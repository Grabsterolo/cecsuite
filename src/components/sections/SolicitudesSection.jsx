import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { translateError } from "../../utils/errors.js";
import { Card } from "../ui/Card.jsx";
import { StatusBadge } from "../ui/StatusBadge.jsx";
import { SolicitudItem } from "../ui/SolicitudItem.jsx";
import { CrearSolicitudModal } from "../forms/SolicitudForms.jsx";

export function SolicitudesSection({ allSolicitudes = [], onNewRequest, onNewReport, availableDays, existingVacationRequests = [], onDeleteRequest, onDeleteReport }) {
  const [modal,            setModal]            = useState(false);
  const [filterType,       setFilterType]       = useState("todos");
  const [filterStatus,     setFilterStatus]     = useState("todos");
  const [confirmingDelete, setConfirmingDelete] = useState(null); // item id
  const [deleting,         setDeleting]         = useState(false);
  const [deleteError,      setDeleteError]      = useState(null);

  async function handleDelete(item) {
    setDeleting(true);
    setDeleteError(null);
    const table = item.kind === "request" ? "requests" : "reports";
    const { error } = await supabase.from(table).delete().eq("id", item.id);
    setDeleting(false);
    if (error) { setDeleteError(translateError(error.message)); return; }
    setConfirmingDelete(null);
    if (item.kind === "request") onDeleteRequest?.(item.id);
    else onDeleteReport?.(item.id);
  }

  const typeOpts = [
    { value:"todos",      label:"Todos"      },
    { value:"vacaciones", label:"Vacaciones" },
    { value:"permiso",    label:"Permisos"   },
    { value:"report",     label:"Reportes"   },
  ];
  const statusOpts = [
    { value:"todos",      label:"Todos"      },
    { value:"pendiente",  label:"Pendiente"  },
    { value:"aprobado",   label:"Aprobado"   },
    { value:"rechazado",  label:"Rechazado"  },
    { value:"atendido",   label:"Atendido"   },
    { value:"descartado", label:"Descartado" },
  ];

  const filtered = allSolicitudes.filter(s => {
    if (filterType === "vacaciones" && !(s.kind === "request" && s.type === "vacaciones")) return false;
    if (filterType === "permiso"    && !(s.kind === "request" && s.type !== "vacaciones")) return false;
    if (filterType === "report"     && s.kind !== "report") return false;
    if (filterStatus !== "todos"    && s.status !== filterStatus) return false;
    return true;
  });

  const chipStyle = active => ({
    padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer",
    fontFamily:"'Manrope', sans-serif", transition:"all 0.15s",
    border:`1px solid ${active ? COLORS.gold : COLORS.border}`,
    background: active ? "rgba(201,162,78,0.13)" : "transparent",
    color: active ? COLORS.gold : COLORS.textMuted,
  });

  return (
    <div>
      {modal && (
        <CrearSolicitudModal
          onClose={() => setModal(false)}
          onSubmit={() => setModal(false)}
          editData={null}
          onNewRequest={onNewRequest}
          onNewReport={onNewReport}
          availableDays={availableDays}
          existingVacationRequests={existingVacationRequests}
        />
      )}
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:16 }}>
        <button onClick={() => setModal(true)} style={{
          display:"flex", alignItems:"center", gap:8,
          background:`linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
          border:"none", borderRadius:8, padding:"10px 18px",
          color:"#FFF", fontSize:14, fontWeight:700, cursor:"pointer",
          fontFamily:"'Manrope', sans-serif", boxShadow:"0 4px 14px rgba(201,162,78,0.35)",
        }}><Plus size={16}/> Nueva solicitud</button>
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:8, marginBottom:14 }}>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", flex:1 }}>
          {typeOpts.map(opt => (
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
          {statusOpts.map(opt => <option key={opt.value} value={opt.value} style={{ color:"#1F4A40" }}>{opt.label}</option>)}
        </select>
      </div>
      {allSolicitudes.length === 0 ? (
        <Card><p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>No tienes solicitudes. Crea una con el botón de arriba.</p></Card>
      ) : filtered.length === 0 ? (
        <Card><p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>No hay solicitudes que coincidan con los filtros.</p></Card>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.map(s => {
            const isConfirming = confirmingDelete === s.id;
            return (
              <Card key={`${s.kind}-${s.id}`} style={{ padding:"10px 14px" }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                  <SolicitudItem s={s} style={{ border:"none", background:"transparent", padding:0, borderRadius:0, flex:1, minWidth:0 }} hideStatus />
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0 }}>
                    <StatusBadge status={s.status} />
                    {s.status === "pendiente" && !isConfirming && (
                      <button onClick={() => { setConfirmingDelete(s.id); setDeleteError(null); }} style={{ fontSize:11, fontWeight:600, color:"#c0392b", background:"rgba(192,57,43,0.06)", border:"1px solid rgba(192,57,43,0.15)", borderRadius:6, padding:"4px 10px", cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontFamily:"'Manrope', sans-serif" }}>
                        <Trash2 size={11}/> Eliminar
                      </button>
                    )}
                  </div>
                </div>
                {s.status === "pendiente" && isConfirming && (
                  <div style={{ marginTop:8, padding:"8px 12px", background:"rgba(192,57,43,0.06)", borderRadius:8, border:"1px solid rgba(192,57,43,0.15)" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontSize:12, color:"#c0392b", fontWeight:600 }}>¿Eliminar esta solicitud?</span>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={() => handleDelete(s)} disabled={deleting} style={{ fontSize:11, fontWeight:700, color:"#FFF", background:"#c0392b", border:"none", borderRadius:6, padding:"4px 10px", cursor:deleting?"not-allowed":"pointer", opacity:deleting?0.6:1, fontFamily:"'Manrope', sans-serif" }}>
                          {deleting ? "Eliminando..." : "Confirmar"}
                        </button>
                        <button onClick={() => { setConfirmingDelete(null); setDeleteError(null); }} disabled={deleting} style={{ fontSize:11, fontWeight:600, color:COLORS.textMuted, background:"transparent", border:`1px solid ${COLORS.border}`, borderRadius:6, padding:"4px 10px", cursor:"pointer", fontFamily:"'Manrope', sans-serif" }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                    {deleteError && <p style={{ fontSize:11, color:"#c0392b", margin:"5px 0 0", fontFamily:"'Manrope', sans-serif" }}>{deleteError}</p>}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
