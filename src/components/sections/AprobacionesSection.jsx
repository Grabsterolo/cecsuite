import React, { useState } from "react";
import { Clock, Check, XCircle } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { taStyle } from "../../styles/forms.js";
import { translateError } from "../../utils/errors.js";
import { fmtSupaDate, getFirstNames } from "../../utils/format.js";
import { getEffectiveDays } from "../../utils/dates.js";
import { Card } from "../ui/Card.jsx";
import { StatusBadge, SolicitudIcon } from "../ui/StatusBadge.jsx";
import { ReportPhoto } from "../ui/SolicitudItem.jsx";

export function AprobacionesSection({ adminRequests = [], adminReports = [], onUpdateAdminRequest, onUpdateAdminReport, onDeleteAdminRequest, onVacationCancelled, reviewerName, showToast }) {
  const [errors,        setErrors]        = useState({});
  const [loading,       setLoading]       = useState({});
  const [pendingAction, setPendingAction] = useState({});
  const [noteText,      setNoteText]      = useState({});
  const actionInProgress = React.useRef({});
  const [filterSearch, setFilterSearch]   = useState("");
  const [filterType,   setFilterType]     = useState("todos");
  const [filterStatus, setFilterStatus]   = useState("pendiente");
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError,   setCancelError]   = useState(null);

  const allItems = [
    ...adminRequests.map(r => ({
      id: r.id, kind: "request", type: r.type,
      user_id: r.user_id,
      days_requested: r.days_requested,
      effectiveDays: r.days_requested > 0 ? r.days_requested : getEffectiveDays(r),
      employeeName: r.profiles?.full_name ?? "—",
      department:   r.profiles?.department ?? "",
      label:   r.type === "vacaciones" ? "Vacaciones" : (r.category || "Permiso"),
      subtitle: r.start_date
        ? `${fmtSupaDate(r.start_date)}${r.end_date ? ` — ${fmtSupaDate(r.end_date)}` : ""} · ${getEffectiveDays(r)} días`
        : "",
      timeRange: (r.start_time && r.end_time) ? `${r.start_time.slice(0,5)} — ${r.end_time.slice(0,5)}` : null,
      comment: r.comment || null,
      status: r.status, created_at: r.created_at,
      reviewerName: r.reviewer?.full_name || null,
    })),
    ...adminReports.map(r => ({
      id: r.id, kind: "report",
      employeeName: r.profiles?.full_name ?? "—",
      department:   r.profiles?.department ?? "",
      label:     r.category || "Reporte",
      subtitle:  r.description || "",
      location:  r.location,
      photo_url: r.photo_url,
      status: r.status, created_at: r.created_at,
      reviewerName: r.reviewer?.full_name || null,
      resolution_note: r.resolution_note || null,
    })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const filtered = allItems.filter(item => {
    if (filterType === "vacaciones" && !(item.kind === "request" && item.type === "vacaciones")) return false;
    if (filterType === "permiso"    && !(item.kind === "request" && item.type !== "vacaciones")) return false;
    if (filterType === "report"     && item.kind !== "report") return false;
    if (filterStatus === "pendiente" && item.status !== "pendiente") return false;
    if (filterStatus === "resuelto"  && item.status === "pendiente") return false;
    if (filterSearch.trim()) {
      const q = filterSearch.trim().toLowerCase();
      if (!(
        item.employeeName.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        (item.subtitle || "").toLowerCase().includes(q) ||
        (item.comment  || "").toLowerCase().includes(q)
      )) return false;
    }
    return true;
  });

  async function handleAction(item, newStatus, resolutionNote = null) {
    const key = `${item.kind}-${item.id}`;
    if (actionInProgress.current[key]) return;
    actionInProgress.current[key] = true;
    setLoading(prev => ({ ...prev, [key]: newStatus }));
    setErrors(prev => ({ ...prev, [key]: null }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const table = item.kind === "request" ? "requests" : "reports";
      const updates = { status: newStatus, reviewed_by: user.id, reviewed_at: new Date().toISOString() };
      if (item.kind === "report") updates.resolution_note = resolutionNote || null;
      const { error } = await supabase.from(table).update(updates).eq("id", item.id);
      if (error) { setErrors(prev => ({ ...prev, [key]: translateError(error.message) })); return; }
      if (newStatus === "aprobado" && item.kind === "request" && item.type === "vacaciones") {
        const daysToDeduct = Number(item.days_requested);
        const { error: rpcError } = await supabase.rpc('adjust_vacation_balance', { p_user_id: item.user_id, p_days_delta: -daysToDeduct });
        if (rpcError) {
          console.error('Error al ajustar saldo:', rpcError);
          alert('La solicitud fue aprobada pero hubo un error al actualizar el saldo. Por favor recarga la página.');
        }
      }
      setPendingAction(prev => ({ ...prev, [key]: null }));
      setNoteText(prev => ({ ...prev, [key]: "" }));
      if (item.kind === "request") onUpdateAdminRequest(item.id, { status: newStatus, reviewer: { full_name: reviewerName } });
      else                          onUpdateAdminReport(item.id,  { status: newStatus, reviewer: { full_name: reviewerName }, resolution_note: resolutionNote || null });
    } finally {
      setLoading(prev => ({ ...prev, [key]: null }));
      actionInProgress.current[key] = false;
    }
  }

  async function handleCancelVacation(item) {
    setCancelLoading(true);
    setCancelError(null);
    const daysToRefund = Number(item.days_requested);
    const { error: updateErr } = await supabase.rpc('adjust_vacation_balance', { p_user_id: item.user_id, p_days_delta: daysToRefund });
    if (updateErr) { setCancelError(translateError(updateErr.message)); setCancelLoading(false); return; }
    const { error: deleteErr } = await supabase.from("requests").delete().eq("id", item.id);
    if (deleteErr) { setCancelError(translateError(deleteErr.message)); setCancelLoading(false); return; }
    const { data: perfilActualizado } = await supabase.from("profiles").select("vacation_balance").eq("id", item.user_id).single();
    const { data: { user } } = await supabase.auth.getUser();
    if (perfilActualizado && item.user_id === user?.id) {
      onVacationCancelled?.(item.user_id, perfilActualizado.vacation_balance);
    }
    setCancelConfirm(null);
    setCancelLoading(false);
    onDeleteAdminRequest?.(item.id);
    showToast?.({ message: `Vacaciones anuladas — ${daysToRefund} día${daysToRefund !== 1 ? "s" : ""} devueltos a ${getFirstNames(item.employeeName)}`, Icon: Check });
  }

  function renderItem(item) {
    const key = `${item.kind}-${item.id}`;
    const isPending = item.status === "pendiente";
    const isLoading = !!loading[key];
    const errMsg = errors[key];
    return (
      <Card key={key} style={{ padding:"10px 14px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:2 }}>
              <span style={{ fontSize:13, fontWeight:700, color:COLORS.green }}>{item.employeeName}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
              <SolicitudIcon kind={item.kind} type={item.type} size={16} />
              <span style={{ fontSize:13, fontWeight:600, color:COLORS.text, wordBreak:"break-word" }}>{item.label}</span>
            </div>
            {item.subtitle && <div style={{ fontSize:11, color:COLORS.textMuted, lineHeight:1.5, marginBottom:2, wordBreak:"break-word" }}>{item.subtitle}</div>}
            {item.timeRange && <div style={{ fontSize:11, color:COLORS.textMuted, marginBottom:2, display:"flex", alignItems:"center", gap:4 }}><Clock size={12} color={COLORS.textMuted} />{item.timeRange}</div>}
            {item.comment && <div style={{ fontSize:11, color:COLORS.textMuted, lineHeight:1.5, marginBottom:2, wordBreak:"break-word" }}><span style={{ fontWeight:600 }}>Nota:</span> {item.comment}</div>}
            {item.location && <div style={{ fontSize:11, color:COLORS.textMuted, marginBottom:2 }}>📍 {item.location}</div>}
            <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:2 }}>{fmtSupaDate((item.created_at ?? "").slice(0,10))}</div>
            {item.reviewerName && item.status !== "pendiente" && (
              <div style={{ fontSize:11, marginTop:3, color: item.status === "aprobado" ? COLORS.green : item.status === "atendido" ? COLORS.green : item.status === "rechazado" ? "#c0392b" : COLORS.textMuted, fontWeight:600 }}>
                {{ aprobado:"Aprobado", rechazado:"Rechazado", atendido:"Atendido", descartado:"Descartado" }[item.status] ?? item.status} por {item.reviewerName}
              </div>
            )}
            {item.resolution_note && (item.status === "atendido" || item.status === "descartado") && (
              <div style={{ fontSize:11, marginTop:2, color:COLORS.textMuted, lineHeight:1.5 }}>
                <span style={{ fontWeight:600 }}>Nota:</span> {item.resolution_note}
              </div>
            )}
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0 }}>
            {item.photo_url && <ReportPhoto path={item.photo_url} size={48} radius={7} />}
            <StatusBadge status={item.status} />
          </div>
        </div>
        {isPending && item.kind === "request" && (
          <div style={{ display:"flex", gap:8, marginTop:10 }}>
            <button onClick={() => handleAction(item, "aprobado")} disabled={isLoading} style={{
              flex:1, padding:"7px 0", borderRadius:7, border:"none",
              cursor:isLoading?"not-allowed":"pointer",
              background:"rgba(44,99,86,0.12)", color:COLORS.greenSoft,
              fontSize:13, fontWeight:700, fontFamily:"'Manrope', sans-serif",
              opacity:isLoading?0.6:1, transition:"background 0.15s",
            }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background="rgba(44,99,86,0.22)"; }}
              onMouseLeave={e => { if (!isLoading) e.currentTarget.style.background="rgba(44,99,86,0.12)"; }}
            >{loading[key] === "aprobado" ? "Aprobando..." : "Aprobar"}</button>
            <button onClick={() => handleAction(item, "rechazado")} disabled={isLoading} style={{
              flex:1, padding:"7px 0", borderRadius:7, border:"none",
              cursor:isLoading?"not-allowed":"pointer",
              background:"rgba(192,57,43,0.1)", color:"#c0392b",
              fontSize:13, fontWeight:700, fontFamily:"'Manrope', sans-serif",
              opacity:isLoading?0.6:1, transition:"background 0.15s",
            }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background="rgba(192,57,43,0.2)"; }}
              onMouseLeave={e => { if (!isLoading) e.currentTarget.style.background="rgba(192,57,43,0.1)"; }}
            >{loading[key] === "rechazado" ? "Rechazando..." : "Rechazar"}</button>
          </div>
        )}
        {isPending && item.kind === "report" && (() => {
          const action = pendingAction[key];
          return (
            <>
              {!action && (
                <div style={{ display:"flex", gap:8, marginTop:10 }}>
                  <button onClick={() => { setPendingAction(p => ({ ...p, [key]:"atendido" })); setNoteText(p => ({ ...p, [key]:"" })); }} disabled={isLoading} style={{
                    flex:2, padding:"7px 0", borderRadius:7, border:"none", cursor:isLoading?"not-allowed":"pointer",
                    background:"rgba(44,99,86,0.12)", color:COLORS.greenSoft, fontSize:13, fontWeight:700,
                    fontFamily:"'Manrope', sans-serif", opacity:isLoading?0.6:1, transition:"background 0.15s",
                  }}
                    onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background="rgba(44,99,86,0.22)"; }}
                    onMouseLeave={e => { if (!isLoading) e.currentTarget.style.background="rgba(44,99,86,0.12)"; }}
                  >Marcar como atendido</button>
                  <button onClick={() => { setPendingAction(p => ({ ...p, [key]:"descartado" })); setNoteText(p => ({ ...p, [key]:"" })); }} disabled={isLoading} style={{
                    flex:1, padding:"7px 0", borderRadius:7, border:"none", cursor:isLoading?"not-allowed":"pointer",
                    background:COLORS.panelAlt, color:COLORS.textMuted, fontSize:13, fontWeight:600,
                    fontFamily:"'Manrope', sans-serif", opacity:isLoading?0.6:1, transition:"background 0.15s",
                  }}
                    onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background=COLORS.border; }}
                    onMouseLeave={e => { if (!isLoading) e.currentTarget.style.background=COLORS.panelAlt; }}
                  >Descartar</button>
                </div>
              )}
              {action && (
                <div style={{ marginTop:10 }}>
                  <textarea
                    value={noteText[key] ?? ""}
                    onChange={e => setNoteText(p => ({ ...p, [key]: e.target.value }))}
                    rows={2} style={{ ...taStyle, width:"100%", fontSize:12, marginBottom:8 }}
                    placeholder={action === "atendido" ? "Nota de resolución (opcional) — ej. Se reemplazó el equipo dañado" : "Motivo (opcional)"}
                    onFocus={e => e.target.style.borderColor=COLORS.gold}
                    onBlur={e => e.target.style.borderColor=COLORS.border}
                    autoFocus
                  />
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={() => handleAction(item, action, noteText[key])} disabled={isLoading} style={{
                      flex:1, padding:"7px 0", borderRadius:7, border:"none", cursor:isLoading?"not-allowed":"pointer",
                      background: action==="atendido" ? "rgba(44,99,86,0.12)" : COLORS.panelAlt,
                      color: action==="atendido" ? COLORS.greenSoft : COLORS.textMuted,
                      fontSize:13, fontWeight:700, fontFamily:"'Manrope', sans-serif", opacity:isLoading?0.6:1,
                    }}>{isLoading ? "Guardando..." : "Confirmar"}</button>
                    <button onClick={() => setPendingAction(p => ({ ...p, [key]:null }))} disabled={isLoading} style={{
                      flex:1, padding:"7px 0", borderRadius:7, border:`1px solid ${COLORS.border}`,
                      background:"transparent", color:COLORS.textMuted, fontSize:13, fontWeight:600,
                      fontFamily:"'Manrope', sans-serif", cursor:"pointer",
                    }}>Cancelar</button>
                  </div>
                </div>
              )}
            </>
          );
        })()}
        {errMsg && <p style={{ fontSize:11, color:"#e07070", margin:"6px 0 0" }}>{errMsg}</p>}
        {!isPending && item.kind === "request" && item.type === "vacaciones" && item.status === "aprobado" && (
          cancelConfirm === item.id ? (
            <div style={{ marginTop:10, padding:"10px 12px", background:"rgba(192,57,43,0.07)", borderRadius:8, border:"1px solid rgba(192,57,43,0.18)" }}>
              <p style={{ fontSize:12, color:COLORS.text, margin:"0 0 8px", lineHeight:1.5 }}>
                ¿Anular estas vacaciones? Se eliminarán y se devolverán <strong>{item.effectiveDays} día{item.effectiveDays !== 1 ? "s" : ""}</strong> al saldo de {getFirstNames(item.employeeName)}.
              </p>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => handleCancelVacation(item)} disabled={cancelLoading} style={{
                  flex:1, padding:"7px 0", borderRadius:7, border:"none", cursor:cancelLoading?"not-allowed":"pointer",
                  background:"rgba(192,57,43,0.15)", color:"#c0392b",
                  fontSize:12, fontWeight:700, fontFamily:"'Manrope', sans-serif", opacity:cancelLoading?0.6:1,
                }}>{cancelLoading ? "Anulando..." : "Confirmar anulación"}</button>
                <button onClick={() => { setCancelConfirm(null); setCancelError(null); }} disabled={cancelLoading} style={{
                  flex:1, padding:"7px 0", borderRadius:7, border:`1px solid ${COLORS.border}`,
                  background:"transparent", color:COLORS.textMuted,
                  fontSize:12, fontWeight:600, fontFamily:"'Manrope', sans-serif", cursor:"pointer",
                }}>Cancelar</button>
              </div>
              {cancelError && <p style={{ fontSize:11, color:"#e07070", margin:"6px 0 0" }}>{cancelError}</p>}
            </div>
          ) : (
            <div style={{ marginTop:8 }}>
              <button onClick={() => { setCancelConfirm(item.id); setCancelError(null); }} style={{
                display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:6,
                border:"none", background:"rgba(192,57,43,0.08)", color:"#c0392b",
                fontSize:12, fontWeight:600, fontFamily:"'Manrope', sans-serif", cursor:"pointer",
              }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(192,57,43,0.16)"}
                onMouseLeave={e => e.currentTarget.style.background="rgba(192,57,43,0.08)"}
              ><XCircle size={13} /> Anular vacaciones</button>
            </div>
          )
        )}
      </Card>
    );
  }

  const chipStyle = active => ({
    padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer",
    fontFamily:"'Manrope', sans-serif", transition:"all 0.15s",
    border:`1px solid ${active ? COLORS.gold : COLORS.border}`,
    background: active ? "rgba(201,162,78,0.13)" : "transparent",
    color: active ? COLORS.gold : COLORS.textMuted,
  });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        <input
          type="text"
          value={filterSearch}
          onChange={e => setFilterSearch(e.target.value)}
          placeholder="Buscar por empleado, tipo o descripción..."
          style={{
            width:"100%", padding:"8px 12px", borderRadius:8, border:`1px solid ${COLORS.border}`,
            background:COLORS.panelAlt, color:COLORS.text, fontSize:13,
            fontFamily:"'Manrope', sans-serif", outline:"none", boxSizing:"border-box",
          }}
          onFocus={e => e.target.style.borderColor=COLORS.gold}
          onBlur={e => e.target.style.borderColor=COLORS.border}
        />
        <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:8 }}>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap", flex:1 }}>
            {[
              { value:"todos",      label:"Todos"      },
              { value:"vacaciones", label:"Vacaciones" },
              { value:"permiso",    label:"Permisos"   },
              { value:"report",     label:"Reportes"   },
            ].map(opt => (
              <button key={opt.value} onClick={() => setFilterType(opt.value)} style={chipStyle(filterType === opt.value)}>{opt.label}</button>
            ))}
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{
              padding:"4px 10px", borderRadius:8, border:`1px solid ${COLORS.border}`,
              background:COLORS.panelAlt, color:COLORS.text, fontSize:12,
              fontFamily:"'Manrope', sans-serif", cursor:"pointer", outline:"none",
            }}
          >
            <option value="pendiente" style={{ color:"#1F4A40" }}>Pendientes</option>
            <option value="resuelto"  style={{ color:"#1F4A40" }}>Resueltos</option>
            <option value="todos"     style={{ color:"#1F4A40" }}>Todos</option>
          </select>
        </div>
      </div>
      {allItems.length === 0 ? (
        <Card><p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>No hay solicitudes registradas.</p></Card>
      ) : filtered.length === 0 ? (
        <Card><p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>No hay solicitudes que coincidan con los filtros.</p></Card>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {filtered.map(renderItem)}
        </div>
      )}
    </div>
  );
}
