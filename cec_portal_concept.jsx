import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Bell, FileText, CalendarDays, CalendarCheck, CalendarRange, User, LogOut,
  Home, ChevronRight, ChevronLeft, Download, Clock, Cake, Menu, X, Plus, Edit2, Trash2, AlertTriangle, ClipboardCheck, ClipboardList, Megaphone, FileUp, Users, UserPlus, KeyRound, UserX, Eye, EyeOff, MessageCircle, Send, Check, CheckCheck, Award, BarChart3, DollarSign, XCircle, Archive,
} from "lucide-react";
import { createClient as _createSupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./src/lib/supabase";
import { COLORS, DEPT_COLORS, FONTS, SIDEBAR_BG } from "./src/constants/colors.js";
import { INFINITY_PATH, ROTATING_WORDS, NAV_ITEMS, VAC_TOTAL, MOTIVATIONAL_MESSAGES, TIPOS_PERMISO, TIPOS_REPORTE, RECOGNITION_CATEGORIES, CONFETTI_PARTICLES, MONTH_NAMES, DAY_NAMES } from "./src/constants/nav.js";
import { inputStyle, taStyle, btnCancelStyle, btnSubmitStyle, verTodosStyle } from "./src/styles/forms.js";
import { translateError } from "./src/utils/errors.js";
import { fmtFull, fmtSupaDate, fmtSupaShort, fmtDate, getFirstNames } from "./src/utils/format.js";
import { calcWorkDays, getEffectiveDays, isBirthdayToday, getDailyMessage } from "./src/utils/dates.js";
import { getDepartmentColor, getDepartmentTextColor } from "./src/utils/departments.js";
import { buildAudienceFilter } from "./src/utils/audience.js";
import { unlockAudio, playNotificationPing } from "./src/utils/audio.js";
import { useIsMobile } from "./src/hooks/useIsMobile.js";
import { Card, CardHeader } from "./src/components/ui/Card.jsx";
import { StatusBadge, Tag, SolicitudIcon } from "./src/components/ui/StatusBadge.jsx";
import { ModalShell } from "./src/components/ui/ModalShell.jsx";
import { ToastNotification } from "./src/components/ui/ToastNotification.jsx";
import { Logo } from "./src/components/ui/Logo.jsx";
import { DeptTag } from "./src/components/ui/DeptTag.jsx";
import { PasswordInput } from "./src/components/ui/PasswordInput.jsx";
import { VacationDonut } from "./src/components/ui/VacationDonut.jsx";
import { BirthdayConfetti } from "./src/components/ui/BirthdayConfetti.jsx";
import { DocDownloadBtn } from "./src/components/ui/DocDownloadBtn.jsx";
import { CalendarWidget } from "./src/components/ui/CalendarWidget.jsx";
import { LoginScreen } from "./src/components/auth/LoginScreen.jsx";
import { Sidebar, MobileDrawer } from "./src/components/layout/Sidebar.jsx";

/* ─────────────────────────── LOGIN — ver src/components/auth/LoginScreen.jsx ─── */
/* ─────────────────────────── SOLICITUDES ─────────────────────────── */

/* ── Formulario vacaciones ── */
function VacationForm({ onClose, onSubmit, editData, onNewRequest, availableDays, existingRequests = [] }) {
  const [startDate, setStartDate] = useState(editData?.startDate || null);
  const [endDate,   setEndDate]   = useState(editData?.endDate   || null);
  const [comment,   setComment]   = useState(editData?.comment   || "");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const wd = calcWorkDays(startDate, endDate || startDate);
  const toDate = (d) => d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` : null;

  const today = new Date(); today.setHours(0,0,0,0);
  const isPastStart = startDate && startDate < today;
  const exceedsBalance = availableDays != null && endDate && wd > availableDays;
  const rangeEnd = endDate || startDate;

  // Convert a local Date object to "YYYY-MM-DD" without timezone drift
  const toYMD = (d) => d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` : null;
  const startStr = startDate ? toYMD(startDate) : null;
  const endStr   = rangeEnd  ? toYMD(rangeEnd)  : null;

  const overlapping = startStr && endStr
    ? existingRequests.filter(r => {
        if (r.status !== "pendiente" && r.status !== "aprobado") return false;
        if (editData && r.id === editData.id) return false;
        // slice(0,10) handles both "YYYY-MM-DD" and "YYYY-MM-DDTHH:..." formats from Supabase
        const rs = (r.start_date || "").slice(0, 10);
        const re = (r.end_date   || r.start_date || "").slice(0, 10);
        if (!rs) return false;
        // YYYY-MM-DD string comparison is safe (lexicographic = chronological)
        const overlaps = startStr <= re && endStr >= rs;
        return overlaps;
      })
    : [];

  async function submit() {
    setError(null);
    if (!startDate) return;
    if (isPastStart) return;
    if (overlapping.length > 0) return;
    if (editData) { onSubmit({ tipo:"vacaciones", startDate, endDate, comment }); return; }
    const effectiveEnd = endDate || startDate;
    const daysRequested = calcWorkDays(startDate, effectiveEnd);
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const insertPayload = {
      user_id: user?.id,
      type: "vacaciones",
      status: "pendiente",
      start_date: toDate(startDate),
      end_date: toDate(effectiveEnd),
      days_requested: daysRequested,
      comment: comment.trim() || null,
    };
    const { data, error: insertError } = await supabase.from("requests").insert(insertPayload).select().single();
    setLoading(false);
    if (insertError) { setError(translateError(insertError.message)); return; }
    if (!data) { setError("La solicitud no pudo guardarse. Intenta de nuevo."); return; }
    if (onNewRequest) onNewRequest(data);
    onClose();
  }

  return (
    <ModalShell onClose={onClose} title={editData ? "Editar solicitud" : "Solicitud de Vacaciones"}>
      <CalendarWidget startDate={startDate} endDate={endDate} onChange={(s,e) => { setStartDate(s); setEndDate(e); }} minDate={today} />
      {startDate && (
        <div style={{ marginTop:12, padding:"10px 14px", background:COLORS.panelAlt, borderRadius:8, fontSize:12, color:COLORS.textMuted }}>
          <div><span style={{ fontWeight:600, color:COLORS.green }}>Inicio: </span>{fmtDate(startDate)}</div>
          {endDate && <>
            <div style={{ marginTop:2 }}><span style={{ fontWeight:600, color:COLORS.green }}>Fin: </span>{fmtDate(endDate)}</div>
            <div style={{ marginTop:2 }}><span style={{ fontWeight:700, color:COLORS.gold }}>{wd} días hábiles</span></div>
          {exceedsBalance && (
            <div style={{ marginTop:8, fontSize:12, color:"#c0392b" }}>
              No tienes suficientes días disponibles. Tienes <strong>{availableDays}</strong> días disponibles y estás solicitando <strong>{wd}</strong>.
            </div>
          )}
          </>}
        </div>
      )}
      {isPastStart && (
        <div style={{ marginTop:8, fontSize:12, color:"#c0392b" }}>
          No se pueden solicitar fechas en el pasado.
        </div>
      )}
      {overlapping.length > 0 && (
        <div style={{ marginTop:8, fontSize:12, color:"#c0392b" }}>
          Ya tienes una solicitud de vacaciones que se solapa con estas fechas
          {" "}(del {overlapping[0].start_date} al {overlapping[0].end_date || overlapping[0].start_date}).
        </div>
      )}
      <div style={{ marginTop:14 }}>
        <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>Comentario <span style={{ fontWeight:400 }}>(opcional)</span></label>
        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Información adicional..." rows={2} style={taStyle}
          onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
      </div>
      {error && <p style={{ fontSize:12, color:"#e07070", margin:"12px 0 0" }}>{error}</p>}
      <div style={{ display:"flex", gap:10, marginTop:20 }}>
        <button onClick={onClose} style={btnCancelStyle}>Cancelar</button>
        <button onClick={submit} disabled={loading || !!exceedsBalance || !!isPastStart || overlapping.length > 0} style={{ ...btnSubmitStyle, opacity:(startDate&&!loading&&!exceedsBalance&&!isPastStart&&overlapping.length===0)?1:0.5, cursor:(loading||exceedsBalance||isPastStart||overlapping.length>0)?"not-allowed":"pointer" }}>
          {loading ? "Enviando..." : editData ? "Guardar cambios" : "Solicitar"}
        </button>
      </div>
    </ModalShell>
  );
}

/* ── Formulario permiso ── */
function PermisoForm({ onClose, onSubmit, editData, onNewRequest }) {
  const [tipoPermiso, setTipoPermiso] = useState(editData?.tipoPermiso || "");
  const [startDate, setStartDate] = useState(editData?.startDate || null);
  const [endDate,   setEndDate]   = useState(editData?.endDate   || null);
  const [notes,     setNotes]     = useState(editData?.notes || "");
  const [startTime, setStartTime] = useState("");
  const [endTime,   setEndTime]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  const workDays = calcWorkDays(startDate, endDate || startDate);
  const todayP = new Date(); todayP.setHours(0,0,0,0);
  const isPastStartP = startDate && startDate < todayP;

  async function submit() {
    setError(null);
    if (!tipoPermiso || !startDate) return;
    if (isPastStartP) return;
    if ((startTime && !endTime) || (!startTime && endTime)) { setError("Si llenas un horario, debes llenar ambas horas."); return; }
    if (startTime && endTime && endTime <= startTime) { setError("La hora de fin debe ser posterior a la hora de inicio."); return; }
    if (editData) { onSubmit({ tipo:"permiso", tipoPermiso, startDate, endDate, notes }); return; }
    const effectiveEnd = endDate || startDate;
    const daysRequested = calcWorkDays(startDate, effectiveEnd);
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const toDate = (d) => d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` : null;
    const insertPayload = {
      user_id: user?.id,
      type: "permiso",
      category: tipoPermiso,
      status: "pendiente",
      start_date: toDate(startDate),
      end_date: toDate(effectiveEnd),
      days_requested: daysRequested,
      comment: notes.trim() || null,
      start_time: startTime || null,
      end_time: endTime || null,
    };
    const { data, error: insertError } = await supabase.from("requests").insert(insertPayload).select().single();
    setLoading(false);
    if (insertError) { setError(translateError(insertError.message)); return; }
    if (!data) { setError("La solicitud no pudo guardarse. Intenta de nuevo."); return; }
    if (onNewRequest) onNewRequest(data);
    onClose();
  }

  return (
    <ModalShell onClose={onClose} title={editData ? "Editar solicitud" : "Solicitud de Permiso"}>
      <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>Tipo de permiso</label>
      <select value={tipoPermiso} onChange={e => setTipoPermiso(e.target.value)} style={{
        width:"100%", background:COLORS.inputBg, border:`1.5px solid ${tipoPermiso?COLORS.gold:COLORS.border}`,
        borderRadius:8, padding:"11px 14px", color: tipoPermiso?COLORS.text:"#9aaea8",
        fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:16,
        fontFamily:"'Manrope', sans-serif", cursor:"pointer", appearance:"auto",
        transition:"border-color 0.2s",
      }}>
        <option value="" disabled style={{ color:"#1F4A40" }}>Selecciona un tipo…</option>
        {TIPOS_PERMISO.map(t => <option key={t} value={t} style={{ color:"#1F4A40" }}>{t}</option>)}
      </select>
      <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:8, fontWeight:600, letterSpacing:"0.02em" }}>Fechas</label>
      <CalendarWidget startDate={startDate} endDate={endDate} onChange={(s,e) => { setStartDate(s); setEndDate(e); }} minDate={todayP} />
      {startDate && (
        <div style={{ marginTop:10, padding:"10px 14px", background:COLORS.panelAlt, borderRadius:8, fontSize:12, color:COLORS.textMuted }}>
          <div><span style={{ fontWeight:600, color:COLORS.green }}>Inicio: </span>{fmtDate(startDate)}</div>
          {endDate && <>
            <div style={{ marginTop:2 }}><span style={{ fontWeight:600, color:COLORS.green }}>Fin: </span>{fmtDate(endDate)}</div>
            <div style={{ marginTop:2 }}><span style={{ fontWeight:700, color:COLORS.gold }}>{workDays} días hábiles</span></div>
          </>}
        </div>
      )}
      <div style={{ display:"flex", gap:12, marginTop:14 }}>
        <div style={{ flex:1 }}>
          <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>Hora de inicio <span style={{ fontWeight:400 }}>(opcional)</span></label>
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ ...inputStyle, fontSize:14, padding:"10px 14px" }}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border} />
        </div>
        <div style={{ flex:1 }}>
          <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>Hora de fin <span style={{ fontWeight:400 }}>(opcional)</span></label>
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ ...inputStyle, fontSize:14, padding:"10px 14px" }}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border} />
        </div>
      </div>
      <div style={{ marginTop:14 }}>
        <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>Notas adicionales</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Información adicional o justificación..." rows={2} style={taStyle}
          onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
      </div>
      {isPastStartP && (
        <div style={{ marginTop:8, fontSize:12, color:"#c0392b" }}>
          No se pueden solicitar fechas en el pasado.
        </div>
      )}
      {error && <p style={{ fontSize:12, color:"#e07070", margin:"12px 0 0" }}>{error}</p>}
      <div style={{ display:"flex", gap:10, marginTop:20 }}>
        <button onClick={onClose} style={btnCancelStyle}>Cancelar</button>
        <button onClick={submit} disabled={loading || !!isPastStartP} style={{ ...btnSubmitStyle, opacity:(tipoPermiso&&startDate&&!loading&&!isPastStartP)?1:0.5, cursor:(loading||isPastStartP)?"not-allowed":"pointer" }}>
          {loading ? "Enviando..." : editData ? "Guardar cambios" : "Solicitar"}
        </button>
      </div>
    </ModalShell>
  );
}

function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX_WIDTH = 1200;
      const scale = Math.min(1, MAX_WIDTH / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
        URL.revokeObjectURL(url);
      }, "image/jpeg", 0.70);
    };
    img.src = url;
  });
}

/* ── Formulario reporte ── */
function ReporteForm({ onClose, onSubmit, editData, onNewReport }) {
  const [category,    setCategory]    = useState(editData?.tipoReporte || "");
  const [description, setDescription] = useState(editData?.descripcion || "");
  const [location,    setLocation]    = useState(editData?.ubicacion || "");
  const [file,        setFile]        = useState(null);
  const [preview,     setPreview]     = useState(null);
  const [loadingMsg,  setLoadingMsg]  = useState(null); // null = idle
  const [error,       setError]       = useState(null);
  const [converting,  setConverting]  = useState(false);

  async function handleFile(e) {
    const raw = e.target.files?.[0] ?? null;
    if (!raw) { setFile(null); setPreview(null); return; }
    const ext = raw.name.split(".").pop().toLowerCase();
    const isHeic = raw.type === "image/heic" || raw.type === "image/heif" || ext === "heic" || ext === "heif";
    let f = raw;
    if (isHeic) {
      setConverting(true);
      setError(null);
      try {
        const { default: heic2any } = await import("heic2any");
        const blob = await heic2any({ blob: raw, toType: "image/jpeg", quality: 0.85 });
        const newName = raw.name.replace(/\.(heic|heif)$/i, ".jpg");
        f = new File([blob], newName, { type: "image/jpeg" });
      } catch (_) {
        setConverting(false);
        setError("No se pudo procesar la imagen, intenta con otra foto.");
        return;
      }
      setConverting(false);
    }
    // Show preview from pre-compression file
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(f);
    // Compress for upload (max 1200px wide, 70% quality)
    const compressed = await compressImage(f);
    setFile(compressed);
  }

  async function submit() {
    setError(null);
    if (!category || !description.trim()) return;
    if (editData) { onSubmit({ tipo:"reporte", tipoReporte:category, descripcion:description, ubicacion:location }); return; }

    setLoadingMsg("Enviando...");
    const { data: { user } } = await supabase.auth.getUser();
    let photo_url = null;

    if (file) {
      setLoadingMsg("Subiendo foto...");
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("reports").upload(fileName, file);
      if (uploadError) { setError(translateError(uploadError.message)); setLoadingMsg(null); return; }
      photo_url = fileName;
      setLoadingMsg("Enviando...");
    }

    const { data, error: insertError } = await supabase.from("reports").insert({
      user_id: user.id,
      category,
      description: description.trim(),
      location: location.trim() || null,
      photo_url,
      status: "pendiente",
    }).select().single();

    setLoadingMsg(null);
    if (insertError) { setError(translateError(insertError.message)); return; }
    if (onNewReport) onNewReport(data);
    onClose();
  }

  const inputSm = { ...taStyle, resize:"none", height:40, padding:"10px 14px", fontSize:14 };
  const loading = !!loadingMsg;

  return (
    <ModalShell onClose={onClose} title={editData ? "Editar reporte" : "Nuevo Reporte"}>
      <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>Tipo de reporte</label>
      <select value={category} onChange={e => setCategory(e.target.value)} style={{
        width:"100%", background:COLORS.inputBg, border:`1.5px solid ${category?COLORS.gold:COLORS.border}`,
        borderRadius:8, padding:"11px 14px", color:category?COLORS.text:"#9aaea8",
        fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:14,
        fontFamily:"'Manrope', sans-serif", cursor:"pointer", appearance:"auto", transition:"border-color 0.2s",
      }}>
        <option value="" disabled style={{ color:"#1F4A40" }}>Selecciona una categoría…</option>
        {TIPOS_REPORTE.map(t => <option key={t} value={t} style={{ color:"#1F4A40" }}>{t}</option>)}
      </select>
      <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>Descripción</label>
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe la situación con el mayor detalle posible..." rows={4} style={{ ...taStyle, marginBottom:14 }}
        onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
      <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>Ubicación <span style={{ fontWeight:400 }}>(opcional)</span></label>
      <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Ej. Sala de cirugía, recepción..." style={{ ...inputSm, marginBottom:14, display:"block" }}
        onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
      <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>Foto <span style={{ fontWeight:400 }}>(opcional)</span></label>
      <label style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, cursor:"pointer" }}>
        <div style={{ flex:1, background:COLORS.inputBg, border:`1.5px dashed ${COLORS.border}`, borderRadius:8, padding:"10px 14px", fontSize:13, color:converting?COLORS.gold:COLORS.textMuted, fontFamily:"'Manrope', sans-serif" }}>
          {converting ? "Procesando imagen..." : file ? file.name : "Adjuntar foto (opcional)"}
        </div>
        <input type="file" accept="image/*,image/heic,image/heif" onChange={handleFile} disabled={converting} style={{ display:"none" }} />
      </label>
      {preview && (
        <div style={{ marginBottom:14 }}>
          <img src={preview} alt="vista previa" style={{ width:"100%", maxHeight:160, objectFit:"cover", borderRadius:8, border:`1px solid ${COLORS.border}` }} />
        </div>
      )}
      {error && <p style={{ fontSize:12, color:"#e07070", margin:"0 0 12px" }}>{error}</p>}
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onClose} style={btnCancelStyle}>Cancelar</button>
        <button onClick={submit} disabled={loading || converting} style={{ ...btnSubmitStyle, opacity:(category&&description.trim()&&!loading&&!converting)?1:0.5, cursor:(loading||converting)?"not-allowed":"pointer" }}>
          {converting ? "Procesando imagen..." : loadingMsg ?? (editData ? "Guardar cambios" : "Enviar reporte")}
        </button>
      </div>
    </ModalShell>
  );
}

/* ── Modal selector de tipo + routing ── */
function CrearSolicitudModal({ onClose, onSubmit, editData, initialTipo, onNewRequest, onNewReport, availableDays, existingVacationRequests }) {
  const [tipo, setTipo] = useState(editData?.tipo || initialTipo || null);

  function handleSubmit(data) { onSubmit(data); onClose(); }

  if (!tipo) {
    const opciones = [
      { key:"vacaciones", icon:CalendarDays,   label:"Vacaciones", desc:"Días de descanso" },
      { key:"permiso",    icon:FileText,        label:"Permiso",    desc:"Médico, personal u otro" },
      { key:"reporte",    icon:AlertTriangle,   label:"Reporte",    desc:"Daños, incidentes, situaciones" },
    ];
    return (
      <ModalShell onClose={onClose} title="Nueva Solicitud">
        <p style={{ color:COLORS.textMuted, fontSize:13, marginBottom:20 }}>Selecciona el tipo de solicitud:</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:12, marginBottom:16 }}>
          {opciones.map(({ key, icon:Icon, label, desc }) => (
            <button key={key} onClick={() => setTipo(key)} style={{
              flex:"1 1 calc(33% - 8px)", minWidth:90, display:"flex", flexDirection:"column", alignItems:"center", gap:10,
              padding:"20px 12px", borderRadius:12, border:`2px solid ${COLORS.border}`,
              background:COLORS.inputBg, cursor:"pointer", textAlign:"center",
              fontFamily:"'Manrope', sans-serif", transition:"all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=COLORS.gold; e.currentTarget.style.background="rgba(201,162,78,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=COLORS.border; e.currentTarget.style.background=COLORS.inputBg; }}
            >
              <Icon size={26} color={COLORS.gold}/>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:COLORS.green }}>{label}</div>
                <div style={{ fontSize:10, color:COLORS.textMuted, marginTop:2 }}>{desc}</div>
              </div>
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ ...btnCancelStyle, width:"100%" }}>Cancelar</button>
      </ModalShell>
    );
  }

  if (tipo === "vacaciones") return <VacationForm onClose={onClose} onSubmit={handleSubmit} editData={editData} onNewRequest={onNewRequest} availableDays={availableDays} existingRequests={existingVacationRequests}/>;
  if (tipo === "permiso")    return <PermisoForm  onClose={onClose} onSubmit={handleSubmit} editData={editData} onNewRequest={onNewRequest}/>;
  return <ReporteForm onClose={onClose} onSubmit={handleSubmit} editData={editData} onNewReport={onNewReport}/>;
}

/* ── Private report photo with signed URL + lightbox ── */
function ReportPhoto({ path, size = 44, radius = 6 }) {
  const [src, setSrc] = useState(null);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!path) return;
    supabase.storage.from("reports").createSignedUrl(path, 3600)
      .then(({ data }) => { if (data?.signedUrl) setSrc(data.signedUrl); });
  }, [path]);

  if (!path) return null;

  return (
    <>
      <div onClick={() => src && setLightbox(true)} style={{
        width: size, height: size, borderRadius: radius, flexShrink: 0,
        border: `1px solid ${COLORS.border}`, overflow: "hidden",
        background: COLORS.panelAlt, cursor: src ? "zoom-in" : "default",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {src
          ? <img src={src} alt="foto" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : <FileText size={size * 0.4} color={COLORS.border} />
        }
      </div>
      {lightbox && (
        <div onClick={() => setLightbox(false)} style={{
          position: "fixed", inset: 0, zIndex: 9000,
          background: "rgba(0,0,0,0.82)", display: "flex",
          alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <button onClick={() => setLightbox(false)} style={{
            position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.12)",
            border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer",
            color: "#FFF", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
          <img
            src={src} alt="foto"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: 10, objectFit: "contain", boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}
          />
        </div>
      )}
    </>
  );
}

/* ── Item individual de solicitud ── */
function SolicitudItem({ s, style, hideStatus = false }) {
  const dateStr = s.created_at ? fmtSupaDate(s.created_at.slice(0,10)) : "";
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"11px 12px", borderRadius:8, background:"rgba(31,74,64,0.04)", border:`1px solid ${COLORS.border}`, ...style }}>
      <div style={{ marginTop:2, flexShrink:0 }}><SolicitudIcon kind={s.kind} type={s.type} size={16} /></div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ color:COLORS.text, fontWeight:600, fontSize:13, wordBreak:"break-word", marginBottom:1 }}>{s.label}</div>
        {s.subtitle && <div style={{ color:COLORS.textMuted, fontSize:11, marginTop:2, lineHeight:1.5, wordBreak:"break-word" }}>{s.subtitle}</div>}
        {s.timeRange && <div style={{ color:COLORS.textMuted, fontSize:11, marginTop:2, display:"flex", alignItems:"center", gap:4 }}><Clock size={12} color={COLORS.textMuted} />{s.timeRange}</div>}
        {s.location && <div style={{ color:COLORS.textMuted, fontSize:11, marginTop:2 }}>📍 {s.location}</div>}
        {dateStr && <div style={{ color:COLORS.textMuted, fontSize:11, marginTop:3 }}>{dateStr}</div>}
        {s.reviewerName && s.status !== "pendiente" && (
          <div style={{ fontSize:11, marginTop:3, color: s.status === "aprobado" ? COLORS.green : s.status === "atendido" ? COLORS.green : s.status === "rechazado" ? "#c0392b" : COLORS.textMuted, fontWeight:500 }}>
            {{ aprobado:"Aprobado", rechazado:"Rechazado", atendido:"Atendido", descartado:"Descartado" }[s.status] ?? s.status} por {s.reviewerName}
          </div>
        )}
        {s.resolution_note && (s.status === "atendido" || s.status === "descartado") && (
          <div style={{ fontSize:11, marginTop:3, color:COLORS.textMuted, lineHeight:1.5 }}>
            <span style={{ fontWeight:600 }}>Nota:</span> {s.resolution_note}
          </div>
        )}
      </div>
      {s.photo_url && <ReportPhoto path={s.photo_url} size={44} radius={6} />}
      {!hideStatus && <div style={{ flexShrink:0, marginTop:1 }}><StatusBadge status={s.status} /></div>}
    </div>
  );
}

function DashboardHome({ isMobile, setActive, allSolicitudes = [], vacData = {}, announcements = [], documents = [], upcomingBirthdays = [], onNewRequest, onNewReport, existingVacationRequests = [], recognitions = [], polls = [], myVotes = {}, pollResults = {}, userId, onVoted, myConfirmations = {} }) {
  const [modal, setModal] = useState(null);
  const [announcementModal, setAnnouncementModal] = useState(null);
  const [pollPending, setPollPending] = useState(null); // selected option_index for active poll widget
  const [pollVoting, setPollVoting] = useState(false);
  const { approvedDays = 0, pendingDays = 0, availableDays = 0, vacationBalance = VAC_TOTAL } = vacData;
  const activePoll = polls.find(p => p.status === "activa" && myVotes[p.id] === undefined);

  return (
    <>
      {announcementModal && <AnnouncementDetailModal announcement={announcementModal} onClose={() => setAnnouncementModal(null)} />}
      {modal === "new-sol" && (
        <CrearSolicitudModal onClose={() => setModal(null)} onSubmit={() => setModal(null)} editData={null} onNewRequest={onNewRequest} onNewReport={onNewReport} availableDays={availableDays} existingVacationRequests={existingVacationRequests} />
      )}
    <div style={isMobile
      ? { display: "flex", flexDirection: "column", gap: 14 }
      : { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }
    }>

      {/* Vacaciones — datos reales de Supabase */}
      <Card>
        <CardHeader title="Vacaciones"
          action={<button style={verTodosStyle} onClick={() => setActive("vacaciones")}>Ver detalle <ChevronRight size={14}/></button>}
        />
        <div style={{ display:"flex", alignItems:"center", gap:18 }}>
          <VacationDonut used={approvedDays} requested={pendingDays} total={vacationBalance} />
          <div style={{ flex:1, fontSize:15 }}>
            <p style={{ margin:"0 0 7px", color:COLORS.textMuted }}>
              <span style={{ color:COLORS.green, fontWeight:700 }}>{availableDays}</span> días disponibles
            </p>
            {approvedDays > 0 && (
              <p style={{ margin:"0 0 7px", color:COLORS.textMuted, display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ width:9, height:9, borderRadius:2, background:COLORS.gold, display:"inline-block", flexShrink:0 }}/>
                <span style={{ color:COLORS.green, fontWeight:700 }}>{approvedDays}</span> tomados
              </p>
            )}
            {pendingDays > 0 && (
              <p style={{ margin:"0 0 7px", color:COLORS.textMuted, display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ width:9, height:9, borderRadius:2, background:COLORS.goldSoft, display:"inline-block", flexShrink:0 }}/>
                <span style={{ color:COLORS.gold, fontWeight:700 }}>{pendingDays}</span> en solicitud
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Comunicados — 2 columnas en desktop */}
      <Card style={isMobile ? {} : { gridColumn: "span 2" }}>
        <CardHeader
          title="Comunicados recientes"
          action={<button style={verTodosStyle} onClick={() => setActive("comunicados")}>Ver todos <ChevronRight size={14} /></button>}
        />
        {announcements.length === 0 ? (
          <p style={{ color:COLORS.textMuted, fontSize:13, margin:0 }}>No hay comunicados recientes.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {announcements.slice(0, 3).map((a, i) => {
              const d = a.publish_at ? new Date(a.publish_at) : null;
              const dateStr = d ? `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0,3)}` : "";
              return (
                <div key={a.id ?? i} onClick={() => setAnnouncementModal(a)} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  paddingBottom: 14, borderBottom: `1px solid ${COLORS.border}`,
                  cursor: "pointer", borderRadius: 6, margin: "0 -6px",
                  padding: "8px 6px 14px",
                  transition: "background 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.panelAlt}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <div style={{ fontSize: 14, color: COLORS.text, fontWeight: 500, wordBreak:"break-word" }}>{a.title}</div>
                    {a.tag && <Tag label={a.tag} />}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", marginLeft: 16 }}>
                    <Clock size={12} />{dateStr}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Documentos */}
      <Card>
        <CardHeader title="Documentos"
          action={<button style={verTodosStyle} onClick={() => setActive("documentos")}>Ver todos <ChevronRight size={14} /></button>}
        />
        {(() => {
          const pendingConfirm = documents.filter(d => d.requires_confirmation && !myConfirmations[d.id]).length;
          return pendingConfirm > 0 ? (
            <button onClick={() => setActive("documentos")} style={{ background:"none", border:"none", padding:0, cursor:"pointer", display:"block", marginBottom:10, textAlign:"left" }}>
              <span style={{ fontSize:12, color:COLORS.gold, fontWeight:600, animation:"gentlePulse 2s ease-in-out infinite", display:"inline-block" }}>⚠ {pendingConfirm} documento{pendingConfirm !== 1 ? "s" : ""} pendiente{pendingConfirm !== 1 ? "s" : ""} de confirmar lectura</span>
            </button>
          ) : null;
        })()}
        {documents.length === 0 ? (
          <p style={{ color:COLORS.textMuted, fontSize:13, margin:0 }}>No hay documentos disponibles.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {documents.slice(0, 4).map((doc, i) => (
              <div key={doc.id ?? i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:13, color:COLORS.text, padding:"9px 0", borderBottom:`1px solid ${COLORS.border}` }}>
                <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <FileText size={14} color={COLORS.textMuted} />{doc.title}
                </span>
                {doc.file_url && <DocDownloadBtn fileUrl={doc.file_url} iconOnly />}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Solicitudes — 3 más recientes */}
      <Card>
        <CardHeader title="Solicitudes"
          action={
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <button style={verTodosStyle} onClick={() => setActive("solicitudes")}>Ver todas <ChevronRight size={14} /></button>
              <button onClick={() => setModal("new-sol")} title="Nueva solicitud" style={{
                width:26, height:26, borderRadius:6, border:"none",
                background:`linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
                color:"#FFF", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 2px 8px rgba(201,162,78,0.35)", flexShrink:0,
              }}>
                <Plus size={13}/>
              </button>
            </div>
          }
        />
        {allSolicitudes.length === 0 ? (
          <p style={{ color:COLORS.textMuted, fontSize:13, margin:0 }}>Sin solicitudes activas.{" "}
            <button onClick={() => setModal("new-sol")} style={{ background:"none", border:"none", color:COLORS.gold, fontWeight:600, fontSize:13, cursor:"pointer", padding:0, fontFamily:"'Manrope', sans-serif" }}>Crear una</button>
          </p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {allSolicitudes.slice(0,3).map(s => (
              <SolicitudItem key={`${s.kind}-${s.id}`} s={s} />
            ))}
          </div>
        )}
      </Card>

      {/* Encuesta activa */}
      {activePoll && (
        <Card style={{ border:`1.5px solid ${COLORS.gold}` }}>
          <CardHeader title="Encuesta activa"
            action={<button style={verTodosStyle} onClick={() => setActive("encuestas")}>Ver encuestas <ChevronRight size={14}/></button>}
          />
          <p style={{ fontSize:14, fontWeight:700, color:COLORS.green, margin:"0 0 12px", lineHeight:1.4 }}>{activePoll.question}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {activePoll.options.map((opt, idx) => (
              <label key={idx} style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer", fontSize:13, color:COLORS.text, fontWeight: pollPending === idx ? 600 : 400 }}>
                <input type="radio" name={`home-poll-${activePoll.id}`} checked={pollPending === idx}
                  onChange={() => setPollPending(idx)}
                  style={{ accentColor: COLORS.green, width:15, height:15, flexShrink:0 }}
                />
                {opt}
              </label>
            ))}
          </div>
          <button onClick={async () => {
            if (pollPending === null || pollPending === undefined || pollVoting) return;
            setPollVoting(true);
            const { error } = await supabase.from("poll_votes").insert({ poll_id: activePoll.id, user_id: userId, option_index: pollPending });
            setPollVoting(false);
            if (!error) { onVoted?.(activePoll.id, pollPending); setPollPending(null); }
          }} disabled={pollPending === null || pollPending === undefined || pollVoting} style={{
            marginTop:14, padding:"8px 18px", borderRadius:8, border:"none",
            background: (pollPending === null || pollPending === undefined || pollVoting) ? COLORS.border : `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
            color:"#FFF", fontSize:13, fontWeight:700,
            cursor: (pollPending === null || pollPending === undefined || pollVoting) ? "not-allowed" : "pointer",
            fontFamily:"'Manrope', sans-serif", opacity: (pollPending === null || pollPending === undefined || pollVoting) ? 0.7 : 1, transition:"all 0.15s",
          }}>{pollVoting ? "Enviando..." : "Votar"}</button>
        </Card>
      )}

      {/* Reconocimientos recientes */}
      <Card>
        <CardHeader title="Reconocimientos"
          action={<button style={verTodosStyle} onClick={() => setActive("reconocimientos")}>Ver todos <ChevronRight size={14}/></button>}
        />
        {recognitions.length === 0 ? (
          <p style={{ color:COLORS.textMuted, fontSize:13, margin:0 }}>Aún no hay reconocimientos.</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {recognitions.slice(0,3).map(r => (
              <div key={r.id} style={{ borderBottom:`1px solid ${COLORS.border}`, paddingBottom:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                  <Award size={12} color={COLORS.gold} style={{ flexShrink:0 }} />
                  <span style={{ fontSize:12, fontWeight:700, color:COLORS.green }}>
                    {r.from_name ?? "—"} → {r.to_name ?? "—"}
                  </span>
                  <span style={{ marginLeft:"auto", fontSize:10, color:COLORS.textMuted, flexShrink:0 }}>
                    {fmtSupaDate((r.created_at ?? "").slice(0,10))}
                  </span>
                </div>
                <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", color:COLORS.gold, background:"rgba(201,162,78,0.1)", borderRadius:4, padding:"1px 6px" }}>{r.category}</span>
                <p style={{ fontSize:12, color:COLORS.textMuted, margin:"4px 0 0", lineHeight:1.5, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{r.message}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Cumpleaños */}
      <Card>
        <CardHeader title="Próximos cumpleaños" />
        {upcomingBirthdays.length === 0 ? (
          <p style={{ color:COLORS.textMuted, fontSize:13, margin:0 }}>No hay cumpleaños próximos.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", fontSize: 13 }}>
            {upcomingBirthdays.slice(0, 3).map((b) => (
              <div key={b.full_name} style={{
                display: "flex", alignItems: "center", gap: 10,
                color: COLORS.text, padding: "9px 0",
                borderBottom: `1px solid ${COLORS.border}`,
              }}>
                <Cake size={16} color={COLORS.gold} />
                {b.full_name}
                <span style={{ marginLeft: "auto", color: COLORS.textMuted, fontSize: 12 }}>{b.date}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
    </>
  );
}

function PlaceholderSection({ title }) {
  return (
    <Card>
      <CardHeader title={title} />
      <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0 }}>
        Esta sección se desarrolla en la siguiente fase.
      </p>
    </Card>
  );
}

function ProfileSection({ profile, onAliasUpdated }) {
  const [currentPwd,   setCurrentPwd]   = useState("");
  const [newPwd,       setNewPwd]       = useState("");
  const [confirmPwd,   setConfirmPwd]   = useState("");
  const [pwdLoading,   setPwdLoading]   = useState(false);
  const [pwdError,     setPwdError]     = useState(null);
  const [pwdSuccess,   setPwdSuccess]   = useState(false);
  const [alias,        setAlias]        = useState(profile?.alias ?? "");
  const [aliasLoading, setAliasLoading] = useState(false);
  const [aliasSaved,   setAliasSaved]   = useState(false);
  const [aliasError,   setAliasError]   = useState(null);

  async function handleSaveAlias() {
    setAliasError(null);
    setAliasSaved(false);
    setAliasLoading(true);
    const trimmed = alias.trim();
    const { error } = await supabase.from("profiles").update({ alias: trimmed || null }).eq("id", profile.id);
    setAliasLoading(false);
    if (error) { setAliasError(translateError(error.message)); return; }
    onAliasUpdated?.(trimmed || null);
    setAliasSaved(true);
    setTimeout(() => setAliasSaved(false), 3000);
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(false);
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdError("Por favor completa todos los campos.");
      return;
    }
    if (newPwd.length < 8) {
      setPwdError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError("Las contraseñas no coinciden.");
      return;
    }
    setPwdLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setPwdLoading(false);
    if (error) {
      setPwdError(translateError(error.message));
    } else {
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setPwdSuccess(true);
    }
  }

  if (!profile) {
    return (
      <Card>
        <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0 }}>Cargando perfil...</p>
      </Card>
    );
  }

  function fmtHireDate(str) {
    if (!str) return "—";
    const [y, m, d] = str.split("-").map(Number);
    const months = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    return `${d} de ${months[m - 1]} de ${y}`;
  }

  const showRole = profile.role === "admin";
  const row = (label, value) => value ? (
    <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0", borderBottom:`1px solid ${COLORS.border}` }}>
      <span style={{ fontSize:13, color:COLORS.textMuted, fontWeight:600 }}>{label}</span>
      <span style={{ fontSize:13, color:COLORS.text }}>{value}</span>
    </div>
  ) : null;

  const inputStyle = {
    width:"100%", padding:"9px 12px", borderRadius:8,
    border:`1px solid ${COLORS.border}`, background:COLORS.inputBg,
    color:COLORS.text, fontSize:13, fontFamily:"'Manrope', sans-serif",
    outline:"none", boxSizing:"border-box",
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <Card>
        <CardHeader title="Mi perfil" />
        {row("Nombre completo", profile.full_name)}
        {row("Puesto", profile.position)}
        {((Array.isArray(profile.departments) && profile.departments.length > 0) || profile.department) && (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, padding:"11px 0", borderBottom:`1px solid ${COLORS.border}`, flexWrap:"wrap" }}>
            <span style={{ fontSize:13, color:COLORS.textMuted, fontWeight:600 }}>
              {Array.isArray(profile.departments) && profile.departments.length > 1 ? "Departamentos" : "Departamento"}
            </span>
            <div style={{ display:"flex", flexWrap:"wrap", gap:4, justifyContent:"flex-end" }}>
              {Array.isArray(profile.departments) && profile.departments.length > 0
                ? profile.departments.map(d => <DeptTag key={d} dept={d} />)
                : <DeptTag dept={profile.department} />
              }
            </div>
          </div>
        )}
        {row("Fecha de ingreso", fmtHireDate(profile.hire_date))}
        {showRole && (
          <div style={{ marginTop:14 }}>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:COLORS.gold, background:"rgba(201,162,78,0.12)", borderRadius:6, padding:"4px 10px", display:"inline-block", width:"fit-content" }}>
              {profile.role === "admin" ? "Administrador" : "RRHH"}
            </span>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="¿Cómo quieres que te llamemos?" />
        <p style={{ fontSize:12, color:COLORS.textMuted, margin:"0 0 12px", lineHeight:1.6 }}>
          Si prefieres un apodo o nombre corto, escríbelo aquí. Se usará en tu saludo del portal.
        </p>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <input
            type="text"
            value={alias}
            onChange={e => { if (e.target.value.length <= 30) setAlias(e.target.value); }}
            placeholder={getFirstNames(profile.full_name) || "Tu apodo o nombre corto"}
            maxLength={30}
            style={{ ...inputStyle, flex:1 }}
            onFocus={e => e.target.style.borderColor=COLORS.gold}
            onBlur={e => e.target.style.borderColor=COLORS.border}
          />
          <button
            onClick={handleSaveAlias}
            disabled={aliasLoading}
            style={{ ...btnSubmitStyle, padding:"9px 18px", fontSize:13, whiteSpace:"nowrap", opacity:aliasLoading?0.7:1, cursor:aliasLoading?"not-allowed":"pointer" }}
          >
            {aliasLoading ? "Guardando..." : "Guardar"}
          </button>
        </div>
        {aliasSaved && <p style={{ fontSize:12, color:COLORS.greenSoft, fontWeight:600, margin:"8px 0 0" }}>✓ ¡Listo! Tu nombre preferido fue actualizado.</p>}
        {aliasError && <p style={{ fontSize:12, color:"#e07070", margin:"8px 0 0" }}>{aliasError}</p>}
      </Card>

      <Card>
        <CardHeader title="Cambiar contraseña" />
        <p style={{ fontSize:12, color:COLORS.textMuted, fontFamily:"'Manrope', sans-serif", marginTop:0, marginBottom:16, lineHeight:1.6 }}>
          Por seguridad, te recomendamos usar una contraseña de al menos 8 caracteres que combine letras, números y símbolos.
        </p>
        <form onSubmit={handleChangePassword} style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:COLORS.textMuted, fontFamily:"'Manrope', sans-serif", marginBottom:5 }}>Contraseña actual</label>
            <PasswordInput
              value={currentPwd}
              onChange={e => setCurrentPwd(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:COLORS.textMuted, fontFamily:"'Manrope', sans-serif", marginBottom:5 }}>Nueva contraseña</label>
            <PasswordInput
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:COLORS.textMuted, fontFamily:"'Manrope', sans-serif", marginBottom:5 }}>Confirmar nueva contraseña</label>
            <PasswordInput
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>
          {pwdError && (
            <p style={{ margin:0, fontSize:12, color:"#c0392b", fontFamily:"'Manrope', sans-serif" }}>{pwdError}</p>
          )}
          {pwdSuccess && (
            <p style={{ margin:0, fontSize:12, color:"#27ae60", fontWeight:600, fontFamily:"'Manrope', sans-serif" }}>Contraseña actualizada correctamente.</p>
          )}
          <div style={{ display:"flex", justifyContent:"flex-end", marginTop:4 }}>
            <button
              type="submit"
              disabled={pwdLoading}
              style={{
                background: pwdLoading ? COLORS.border : `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
                border:"none", borderRadius:8, padding:"9px 20px",
                color:"#FFF", fontSize:13, fontWeight:700, cursor: pwdLoading ? "not-allowed" : "pointer",
                fontFamily:"'Manrope', sans-serif", boxShadow: pwdLoading ? "none" : "0 4px 14px rgba(201,162,78,0.3)",
                transition:"all 0.15s",
              }}
            >
              {pwdLoading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function SolicitudesSection({ allSolicitudes = [], onNewRequest, onNewReport, availableDays, existingVacationRequests = [], onDeleteRequest, onDeleteReport }) {
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

function DocumentsSection({ documents: allDocs, myConfirmations = {}, userId, onConfirmRead }) {
  const documents = allDocs.filter(d => !d.archived);
  const [confirming, setConfirming] = useState({});

  async function handleConfirm(doc) {
    if (confirming[doc.id]) return;
    setConfirming(prev => ({ ...prev, [doc.id]: true }));
    const confirmedAt = new Date().toISOString();
    const { error } = await supabase.from("document_confirmations").insert({ document_id: doc.id, user_id: userId, confirmed_at: confirmedAt });
    setConfirming(prev => ({ ...prev, [doc.id]: false }));
    if (!error) onConfirmRead?.(doc.id, confirmedAt);
  }

  function fmtConfirmedAt(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  if (documents.length === 0) {
    return <Card><p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>No hay documentos disponibles.</p></Card>;
  }
  return (
    <Card>
      <div style={{ display:"flex", flexDirection:"column" }}>
        {documents.map((doc, i) => (
          <div key={doc.id ?? i} style={{ padding:"10px 0", borderBottom:`1px solid ${COLORS.border}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ display:"flex", alignItems:"center", gap:8, minWidth:0, flex:1 }}>
                <FileText size={14} color={COLORS.textMuted} style={{ flexShrink:0 }} />
                <span style={{ minWidth:0 }}>
                  <span style={{ fontSize:13, color:COLORS.text, fontWeight:500, wordBreak:"break-word" }}>{doc.title}</span>
                  {doc.category && (
                    <span style={{ marginLeft:8, fontSize:10, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:COLORS.gold, background:"rgba(201,162,78,0.1)", borderRadius:4, padding:"1px 6px" }}>{doc.category}</span>
                  )}
                </span>
              </span>
              {doc.file_url && <DocDownloadBtn fileUrl={doc.file_url} />}
            </div>
            {doc.requires_confirmation && (
              myConfirmations[doc.id]
                ? <p style={{ margin:"6px 0 0 22px", fontSize:11, color:COLORS.greenSoft, fontWeight:600 }}>✓ Leído el {fmtConfirmedAt(myConfirmations[doc.id])}</p>
                : <button onClick={() => handleConfirm(doc)} disabled={!!confirming[doc.id]} style={{ marginTop:6, marginLeft:22, background:COLORS.green, color:"#FFF", border:"none", borderRadius:6, padding:"4px 12px", fontSize:11, fontWeight:700, cursor:confirming[doc.id]?"not-allowed":"pointer", fontFamily:"'Manrope', sans-serif", opacity:confirming[doc.id]?0.65:1 }}>
                    {confirming[doc.id] ? "Guardando..." : "Confirmar lectura"}
                  </button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function AnnouncementDetailModal({ announcement: a, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={onClose}
    >
      <div
        style={{ background:COLORS.panel, borderRadius:16, padding:"28px 28px 24px", width:"100%", maxWidth:780, maxHeight:"88vh", overflowY:"auto", boxShadow:"0 8px 40px rgba(31,74,64,0.22)", fontFamily:"'Manrope', sans-serif", animation:"sectionIn 0.18s ease-out both" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            {a.tag && <Tag label={a.tag} />}
            <span style={{ fontSize:12, color:COLORS.textMuted }}>{fmtFull(a.publish_at)}</span>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.textMuted, display:"flex", padding:4, flexShrink:0, marginLeft:12 }}>
            <X size={18} />
          </button>
        </div>
        <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:24, fontWeight:600, color:COLORS.green, margin:"0 0 16px", lineHeight:1.3, wordBreak:"break-word" }}>{a.title}</h2>
        {a.body
          ? <p style={{ fontSize:14, color:COLORS.text, lineHeight:1.75, margin:"0 0 16px", whiteSpace:"pre-wrap" }}>{a.body}</p>
          : <p style={{ fontSize:13, color:COLORS.textMuted, fontStyle:"italic", margin:"0 0 16px" }}>Este comunicado no tiene cuerpo de texto.</p>
        }
        {a.profiles?.full_name && (
          <p style={{ fontSize:12, color:COLORS.textMuted, margin:"0 0 20px" }}>Publicado por: <strong style={{ color:COLORS.text }}>{a.profiles.full_name}</strong></p>
        )}
        <button onClick={onClose} style={{ ...btnCancelStyle, flex:"none", width:"100%", marginTop:4 }}>Cerrar</button>
      </div>
    </div>
  );
}

function AnnouncementsSection({ announcements, profile, onDeleteAnnouncement }) {
  const isAdmin = profile?.role === "admin";
  const [expanded,   setExpanded]   = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  async function handleDelete(a) {
    if (!window.confirm("¿Eliminar este comunicado? Esta acción no se puede deshacer.")) return;
    setDeletingId(a.id);
    setDeleteError(null);
    const { error } = await supabase.from("announcements").delete().eq("id", a.id);
    setDeletingId(null);
    if (error) { setDeleteError(a.id); return; }
    onDeleteAnnouncement?.(a.id);
  }
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {announcements.length === 0 ? (
        <Card><p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>No hay comunicados disponibles.</p></Card>
      ) : announcements.map((a, i) => {
        const key = a.id ?? i;
        const isExpanded = !!expanded[key];
        return (
          <Card key={key}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <Tag label={a.tag || "Aviso"} />
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:11, color:COLORS.textMuted, fontFamily:"'Manrope', sans-serif" }}>{fmtFull(a.publish_at)}</span>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(a)}
                    disabled={deletingId === a.id}
                    title="Eliminar comunicado"
                    style={{ background:"none", border:"none", cursor:deletingId===a.id?"not-allowed":"pointer", color:"rgba(192,57,43,0.6)", padding:2, display:"flex", alignItems:"center", opacity:deletingId===a.id?0.5:1, transition:"color 0.15s" }}
                    onMouseEnter={e => { if (deletingId!==a.id) e.currentTarget.style.color="#c0392b"; }}
                    onMouseLeave={e => { e.currentTarget.style.color="rgba(192,57,43,0.6)"; }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, fontWeight:600, color:COLORS.green, margin:"0 0 10px", lineHeight:1.3, wordBreak:"break-word" }}>{a.title}</h3>
            {isExpanded && a.body && (
              <p style={{ fontSize:14, color:COLORS.text, lineHeight:1.7, margin:"0 0 8px", whiteSpace:"pre-wrap", fontFamily:"'Manrope', sans-serif" }}>{a.body}</p>
            )}
            {deleteError === a.id && <p style={{ fontSize:11, color:"#c0392b", margin:"4px 0" }}>No se pudo eliminar. Intenta de nuevo.</p>}
            {a.body && (
              <button
                onClick={() => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))}
                style={{ background:"none", border:"none", color:COLORS.gold, fontSize:12, fontWeight:600, cursor:"pointer", padding:0, fontFamily:"'Manrope', sans-serif" }}
              >
                {isExpanded ? "Ver menos" : "Ver más"}
              </button>
            )}
          </Card>
        );
      })}
    </div>
  );
}

/* ── Reconocimientos ── */
function RecognitionsSection({ recognitions = [], onNewRecognition, onDeleteRecognition, userId, profile, teamDirectory = [], onMarkRead, unreadCount = 0 }) {
  const [modal,    setModal]    = useState(false);
  const [toUser,   setToUser]   = useState("");
  const [category, setCategory] = useState("");
  const [message,  setMessage]  = useState("");
  const [sending,  setSending]  = useState(false);
  const [error,    setError]    = useState(null);
  const [success,  setSuccess]  = useState(false);

  const peers = teamDirectory.filter(p => p.id !== userId);

  // Auto-mark all as read while viewing this section
  useEffect(() => {
    if (unreadCount > 0) onMarkRead?.();
  }, [unreadCount]);

  function openModal() { setModal(true); setError(null); setSuccess(false); }
  function closeModal() { setModal(false); setToUser(""); setCategory(""); setMessage(""); setError(null); }

  async function handleSend() {
    if (!toUser || !category || !message.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }
    setSending(true); setError(null);
    const { error: err } = await supabase
      .from("recognitions")
      .insert({ from_user_id: userId, to_user_id: toUser, category, message: message.trim() });
    setSending(false);
    if (err) { setError(translateError(err.message)); return; }
    closeModal();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  async function handleDelete(id) {
    const { error: err } = await supabase.from("recognitions").delete().eq("id", id);
    if (!err) onDeleteRecognition?.(id);
  }

  const isAdmin = profile?.role === "admin";
  const selStyle = { width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${COLORS.border}`, background:COLORS.inputBg, color:COLORS.text, fontSize:13, fontFamily:"'Manrope', sans-serif", outline:"none" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {success && (
        <div style={{ padding:"10px 16px", background:"rgba(31,74,64,0.08)", border:`1px solid ${COLORS.green}`, borderRadius:10, display:"flex", alignItems:"center", gap:8 }}>
          <Award size={15} color={COLORS.green} />
          <span style={{ fontSize:13, color:COLORS.green, fontWeight:600 }}>¡Reconocimiento enviado con éxito!</span>
        </div>
      )}

      {modal && (
        <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:COLORS.panel, borderRadius:16, padding:28, width:"100%", maxWidth:420, boxShadow:"0 8px 32px rgba(31,74,64,0.18)", fontFamily:"'Manrope', sans-serif" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:22, fontWeight:600, color:COLORS.green, margin:0 }}>Dar un reconocimiento</h2>
              <button onClick={closeModal} style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.textMuted, display:"flex", padding:4 }}><X size={18}/></button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:COLORS.textMuted, marginBottom:5 }}>Compañero</label>
                <select value={toUser} onChange={e => setToUser(e.target.value)} style={selStyle}>
                  <option value="" style={{ color:"#1F4A40" }}>Selecciona un compañero...</option>
                  {peers.map(p => <option key={p.id} value={p.id} style={{ color:"#1F4A40" }}>{p.full_name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:COLORS.textMuted, marginBottom:5 }}>Categoría</label>
                <select value={category} onChange={e => setCategory(e.target.value)} style={selStyle}>
                  <option value="" style={{ color:"#1F4A40" }}>Selecciona una categoría...</option>
                  {RECOGNITION_CATEGORIES.map(c => <option key={c} value={c} style={{ color:"#1F4A40" }}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:COLORS.textMuted, marginBottom:5 }}>Mensaje</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Escribe por qué reconoces a esta persona..."
                  rows={4}
                  style={{ ...selStyle, resize:"vertical", boxSizing:"border-box" }}
                />
              </div>
              {error && <p style={{ fontSize:12, color:"#c0392b", margin:0 }}>{error}</p>}
              <button onClick={handleSend} disabled={sending} style={{
                padding:"11px 0", borderRadius:9, border:"none",
                background: sending ? COLORS.border : `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
                color:"#FFF", fontSize:14, fontWeight:700,
                cursor: sending ? "not-allowed" : "pointer",
                fontFamily:"'Manrope', sans-serif", opacity: sending ? 0.7 : 1, transition:"all 0.15s",
              }}>
                {sending ? "Enviando..." : "Enviar reconocimiento"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <button onClick={openModal} style={{
          display:"flex", alignItems:"center", gap:8,
          background:`linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
          border:"none", borderRadius:8, padding:"10px 18px",
          color:"#FFF", fontSize:14, fontWeight:700, cursor:"pointer",
          fontFamily:"'Manrope', sans-serif", boxShadow:"0 4px 14px rgba(201,162,78,0.35)",
        }}><Award size={16}/> Dar un reconocimiento</button>
      </div>

      {recognitions.length === 0 ? (
        <Card><p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>Aún no hay reconocimientos. ¡Sé el primero en reconocer a un compañero!</p></Card>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {recognitions.map(r => (
            <Card key={r.id} style={{ padding:"14px 16px" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap", marginBottom:5 }}>
                    <Award size={14} color={COLORS.gold} style={{ flexShrink:0 }} />
                    <span style={{ fontSize:13, fontWeight:700, color:COLORS.green }}>
                      {r.from_name ?? "—"} reconoció a {r.to_name ?? "—"}
                    </span>
                  </div>
                  <span style={{ display:"inline-block", fontSize:11, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", color:COLORS.gold, background:"rgba(201,162,78,0.12)", borderRadius:6, padding:"2px 8px", marginBottom:6 }}>{r.category}</span>
                  <p style={{ fontSize:13, color:COLORS.text, lineHeight:1.6, margin:"4px 0", wordBreak:"break-word" }}>{r.message}</p>
                  <span style={{ fontSize:11, color:COLORS.textMuted }}>{fmtSupaDate((r.created_at ?? "").slice(0,10))}</span>
                </div>
                {isAdmin && (
                  <button onClick={() => handleDelete(r.id)} title="Eliminar"
                    style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.textMuted, padding:4, flexShrink:0, display:"flex", transition:"color 0.12s" }}
                    onMouseEnter={e => e.currentTarget.style.color="#c0392b"}
                    onMouseLeave={e => e.currentTarget.style.color=COLORS.textMuted}
                  ><Trash2 size={14}/></button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Encuestas ── */
function PollResultBars({ poll, pollResults = {}, myVoteIndex }) {
  const results = pollResults[poll.id] || {};
  const total = Object.values(results).reduce((s, v) => s + v, 0);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {poll.options.map((opt, idx) => {
        const votes = results[idx] ?? 0;
        const pct = total > 0 ? Math.round((votes / total) * 100) : 0;
        const isMyVote = myVoteIndex === idx;
        return (
          <div key={idx}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
              <span style={{ fontSize:13, fontWeight: isMyVote ? 700 : 500, color: isMyVote ? COLORS.green : COLORS.text, display:"flex", alignItems:"center", gap:5 }}>
                {isMyVote && <Check size={13} color={COLORS.green} />}
                {opt}
              </span>
              <span style={{ fontSize:12, color:COLORS.textMuted, flexShrink:0, marginLeft:8 }}>{votes} voto{votes !== 1 ? "s" : ""} · {pct}%</span>
            </div>
            <div style={{ height:8, borderRadius:4, background:COLORS.border, overflow:"hidden" }}>
              <div style={{ height:"100%", borderRadius:4, width:`${pct}%`, background: isMyVote ? `linear-gradient(90deg, ${COLORS.goldSoft}, ${COLORS.gold})` : COLORS.green, transition:"width 0.4s ease" }} />
            </div>
          </div>
        );
      })}
      <div style={{ fontSize:11, color:COLORS.textMuted }}>{total} voto{total !== 1 ? "s" : ""} totales</div>
    </div>
  );
}

function EncuestasSection({ polls = [], myVotes = {}, pollResults = {}, userId, profile, onPollCreated, onVoted, onPollClosed, onPollDeleted }) {
  const isAdmin = profile?.role === "admin";
  const [question,     setQuestion]     = useState("");
  const [options,      setOptions]      = useState(["", ""]);
  const [creating,     setCreating]     = useState(false);
  const [createError,  setCreateError]  = useState(null);
  const [pendingVote,  setPendingVote]  = useState({});
  const [votingPoll,   setVotingPoll]   = useState(null);
  const [changingVote, setChangingVote] = useState({});
  const [confirmDel,   setConfirmDel]   = useState(null);
  const [deleting,     setDeleting]     = useState(null);
  const [voteError,    setVoteError]    = useState(null);

  async function handleCreate() {
    const q = question.trim();
    const opts = options.map(o => o.trim()).filter(Boolean);
    if (!q) { setCreateError("Escribe una pregunta."); return; }
    if (opts.length < 2) { setCreateError("Agrega al menos 2 opciones."); return; }
    setCreating(true); setCreateError(null);
    const { data, error } = await supabase.from("polls")
      .insert({ question: q, options: opts, created_by: userId, status: "activa" })
      .select("*").single();
    setCreating(false);
    if (error) { setCreateError(translateError(error.message)); return; }
    setQuestion(""); setOptions(["", ""]);
    onPollCreated?.(data);
  }

  async function handleVote(pollId, isUpdate) {
    const idx = pendingVote[pollId];
    if (idx === undefined) return;
    setVoteError(null);
    setVotingPoll(pollId);
    const { error } = isUpdate
      ? await supabase.from("poll_votes").update({ option_index: idx }).eq("poll_id", pollId).eq("user_id", userId)
      : await supabase.from("poll_votes").insert({ poll_id: pollId, user_id: userId, option_index: idx });
    setVotingPoll(null);
    if (error) {
      setVoteError("No se pudo registrar tu voto. Intenta de nuevo.");
      return;
    }
    onVoted?.(pollId, idx);
    setPendingVote(prev => { const n = { ...prev }; delete n[pollId]; return n; });
    setChangingVote(prev => { const n = { ...prev }; delete n[pollId]; return n; });
  }

  async function handleClose(pollId) {
    await supabase.from("polls").update({ status: "cerrada" }).eq("id", pollId);
    onPollClosed?.(pollId);
  }

  async function handleDelete(pollId) {
    setDeleting(pollId);
    await supabase.from("polls").delete().eq("id", pollId);
    setDeleting(null); setConfirmDel(null);
    onPollDeleted?.(pollId);
  }

  const inpStyle = { width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${COLORS.border}`, background:COLORS.inputBg, color:COLORS.text, fontSize:13, fontFamily:"'Manrope', sans-serif", outline:"none", boxSizing:"border-box" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {isAdmin && (
        <Card>
          <CardHeader title="Crear encuesta" />
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:COLORS.textMuted, marginBottom:5 }}>Pregunta</label>
              <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="¿Cuál es tu pregunta?" style={inpStyle} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:COLORS.textMuted, marginBottom:6 }}>Opciones</label>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {options.map((opt, i) => (
                  <div key={i} style={{ display:"flex", gap:6, alignItems:"center" }}>
                    <input value={opt} onChange={e => { const n = [...options]; n[i] = e.target.value; setOptions(n); }} placeholder={`Opción ${i + 1}`} style={{ ...inpStyle, flex:1 }} />
                    {options.length > 2 && (
                      <button onClick={() => setOptions(options.filter((_, j) => j !== i))} style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.textMuted, padding:4, display:"flex", flexShrink:0, transition:"color 0.12s" }}
                        onMouseEnter={e => e.currentTarget.style.color="#c0392b"}
                        onMouseLeave={e => e.currentTarget.style.color=COLORS.textMuted}
                      ><X size={14}/></button>
                    )}
                  </div>
                ))}
              </div>
              {options.length < 5 && (
                <button onClick={() => setOptions([...options, ""])} style={{ marginTop:8, display:"flex", alignItems:"center", gap:5, background:"none", border:"none", cursor:"pointer", color:COLORS.gold, fontSize:12, fontWeight:600, fontFamily:"'Manrope', sans-serif", padding:0 }}>
                  <Plus size={13}/> Agregar opción
                </button>
              )}
            </div>
            {createError && <p style={{ fontSize:12, color:"#c0392b", margin:0 }}>{createError}</p>}
            <button onClick={handleCreate} disabled={creating} style={{
              padding:"10px 0", borderRadius:9, border:"none",
              background: creating ? COLORS.border : `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
              color:"#FFF", fontSize:14, fontWeight:700,
              cursor: creating ? "not-allowed" : "pointer",
              fontFamily:"'Manrope', sans-serif", opacity: creating ? 0.7 : 1, transition:"all 0.15s",
            }}>{creating ? "Creando..." : "Crear encuesta"}</button>
          </div>
        </Card>
      )}

      {polls.length === 0 ? (
        <Card><p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>No hay encuestas por el momento.</p></Card>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {polls.map(poll => {
            const myvote = myVotes[poll.id];
            const isClosed = poll.status === "cerrada";
            const hasVoted = myvote !== undefined;
            const isChanging = !!changingVote[poll.id];
            const showResults = hasVoted && !isChanging;
            const showVoteForm = !isClosed && (!hasVoted || isChanging);
            const isSubmitting = votingPoll === poll.id;
            const noPending = pendingVote[poll.id] === undefined;
            return (
              <Card key={poll.id} style={{ padding:"16px 18px" }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      <BarChart3 size={15} color={isClosed ? COLORS.textMuted : COLORS.green} style={{ flexShrink:0 }} />
                      <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:COLORS.green, flex:1, lineHeight:1.3 }}>{poll.question}</h3>
                      {isClosed && (
                        <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:"#FFF", background:COLORS.textMuted, borderRadius:6, padding:"2px 8px", flexShrink:0 }}>Cerrada</span>
                      )}
                    </div>
                  </div>
                  {isAdmin && (
                    <div style={{ display:"flex", gap:6, flexShrink:0, alignItems:"center" }}>
                      {!isClosed && (
                        <button onClick={() => handleClose(poll.id)} style={{ fontSize:11, fontWeight:600, color:COLORS.textMuted, background:"none", border:`1px solid ${COLORS.border}`, borderRadius:6, padding:"3px 8px", cursor:"pointer", fontFamily:"'Manrope', sans-serif", transition:"all 0.12s", whiteSpace:"nowrap" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor=COLORS.green; e.currentTarget.style.color=COLORS.green; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor=COLORS.border; e.currentTarget.style.color=COLORS.textMuted; }}
                        >Cerrar</button>
                      )}
                      {confirmDel === poll.id ? (
                        <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                          <span style={{ fontSize:11, color:COLORS.textMuted, whiteSpace:"nowrap" }}>¿Eliminar?</span>
                          <button onClick={() => handleDelete(poll.id)} disabled={deleting === poll.id} style={{ fontSize:11, fontWeight:700, color:"#FFF", background:"#c0392b", border:"none", borderRadius:6, padding:"3px 8px", cursor:"pointer", fontFamily:"'Manrope', sans-serif" }}>
                            {deleting === poll.id ? "..." : "Sí"}
                          </button>
                          <button onClick={() => setConfirmDel(null)} style={{ fontSize:11, fontWeight:600, color:COLORS.textMuted, background:"none", border:`1px solid ${COLORS.border}`, borderRadius:6, padding:"3px 8px", cursor:"pointer", fontFamily:"'Manrope', sans-serif" }}>No</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDel(poll.id)} style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.textMuted, padding:4, display:"flex", transition:"color 0.12s" }}
                          onMouseEnter={e => e.currentTarget.style.color="#c0392b"}
                          onMouseLeave={e => e.currentTarget.style.color=COLORS.textMuted}
                        ><Trash2 size={14}/></button>
                      )}
                    </div>
                  )}
                </div>

                {showVoteForm && (
                  <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                    {poll.options.map((opt, idx) => (
                      <label key={idx} style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer", fontSize:13, color:COLORS.text, fontWeight: pendingVote[poll.id] === idx ? 600 : 400 }}>
                        <input type="radio" name={`poll-${poll.id}`} checked={pendingVote[poll.id] === idx}
                          onChange={() => setPendingVote(prev => ({ ...prev, [poll.id]: idx }))}
                          style={{ accentColor: COLORS.green, width:15, height:15, flexShrink:0 }}
                        />
                        {opt}
                      </label>
                    ))}
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginTop:4, flexWrap:"wrap" }}>
                      <button onClick={() => handleVote(poll.id, hasVoted)} disabled={isSubmitting || noPending} style={{
                        padding:"8px 18px", borderRadius:8, border:"none",
                        background: (isSubmitting || noPending) ? COLORS.border : `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
                        color:"#FFF", fontSize:13, fontWeight:700,
                        cursor: (isSubmitting || noPending) ? "not-allowed" : "pointer",
                        fontFamily:"'Manrope', sans-serif", opacity: (isSubmitting || noPending) ? 0.7 : 1, transition:"all 0.15s",
                      }}>{isSubmitting ? "Enviando..." : hasVoted ? "Actualizar voto" : "Votar"}</button>
                      {isChanging && (
                        <button onClick={() => setChangingVote(prev => { const n={...prev}; delete n[poll.id]; return n; })} style={{ fontSize:12, color:COLORS.textMuted, background:"none", border:"none", cursor:"pointer", fontFamily:"'Manrope', sans-serif", padding:0 }}>Cancelar</button>
                      )}
                    </div>
                    {voteError && <p style={{ fontSize:12, color:"#e07070", margin:"6px 0 0" }}>{voteError}</p>}
                  </div>
                )}

                {showResults && (
                  <>
                    <PollResultBars poll={poll} pollResults={pollResults} myVoteIndex={myvote} />
                    {!isClosed && (
                      <button onClick={() => setChangingVote(prev => ({ ...prev, [poll.id]: true }))} style={{ marginTop:10, fontSize:12, color:COLORS.gold, background:"none", border:"none", cursor:"pointer", fontFamily:"'Manrope', sans-serif", fontWeight:600, padding:0, textDecoration:"underline" }}>
                        Cambiar mi voto
                      </button>
                    )}
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────
function fmtAmt(amount, currency) {
  const n = Number(amount);
  if (currency === "USD") return "$" + new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  return "₡" + new Intl.NumberFormat("es-CR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
function toUSD(amount, currency, rate) {
  if (currency === "USD") return Number(amount);
  return rate ? Number(amount) / rate : 0;
}
function toCRC(amount, currency, rate) {
  if (currency === "CRC") return Number(amount);
  return rate ? Number(amount) * rate : 0;
}

function ComisionesSection({ profile, userId, exchangeRate, mySales = [], allSales = [], onExchangeRateUpdated, onSaleDeleted, showToast }) {
  const isAdmin = profile?.role === "admin";
  const isMobile = useIsMobile();
  const rate = exchangeRate?.rate ?? null;

  // ── employee state ──
  const [displayCurrency, setDisplayCurrency] = useState("USD");
  const [filterMonth,     setFilterMonth]     = useState("");
  const [showSaleForm,    setShowSaleForm]    = useState(false);
  const [editingSale,     setEditingSale]     = useState(null);

  // sale form
  const [svcName,    setSvcName]    = useState("");
  const [clientName, setClientName] = useState("");
  const [amount,     setAmount]     = useState("");
  const [saleCurrency, setSaleCurrency] = useState("USD");
  const getTodayCR = () => {
    const now = new Date();
    const cr = new Date(now.toLocaleString("en-US", { timeZone: "America/Costa_Rica" }));
    return cr.toISOString().slice(0, 10);
  };
  const [saleDate,   setSaleDate]   = useState(getTodayCR());
  const [formLoading, setFormLoading] = useState(false);
  const [formError,   setFormError]   = useState(null);

  // ── admin state ──
  const [newRate,        setNewRate]        = useState("");
  const [rateLoading,    setRateLoading]    = useState(false);
  const [rateError,      setRateError]      = useState(null);
  const [rateSaved,      setRateSaved]      = useState(false);
  const [lockMonth,      setLockMonth]      = useState("");
  const [lockLoading,    setLockLoading]    = useState(false);
  const [lockError,      setLockError]      = useState(null);
  const [lockConfirm,    setLockConfirm]    = useState(false);
  const [adminFilter,    setAdminFilter]    = useState("");
  const [adminCurrency,  setAdminCurrency]  = useState("USD");

  function openNew() {
    setSvcName(""); setClientName(""); setAmount(""); setSaleCurrency("USD");
    setSaleDate(getTodayCR());
    setFormError(null); setEditingSale(null); setShowSaleForm(true);
  }
  function openEdit(sale) {
    setSvcName(sale.service_name ?? ""); setClientName(sale.client_name ?? "");
    setAmount(String(sale.amount ?? "")); setSaleCurrency(sale.currency ?? "USD");
    setSaleDate(sale.sale_date ?? ""); setFormError(null);
    setEditingSale(sale); setShowSaleForm(true);
  }
  function closeForm() { setShowSaleForm(false); setEditingSale(null); setFormError(null); }

  async function handleSaleSubmit() {
    if (!svcName.trim() || !amount || !saleDate) { setFormError("Servicio, monto y fecha son obligatorios."); return; }
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) { setFormError("El monto debe ser un número positivo."); return; }
    setFormLoading(true); setFormError(null);
    const payload = { service_name: svcName.trim(), client_name: clientName.trim() || null, amount: numAmt, currency: saleCurrency, sale_date: saleDate };
    let err;
    if (editingSale) {
      const { error } = await supabase.from("commission_sales").update(payload).eq("id", editingSale.id);
      err = error;
    } else {
      const { error } = await supabase.from("commission_sales").insert({ ...payload, user_id: userId });
      err = error;
    }
    setFormLoading(false);
    if (err) { setFormError(translateError(err.message)); return; }
    closeForm();
  }

  async function handleDelete(sale) {
    if (!window.confirm(`¿Eliminar la venta "${sale.service_name}"?`)) return;
    const { error } = await supabase.from("commission_sales").delete().eq("id", sale.id);
    if (!error) {
      onSaleDeleted?.(sale.id);
      showToast?.({ message: "Venta eliminada correctamente", Icon: Trash2 });
    }
  }

  async function handleSaveRate() {
    const r = parseFloat(newRate);
    if (isNaN(r) || r <= 0) { setRateError("Ingresa un tipo de cambio válido."); return; }
    setRateLoading(true); setRateError(null);
    const { data: existing } = await supabase.from("exchange_rate").select("id").limit(1).single();
    let err;
    if (existing) {
      const { error } = await supabase.from("exchange_rate").update({ rate: r, updated_at: new Date().toISOString(), updated_by: userId }).eq("id", existing.id);
      err = error;
    } else {
      const { error } = await supabase.from("exchange_rate").insert({ rate: r, updated_at: new Date().toISOString(), updated_by: userId });
      err = error;
    }
    setRateLoading(false);
    if (err) { setRateError(translateError(err.message)); return; }
    setRateSaved(true); setNewRate("");
    setTimeout(() => setRateSaved(false), 3000);
  }

  async function handleLockSales() {
    if (!lockMonth) { setLockError("Selecciona un mes."); return; }
    setLockLoading(true); setLockError(null);
    const start = lockMonth + "-01";
    const d = new Date(start + "T12:00:00");
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const end = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
    const { error } = await supabase.from("commission_sales").update({ locked: true }).gte("sale_date", start).lte("sale_date", end);
    setLockLoading(false);
    if (error) { setLockError(translateError(error.message)); return; }
    setLockConfirm(false); setLockMonth("");
  }

  // ── derived ──
  const filteredMySales = mySales.filter(s => !filterMonth || (s.sale_date && s.sale_date.startsWith(filterMonth)));

  function convertAmt(sale) {
    if (displayCurrency === sale.currency) return sale.amount;
    if (displayCurrency === "USD") return toUSD(sale.amount, sale.currency, rate);
    return toCRC(sale.amount, sale.currency, rate);
  }

  const totalDisplay = filteredMySales.reduce((acc, s) => acc + convertAmt(s), 0);
  const commissionDisplay = totalDisplay * 0.05;

  // ── admin derived ──
  const adminFilteredSales = allSales.filter(s => !adminFilter || (s.sale_date && s.sale_date.startsWith(adminFilter)));
  const byUser = {};
  adminFilteredSales.forEach(s => {
    const name = s.profiles?.full_name ?? s.user_id;
    if (!byUser[name]) byUser[name] = { name, total: 0, comm: 0 };
    const converted = adminCurrency === "USD"
      ? toUSD(s.amount, s.currency, rate)
      : toCRC(s.amount, s.currency, rate);
    byUser[name].total += converted;
    byUser[name].comm  += converted * 0.05;
  });
  const userRows = Object.values(byUser);
  const grandTotal = userRows.reduce((a, r) => a + r.total, 0);
  const grandComm  = userRows.reduce((a, r) => a + r.comm, 0);

  const cardStyle = { background: COLORS.panel, border: `1.5px solid ${COLORS.border}`, borderRadius: 14, padding: "18px 20px", marginBottom: 18 };
  const inp = { ...inputStyle, fontSize: 14, padding: "10px 14px" };
  const selSt = { width: "100%", background: COLORS.inputBg, border: `1.5px solid ${COLORS.border}`, borderRadius: 8, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'Manrope', sans-serif", cursor: "pointer", appearance: "auto" };

  if (isAdmin) {
    return (
      <div style={{ padding: isMobile ? "0 4px" : "0 8px", maxWidth: 860, margin: "0 auto" }}>
        {/* Exchange rate editor */}
        <div style={{ ...cardStyle, borderColor: COLORS.gold }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <DollarSign size={17} color={COLORS.gold} />
            <span style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>Tipo de cambio USD/CRC</span>
          </div>
          <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 12 }}>
            {rate ? `Actual: ₡${rate.toLocaleString("es-CR")} por USD` : "No configurado aún."}
            {exchangeRate?.updated_at && <span style={{ marginLeft: 8, fontSize: 12 }}>· Actualizado {new Date(exchangeRate.updated_at).toLocaleDateString("es-CR")}</span>}
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 5, fontWeight: 600 }}>Nuevo tipo de cambio (₡ por $1)</label>
              <input type="number" min="1" step="1" value={newRate} onChange={e => setNewRate(e.target.value)} placeholder="Ej. 530" style={inp}
                onFocus={e => e.target.style.borderColor = COLORS.gold} onBlur={e => e.target.style.borderColor = COLORS.border} />
            </div>
            <button onClick={handleSaveRate} disabled={rateLoading} style={{ ...btnSubmitStyle, height: 42, padding: "0 20px", opacity: rateLoading ? 0.7 : 1, cursor: rateLoading ? "not-allowed" : "pointer" }}>
              {rateLoading ? "Guardando..." : "Actualizar"}
            </button>
          </div>
          {rateError && <p style={{ fontSize: 12, color: "#e07070", marginTop: 8 }}>{rateError}</p>}
          {rateSaved && <p style={{ fontSize: 12, color: COLORS.green, marginTop: 8, fontWeight: 600 }}>¡Tipo de cambio actualizado!</p>}
        </div>

        {/* Summary table */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>Resumen de ventas</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {["USD", "CRC"].map(cur => (
                  <button key={cur} onClick={() => setAdminCurrency(cur)} style={{
                    padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${adminCurrency === cur ? COLORS.gold : COLORS.border}`,
                    background: adminCurrency === cur ? "rgba(201,162,78,0.12)" : COLORS.panel,
                    color: adminCurrency === cur ? COLORS.green : COLORS.textMuted,
                    fontWeight: adminCurrency === cur ? 700 : 400, fontSize: 12, cursor: "pointer",
                    fontFamily: "'Manrope', sans-serif",
                  }}>{cur}</button>
                ))}
              </div>
              <input type="month" value={adminFilter} onChange={e => setAdminFilter(e.target.value)} style={{ ...inp, width: "auto", minWidth: 160 }}
                onFocus={e => e.target.style.borderColor = COLORS.gold} onBlur={e => e.target.style.borderColor = COLORS.border} />
            </div>
          </div>
          {!rate && adminCurrency === "CRC" && <p style={{ fontSize: 12, color: "#e07070", marginBottom: 10 }}>Configura el tipo de cambio para convertir ventas en USD a CRC.</p>}
          {!rate && adminCurrency === "USD" && allSales.some(s => s.currency === "CRC") && <p style={{ fontSize: 12, color: "#e07070", marginBottom: 10 }}>Configura el tipo de cambio para convertir ventas en CRC a USD.</p>}
          {userRows.length === 0
            ? <p style={{ fontSize: 13, color: COLORS.textMuted, textAlign: "center", padding: "20px 0" }}>No hay ventas{adminFilter ? " para este período" : ""}.</p>
            : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1.5px solid ${COLORS.border}` }}>
                      <th style={{ textAlign: "left", padding: "8px 10px", color: COLORS.textMuted, fontWeight: 600 }}>Esteticista</th>
                      <th style={{ textAlign: "right", padding: "8px 10px", color: COLORS.textMuted, fontWeight: 600 }}>Total vendido</th>
                      <th style={{ textAlign: "right", padding: "8px 10px", color: COLORS.textMuted, fontWeight: 600 }}>Comisión (5%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userRows.map(r => (
                      <tr key={r.name} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                        <td style={{ padding: "8px 10px", fontWeight: 600, color: COLORS.text }}>{r.name}</td>
                        <td style={{ padding: "8px 10px", textAlign: "right", color: COLORS.text }}>{fmtAmt(r.total, adminCurrency)}</td>
                        <td style={{ padding: "8px 10px", textAlign: "right", color: COLORS.green, fontWeight: 600 }}>{fmtAmt(r.comm, adminCurrency)}</td>
                      </tr>
                    ))}
                    {userRows.length > 1 && (
                      <tr style={{ borderTop: `2px solid ${COLORS.border}` }}>
                        <td style={{ padding: "8px 10px", fontWeight: 700, color: COLORS.text }}>Total general</td>
                        <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: COLORS.text }}>{fmtAmt(grandTotal, adminCurrency)}</td>
                        <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: COLORS.gold }}>{fmtAmt(grandComm, adminCurrency)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>

        {/* Lock sales card */}
        <div style={{ ...cardStyle, borderColor: "rgba(224,112,112,0.35)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <AlertTriangle size={16} color="#e07070" />
            <span style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>Cerrar período</span>
          </div>
          <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 12 }}>Bloquea las ventas de un mes para que los empleados no puedan editarlas.</p>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 5, fontWeight: 600 }}>Mes a cerrar</label>
              <input type="month" value={lockMonth} onChange={e => setLockMonth(e.target.value)} style={inp}
                onFocus={e => e.target.style.borderColor = COLORS.gold} onBlur={e => e.target.style.borderColor = COLORS.border} />
            </div>
            <button onClick={() => { setLockError(null); setLockConfirm(true); }} style={{ ...btnSubmitStyle, background: "#c0392b", height: 42, padding: "0 20px" }}>
              Cerrar
            </button>
          </div>
          {lockError && <p style={{ fontSize: 12, color: "#e07070", marginTop: 8 }}>{lockError}</p>}
          {lockConfirm && (
            <div style={{ marginTop: 14, background: "rgba(224,112,112,0.08)", border: "1.5px solid rgba(224,112,112,0.35)", borderRadius: 10, padding: "14px 16px" }}>
              <p style={{ fontSize: 13, color: COLORS.text, marginBottom: 12, fontWeight: 600 }}>¿Confirmas cerrar el mes {lockMonth}? Esta acción no se puede deshacer.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setLockConfirm(false)} style={btnCancelStyle}>Cancelar</button>
                <button onClick={handleLockSales} disabled={lockLoading} style={{ ...btnSubmitStyle, background: "#c0392b", opacity: lockLoading ? 0.7 : 1 }}>
                  {lockLoading ? "Cerrando..." : "Confirmar cierre"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Employee view ──
  return (
    <div style={{ padding: isMobile ? "0 4px" : "0 8px", maxWidth: 700, margin: "0 auto" }}>
      {/* Header controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["USD", "CRC"].map(cur => (
            <button key={cur} onClick={() => setDisplayCurrency(cur)} style={{
              padding: "6px 16px", borderRadius: 20, border: `1.5px solid ${displayCurrency === cur ? COLORS.gold : COLORS.border}`,
              background: displayCurrency === cur ? "rgba(201,162,78,0.12)" : COLORS.panel,
              color: displayCurrency === cur ? COLORS.green : COLORS.textMuted,
              fontWeight: displayCurrency === cur ? 700 : 400, fontSize: 13, cursor: "pointer",
              fontFamily: "'Manrope', sans-serif",
            }}>{cur}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ ...inp, width: "auto", minWidth: 150 }}
            onFocus={e => e.target.style.borderColor = COLORS.gold} onBlur={e => e.target.style.borderColor = COLORS.border} />
          <button onClick={openNew} style={{ ...btnSubmitStyle, display: "flex", alignItems: "center", gap: 6, padding: "8px 16px" }}>
            <Plus size={15} /> Registrar
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div style={{ ...cardStyle, marginBottom: 0, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6, fontWeight: 600 }}>Total ventas {filterMonth || "histórico"}</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: COLORS.text, margin: 0 }}>
            {rate || displayCurrency === "USD" ? fmtAmt(totalDisplay, displayCurrency) : "—"}
          </p>
          <p style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>{filteredMySales.length} venta{filteredMySales.length !== 1 ? "s" : ""}</p>
        </div>
        <div style={{ ...cardStyle, marginBottom: 0, textAlign: "center", borderColor: COLORS.gold }}>
          <p style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6, fontWeight: 600 }}>Mi comisión (5%)</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: COLORS.gold, margin: 0 }}>
            {rate || displayCurrency === "USD" ? fmtAmt(commissionDisplay, displayCurrency) : "—"}
          </p>
          {displayCurrency === "CRC" && !rate && <p style={{ fontSize: 11, color: "#e07070", marginTop: 4 }}>Configura el tipo de cambio</p>}
        </div>
      </div>

      {/* Sale form */}
      {showSaleForm && (
        <div style={{ ...cardStyle, borderColor: COLORS.gold }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 14 }}>
            {editingSale ? "Editar venta" : "Nueva venta"}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 5, fontWeight: 600 }}>Servicio *</label>
              <input type="text" value={svcName} onChange={e => setSvcName(e.target.value)} placeholder="Ej. Facial de hidratación" style={inp}
                onFocus={e => e.target.style.borderColor = COLORS.gold} onBlur={e => e.target.style.borderColor = COLORS.border} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 5, fontWeight: 600 }}>Cliente (opcional)</label>
              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nombre del cliente" style={inp}
                onFocus={e => e.target.style.borderColor = COLORS.gold} onBlur={e => e.target.style.borderColor = COLORS.border} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 5, fontWeight: 600 }}>Monto *</label>
              <input type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" style={inp}
                onFocus={e => e.target.style.borderColor = COLORS.gold} onBlur={e => e.target.style.borderColor = COLORS.border} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 5, fontWeight: 600 }}>Moneda *</label>
              <select value={saleCurrency} onChange={e => setSaleCurrency(e.target.value)} style={selSt}>
                <option value="USD">USD (dólares)</option>
                <option value="CRC">CRC (colones)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 5, fontWeight: 600 }}>Fecha *</label>
              <input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} style={{ ...inp, maxWidth: "100%", minWidth: 0 }}
                onFocus={e => e.target.style.borderColor = COLORS.gold} onBlur={e => e.target.style.borderColor = COLORS.border} />
            </div>
          </div>
          {formError && <p style={{ fontSize: 12, color: "#e07070", marginBottom: 10 }}>{formError}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={closeForm} style={btnCancelStyle}>Cancelar</button>
            <button onClick={handleSaleSubmit} disabled={formLoading} style={{ ...btnSubmitStyle, opacity: formLoading ? 0.7 : 1, cursor: formLoading ? "not-allowed" : "pointer" }}>
              {formLoading ? "Guardando..." : editingSale ? "Guardar cambios" : "Registrar venta"}
            </button>
          </div>
        </div>
      )}

      {/* Sales history */}
      <div style={cardStyle}>
        <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 14 }}>Historial de ventas</p>
        {filteredMySales.length === 0
          ? <p style={{ fontSize: 13, color: COLORS.textMuted, textAlign: "center", padding: "20px 0" }}>No hay ventas{filterMonth ? " para este período" : ""}.</p>
          : filteredMySales.map(sale => {
              const displayAmt = convertAmt(sale);
              const comm = displayAmt * 0.05;
              const locked = sale.locked === true;
              return (
                <div key={sale.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, margin: "0 0 2px" }}>{sale.service_name}</p>
                    {sale.client_name && <p style={{ fontSize: 12, color: COLORS.textMuted, margin: "0 0 2px" }}>{sale.client_name}</p>}
                    <p style={{ fontSize: 12, color: COLORS.textMuted, margin: 0 }}>
                      {sale.sale_date} · {sale.currency}
                      {locked && <span style={{ marginLeft: 8, fontSize: 11, color: "#e07070", fontWeight: 600 }}>Período cerrado</span>}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, margin: "0 0 2px" }}>
                      {(rate || displayCurrency === "USD") ? fmtAmt(displayAmt, displayCurrency) : fmtAmt(sale.amount, sale.currency)}
                    </p>
                    <p style={{ fontSize: 12, color: COLORS.gold, fontWeight: 600, margin: "0 0 6px" }}>
                      Comisión: {(rate || displayCurrency === "USD") ? fmtAmt(comm, displayCurrency) : fmtAmt(sale.amount * 0.05, sale.currency)}
                    </p>
                    {!locked && (
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button onClick={() => openEdit(sale)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textMuted, padding: 4 }} title="Editar">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(sale)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e07070", padding: 4 }} title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}

function VacationSection({ profile, vacationRequests, onNewRequest }) {
  const vacationBalance = profile?.vacation_balance ?? VAC_TOTAL;
  const approvedDays  = vacationRequests.filter(r => r.status === "aprobado").reduce((a, r) => a + getEffectiveDays(r), 0);
  const pendingDays   = vacationRequests.filter(r => r.status === "pendiente").reduce((a, r) => a + getEffectiveDays(r), 0);
  const availableDays = Math.max(0, vacationBalance - approvedDays);
  const [showModal, setShowModal] = useState(false);

  const statBox = (label, value, color) => (
    <div style={{ flex:1, textAlign:"center", padding:"16px 8px" }}>
      <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:42, fontWeight:700, color, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:13, color:COLORS.textMuted, marginTop:4, fontWeight:600, letterSpacing:"0.03em" }}>{label}</div>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {showModal && (
        <CrearSolicitudModal
          onClose={() => setShowModal(false)}
          onSubmit={() => setShowModal(false)}
          editData={null}
          initialTipo="vacaciones"
          onNewRequest={onNewRequest}
          onNewReport={() => {}}
          availableDays={availableDays}
          existingVacationRequests={vacationRequests}
        />
      )}

      {/* Saldo */}
      <Card>
        <CardHeader title="Saldo de vacaciones"
          action={
            <button onClick={() => setShowModal(true)} style={{
              display:"flex", alignItems:"center", gap:6,
              background:`linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
              border:"none", borderRadius:7, padding:"7px 14px",
              color:"#FFF", fontSize:13, fontWeight:700, cursor:"pointer",
              fontFamily:"'Manrope', sans-serif", boxShadow:"0 3px 10px rgba(201,162,78,0.35)",
            }}><Plus size={14}/> Solicitar</button>
          }
        />
        <div style={{ display:"flex", borderTop:`1px solid ${COLORS.border}`, marginTop:4 }}>
          {statBox("Disponibles", availableDays, COLORS.green)}
          <div style={{ width:1, background:COLORS.border, margin:"12px 0" }}/>
          {statBox("Tomados", approvedDays, COLORS.gold)}
          <div style={{ width:1, background:COLORS.border, margin:"12px 0" }}/>
          {statBox("En solicitud", pendingDays, COLORS.goldSoft)}
        </div>
      </Card>

      {/* Historial */}
      <Card>
        <CardHeader title="Historial de solicitudes" />
        {vacationRequests.length === 0 ? (
          <p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>Aún no tienes solicitudes registradas.</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {vacationRequests.map((r, i) => (
              <div key={r.id ?? i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:`1px solid ${COLORS.border}` }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, color:COLORS.text, fontWeight:500 }}>
                    {fmtSupaDate(r.start_date)}{r.end_date ? ` — ${fmtSupaDate(r.end_date)}` : ""}
                  </div>
                  <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:2 }}>
                    {getEffectiveDays(r) || "—"} días hábiles
                  </div>
                  {r.reviewer?.full_name && r.status !== "pendiente" && (
                    <div style={{ fontSize:11, marginTop:3, color: r.status === "aprobado" ? COLORS.green : "#c0392b", fontWeight:500 }}>
                      {r.status === "aprobado" ? "Aprobado" : "Rechazado"} por {r.reviewer.full_name}
                    </div>
                  )}
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function AltaEmpleadoSection({ departmentsList = [] }) {
  const isMobile = useIsMobile();
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [fullName,      setFullName]      = useState("");
  const [alias,         setAlias]         = useState("");
  const [position,      setPosition]      = useState("");
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [hireDate,      setHireDate]      = useState("");
  const [birthDate,     setBirthDate]     = useState("");
  const [role,               setRole]               = useState("empleado");
  const [vacBalance,         setVacBalance]         = useState("");
  const [commissionEligible, setCommissionEligible] = useState(false);
  const [loading,            setLoading]            = useState(false);
  const [error,              setError]              = useState(null);
  const [partialErr,         setPartialErr]         = useState(null);
  const [successInfo,        setSuccessInfo]        = useState(null);

  function toggleDept(name) {
    setSelectedDepts(prev => prev.includes(name) ? prev.filter(d => d !== name) : [...prev, name]);
  }

  function generatePassword() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pwd = "";
    for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    setPassword(pwd);
  }

  async function handleCreate() {
    setError(null); setPartialErr(null); setSuccessInfo(null);
    if (!email.trim() || !password || !fullName.trim() || selectedDepts.length === 0) {
      setError("Correo, contraseña, nombre completo y al menos un departamento son obligatorios.");
      return;
    }
    setLoading(true);

    // Snapshot admin session BEFORE touching tempClient so we can restore it
    const { data: { session: adminSession } } = await supabase.auth.getSession();

    const tempClient = _createSupabaseClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { data, error: signUpError } = await tempClient.auth.signUp({ email: email.trim(), password });
    if (signUpError) { setError(translateError(signUpError.message)); setLoading(false); return; }
    const userId = data?.user?.id;
    if (!userId) {
      setError("No se pudo obtener el ID del nuevo usuario. Es posible que el correo ya esté registrado.");
      setLoading(false); return;
    }

    // Explicitly restore admin session — signUp on the temp client can pollute
    // the shared auth state even when persistSession:false is set
    if (adminSession) {
      await supabase.auth.setSession({
        access_token:  adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id:                    userId,
      full_name:             fullName.trim(),
      alias:                 alias.trim() || null,
      position:              position.trim() || null,
      departments:           selectedDepts,
      hire_date:             hireDate   || null,
      birth_date:            birthDate  || null,
      role,
      vacation_balance:       vacBalance  !== "" ? Number(vacBalance)  : VAC_TOTAL,
      commission_eligible:    commissionEligible,
    }, { onConflict: "id" });
    setLoading(false);
    if (profileError) {
      setPartialErr(
        `El usuario fue creado en autenticación (ID: ${userId}) pero no se pudo actualizar el perfil.\n` +
        `message: ${profileError.message}\n` +
        `code: ${profileError.code ?? "—"}\n` +
        `details: ${profileError.details ?? "—"}\n` +
        `hint: ${profileError.hint ?? "—"}`
      );
      return;
    }
    const savedEmail = email.trim();
    const savedPwd   = password;
    setEmail(""); setPassword(""); setFullName(""); setAlias(""); setPosition("");
    setSelectedDepts([]); setHireDate(""); setBirthDate("");
    setRole("empleado"); setVacBalance(""); setCommissionEligible(false);
    setSuccessInfo({ email: savedEmail, password: savedPwd });
  }

  const fl = (text, optional) => (
    <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>
      {text}{optional && <span style={{ fontWeight:400 }}> (opcional)</span>}
    </label>
  );
  const inp = { ...inputStyle, fontSize:14, padding:"10px 14px" };
  const selStyle = { width:"100%", background:COLORS.inputBg, border:`1.5px solid ${COLORS.border}`, borderRadius:8, padding:"11px 14px", color:COLORS.text, fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"'Manrope', sans-serif", cursor:"pointer", appearance:"auto" };

  return (
    <Card>
      <CardHeader title="Nuevo empleado" />

      {/* Credenciales */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr", gap:12, marginBottom:14 }}>
        <div>
          {fl("Correo corporativo")}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@cec.cr" style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Contraseña temporal")}
          <div style={{ display:"flex", gap:8 }}>
            <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña…" style={{ ...inp, flex:1 }}
              onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
            <button onClick={generatePassword} title="Generar contraseña" style={{
              border:`1.5px solid ${COLORS.border}`, background:COLORS.inputBg, borderRadius:8, padding:"0 12px",
              color:COLORS.textMuted, fontSize:12, fontWeight:600, cursor:"pointer",
              fontFamily:"'Manrope', sans-serif", whiteSpace:"nowrap", flexShrink:0,
            }}>Generar</button>
          </div>
        </div>
      </div>

      {/* Datos personales */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr", gap:12, marginBottom:14 }}>
        <div>
          {fl("Nombre completo")}
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nombre Apellido" style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Alias / ¿Cómo llamarlo?", true)}
          <input type="text" value={alias} onChange={e => { if (e.target.value.length <= 30) setAlias(e.target.value); }} placeholder="Apodo o nombre corto" maxLength={30} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Puesto", true)}
          <input type="text" value={position} onChange={e => setPosition(e.target.value)} placeholder="Ej. Enfermera, Recepcionista" style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
      </div>

      {/* Departamentos */}
      <div style={{ marginBottom:14 }}>
        {fl("Departamentos")}
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {departmentsList.length === 0
            ? <span style={{ fontSize:13, color:COLORS.textMuted }}>No hay departamentos registrados.</span>
            : departmentsList.map(dept => {
                const sel = selectedDepts.includes(dept.name);
                return (
                  <button type="button" key={dept.id} onClick={() => toggleDept(dept.name)} style={{
                    display:"inline-flex", alignItems:"center", padding:"5px 12px", borderRadius:20,
                    cursor:"pointer", fontSize:12, fontWeight:sel?600:400,
                    border:`1.5px solid ${sel?COLORS.gold:COLORS.border}`,
                    background:sel?"rgba(201,162,78,0.12)":COLORS.panel,
                    color:sel?COLORS.green:COLORS.textMuted,
                    transition:"all 0.15s", fontFamily:"'Manrope', sans-serif",
                  }}>
                    {dept.name}
                  </button>
                );
              })
          }
        </div>
      </div>

      {/* Fechas */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr", gap:12, marginBottom:14, alignItems:"end" }}>
        <div>
          {fl("Fecha de ingreso", true)}
          <input type="date" value={hireDate} onChange={e => setHireDate(e.target.value)} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Fecha de nacimiento", true)}
          <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
      </div>

      {/* Rol y vacaciones */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap:12, marginBottom:20 }}>
        <div>
          {fl("Rol")}
          <select value={role} onChange={e => setRole(e.target.value)} style={selStyle}>
            <option value="empleado" style={{ color:"#1F4A40" }}>Empleado</option>

            <option value="admin"    style={{ color:"#1F4A40" }}>Admin</option>
          </select>
        </div>
        <div>
          {fl("Saldo vacaciones inicial", true)}
          <input type="number" min="0" value={vacBalance} onChange={e => setVacBalance(e.target.value)} placeholder={String(VAC_TOTAL)} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
      </div>

      {/* Módulo de comisiones */}
      <div style={{ marginBottom:14 }}>
        <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", fontSize:13, fontWeight:500, color:COLORS.text }}>
          <input type="checkbox" checked={commissionEligible} onChange={e => setCommissionEligible(e.target.checked)} style={{ width:16, height:16, accentColor:COLORS.green }} />
          Módulo de comisiones (esteticista)
        </label>
      </div>

      {error && <p style={{ fontSize:12, color:"#e07070", margin:"0 0 12px" }}>{error}</p>}
      {partialErr && (
        <div style={{ fontSize:12, color:"#e07070", background:"rgba(192,57,43,0.06)", borderRadius:7, padding:"10px 12px", margin:"0 0 12px", lineHeight:1.6 }}>
          ⚠️ {partialErr}
        </div>
      )}
      {successInfo && (
        <div style={{ fontSize:13, background:"rgba(44,99,86,0.08)", borderRadius:8, padding:"12px 16px", margin:"0 0 16px", lineHeight:1.8, border:`1px solid rgba(44,99,86,0.2)` }}>
          <div style={{ fontWeight:700, color:COLORS.green, marginBottom:6 }}>✓ Empleado creado correctamente</div>
          <div style={{ color:COLORS.text }}>Correo: <strong>{successInfo.email}</strong></div>
          <div style={{ color:COLORS.text }}>Contraseña temporal: <strong style={{ fontFamily:"monospace", letterSpacing:"0.05em" }}>{successInfo.password}</strong></div>
          <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:6 }}>Comparte estos datos con el empleado para que pueda ingresar al portal.</div>
        </div>
      )}

      <button onClick={handleCreate} disabled={loading} style={{
        ...btnSubmitStyle, width:"100%", opacity: loading ? 0.75 : 1, cursor: loading ? "not-allowed" : "pointer",
      }}>
        {loading ? "Creando..." : "Crear empleado"}
      </button>
    </Card>
  );
}

function EditEmployeeModal({ emp, departmentsList, onClose, onSave }) {
  const isMobile = useIsMobile();
  const [fullName,    setFullName]    = useState(emp.full_name ?? "");
  const [position,    setPosition]    = useState(emp.position ?? "");
  const [selectedDepts, setSelectedDepts] = useState(
    Array.isArray(emp.departments) ? emp.departments : (emp.department ? [emp.department] : [])
  );
  const [hireDate,    setHireDate]    = useState(emp.hire_date ?? "");
  const [birthDate,   setBirthDate]   = useState(emp.birth_date ?? "");
  const [role,        setRole]        = useState(emp.role ?? "empleado");
  const [vacBalance,  setVacBalance]  = useState(emp.vacation_balance !== undefined && emp.vacation_balance !== null ? String(emp.vacation_balance) : "");
  const [alias,       setAlias]       = useState(emp.alias ?? "");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [commissionEligible, setCommissionEligible] = useState(emp.commission_eligible ?? false);

  function toggleDept(name) {
    setSelectedDepts(prev => prev.includes(name) ? prev.filter(d => d !== name) : [...prev, name]);
  }

  async function handleSave() {
    setError(null);
    if (!fullName.trim() || selectedDepts.length === 0) {
      setError("Nombre completo y al menos un departamento son obligatorios.");
      return;
    }
    setLoading(true);
    const updates = {
      full_name:              fullName.trim(),
      alias:                  alias.trim() || null,
      position:               position.trim() || null,
      departments:            selectedDepts,
      hire_date:              hireDate  || null,
      birth_date:             birthDate || null,
      role,
      vacation_balance:       vacBalance  !== "" ? Number(vacBalance)  : VAC_TOTAL,
      commission_eligible:    commissionEligible,
    };
    const { error: updateError } = await supabase.from("profiles").update(updates).eq("id", emp.id);
    setLoading(false);
    if (updateError) { setError(translateError(updateError.message)); return; }
    onSave({ ...emp, ...updates });
  }

  const fl = (text, optional) => (
    <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>
      {text}{optional && <span style={{ fontWeight:400 }}> (opcional)</span>}
    </label>
  );
  const inp = { ...inputStyle, fontSize:14, padding:"10px 14px" };
  const selStyle = { width:"100%", background:COLORS.inputBg, border:`1.5px solid ${COLORS.border}`, borderRadius:8, padding:"11px 14px", color:COLORS.text, fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"'Manrope', sans-serif", cursor:"pointer", appearance:"auto" };

  return (
    <ModalShell onClose={onClose} title={`Editar: ${emp.full_name ?? "empleado"}`}>
      <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr", gap:12, marginBottom:14, alignItems:"end" }}>
        <div>
          {fl("Nombre completo")}
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Alias / ¿Cómo llamarlo?")}
          <input type="text" value={alias} onChange={e => { if (e.target.value.length <= 30) setAlias(e.target.value); }} placeholder="Apodo o nombre corto" maxLength={30} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Puesto")}
          <input type="text" value={position} onChange={e => setPosition(e.target.value)} placeholder="Ej. Enfermera" style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Rol")}
          <select value={role} onChange={e => setRole(e.target.value)} style={selStyle}>
            <option value="empleado" style={{ color:"#1F4A40" }}>Empleado</option>

            <option value="admin"    style={{ color:"#1F4A40" }}>Admin</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom:14 }}>
        {fl("Departamentos")}
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {departmentsList.length === 0
            ? <span style={{ fontSize:13, color:COLORS.textMuted }}>No hay departamentos registrados.</span>
            : departmentsList.map(dept => {
                const sel = selectedDepts.includes(dept.name);
                return (
                  <button type="button" key={dept.id} onClick={() => toggleDept(dept.name)} style={{
                    display:"inline-flex", alignItems:"center", padding:"5px 12px", borderRadius:20,
                    cursor:"pointer", fontSize:12, fontWeight:sel?600:400,
                    border:`1.5px solid ${sel?COLORS.gold:COLORS.border}`,
                    background:sel?"rgba(201,162,78,0.12)":COLORS.panel,
                    color:sel?COLORS.green:COLORS.textMuted,
                    transition:"all 0.15s", fontFamily:"'Manrope', sans-serif",
                  }}>{dept.name}</button>
                );
              })
          }
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr", gap:12, marginBottom:14, alignItems:"end" }}>
        <div>
          {fl("Fecha de ingreso")}
          <input type="date" value={hireDate} onChange={e => setHireDate(e.target.value)} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Fecha de nacimiento")}
          <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Saldo vacaciones")}
          <input type="number" min="0" value={vacBalance} onChange={e => setVacBalance(e.target.value)} placeholder={String(VAC_TOTAL)} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
      </div>

      <div style={{ marginBottom:14 }}>
        <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", fontSize:13, fontWeight:500, color:COLORS.text }}>
          <input type="checkbox" checked={commissionEligible} onChange={e => setCommissionEligible(e.target.checked)} style={{ width:16, height:16, accentColor:COLORS.green }} />
          Módulo de comisiones (esteticista)
        </label>
      </div>
      {error && <p style={{ fontSize:12, color:"#e07070", margin:"0 0 12px" }}>{error}</p>}
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onClose} style={btnCancelStyle}>Cancelar</button>
        <button onClick={handleSave} disabled={loading} style={{ ...btnSubmitStyle, opacity:loading?0.75:1, cursor:loading?"not-allowed":"pointer" }}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </ModalShell>
  );
}

function EmpleadosSection({ adminProfiles = [], adminRequests = [], departmentsList = [], onUpdateProfile }) {
  const [search,      setSearch]      = useState("");
  const [filterDept,  setFilterDept]  = useState("todos");
  const [editingEmp,  setEditingEmp]  = useState(null);
  const [savedEmpId,  setSavedEmpId]  = useState(null);
  const [resetModal,        setResetModal]        = useState(null); // { emp, password }
  const [resetLoading,      setResetLoading]      = useState(false);
  const [resetError,        setResetError]        = useState(null);
  const [resetSuccess,      setResetSuccess]      = useState(false);
  const [copied,            setCopied]            = useState(false);
  const [deactivateModal,   setDeactivateModal]   = useState(null); // emp
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [deactivateError,   setDeactivateError]   = useState(null);

  const activeProfiles = adminProfiles.filter(p => p.role !== "inactivo");

  const departments = [...new Set(activeProfiles.flatMap(p =>
    Array.isArray(p.departments) ? p.departments : (p.department ? [p.department] : [])
  ).filter(Boolean))].sort();

  const filtered = activeProfiles.filter(p => {
    const matchSearch = !search || (p.full_name ?? "").toLowerCase().includes(search.toLowerCase());
    const empDepts = Array.isArray(p.departments) ? p.departments : (p.department ? [p.department] : []);
    const matchDept   = filterDept === "todos" || empDepts.includes(filterDept);
    return matchSearch && matchDept;
  });

  function handleSaved(updatedEmp) {
    onUpdateProfile(updatedEmp);
    setEditingEmp(null);
    setSavedEmpId(updatedEmp.id);
    setTimeout(() => setSavedEmpId(null), 3000);
  }

  function getVacStats(userId) {
    const reqs = adminRequests.filter(r => r.user_id === userId && r.type === "vacaciones");
    const approved = reqs.filter(r => r.status === "aprobado").reduce((a, r) => a + getEffectiveDays(r), 0);
    const pending  = reqs.filter(r => r.status === "pendiente").reduce((a, r) => a + getEffectiveDays(r), 0);
    return { approved, pending };
  }

  function fmtHireDateShort(str) {
    if (!str) return "—";
    const [y, m, d] = str.split("-").map(Number);
    const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
    return `${d} ${months[m-1]} ${y}`;
  }

  function generatePassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }

  function openResetModal(emp) {
    setResetModal({ emp, password: generatePassword() });
    setResetError(null);
    setResetSuccess(false);
    setCopied(false);
  }

  async function handleResetPassword() {
    if (!resetModal) return;
    setResetLoading(true);
    setResetError(null);
    const { error } = await supabase.rpc("admin_reset_password", {
      target_user_id: resetModal.emp.id,
      new_password: resetModal.password,
    });
    setResetLoading(false);
    if (error) { setResetError(translateError(error.message)); return; }
    setResetSuccess(true);
  }

  async function handleDeactivate() {
    if (!deactivateModal) return;
    const emp = deactivateModal;
    setDeactivateLoading(true);
    setDeactivateError(null);
    const newName = "[BAJA] " + (emp.full_name ?? "");
    const { error } = await supabase.from("profiles").update({ role: "inactivo", full_name: newName }).eq("id", emp.id);
    setDeactivateLoading(false);
    if (error) { setDeactivateError(translateError(error.message)); return; }
    onUpdateProfile({ ...emp, role: "inactivo", full_name: newName });
    setDeactivateModal(null);
  }

  const pendingTotal = adminRequests.filter(r => r.type === "vacaciones" && r.status === "pendiente").length;

  const overlayStyle = { position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 };
  const modalBoxStyle = { background:COLORS.panel, borderRadius:16, padding:28, width:"100%", maxWidth:420, boxShadow:"0 8px 32px rgba(31,74,64,0.18)", fontFamily:"'Manrope', sans-serif" };
  const iconBtn = (extraStyle) => ({
    border:`1.5px solid ${COLORS.border}`, background:"transparent",
    cursor:"pointer", borderRadius:8,
    width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center",
    transition:"all 0.15s", ...extraStyle,
  });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {editingEmp && (
        <EditEmployeeModal
          emp={editingEmp}
          departmentsList={departmentsList}
          onClose={() => setEditingEmp(null)}
          onSave={handleSaved}
        />
      )}

      {/* Reset password modal */}
      {resetModal && (
        <div style={overlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, fontWeight:600, color:COLORS.green, margin:"0 0 14px" }}>Restablecer contraseña</h3>
            <p style={{ fontSize:13, color:COLORS.text, margin:"0 0 12px" }}>
              Nueva contraseña temporal para <strong>{resetModal.emp.full_name}</strong>:
            </p>
            {!resetSuccess ? (
              <>
                <div style={{ background:COLORS.panelAlt, borderRadius:8, padding:"10px 14px", marginBottom:14, display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, border:`1px solid ${COLORS.border}` }}>
                  <span style={{ fontSize:16, fontWeight:700, letterSpacing:"0.08em", color:COLORS.text, fontFamily:"monospace" }}>{resetModal.password}</span>
                  <button onClick={() => { navigator.clipboard.writeText(resetModal.password); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{
                    border:`1px solid ${COLORS.border}`, background:"none", borderRadius:6, padding:"4px 10px",
                    fontSize:11, fontWeight:600, cursor:"pointer", color: copied ? COLORS.greenSoft : COLORS.textMuted,
                    fontFamily:"'Manrope', sans-serif", whiteSpace:"nowrap", flexShrink:0,
                  }}>{copied ? "✓ Copiado" : "Copiar"}</button>
                </div>
                {resetError && <p style={{ fontSize:12, color:"#e07070", margin:"0 0 10px" }}>{resetError}</p>}
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={handleResetPassword} disabled={resetLoading} style={{
                    flex:2, padding:"9px 0", borderRadius:8, border:"none", cursor:resetLoading?"not-allowed":"pointer",
                    background:`linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
                    color:"#FFF", fontSize:13, fontWeight:700, fontFamily:"'Manrope', sans-serif", opacity:resetLoading?0.7:1,
                  }}>{resetLoading ? "Procesando..." : "Confirmar y restablecer"}</button>
                  <button onClick={() => setResetModal(null)} disabled={resetLoading} style={{
                    flex:1, padding:"9px 0", borderRadius:8, border:`1px solid ${COLORS.border}`,
                    background:"transparent", color:COLORS.textMuted, fontSize:13, fontWeight:600,
                    fontFamily:"'Manrope', sans-serif", cursor:"pointer",
                  }}>Cancelar</button>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontSize:13, color:COLORS.greenSoft, fontWeight:600, margin:"0 0 16px", lineHeight:1.5 }}>
                  ✓ Contraseña restablecida correctamente. Comparte la nueva contraseña con el empleado.
                </p>
                <button onClick={() => setResetModal(null)} style={{
                  width:"100%", padding:"9px 0", borderRadius:8, border:`1px solid ${COLORS.border}`,
                  background:"transparent", color:COLORS.textMuted, fontSize:13, fontWeight:600,
                  fontFamily:"'Manrope', sans-serif", cursor:"pointer",
                }}>Cerrar</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Deactivation modal */}
      {deactivateModal && (
        <div style={overlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, fontWeight:600, color:"#c0392b", margin:"0 0 14px" }}>Dar de baja</h3>
            <p style={{ fontSize:13, color:COLORS.text, margin:"0 0 8px" }}>
              ¿Estás seguro de que deseas dar de baja a <strong>{deactivateModal.full_name}</strong>?
            </p>
            <p style={{ fontSize:12, color:COLORS.textMuted, margin:"0 0 16px", lineHeight:1.5, background:"rgba(192,57,43,0.06)", borderRadius:7, padding:"10px 12px", border:"1px solid rgba(192,57,43,0.15)" }}>
              Esta acción eliminará su acceso al portal. Sus datos históricos (solicitudes, reportes) se conservarán.
            </p>
            {deactivateError && <p style={{ fontSize:12, color:"#e07070", margin:"0 0 10px" }}>{deactivateError}</p>}
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={handleDeactivate} disabled={deactivateLoading} style={{
                flex:2, padding:"9px 0", borderRadius:8, border:"none", cursor:deactivateLoading?"not-allowed":"pointer",
                background:"rgba(192,57,43,0.12)", color:"#c0392b",
                fontSize:13, fontWeight:700, fontFamily:"'Manrope', sans-serif", opacity:deactivateLoading?0.7:1,
              }}>{deactivateLoading ? "Procesando..." : "Confirmar baja"}</button>
              <button onClick={() => setDeactivateModal(null)} disabled={deactivateLoading} style={{
                flex:1, padding:"9px 0", borderRadius:8, border:`1px solid ${COLORS.border}`,
                background:"transparent", color:COLORS.textMuted, fontSize:13, fontWeight:600,
                fontFamily:"'Manrope', sans-serif", cursor:"pointer",
              }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Resumen rápido */}
      <Card>
        <div style={{ display:"flex", gap:0 }}>
          <div style={{ flex:1, textAlign:"center", padding:"12px 8px" }}>
            <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:36, fontWeight:700, color:COLORS.green, lineHeight:1 }}>{activeProfiles.length}</div>
            <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:4, fontWeight:600 }}>Colaboradores</div>
          </div>
          <div style={{ width:1, background:COLORS.border, margin:"8px 0" }}/>
          <div style={{ flex:1, textAlign:"center", padding:"12px 8px" }}>
            <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:36, fontWeight:700, color:COLORS.gold, lineHeight:1 }}>{pendingTotal}</div>
            <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:4, fontWeight:600 }}>Solicitudes de vacaciones pendientes</div>
          </div>
          <div style={{ width:1, background:COLORS.border, margin:"8px 0" }}/>
          <div style={{ flex:1, textAlign:"center", padding:"12px 8px" }}>
            <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:36, fontWeight:700, color:COLORS.greenSoft, lineHeight:1 }}>{departments.length}</div>
            <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:4, fontWeight:600 }}>Departamentos</div>
          </div>
        </div>
      </Card>

      {/* Filtros */}
      <div style={{ display:"flex", gap:10 }}>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre..."
          style={{ ...inputStyle, flex:1, fontSize:13, padding:"9px 12px" }}
          onFocus={e => e.target.style.borderColor=COLORS.gold}
          onBlur={e => e.target.style.borderColor=COLORS.border}
        />
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{
          background:COLORS.inputBg, border:`1.5px solid ${COLORS.border}`, borderRadius:8,
          padding:"9px 12px", color:COLORS.text, fontSize:13, outline:"none",
          fontFamily:"'Manrope', sans-serif", cursor:"pointer", appearance:"auto", flexShrink:0,
        }}>
          <option value="todos" style={{ color:"#1F4A40" }}>Todos los departamentos</option>
          {departmentsList.map(d => <option key={d.id} value={d.name} style={{ color:"#1F4A40" }}>{d.name}</option>)}
        </select>
      </div>

      {/* Lista de empleados */}
      {filtered.length === 0 ? (
        <Card><p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>No se encontraron colaboradores.</p></Card>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {filtered.map(emp => {
            const total    = emp.vacation_balance ?? VAC_TOTAL;
            const { approved, pending } = getVacStats(emp.id);
            const available = Math.max(0, total - approved);
            const usedPct   = Math.min(100, Math.round((approved / total) * 100));
            const pendPct   = Math.min(100 - usedPct, Math.round((pending / total) * 100));
            const showRole  = emp.role === "admin";
            return (
              <Card key={emp.id}>
                {savedEmpId === emp.id && (
                  <div style={{ fontSize:12, color:COLORS.greenSoft, fontWeight:600, marginBottom:10 }}>✓ Cambios guardados correctamente.</div>
                )}
                <div style={{ display:"flex", alignItems:"flex-start", gap:14, flexWrap:"wrap" }}>
                  {/* Avatar iniciales */}
                  <div style={{
                    width:44, height:44, borderRadius:12, flexShrink:0,
                    background:`linear-gradient(135deg, ${COLORS.green}, ${COLORS.greenSoft})`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"'Manrope', sans-serif", fontSize:16, fontWeight:700, color:"#FFF",
                  }}>
                    {(emp.full_name ?? "?").split(/\s+/).slice(0,2).map(w => w[0]).join("").toUpperCase()}
                  </div>
                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:2 }}>
                      <span style={{ fontFamily:"'Manrope', sans-serif", fontSize:15, fontWeight:700, color:COLORS.green, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", minWidth:0, maxWidth:"100%" }}>{emp.full_name ?? "—"}</span>
                      {showRole && (
                        <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:COLORS.gold, background:"rgba(201,162,78,0.12)", borderRadius:5, padding:"2px 8px", display:"inline-block", width:"fit-content" }}>
                          {emp.role === "admin" ? "Admin" : "RRHH"}
                        </span>
                      )}
                    </div>
                    <div style={{ marginBottom:6 }}>
                      {emp.position && (
                        <div style={{ fontSize:12, color:COLORS.textMuted, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {emp.position}{emp.hire_date ? <span style={{ marginLeft:8 }}>· Ingreso: {fmtHireDateShort(emp.hire_date)}</span> : null}
                        </div>
                      )}
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                        {(Array.isArray(emp.departments) ? emp.departments : [emp.department].filter(Boolean)).map((dept, di) => (
                          <DeptTag key={di} dept={dept} />
                        ))}
                      </div>
                    </div>
                    {/* Barra de vacaciones */}
                    <div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:11, color:COLORS.textMuted, fontWeight:600 }}>Vacaciones</span>
                        <span style={{ fontSize:11, color:COLORS.textMuted }}>
                          <span style={{ color:COLORS.green, fontWeight:700 }}>{available}</span> disponibles ·{" "}
                          <span style={{ color:COLORS.gold, fontWeight:700 }}>{approved}</span> tomados{" "}
                          {pending > 0 && <><span style={{ color:COLORS.goldSoft, fontWeight:700 }}>· {pending}</span> en solicitud</>}
                          {" "}/ {total}
                        </span>
                      </div>
                      <div style={{ height:6, borderRadius:4, background:COLORS.panelAlt, overflow:"hidden", display:"flex" }}>
                        <div style={{ width:`${usedPct}%`, background:COLORS.gold, transition:"width 0.3s" }}/>
                        <div style={{ width:`${pendPct}%`, background:COLORS.goldSoft, transition:"width 0.3s" }}/>
                      </div>
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6, flexShrink:0 }}>
                    <button onClick={() => setEditingEmp(emp)} title="Editar empleado" style={{
                      border:`1.5px solid ${COLORS.border}`, background:COLORS.inputBg,
                      color:COLORS.textMuted, cursor:"pointer", borderRadius:8,
                      width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center",
                      flexShrink:0, transition:"all 0.15s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor=COLORS.gold; e.currentTarget.style.color=COLORS.gold; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor=COLORS.border; e.currentTarget.style.color=COLORS.textMuted; }}
                    >
                      <Edit2 size={14}/>
                    </button>
                    <button onClick={() => openResetModal(emp)} title="Restablecer contraseña" style={{
                      border:`1.5px solid ${COLORS.primary}`, background:"transparent",
                      color:COLORS.primary, cursor:"pointer", borderRadius:8,
                      width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center",
                      flexShrink:0, transition:"all 0.15s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background="rgba(31,74,64,0.08)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background="transparent"; }}
                    >
                      <KeyRound size={14}/>
                    </button>
                    <button onClick={() => setDeactivateModal(emp)} title="Dar de baja" style={{
                      border:"1.5px solid #c0392b", background:"transparent",
                      color:"#c0392b", cursor:"pointer", borderRadius:8,
                      width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center",
                      flexShrink:0, transition:"all 0.15s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background="rgba(192,57,43,0.08)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background="transparent"; }}
                    >
                      <UserX size={14}/>
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GestionDocumentosSection({ adminDocuments = [], departmentsList = [], adminProfiles = [], allConfirmations = [], onNewDocument, onDeleteDocument, onUpdateAdminDocument }) {
  const isMobile = useIsMobile();
  const [title,                 setTitle]                 = useState("");
  const [category,              setCategory]              = useState("");
  const [deptTodos,             setDeptTodos]             = useState(true);
  const [selectedDepts,         setSelectedDepts]         = useState([]);
  const [requiresConfirmation,  setRequiresConfirmation]  = useState(false);
  const [file,          setFile]          = useState(null);
  const [status,        setStatus]        = useState(null); // null | "uploading" | "saving"
  const [error,         setError]         = useState(null);
  const [success,       setSuccess]       = useState(false);
  const [archiving,     setArchiving]     = useState({}); // { [id]: true }
  const [deleting,      setDeleting]      = useState({}); // { [id]: true } for permanent delete
  const [confirmArchive,   setConfirmArchive]   = useState(null); // doc.id
  const [confirmPermaDel,  setConfirmPermaDel]  = useState(null); // doc.id
  const [showArchived,     setShowArchived]     = useState(false);
  const [expandConfirm,    setExpandConfirm]    = useState(null); // doc.id | null

  async function handleArchive(doc) {
    setArchiving(prev => ({ ...prev, [doc.id]: true }));
    const { error } = await supabase.from("documents").update({ archived: true }).eq("id", doc.id);
    setArchiving(prev => ({ ...prev, [doc.id]: false }));
    if (error) { setError(translateError(error.message)); return; }
    onUpdateAdminDocument?.({ ...doc, archived: true });
    setConfirmArchive(null);
  }

  async function handleRestore(doc) {
    setArchiving(prev => ({ ...prev, [doc.id]: true }));
    const { error } = await supabase.from("documents").update({ archived: false }).eq("id", doc.id);
    setArchiving(prev => ({ ...prev, [doc.id]: false }));
    if (error) { setError(translateError(error.message)); return; }
    onUpdateAdminDocument?.({ ...doc, archived: false });
  }

  async function handlePermaDel(doc) {
    const confCount = allConfirmations.filter(c => c.document_id === doc.id).length;
    if (confCount > 0) {
      setError(`No se puede eliminar — hay ${confCount} confirmación${confCount !== 1 ? "es" : ""} registrada${confCount !== 1 ? "s" : ""}.`);
      setConfirmPermaDel(null);
      return;
    }
    setDeleting(prev => ({ ...prev, [doc.id]: true }));
    if (doc.file_url) {
      try { await supabase.storage.from("documents").remove([doc.file_url]); } catch (_) {}
    }
    const { error: delError } = await supabase.from("documents").delete().eq("id", doc.id);
    setDeleting(prev => ({ ...prev, [doc.id]: false }));
    if (delError) { setError(translateError(delError.message)); return; }
    onDeleteDocument(doc.id);
    setConfirmPermaDel(null);
  }

  function handleFile(e) { setFile(e.target.files?.[0] ?? null); }

  async function handleSubmit() {
    setError(null);
    setSuccess(false);
    if (!title.trim() || !category.trim() || !file) {
      setError("Título, categoría y archivo son obligatorios.");
      return;
    }
    setStatus("uploading");
    const { data: { user } } = await supabase.auth.getUser();
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("documents").upload(fileName, file);
    if (uploadError) { setError(translateError(uploadError.message)); setStatus(null); return; }
    setStatus("saving");
    const { data, error: insertError } = await supabase.from("documents").insert({
      title: title.trim(),
      category: category.trim(),
      departments: deptTodos ? ["todos"] : selectedDepts,
      file_url: fileName,
      uploaded_by: user.id,
      requires_confirmation: requiresConfirmation,
    }).select().single();
    setStatus(null);
    if (insertError) { setError(translateError(insertError.message)); return; }
    onNewDocument(data);
    setTitle(""); setCategory(""); setDeptTodos(true); setSelectedDepts([]); setFile(null); setRequiresConfirmation(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  }

  const fieldLabel = (text) => (
    <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>{text}</label>
  );
  const dateInputStyle = { ...inputStyle, fontSize:14, padding:"10px 14px" };
  const isLoading = !!status;

  function fmtDateStr(str) {
    if (!str) return "—";
    const d = new Date(str);
    const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Card>
        <CardHeader title="Subir documento" />
        {fieldLabel("Título")}
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Nombre del documento" style={{ ...dateInputStyle, marginBottom:14, display:"block" }}
          onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr", gap:12, marginBottom:14 }}>
          <div>
            {fieldLabel("Categoría")}
            <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Ej. Protocolo, Manual" style={dateInputStyle}
              onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
          </div>
          <div>
            {fieldLabel("Departamento")}
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {(() => {
                const chipBase = (sel) => ({
                  display:"inline-flex", alignItems:"center", padding:"5px 12px", borderRadius:20,
                  cursor:"pointer", fontSize:12, fontWeight:sel?600:400,
                  border:`1.5px solid ${sel?COLORS.gold:COLORS.border}`,
                  background:sel?"rgba(201,162,78,0.12)":COLORS.panel,
                  color:sel?COLORS.green:COLORS.textMuted,
                  transition:"all 0.15s", fontFamily:"'Manrope', sans-serif",
                });
                return (<>
                  <button type="button" onClick={() => { setDeptTodos(true); setSelectedDepts([]); }} style={chipBase(deptTodos)}>
                    Todos los departamentos
                  </button>
                  {departmentsList.map(dept => {
                    const sel = selectedDepts.includes(dept.name);
                    return (
                      <button type="button" key={dept.id} onClick={() => { setDeptTodos(false); setSelectedDepts(prev => sel ? prev.filter(d => d !== dept.name) : [...prev, dept.name]); }} style={chipBase(sel)}>
                        {dept.name}
                      </button>
                    );
                  })}
                </>);
              })()}
            </div>
          </div>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", fontSize:13, fontWeight:500, color:COLORS.text }}>
            <input type="checkbox" checked={requiresConfirmation} onChange={e => setRequiresConfirmation(e.target.checked)} style={{ width:16, height:16, accentColor:COLORS.green }} />
            Requiere confirmación de lectura
          </label>
        </div>
        {fieldLabel("Archivo")}
        <label style={{ display:"block", marginBottom:16, cursor:"pointer" }}>
          <div style={{ background:COLORS.inputBg, border:`1.5px dashed ${COLORS.border}`, borderRadius:8, padding:"11px 14px", fontSize:13, color: file ? COLORS.text : COLORS.textMuted, fontFamily:"'Manrope', sans-serif" }}>
            {file ? file.name : "Seleccionar archivo…"}
          </div>
          <input type="file" onChange={handleFile} style={{ display:"none" }} />
        </label>
        {error   && <p style={{ fontSize:12, color:"#e07070", margin:"0 0 12px" }}>{error}</p>}
        {success && <p style={{ fontSize:12, color:COLORS.greenSoft, fontWeight:600, margin:"0 0 12px" }}>✓ Documento subido correctamente.</p>}
        <button onClick={handleSubmit} disabled={isLoading} style={{
          ...btnSubmitStyle, width:"100%", opacity: isLoading ? 0.75 : 1, cursor: isLoading ? "not-allowed" : "pointer",
        }}>
          {status === "uploading" ? "Subiendo archivo..." : status === "saving" ? "Guardando..." : "Subir documento"}
        </button>
      </Card>

      <Card>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <span style={{ fontSize:14, fontWeight:700, color:COLORS.text }}>Documentos subidos</span>
          <div style={{ display:"flex", gap:4 }}>
            {["activos","archivados"].map(tab => (
              <button key={tab} onClick={() => setShowArchived(tab === "archivados")} style={{
                border:"none", borderRadius:6, padding:"4px 12px", fontSize:12, fontWeight:600, cursor:"pointer",
                fontFamily:"'Manrope', sans-serif",
                background: (tab === "archivados") === showArchived ? COLORS.green : COLORS.panelAlt,
                color:      (tab === "archivados") === showArchived ? "#FFF" : COLORS.textMuted,
              }}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
            ))}
          </div>
        </div>
        {(() => {
          const displayedDocs = adminDocuments.filter(d => showArchived ? d.archived : !d.archived);
          if (displayedDocs.length === 0) return <p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>{showArchived ? "No hay documentos archivados." : "No hay documentos activos."}</p>;
          return (
          <div style={{ display:"flex", flexDirection:"column" }}>
            {displayedDocs.map((doc, i) => {
              const isArchiving  = !!archiving[doc.id];
              const isDeleting   = !!deleting[doc.id];
              const isConfirmingArchive = confirmArchive === doc.id;
              const isConfirmingPermaDel = confirmPermaDel === doc.id;
              return (
                <div key={doc.id ?? i} style={{ padding:"12px 0", borderBottom:`1px solid ${COLORS.border}`, opacity: doc.archived ? 0.72 : 1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                        <span style={{ fontSize:13, fontWeight:600, color: doc.archived ? COLORS.textMuted : COLORS.text, wordBreak:"break-word" }}>{doc.title}</span>
                        {doc.archived && <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:COLORS.textMuted, background:COLORS.panelAlt, borderRadius:4, padding:"1px 6px" }}>Archivado</span>}
                      </div>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                        {doc.category && <Tag label={doc.category} />}
                        {Array.isArray(doc.departments) ? (
                          doc.departments.length === 0
                            ? <span style={{ fontSize:11, color:COLORS.textMuted }}>Todos los departamentos</span>
                            : doc.departments.map((d, di) => <DeptTag key={di} dept={d} />)
                        ) : doc.department
                          ? <DeptTag dept={doc.department} />
                          : <span style={{ fontSize:11, color:COLORS.textMuted }}>Todos los departamentos</span>
                        }
                        <span style={{ fontSize:11, color:COLORS.textMuted }}>· {fmtDateStr(doc.created_at)}</span>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                      {doc.file_url && <DocDownloadBtn fileUrl={doc.file_url} />}
                      {doc.archived ? (
                        <button onClick={() => handleRestore(doc)} disabled={isArchiving} title="Restaurar" style={{
                          border:"none", background:"rgba(44,99,86,0.1)", color:COLORS.greenSoft,
                          cursor:isArchiving?"not-allowed":"pointer", borderRadius:6, padding:"4px 10px",
                          fontSize:11, fontWeight:700, fontFamily:"'Manrope', sans-serif", opacity:isArchiving?0.6:1,
                        }}>{isArchiving ? "..." : "Restaurar"}</button>
                      ) : doc.requires_confirmation ? (
                        <button onClick={() => setConfirmArchive(isConfirmingArchive ? null : doc.id)} disabled={isArchiving} title="Archivar" style={{
                          border:"none", background:COLORS.panelAlt, color:COLORS.textMuted,
                          cursor:isArchiving?"not-allowed":"pointer", borderRadius:6, width:30, height:30,
                          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                        }}>
                          <Archive size={13}/>
                        </button>
                      ) : (
                        <button onClick={() => setConfirmPermaDel(isConfirmingPermaDel ? null : doc.id)} disabled={isDeleting} title="Eliminar" style={{
                          border:"none", background:"rgba(192,57,43,0.08)", color:"#c0392b",
                          cursor:isDeleting?"not-allowed":"pointer", borderRadius:6, width:30, height:30,
                          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                        }}>
                          <Trash2 size={13}/>
                        </button>
                      )}
                    </div>
                  </div>
                  {isConfirmingArchive && (
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8, padding:"8px 10px", background:COLORS.panelAlt, borderRadius:7 }}>
                      <span style={{ fontSize:12, color:COLORS.text, flex:1 }}>¿Archivar este documento? Dejará de ser visible para los empleados. <span style={{ color:COLORS.textMuted }}>Se archiva para preservar el historial de confirmaciones.</span></span>
                      <button onClick={() => handleArchive(doc)} disabled={isArchiving} style={{
                        border:"none", background:COLORS.green, color:"#FFF", borderRadius:6,
                        padding:"5px 12px", fontSize:12, fontWeight:700, cursor:"pointer",
                        fontFamily:"'Manrope', sans-serif", opacity:isArchiving?0.6:1,
                      }}>{isArchiving ? "Archivando..." : "Sí, archivar"}</button>
                      <button onClick={() => setConfirmArchive(null)} style={{
                        border:"none", background:"transparent", color:COLORS.textMuted, borderRadius:6,
                        padding:"5px 12px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Manrope', sans-serif",
                      }}>Cancelar</button>
                    </div>
                  )}
                  {isConfirmingPermaDel && (
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8, padding:"8px 10px", background:"rgba(192,57,43,0.06)", borderRadius:7 }}>
                      <span style={{ fontSize:12, color:"#c0392b", flex:1 }}>¿Eliminar permanentemente? No se puede deshacer.</span>
                      <button onClick={() => handlePermaDel(doc)} disabled={isDeleting} style={{
                        border:"none", background:"#c0392b", color:"#FFF", borderRadius:6,
                        padding:"5px 12px", fontSize:12, fontWeight:700, cursor:"pointer",
                        fontFamily:"'Manrope', sans-serif", opacity:isDeleting?0.6:1,
                      }}>{isDeleting ? "Eliminando..." : "Sí, eliminar"}</button>
                      <button onClick={() => setConfirmPermaDel(null)} style={{
                        border:"none", background:"transparent", color:COLORS.textMuted, borderRadius:6,
                        padding:"5px 12px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Manrope', sans-serif",
                      }}>Cancelar</button>
                    </div>
                  )}
                  {doc.requires_confirmation && (() => {
                    const docConfs = allConfirmations.filter(c => c.document_id === doc.id);
                    const confirmedIds = new Set(docConfs.map(c => c.user_id));
                    const eligible = adminProfiles.filter(p => p.role !== "inactivo" && (Array.isArray(doc.departments) && (doc.departments.includes("todos") || (Array.isArray(p.departments) && p.departments.some(d => doc.departments.includes(d))))));
                    const notConfirmed = eligible.filter(p => !confirmedIds.has(p.id));
                    const isOpen = expandConfirm === doc.id;
                    return (
                      <div style={{ marginTop:8 }}>
                        <button onClick={() => setExpandConfirm(isOpen ? null : doc.id)} style={{ background:"none", border:`1px solid ${COLORS.border}`, borderRadius:6, padding:"3px 10px", fontSize:11, color:COLORS.textMuted, cursor:"pointer", fontFamily:"'Manrope', sans-serif", fontWeight:600 }}>
                          {isOpen ? "Ocultar confirmaciones" : `Ver confirmaciones (${docConfs.length}/${eligible.length})`}
                        </button>
                        {isOpen && (
                          <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:4 }}>
                            {docConfs.map(c => (
                              <div key={c.user_id} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:COLORS.greenSoft }}>
                                <span style={{ fontWeight:600 }}>✓</span>
                                <span>{c.profiles?.full_name ?? c.user_id}</span>
                                <span style={{ color:COLORS.textMuted, fontSize:11 }}>· {c.confirmed_at ? new Date(c.confirmed_at).toLocaleDateString("es-ES", { day:"2-digit", month:"short", year:"numeric" }) : ""}</span>
                              </div>
                            ))}
                            {notConfirmed.map(p => (
                              <div key={p.id} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:COLORS.textMuted }}>
                                <span style={{ fontWeight:600 }}>·</span>
                                <span>{p.full_name}</span>
                                <span style={{ fontSize:11, color:"rgba(192,57,43,0.8)" }}>pendiente</span>
                              </div>
                            ))}
                            {eligible.length === 0 && <span style={{ fontSize:12, color:COLORS.textMuted }}>Sin empleados con acceso.</span>}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
          );
        })()}
      </Card>
    </div>
  );
}

function GestionComunicadosSection({ adminAnnouncements = [], departmentsList = [], onNewAnnouncement, onDeleteAnnouncement }) {
  const isMobile = useIsMobile();
  const [deletingId,  setDeletingId]  = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  async function handleDeleteAnn(a) {
    if (!window.confirm("¿Eliminar este comunicado? Esta acción no se puede deshacer.")) return;
    setDeletingId(a.id);
    setDeleteError(null);
    const { error } = await supabase.from("announcements").delete().eq("id", a.id);
    setDeletingId(null);
    if (error) { setDeleteError(a.id); return; }
    onDeleteAnnouncement?.(a.id);
  }
  const nowLocal = () => {
    const d = new Date();
    d.setSeconds(0, 0);
    // Adjust for local timezone so datetime-local input shows the correct local time
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };
  const [expandedAnnouncements, setExpandedAnnouncements] = useState({});
  const [title,     setTitle]     = useState("");
  const [tag,       setTag]       = useState("");
  const [body,      setBody]      = useState("");
  const [audienceTodos, setAudienceTodos] = useState(true);
  const [audienceDepts, setAudienceDepts] = useState([]);
  const [publishAt, setPublishAt] = useState(nowLocal);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [success,   setSuccess]   = useState(false);

  async function handlePublish() {
    setError(null);
    setSuccess(false);
    if (!title.trim() || !body.trim()) { setError("El título y el contenido son obligatorios."); return; }
    if (!audienceTodos && audienceDepts.length === 0) { setError("Selecciona al menos una audiencia."); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error: insertError } = await supabase.from("announcements").insert({
      title: title.trim(),
      tag:   tag.trim() || null,
      body:  body.trim(),
      audience_list: audienceTodos ? ["todos"] : audienceDepts,
      publish_at: new Date(publishAt).toISOString(),
      created_by: user.id,
    }).select().single();
    setLoading(false);
    if (insertError) { setError(translateError(insertError.message)); return; }
    onNewAnnouncement(data);
    setTitle(""); setTag(""); setBody(""); setAudienceTodos(true); setAudienceDepts([]); setPublishAt(nowLocal());
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  }

  const fieldLabel = (text) => (
    <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>{text}</label>
  );
  const dateInputStyle = { ...inputStyle, fontSize:14, padding:"10px 14px" };

  function fmtPublishAt(str) {
    if (!str) return "—";
    const d = new Date(str);
    const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  }

  const now = new Date();

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* Formulario */}
      <Card>
        <CardHeader title="Nuevo comunicado" />
        {fieldLabel("Título")}
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título del comunicado" style={{ ...dateInputStyle, marginBottom:14, display:"block" }}
          onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr", gap:12, marginBottom:14 }}>
          <div>
            {fieldLabel("Etiqueta")}
            <input type="text" value={tag} onChange={e => setTag(e.target.value)} placeholder="Ej. General, Operaciones" style={dateInputStyle}
              onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
          </div>
          <div>
            {fieldLabel("Audiencia")}
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {(() => {
                const chipBase = (sel) => ({
                  display:"inline-flex", alignItems:"center", padding:"5px 12px", borderRadius:20,
                  cursor:"pointer", fontSize:12, fontWeight:sel?600:400,
                  border:`1.5px solid ${sel?COLORS.gold:COLORS.border}`,
                  background:sel?"rgba(201,162,78,0.12)":COLORS.panel,
                  color:sel?COLORS.green:COLORS.textMuted,
                  transition:"all 0.15s", fontFamily:"'Manrope', sans-serif",
                });
                return (<>
                  <button type="button" onClick={() => { setAudienceTodos(true); setAudienceDepts([]); }} style={chipBase(audienceTodos)}>
                    Todos los departamentos
                  </button>
                  {departmentsList.map(dept => {
                    const sel = audienceDepts.includes(dept.name);
                    return (
                      <button type="button" key={dept.id} onClick={() => { setAudienceTodos(false); setAudienceDepts(prev => sel ? prev.filter(d => d !== dept.name) : [...prev, dept.name]); }} style={chipBase(sel)}>
                        {dept.name}
                      </button>
                    );
                  })}
                </>);
              })()}
            </div>
          </div>
        </div>
        {fieldLabel("Contenido")}
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Escribe el contenido del comunicado..." rows={4} style={{ ...taStyle, marginBottom:14 }}
          onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        {fieldLabel("Fecha y hora de publicación")}
        <input type="datetime-local" value={publishAt} onChange={e => setPublishAt(e.target.value)} style={{ ...dateInputStyle, marginBottom:16, display:"block" }}
          onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        {error   && <p style={{ fontSize:12, color:"#e07070", margin:"0 0 12px" }}>{error}</p>}
        {success && <p style={{ fontSize:12, color:COLORS.greenSoft, fontWeight:600, margin:"0 0 12px" }}>✓ Comunicado publicado correctamente.</p>}
        <button onClick={handlePublish} disabled={loading} style={{
          ...btnSubmitStyle, width:"100%", opacity: loading ? 0.75 : 1, cursor: loading ? "not-allowed" : "pointer",
        }}>
          {loading ? "Publicando..." : "Publicar comunicado"}
        </button>
      </Card>

      {/* Lista */}
      {adminAnnouncements.length === 0 ? (
        <Card><p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>No hay comunicados creados.</p></Card>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {adminAnnouncements.map((a, i) => {
            const isScheduled = a.publish_at && new Date(a.publish_at) > now;
            const isExpanded = expandedAnnouncements[a.id ?? i];
            const authorName = a.profiles?.full_name || null;
            return (
              <Card key={a.id ?? i}>
                <div style={{ fontSize:14, fontWeight:600, color:COLORS.text, marginBottom:4, wordBreak:"break-word" }}>{a.title}</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center", marginBottom:4 }}>
                  {a.tag && <Tag label={a.tag} />}
                  <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                    <span style={{ fontSize:11, color:COLORS.textMuted }}>Audiencia:</span>
                    {Array.isArray(a.audience_list) && a.audience_list.includes("todos")
                      ? <span style={{ fontSize:11, fontWeight:700, color:COLORS.textMuted }}>Todos los departamentos</span>
                      : Array.isArray(a.audience_list)
                        ? a.audience_list.map((d, di) => <DeptTag key={di} dept={d} />)
                        : a.audience === "todos"
                          ? <span style={{ fontSize:11, fontWeight:700, color:COLORS.textMuted }}>Todos los departamentos</span>
                          : a.audience
                            ? <DeptTag dept={a.audience} />
                            : <span style={{ fontSize:11, color:COLORS.textMuted }}>—</span>
                    }
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <span style={{ fontSize:11, color:COLORS.textMuted }}>{fmtPublishAt(a.publish_at)}</span>
                  {isScheduled && (
                    <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.06em", padding:"2px 7px", borderRadius:4, background:"rgba(100,140,220,0.12)", color:"#5a7ec7" }}>
                      PROGRAMADO
                    </span>
                  )}
                  {authorName && (
                    <span style={{ fontSize:11, color:COLORS.textMuted }}>· Creado por: <strong>{authorName}</strong></span>
                  )}
                </div>
                {isExpanded && a.body && (
                  <div style={{ marginTop:10, fontSize:13, color:COLORS.text, lineHeight:1.65, whiteSpace:"pre-wrap", wordBreak:"break-word", background:COLORS.panelAlt, borderRadius:7, padding:"10px 12px", fontFamily:"'Manrope', sans-serif" }}>
                    {a.body}
                  </div>
                )}
                {a.body && (
                  <button
                    onClick={() => setExpandedAnnouncements(prev => ({ ...prev, [a.id ?? i]: !prev[a.id ?? i] }))}
                    style={{ marginTop:8, background:"none", border:"none", color:COLORS.gold, fontSize:12, fontWeight:600, cursor:"pointer", padding:0, fontFamily:"'Manrope', sans-serif" }}
                  >
                    {isExpanded ? "Ver menos" : "Ver más"}
                  </button>
                )}
                {deleteError === a.id && <p style={{ fontSize:11, color:"#c0392b", margin:"6px 0 0" }}>No se pudo eliminar. Intenta de nuevo.</p>}
                <div style={{ marginTop:10, display:"flex", justifyContent:"flex-end" }}>
                  <button
                    onClick={() => handleDeleteAnn(a)}
                    disabled={deletingId === a.id}
                    style={{ fontSize:11, fontWeight:600, color:"#c0392b", background:"rgba(192,57,43,0.06)", border:"1px solid rgba(192,57,43,0.18)", borderRadius:6, padding:"4px 10px", cursor:deletingId===a.id?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:5, fontFamily:"'Manrope', sans-serif", opacity:deletingId===a.id?0.6:1 }}
                  >
                    <Trash2 size={11} /> {deletingId===a.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Team vacation calendar ── */
function TeamCalendarSection({ teamVacations = [] }) {
  const now = new Date();
  const [yr, setYr] = useState(now.getFullYear());
  const [mo, setMo] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(null); // "YYYY-MM-DD"

  const firstWeekday = new Date(yr, mo, 1).getDay();
  const daysInMonth  = new Date(yr, mo + 1, 0).getDate();
  const prevMo = mo === 0 ? 11 : mo - 1;
  const prevYr = mo === 0 ? yr - 1 : yr;
  const daysInPrev = new Date(prevYr, prevMo + 1, 0).getDate();
  const nextMo = mo === 11 ? 0 : mo + 1;
  const nextYr = mo === 11 ? yr + 1 : yr;

  const cells = [];
  for (let i = firstWeekday - 1; i >= 0; i--) cells.push({ d: daysInPrev - i, m: prevMo, y: prevYr, overflow: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ d, m: mo, y: yr, overflow: false });
  while (cells.length < 42) cells.push({ d: cells.length - firstWeekday - daysInMonth + 1, m: nextMo, y: nextYr, overflow: true });

  function toYMD(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function vacationersOnDay(cell) {
    const ymd = toYMD(cell.y, cell.m, cell.d);
    return teamVacations.filter(r => {
      const rs = (r.start_date || "").slice(0, 10);
      const re = (r.end_date   || r.start_date || "").slice(0, 10);
      return rs && ymd >= rs && ymd <= re;
    });
  }

  function navMonth(delta) {
    let nm = mo + delta, ny = yr;
    if (nm < 0) { nm = 11; ny--; }
    if (nm > 11) { nm = 0; ny++; }
    setMo(nm); setYr(ny); setSelectedDay(null);
  }

  const todayYMD = toYMD(now.getFullYear(), now.getMonth(), now.getDate());
  const getFirstName = name => getFirstNames(name) || "?";
  const getPrimaryDept = p => {
    const arr = p?.departments;
    return (Array.isArray(arr) && arr.length > 0) ? arr[0] : (p?.department || null);
  };
  function getInitials(name) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2);
  }

  // vacationers in the whole visible month (for empty-month message + legend)
  const monthStart = toYMD(yr, mo, 1);
  const monthEnd   = toYMD(yr, mo, daysInMonth);
  const monthVacationers = teamVacations.filter(r => {
    const rs = (r.start_date || "").slice(0, 10);
    const re = (r.end_date   || r.start_date || "").slice(0, 10);
    return rs && rs <= monthEnd && re >= monthStart;
  });
  const anyThisMonth = monthVacationers.length > 0;
  const legendDepts = [...new Set(monthVacationers.map(r => getPrimaryDept(r.profiles)).filter(Boolean))].sort();

  const selectedVacationers = selectedDay
    ? teamVacations.filter(r => {
        const rs = (r.start_date || "").slice(0, 10);
        const re = (r.end_date   || r.start_date || "").slice(0, 10);
        return rs && selectedDay >= rs && selectedDay <= re;
      })
    : [];

  const navBtn = { border:"none", background:"rgba(31,74,64,0.07)", cursor:"pointer", color:COLORS.green, display:"flex", padding:"6px 8px", borderRadius:8 };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <Card>
        {/* Month navigation */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <button style={navBtn} onClick={() => navMonth(-1)}><ChevronLeft size={16}/></button>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={() => setYr(y => y - 1)} style={{ border:"none", background:"transparent", cursor:"pointer", color:COLORS.textMuted, fontSize:16, padding:"0 2px" }}>‹</button>
            <span style={{ fontWeight:700, color:COLORS.green, fontSize:15, minWidth:154, textAlign:"center" }}>{MONTH_NAMES[mo]} {yr}</span>
            <button onClick={() => setYr(y => y + 1)} style={{ border:"none", background:"transparent", cursor:"pointer", color:COLORS.textMuted, fontSize:16, padding:"0 2px" }}>›</button>
          </div>
          <button style={navBtn} onClick={() => navMonth(1)}><ChevronRight size={16}/></button>
        </div>

        {/* Day headers */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:4 }}>
          {DAY_NAMES.map(d => (
            <div key={d} style={{ textAlign:"center", fontSize:11, fontWeight:700, color:COLORS.textMuted, padding:"3px 0" }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
          {cells.map((cell, i) => {
            const vacers = vacationersOnDay(cell);
            const ymd = toYMD(cell.y, cell.m, cell.d);
            const isToday = ymd === todayYMD;
            const isSelected = ymd === selectedDay;
            const isOverflow = cell.overflow;
            const hasVac = vacers.length > 0;

            return (
              <div
                key={i}
                onClick={() => !isOverflow && hasVac && setSelectedDay(isSelected ? null : ymd)}
                style={{
                  minHeight:56,
                  borderRadius:7,
                  padding:"4px 3px 3px",
                  background: isSelected
                    ? "rgba(31,74,64,0.12)"
                    : isToday
                    ? "rgba(201,162,78,0.10)"
                    : "transparent",
                  border: isToday
                    ? `1.5px solid ${COLORS.gold}`
                    : isSelected
                    ? `1.5px solid ${COLORS.green}`
                    : "1.5px solid transparent",
                  cursor: !isOverflow && hasVac ? "pointer" : "default",
                  opacity: isOverflow ? 0.3 : 1,
                  display:"flex", flexDirection:"column", alignItems:"flex-start", gap:2,
                  overflow:"hidden",
                  transition:"background 0.1s",
                }}
              >
                <span style={{
                  fontSize:10, fontWeight: isToday ? 700 : 400,
                  color: isToday ? COLORS.gold : COLORS.textMuted,
                  lineHeight:1, flexShrink:0, alignSelf:"flex-end",
                  marginBottom:1,
                }}>
                  {cell.d}
                </span>

                {/* Vacation indicators */}
                {hasVac && !isOverflow && (
                  <div style={{ display:"flex", flexDirection:"column", gap:1, width:"100%", overflow:"hidden" }}>
                    {vacers.slice(0, 2).map((r, vi) => {
                      const dept = getPrimaryDept(r.profiles);
                      return (
                        <div key={vi} style={{
                          background: getDepartmentColor(dept),
                          color: getDepartmentTextColor(dept),
                          borderRadius:3,
                          fontSize:9,
                          fontWeight:700,
                          padding:"1px 3px",
                          overflow:"hidden",
                          whiteSpace:"nowrap",
                          textOverflow:"ellipsis",
                          lineHeight:1.4,
                          width:"100%",
                          boxSizing:"border-box",
                        }}>
                          {getFirstName(r.profiles?.full_name)}
                        </div>
                      );
                    })}
                    {vacers.length > 2 && (
                      <div style={{
                        background:"rgba(31,74,64,0.15)",
                        color:COLORS.green,
                        borderRadius:3,
                        fontSize:9,
                        fontWeight:700,
                        padding:"1px 3px",
                        textAlign:"center",
                        lineHeight:1.4,
                      }}>
                        +{vacers.length - 2}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty month message */}
        {!anyThisMonth && (
          <p style={{ textAlign:"center", color:COLORS.textMuted, fontSize:13, marginTop:16, marginBottom:4 }}>
            Nadie del equipo tiene vacaciones programadas este mes.
          </p>
        )}
      </Card>

      {/* Detail panel for selected day */}
      {selectedDay && selectedVacationers.length > 0 && (
        <Card>
          <div style={{ marginBottom:10, fontSize:13, fontWeight:700, color:COLORS.green }}>
            {fmtSupaDate(selectedDay)} — {selectedVacationers.length} persona{selectedVacationers.length !== 1 ? "s" : ""} de vacaciones
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {selectedVacationers.map((r, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"8px 12px", borderRadius:8, background:COLORS.panelAlt,
              }}>
                <div style={{
                  width:32, height:32, borderRadius:16,
                  background: getDepartmentColor(getPrimaryDept(r.profiles)),
                  color: getDepartmentTextColor(getPrimaryDept(r.profiles)),
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:12, fontWeight:700, flexShrink:0,
                }}>
                  {getInitials(r.profiles?.full_name)}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:COLORS.text }}>{r.profiles?.full_name || "—"}</div>
                  {getPrimaryDept(r.profiles) && (
                    <div style={{ marginTop:3 }}><DeptTag dept={getPrimaryDept(r.profiles)} /></div>
                  )}
                  <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:4 }}>
                    {fmtSupaDate(r.start_date)} → {fmtSupaDate(r.end_date || r.start_date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Legend */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", padding:"0 2px", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:COLORS.textMuted }}>
          <div style={{ width:16, height:16, borderRadius:3, border:`1.5px solid ${COLORS.gold}` }}/>
          Hoy
        </div>
        {legendDepts.map(dept => (
          <div key={dept} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:COLORS.textMuted }}>
            <div style={{ width:16, height:16, borderRadius:3, background:getDepartmentColor(dept) }}/>
            {dept}
          </div>
        ))}
        {legendDepts.length === 0 && anyThisMonth && (
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:COLORS.textMuted }}>
            <div style={{ width:16, height:16, borderRadius:3, background:COLORS.gold }}/>
            Vacaciones aprobadas
          </div>
        )}
      </div>
    </div>
  );
}

function AprobacionesSection({ adminRequests = [], adminReports = [], onUpdateAdminRequest, onUpdateAdminReport, onDeleteAdminRequest, onVacationCancelled, reviewerName, showToast }) {
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

function fmtChatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (msgDay.getTime() === today.getTime())
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function SupportChatWidget({ userId }) {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState(null); // null = not yet loaded
  const [input,    setInput]    = useState("");
  const [sending,  setSending]  = useState(false);
  const [unread,   setUnread]   = useState(false);
  const bottomRef = useRef(null);
  const openRef2  = useRef(false);
  useEffect(() => { openRef2.current = open; }, [open]);

  // Load messages on first open
  useEffect(() => {
    if (!open || messages !== null) return;
    supabase.from("support_messages").select("*").eq("user_id", userId).order("created_at", { ascending: true })
      .then(({ data }) => setMessages(data || []));
  }, [open]);

  // Mark admin messages as read when panel opens
  useEffect(() => {
    if (!open) return;
    setUnread(false);
    supabase.from("support_messages").update({ read_by_employee: true })
      .eq("user_id", userId).eq("read_by_employee", false);
  }, [open]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime: admin replies + read-receipt updates
  useEffect(() => {
    const ch = supabase.channel("support-emp-" + userId)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: `user_id=eq.${userId}` }, ({ new: row }) => {
        if (row.sender_id === userId) {
          // Replace the oldest pending optimistic message with the real DB row so its id matches future UPDATE events
          setMessages(prev => {
            if (!prev) return [row];
            const optIdx = prev.findIndex(m => String(m.id).startsWith("opt-"));
            if (optIdx !== -1) return prev.map((m, i) => i === optIdx ? row : m);
            return prev.some(m => m.id === row.id) ? prev : [...prev, row];
          });
          return;
        }
        if (openRef2.current) {
          setMessages(prev => prev ? (prev.some(m => m.id === row.id) ? prev : [...prev, row]) : [row]);
          supabase.from("support_messages").update({ read_by_employee: true }).eq("id", row.id);
        } else {
          playNotificationPing();
          setUnread(true);
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "support_messages", filter: `user_id=eq.${userId}` }, ({ new: row }) => {
        // Update read_by_admin flag on own messages so receipt icon updates in real time
        if (row.sender_id === userId && row.read_by_admin) {
          setMessages(prev => prev ? prev.map(m => m.id === row.id ? { ...m, read_by_admin: true } : m) : prev);
        }
      })
      .subscribe();
    return () => { ch.unsubscribe(); supabase.removeChannel(ch); };
  }, [userId]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    const optimistic = { id: "opt-" + Date.now(), user_id: userId, sender_id: userId, message: text, created_at: new Date().toISOString(), read_by_admin: false, read_by_employee: true };
    setMessages(prev => [...(prev || []), optimistic]);
    setInput("");
    await supabase.from("support_messages").insert({ user_id: userId, sender_id: userId, message: text, read_by_admin: false, read_by_employee: true });
    setSending(false);
  }

  const isMineStyle = { background:"rgba(201,162,78,0.15)", border:"1px solid rgba(201,162,78,0.3)", borderRadius:"14px 14px 4px 14px" };
  const isTheirsStyle = { background:COLORS.panelAlt, border:`1px solid ${COLORS.border}`, borderRadius:"14px 14px 14px 4px" };

  return (
    <>
      {open && (
        <div style={{
          position:"fixed", bottom:90, right:24, width:340, height:420,
          background:COLORS.panel, borderRadius:16, border:`1px solid ${COLORS.border}`,
          boxShadow:"0 8px 32px rgba(0,0,0,0.14)", display:"flex", flexDirection:"column",
          zIndex:200, fontFamily:"'Manrope', sans-serif", animation:"sectionIn 0.2s ease-out both",
        }}>
          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 16px", borderBottom:`1px solid ${COLORS.border}`, flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#27ae60", flexShrink:0 }} />
              <span style={{ fontSize:14, fontWeight:700, color:COLORS.green }}>Soporte</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.textMuted, display:"flex", padding:4 }}>
              <X size={16}/>
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }}>
            {messages === null ? (
              <p style={{ color:COLORS.textMuted, fontSize:12, textAlign:"center", marginTop:24 }}>Cargando...</p>
            ) : messages.length === 0 ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", textAlign:"center", gap:12 }}>
                <MessageCircle size={28} color={COLORS.gold}/>
                <p style={{ color:COLORS.textMuted, fontSize:13, lineHeight:1.55, margin:0, maxWidth:220 }}>
                  ¿Tienes alguna duda o necesitas ayuda? Escríbenos y te responderemos pronto.
                </p>
              </div>
            ) : messages.map((msg, i) => {
              const mine = msg.sender_id === userId;
              return (
                <div key={msg.id || i} style={{ display:"flex", flexDirection:"column", alignItems: mine ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth:"80%", padding:"8px 12px", fontSize:13, color:COLORS.text, lineHeight:1.5, ...(mine ? isMineStyle : isTheirsStyle) }}>
                    {msg.message}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:3, marginTop:3 }}>
                    <span style={{ fontSize:10, color:COLORS.textMuted }}>{fmtChatTime(msg.created_at)}</span>
                    {mine && (
                      msg.read_by_admin
                        ? <CheckCheck size={12} color={COLORS.gold} />
                        : <Check size={12} color={COLORS.textMuted} />
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div style={{ padding:"10px 12px", borderTop:`1px solid ${COLORS.border}`, display:"flex", gap:8, flexShrink:0 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Escribe un mensaje..."
              style={{ flex:1, padding:"8px 12px", borderRadius:20, border:`1px solid ${COLORS.border}`, background:COLORS.inputBg, color:COLORS.text, fontSize:13, fontFamily:"'Manrope', sans-serif", outline:"none" }}
            />
            <button onClick={handleSend} disabled={!input.trim() || sending} style={{
              width:36, height:36, borderRadius:"50%", border:"none", flexShrink:0,
              cursor:(!input.trim() || sending) ? "not-allowed" : "pointer",
              background:(!input.trim() || sending) ? COLORS.border : `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
              display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s",
            }}>
              <Send size={14} color="#FFF"/>
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position:"fixed", bottom:24, right:24, width:56, height:56, borderRadius:"50%",
          background:`linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
          border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 4px 20px rgba(201,162,78,0.45)", zIndex:200, transition:"transform 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform="scale(1.08)"}
        onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
      >
        <MessageCircle size={24} color="#FFF"/>
        {unread && <div style={{ position:"absolute", top:4, right:4, width:10, height:10, borderRadius:"50%", background:"#e74c3c", border:"2px solid #FFF" }}/>}
      </button>
    </>
  );
}

function AdminSupportChatWidget({ adminId }) {
  const [open,         setOpen]         = useState(false);
  const [view,         setView]         = useState("list"); // "list" | "chat"
  const [conversations,setConversations]= useState(null);  // null = not loaded
  const [selectedConv, setSelectedConv] = useState(null);  // { userId, full_name, hasUnread }
  const [chatMessages, setChatMessages] = useState([]);
  const [input,        setInput]        = useState("");
  const [sending,      setSending]      = useState(false);
  const [badge,        setBadge]        = useState(0);
  const [deletingId,   setDeletingId]   = useState(null); // userId pending delete confirm
  const [deleteError,  setDeleteError]  = useState(null);
  const bottomRef        = useRef(null);
  const viewRef          = useRef("list");
  const selectedRef      = useRef(null);
  const openRef          = useRef(false);
  const pendingFetchsRef = useRef(new Set());
  const loadingConvRef   = useRef(null);
  useEffect(() => { viewRef.current     = view; },         [view]);
  useEffect(() => { selectedRef.current = selectedConv; }, [selectedConv]);
  useEffect(() => { openRef.current     = open; },         [open]);

  function buildConversations(data) {
    const map = {};
    for (const msg of data) {
      const uid = msg.user_id;
      if (!map[uid]) {
        map[uid] = {
          userId: uid,
          full_name: msg.profiles?.full_name || "Empleado",
          lastMessage: msg.message,
          lastTime: msg.created_at,
          hasUnread: false,
        };
      }
      if (!msg.read_by_admin && msg.sender_id !== adminId) map[uid].hasUnread = true;
    }
    return Object.values(map).sort((a, b) => {
      if (a.hasUnread !== b.hasUnread) return a.hasUnread ? -1 : 1;
      return new Date(b.lastTime) - new Date(a.lastTime);
    });
  }

  // Single source of truth for badge: derive from conversations when loaded, query DB before first open
  useEffect(() => {
    if (conversations !== null) {
      setBadge(conversations.filter(c => c.hasUnread).length);
      return;
    }
    supabase.from("support_messages").select("user_id").eq("read_by_admin", false).neq("sender_id", adminId)
      .then(({ data }) => { if (data) setBadge(new Set(data.map(m => m.user_id)).size); });
  }, [conversations, adminId]);

  // Load conversations on first open
  useEffect(() => {
    if (!open || conversations !== null) return;
    supabase.from("support_messages")
      .select("*, profiles!support_messages_user_id_fkey(full_name)")
      .order("created_at", { ascending: false })
      .then(({ data }) => setConversations(buildConversations(data || [])));
  }, [open]);

  // Auto-scroll in chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  async function openConversation(conv) {
    setSelectedConv(conv);
    setView("chat");
    setChatMessages([]);
    loadingConvRef.current = conv.userId;
    const { data } = await supabase.from("support_messages").select("*")
      .eq("user_id", conv.userId).order("created_at", { ascending: true });
    if (loadingConvRef.current !== conv.userId) return; // admin switched conversation before fetch resolved
    setChatMessages(data || []);
    await supabase.from("support_messages").update({ read_by_admin: true })
      .eq("user_id", conv.userId).eq("read_by_admin", false);
    setConversations(prev => prev ? prev.map(c =>
      c.userId === conv.userId ? { ...c, hasUnread: false } : c
    ).sort((a, b) => {
      if (a.hasUnread !== b.hasUnread) return a.hasUnread ? -1 : 1;
      return new Date(b.lastTime) - new Date(a.lastTime);
    }) : prev);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || sending || !selectedConv) return;
    setSending(true);
    const optimistic = { id:"opt-"+Date.now(), user_id:selectedConv.userId, sender_id:adminId, message:text, created_at:new Date().toISOString(), read_by_admin:true, read_by_employee:false };
    setChatMessages(prev => [...prev, optimistic]);
    setInput("");
    await supabase.from("support_messages").insert({ user_id:selectedConv.userId, sender_id:adminId, message:text, read_by_admin:true, read_by_employee:false });
    setSending(false);
  }

  async function deleteConversation(userId) {
    setDeleteError(null);
    const { error } = await supabase.from("support_messages").delete().eq("user_id", userId);
    if (error) {
      setDeleteError("No se pudo eliminar. Verifica los permisos.");
      return;
    }
    setConversations(prev => prev ? prev.filter(c => c.userId !== userId) : prev);
    setDeletingId(null);
    if (selectedConv?.userId === userId) { setView("list"); setSelectedConv(null); setChatMessages([]); }
  }

  // Realtime: all new employee messages + read-receipt updates for admin's own messages
  useEffect(() => {
    const ch = supabase.channel("support-admin-" + adminId)
      .on("postgres_changes", { event:"UPDATE", schema:"public", table:"support_messages", filter:`sender_id=eq.${adminId}` }, ({ new: row }) => {
        // When employee reads an admin message, update read_by_employee in local state
        if (row.read_by_employee && selectedRef.current?.userId === row.user_id) {
          setChatMessages(prev => prev.map(m => m.id === row.id ? { ...m, read_by_employee: true } : m));
        }
      })
      .on("postgres_changes", { event:"INSERT", schema:"public", table:"support_messages" }, ({ new: row }) => {
        if (row.sender_id === adminId) return;
        playNotificationPing();
        const inThisChat = openRef.current && viewRef.current === "chat" && selectedRef.current?.userId === row.user_id;
        if (inThisChat) {
          setChatMessages(prev => prev.some(m => m.id === row.id) ? prev : [...prev, row]);
          supabase.from("support_messages").update({ read_by_admin:true }).eq("id", row.id);
        }
        // Update conversations list; if not yet loaded, just increment badge directly
        setConversations(prev => {
          if (!prev) {
            setBadge(n => n + 1);
            return prev;
          }
          const exists = prev.some(c => c.userId === row.user_id);
          let next;
          if (exists) {
            next = prev.map(c => c.userId === row.user_id
              ? { ...c, lastMessage: row.message, lastTime: row.created_at, hasUnread: inThisChat ? false : true }
              : c);
          } else {
            // New conversation — fetch name once per user_id (guard against rapid duplicates)
            if (!pendingFetchsRef.current.has(row.user_id)) {
              pendingFetchsRef.current.add(row.user_id);
              supabase.from("profiles").select("full_name").eq("id", row.user_id).single()
                .then(({ data }) => {
                  pendingFetchsRef.current.delete(row.user_id);
                  setConversations(p => {
                    if (!p) return p;
                    if (p.some(c => c.userId === row.user_id)) return p;
                    return [...p, {
                      userId: row.user_id, full_name: data?.full_name || "Empleado",
                      lastMessage: row.message, lastTime: row.created_at, hasUnread: !inThisChat,
                    }].sort((a, b) => {
                      if (a.hasUnread !== b.hasUnread) return a.hasUnread ? -1 : 1;
                      return new Date(b.lastTime) - new Date(a.lastTime);
                    });
                  });
                });
            }
            return prev;
          }
          return next.sort((a, b) => {
            if (a.hasUnread !== b.hasUnread) return a.hasUnread ? -1 : 1;
            return new Date(b.lastTime) - new Date(a.lastTime);
          });
        });
      })
      .subscribe();
    return () => { ch.unsubscribe(); supabase.removeChannel(ch); };
  }, [adminId]);

  const panelStyle = {
    position:"fixed", bottom:90, right:24, width:340, height:440,
    background:COLORS.panel, borderRadius:16, border:`1px solid ${COLORS.border}`,
    boxShadow:"0 8px 32px rgba(0,0,0,0.14)", display:"flex", flexDirection:"column",
    zIndex:200, fontFamily:"'Manrope', sans-serif", animation:"sectionIn 0.2s ease-out both",
  };

  return (
    <>
      {open && (
        <div style={panelStyle}>
          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 16px", borderBottom:`1px solid ${COLORS.border}`, flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {view === "chat" && (
                <button onClick={() => { setView("list"); setSelectedConv(null); setDeletingId(null); }} style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.textMuted, display:"flex", padding:"0 4px 0 0" }}>
                  <ChevronLeft size={18}/>
                </button>
              )}
              <span style={{ fontSize:14, fontWeight:700, color:COLORS.green }}>
                {view === "list" ? "Soporte" : (selectedConv?.full_name || "Chat")}
              </span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              {view === "chat" && selectedConv && (
                <button onClick={() => setDeletingId(selectedConv.userId)} title="Eliminar chat" style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.textMuted, display:"flex", padding:4, transition:"color 0.12s" }}
                  onMouseEnter={e => e.currentTarget.style.color="#c0392b"}
                  onMouseLeave={e => e.currentTarget.style.color=COLORS.textMuted}
                >
                  <Trash2 size={15}/>
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.textMuted, display:"flex", padding:4 }}>
                <X size={16}/>
              </button>
            </div>
          </div>
          {/* Inline delete confirm in chat view */}
          {view === "chat" && deletingId === selectedConv?.userId && (
            <div style={{ padding:"8px 16px", background:"rgba(192,57,43,0.06)", borderBottom:`1px solid rgba(192,57,43,0.15)`, flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontSize:12, color:"#c0392b", fontWeight:600 }}>¿Eliminar este chat?</span>
                <div style={{ display:"flex", gap:6 }}>
                  <button onClick={() => deleteConversation(selectedConv.userId)} style={{ fontSize:11, fontWeight:700, color:"#FFF", background:"#c0392b", border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>Eliminar</button>
                  <button onClick={() => { setDeletingId(null); setDeleteError(null); }} style={{ fontSize:11, fontWeight:600, color:COLORS.textMuted, background:"transparent", border:`1px solid ${COLORS.border}`, borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>Cancelar</button>
                </div>
              </div>
              {deleteError && <p style={{ fontSize:11, color:"#c0392b", margin:"5px 0 0", fontFamily:"'Manrope', sans-serif" }}>{deleteError}</p>}
            </div>
          )}

          {/* LIST view */}
          {view === "list" && (
            <div style={{ flex:1, overflowY:"auto" }}>
              {conversations === null ? (
                <p style={{ color:COLORS.textMuted, fontSize:12, textAlign:"center", marginTop:24 }}>Cargando...</p>
              ) : conversations.length === 0 ? (
                <p style={{ color:COLORS.textMuted, fontSize:13, textAlign:"center", margin:"32px 20px" }}>No hay conversaciones de soporte.</p>
              ) : conversations.map(conv => (
                <div key={conv.userId} style={{ borderBottom:`1px solid ${COLORS.border}` }}>
                  {deletingId === conv.userId ? (
                    <div style={{ padding:"10px 16px", background:"rgba(192,57,43,0.05)" }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <span style={{ fontSize:12, color:"#c0392b", fontWeight:600 }}>¿Eliminar este chat?</span>
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={() => deleteConversation(conv.userId)} style={{ fontSize:11, fontWeight:700, color:"#FFF", background:"#c0392b", border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>Eliminar</button>
                          <button onClick={() => { setDeletingId(null); setDeleteError(null); }} style={{ fontSize:11, fontWeight:600, color:COLORS.textMuted, background:"transparent", border:`1px solid ${COLORS.border}`, borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>Cancelar</button>
                        </div>
                      </div>
                      {deleteError && <p style={{ fontSize:11, color:"#c0392b", margin:"5px 0 0", fontFamily:"'Manrope', sans-serif" }}>{deleteError}</p>}
                    </div>
                  ) : (
                    <div onClick={() => openConversation(conv)} style={{
                      display:"flex", alignItems:"center", gap:10, padding:"11px 16px",
                      cursor:"pointer",
                      background: conv.hasUnread ? "rgba(201,162,78,0.06)" : "transparent",
                      transition:"background 0.12s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background="rgba(31,74,64,0.05)"}
                      onMouseLeave={e => e.currentTarget.style.background= conv.hasUnread ? "rgba(201,162,78,0.06)" : "transparent"}
                    >
                      <div style={{ width:36, height:36, borderRadius:"50%", background:COLORS.panelAlt, border:`1px solid ${COLORS.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:14, fontWeight:700, color:COLORS.textMuted }}>
                        {(conv.full_name || "E")[0].toUpperCase()}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:2 }}>
                          <span style={{ fontSize:13, fontWeight: conv.hasUnread ? 700 : 600, color:COLORS.text }}>{conv.full_name}</span>
                          <span style={{ fontSize:10, color:COLORS.textMuted, flexShrink:0 }}>{fmtChatTime(conv.lastTime)}</span>
                        </div>
                        <span style={{ fontSize:12, color: conv.hasUnread ? COLORS.text : COLORS.textMuted, display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {conv.lastMessage}
                        </span>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setDeletingId(conv.userId); }}
                        title="Eliminar chat"
                        style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.textMuted, padding:4, display:"flex", flexShrink:0, transition:"color 0.12s" }}
                        onMouseEnter={e => e.currentTarget.style.color="#c0392b"}
                        onMouseLeave={e => e.currentTarget.style.color=COLORS.textMuted}
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* CHAT view */}
          {view === "chat" && (
            <>
              <div style={{ flex:1, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }}>
                {chatMessages.length === 0 ? (
                  <p style={{ color:COLORS.textMuted, fontSize:12, textAlign:"center", marginTop:24 }}>Sin mensajes aún.</p>
                ) : chatMessages.map((msg, i) => {
                  const mine = msg.sender_id === adminId;
                  return (
                    <div key={msg.id || i} style={{ display:"flex", flexDirection:"column", alignItems: mine ? "flex-end" : "flex-start" }}>
                      <div style={{ maxWidth:"80%", padding:"8px 12px", fontSize:13, color:COLORS.text, lineHeight:1.5,
                        background: mine ? "rgba(201,162,78,0.15)" : COLORS.panelAlt,
                        border: mine ? "1px solid rgba(201,162,78,0.3)" : `1px solid ${COLORS.border}`,
                        borderRadius: mine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      }}>
                        {msg.message}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:3, marginTop:3 }}>
                        <span style={{ fontSize:10, color:COLORS.textMuted }}>{fmtChatTime(msg.created_at)}</span>
                        {mine && (
                          msg.read_by_employee
                            ? <CheckCheck size={12} color={COLORS.gold} />
                            : <Check size={12} color={COLORS.textMuted} />
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef}/>
              </div>
              <div style={{ padding:"10px 12px", borderTop:`1px solid ${COLORS.border}`, display:"flex", gap:8, flexShrink:0 }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Responder..."
                  style={{ flex:1, padding:"8px 12px", borderRadius:20, border:`1px solid ${COLORS.border}`, background:COLORS.inputBg, color:COLORS.text, fontSize:13, fontFamily:"'Manrope', sans-serif", outline:"none" }}
                />
                <button onClick={handleSend} disabled={!input.trim() || sending} style={{
                  width:36, height:36, borderRadius:"50%", border:"none", flexShrink:0,
                  cursor:(!input.trim() || sending) ? "not-allowed" : "pointer",
                  background:(!input.trim() || sending) ? COLORS.border : `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
                  display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s",
                }}>
                  <Send size={14} color="#FFF"/>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position:"fixed", bottom:24, right:24, width:56, height:56, borderRadius:"50%",
          background:`linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
          border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 4px 20px rgba(201,162,78,0.45)", zIndex:200, transition:"transform 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform="scale(1.08)"}
        onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
      >
        <MessageCircle size={24} color="#FFF"/>
        {badge > 0 && (
          <div style={{ position:"absolute", top:2, right:2, minWidth:18, height:18, borderRadius:9, background:"#e74c3c", border:"2px solid #FFF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:"#FFF", padding:"0 3px" }}>
            {badge}
          </div>
        )}
      </button>
    </>
  );
}

function Dashboard({ onLogout, profile, allRequests = [], onNewRequest, onDeleteRequest, reports = [], onNewReport, onDeleteReport, announcements = [], documents = [], upcomingBirthdays = [], adminRequests = [], adminReports = [], onUpdateAdminRequest, onUpdateAdminReport, onDeleteAdminRequest, onVacationCancelled, adminAnnouncements = [], onNewAnnouncement, onDeleteAnnouncement, adminDocuments = [], onNewDocument, onDeleteDocument, onUpdateAdminDocument, adminProfiles = [], departments = [], departmentsList = [], onUpdateAdminProfile, userId, solicitudesUnread = 0, onClearSolicitudesUnread, teamVacations = [], recognitions = [], onNewRecognition, onDeleteRecognition, teamDirectory = [], recognitionsUnread = 0, onMarkRecognitionsRead, polls = [], myVotes = {}, pollResults = {}, onVoted, onPollCreated, onPollClosed, onPollDeleted, exchangeRate = null, mySales = [], allSales = [], onExchangeRateUpdated, onSaleDeleted, showToast, onAliasUpdated, myConfirmations = {}, allConfirmations = [], onConfirmRead, onNewConfirmation }) {
  const [active, setActive] = useState("inicio");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const noAnim = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [displayActive, setDisplayActive] = useState("inicio");
  const [sectionPhase, setSectionPhase] = useState(null); // null = no anim on first mount
  const navigate = useCallback((next) => {
    if (next === displayActive) return;
    if (next === "solicitudes") onClearSolicitudesUnread?.();
    if (next === "reconocimientos") onMarkRecognitionsRead?.();
    setActive(next);
    if (noAnim) { setDisplayActive(next); return; }
    setSectionPhase("out");
    setTimeout(() => { setDisplayActive(next); setSectionPhase("in"); }, 170);
  }, [displayActive, noAnim, onClearSolicitudesUnread]);
  const sectionAnim = (!sectionPhase || noAnim) ? {} : sectionPhase === "out"
    ? { animation: "sectionOut 0.17s ease-in both" }
    : { animation: "sectionIn 0.22s ease-out both" };
  const [dashDone, setDashDone] = useState(false);
  const dashboardInAnim = (!dashDone && !noAnim) ? { animation: "dashboardIn 0.45s ease-out both" } : {};

  const sectionTitle = { inicio: "Inicio", vacaciones: "Vacaciones", "calendario-equipo": "Calendario de equipo", comunicados: "Comunicados", encuestas: "Encuestas", reconocimientos: "Reconocimientos", comisiones: "Comisiones", documentos: "Documentos", solicitudes: "Solicitudes", perfil: "Mi perfil", aprobaciones: "Aprobaciones", "comunicados-admin": "Gestionar comunicados", "documentos-admin": "Gestionar documentos", empleados: "Empleados", "alta-empleado": "Gestión de empleados" }[displayActive];

  const pendingApprovalCount = (profile?.role === "admin")
    ? adminRequests.filter(r => r.status === "pendiente").length + adminReports.filter(r => r.status === "pendiente").length
    : 0;
  const pollsUnvotedCount = polls.filter(p => p.status === "activa" && myVotes[p.id] === undefined).length;

  const vacationRequests = allRequests.filter(r => r.type === "vacaciones");
  const allSolicitudes = [
    ...allRequests.map(r => ({
      id: r.id, kind: "request", type: r.type,
      label: r.type === "vacaciones" ? "Vacaciones" : (r.category || "Permiso"),
      subtitle: r.start_date
        ? `${fmtSupaShort(r.start_date)} → ${fmtSupaShort(r.end_date || r.start_date)} · ${getEffectiveDays(r)} días`
        : (r.comment || ""),
      timeRange: (r.start_time && r.end_time) ? `${r.start_time.slice(0,5)} — ${r.end_time.slice(0,5)}` : null,
      status: r.status, created_at: r.created_at,
      reviewerName: r.reviewer?.full_name || null,
      reviewed_at: r.reviewed_at || null,
    })),
    ...reports.map(r => ({
      id: r.id, kind: "report",
      label: r.category || "Reporte",
      subtitle: r.description || "",
      location: r.location,
      photo_url: r.photo_url,
      status: r.status, created_at: r.created_at,
      resolution_note: r.resolution_note || null,
      reviewerName: r.reviewer?.full_name || null,
    })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const vacationBalance = profile?.vacation_balance ?? VAC_TOTAL;
  const approvedDays  = vacationRequests.filter(r => r.status === "aprobado").reduce((a, r) => a + getEffectiveDays(r), 0);
  const pendingDays   = vacationRequests.filter(r => r.status === "pendiente").reduce((a, r) => a + getEffectiveDays(r), 0);
  const availableDays = Math.max(0, vacationBalance - approvedDays);
  const vacData = { approvedDays, pendingDays, availableDays, vacationBalance };

  function getInitials(name) {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  }
  const initials = getInitials(profile?.full_name);

  const now = new Date();
  const hour = now.getHours();
  const timeGreeting = hour >= 5 && hour < 12 ? "Buenos días"
    : hour >= 12 && hour < 19 ? "Buenas tardes"
    : "Buenas noches";
  const displayName = profile?.alias?.trim() || getFirstNames(profile?.full_name) || "";
  const greeting = displayName ? `${timeGreeting}, ${displayName}` : timeGreeting;
  const DAY_NAMES = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const todayStr = `${DAY_NAMES[now.getDay()]} ${now.getDate()} de ${MONTH_NAMES[now.getMonth()].toLowerCase()} de ${now.getFullYear()}`;
  const isBirthday = isBirthdayToday(profile?.birth_date);
  const dailyMessage = getDailyMessage();

  if (isMobile) {
    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'Manrope', sans-serif" }}>
        {/* Header fijo móvil */}
        <div style={{
          position: "sticky", top: 0, zIndex: 50, width: "100%", boxSizing: "border-box",
          background: SIDEBAR_BG, padding: "10px 14px",
          display: "flex", alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ width: 42, flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Logo width={120} />
          </div>
          <button onClick={openDrawer} style={{
            width: 42, height: 42, border: "none",
            background: "rgba(255,255,255,0.1)", color: "#FFF",
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", borderRadius: 10, flexShrink: 0,
          }}>
            <Menu size={22} />
          </button>
        </div>
        {isBirthday && !noAnim && <BirthdayConfetti />}
        <MobileDrawer open={drawerOpen} onClose={closeDrawer} active={active} setActive={navigate} onLogout={onLogout} profile={profile} pendingApprovalCount={pendingApprovalCount} solicitudesUnreadCount={solicitudesUnread} />
        <div style={{ padding: "24px 16px 48px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.22em", color: COLORS.gold, marginBottom: 4, textTransform: "uppercase", fontWeight: 600 }}>
            {todayStr}
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, margin: "0 0 6px", color: COLORS.green }}>
            {displayActive === "inicio" ? greeting : sectionTitle}
          </h1>
          {isBirthday && displayActive === "inicio" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 10px" }}>
              <Cake size={18} color={COLORS.gold} />
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: COLORS.gold }}>
                ¡Feliz cumpleaños!
              </span>
            </div>
          )}
          {displayActive === "inicio" && (
            <p style={{ fontSize: 13, color: COLORS.textMuted, margin: "0 0 20px", lineHeight: 1.55, fontStyle: "italic" }}>
              {dailyMessage}
            </p>
          )}
          {displayActive === "inicio" ? <DashboardHome isMobile={true} setActive={navigate} allSolicitudes={allSolicitudes} vacData={vacData} announcements={announcements} documents={documents} upcomingBirthdays={upcomingBirthdays} onNewRequest={onNewRequest} onNewReport={onNewReport} existingVacationRequests={vacationRequests} recognitions={recognitions} polls={polls} myVotes={myVotes} pollResults={pollResults} userId={userId} onVoted={onVoted} myConfirmations={myConfirmations} /> : displayActive === "vacaciones" ? <VacationSection profile={profile} vacationRequests={vacationRequests} onNewRequest={onNewRequest} /> : displayActive === "calendario-equipo" ? <TeamCalendarSection teamVacations={teamVacations} /> : displayActive === "comunicados" ? <AnnouncementsSection announcements={announcements} profile={profile} onDeleteAnnouncement={onDeleteAnnouncement} /> : displayActive === "reconocimientos" ? <RecognitionsSection recognitions={recognitions} onNewRecognition={onNewRecognition} onDeleteRecognition={onDeleteRecognition} userId={userId} profile={profile} teamDirectory={teamDirectory} onMarkRead={onMarkRecognitionsRead} unreadCount={recognitionsUnread} /> : displayActive === "documentos" ? <DocumentsSection documents={documents} myConfirmations={myConfirmations} userId={userId} onConfirmRead={onConfirmRead} /> : displayActive === "solicitudes" ? <SolicitudesSection allSolicitudes={allSolicitudes} onNewRequest={onNewRequest} onNewReport={onNewReport} availableDays={availableDays} existingVacationRequests={vacationRequests} onDeleteRequest={onDeleteRequest} onDeleteReport={onDeleteReport} /> : displayActive === "perfil" ? <ProfileSection profile={profile} onAliasUpdated={onAliasUpdated} /> : displayActive === "aprobaciones" ? <AprobacionesSection adminRequests={adminRequests} adminReports={adminReports} onUpdateAdminRequest={onUpdateAdminRequest} onUpdateAdminReport={onUpdateAdminReport} onDeleteAdminRequest={onDeleteAdminRequest} onVacationCancelled={onVacationCancelled} reviewerName={profile?.full_name} showToast={showToast} /> : displayActive === "comunicados-admin" ? <GestionComunicadosSection adminAnnouncements={adminAnnouncements} departmentsList={departmentsList} onNewAnnouncement={onNewAnnouncement} onDeleteAnnouncement={onDeleteAnnouncement} /> : displayActive === "documentos-admin" ? <GestionDocumentosSection adminDocuments={adminDocuments} departmentsList={departmentsList} adminProfiles={adminProfiles} allConfirmations={allConfirmations} onNewDocument={onNewDocument} onDeleteDocument={onDeleteDocument} onUpdateAdminDocument={onUpdateAdminDocument} /> : displayActive === "empleados" ? <EmpleadosSection adminProfiles={adminProfiles} adminRequests={adminRequests} departmentsList={departmentsList} onUpdateProfile={onUpdateAdminProfile} /> : displayActive === "encuestas" ? <EncuestasSection polls={polls} myVotes={myVotes} pollResults={pollResults} userId={userId} profile={profile} onPollCreated={onPollCreated} onVoted={onVoted} onPollClosed={onPollClosed} onPollDeleted={onPollDeleted} /> : displayActive === "comisiones" ? <ComisionesSection profile={profile} userId={userId} exchangeRate={exchangeRate} mySales={mySales} allSales={allSales} onExchangeRateUpdated={onExchangeRateUpdated} onSaleDeleted={onSaleDeleted} showToast={showToast} /> : displayActive === "alta-empleado" ? <AltaEmpleadoSection departmentsList={departmentsList} /> : <PlaceholderSection title={sectionTitle} />}
        </div>
        {profile && profile.role !== "admin" && profile.role !== "inactivo" && userId && <SupportChatWidget userId={userId}/>}
      {(profile?.role === "admin") && userId && <AdminSupportChatWidget adminId={userId}/>}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", background: COLORS.bg, minHeight: "100vh", fontFamily: "'Manrope', sans-serif", ...dashboardInAnim }} onAnimationEnd={(e) => { if (e.animationName === "dashboardIn") setDashDone(true); }}>
      {isBirthday && !noAnim && <BirthdayConfetti />}
      <Sidebar active={active} setActive={navigate} onLogout={onLogout} profile={profile} pendingApprovalCount={pendingApprovalCount} solicitudesUnreadCount={solicitudesUnread} recognitionsUnreadCount={recognitionsUnread} pollsUnvotedCount={pollsUnvotedCount} />
      <div style={{ flex: 1, padding: "36px 40px", minWidth: 0 }}>
        <div style={sectionAnim} onAnimationEnd={(e) => { if (e.animationName === "sectionIn") setSectionPhase(null); }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.25em", color: COLORS.gold, marginBottom: 6, textTransform: "uppercase", fontWeight: 600 }}>
              {todayStr}
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, margin: "0 0 6px", color: COLORS.green }}>
              {displayActive === "inicio" ? greeting : sectionTitle}
            </h1>
            {isBirthday && displayActive === "inicio" && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0 10px" }}>
                <Cake size={20} color={COLORS.gold} />
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: COLORS.gold }}>
                  ¡Feliz cumpleaños!
                </span>
              </div>
            )}
            {displayActive === "inicio" && (
              <p style={{ fontSize: 14, color: COLORS.textMuted, margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
                {dailyMessage}
              </p>
            )}
          </div>
          {displayActive === "inicio" ? <DashboardHome isMobile={false} setActive={navigate} allSolicitudes={allSolicitudes} vacData={vacData} announcements={announcements} documents={documents} upcomingBirthdays={upcomingBirthdays} onNewRequest={onNewRequest} onNewReport={onNewReport} existingVacationRequests={vacationRequests} recognitions={recognitions} polls={polls} myVotes={myVotes} pollResults={pollResults} userId={userId} onVoted={onVoted} myConfirmations={myConfirmations} /> : displayActive === "vacaciones" ? <VacationSection profile={profile} vacationRequests={vacationRequests} onNewRequest={onNewRequest} /> : displayActive === "calendario-equipo" ? <TeamCalendarSection teamVacations={teamVacations} /> : displayActive === "comunicados" ? <AnnouncementsSection announcements={announcements} profile={profile} onDeleteAnnouncement={onDeleteAnnouncement} /> : displayActive === "reconocimientos" ? <RecognitionsSection recognitions={recognitions} onNewRecognition={onNewRecognition} onDeleteRecognition={onDeleteRecognition} userId={userId} profile={profile} teamDirectory={teamDirectory} onMarkRead={onMarkRecognitionsRead} unreadCount={recognitionsUnread} /> : displayActive === "documentos" ? <DocumentsSection documents={documents} myConfirmations={myConfirmations} userId={userId} onConfirmRead={onConfirmRead} /> : displayActive === "solicitudes" ? <SolicitudesSection allSolicitudes={allSolicitudes} onNewRequest={onNewRequest} onNewReport={onNewReport} availableDays={availableDays} existingVacationRequests={vacationRequests} onDeleteRequest={onDeleteRequest} onDeleteReport={onDeleteReport} /> : displayActive === "perfil" ? <ProfileSection profile={profile} onAliasUpdated={onAliasUpdated} /> : displayActive === "aprobaciones" ? <AprobacionesSection adminRequests={adminRequests} adminReports={adminReports} onUpdateAdminRequest={onUpdateAdminRequest} onUpdateAdminReport={onUpdateAdminReport} onDeleteAdminRequest={onDeleteAdminRequest} onVacationCancelled={onVacationCancelled} reviewerName={profile?.full_name} showToast={showToast} /> : displayActive === "comunicados-admin" ? <GestionComunicadosSection adminAnnouncements={adminAnnouncements} departmentsList={departmentsList} onNewAnnouncement={onNewAnnouncement} onDeleteAnnouncement={onDeleteAnnouncement} /> : displayActive === "documentos-admin" ? <GestionDocumentosSection adminDocuments={adminDocuments} departmentsList={departmentsList} adminProfiles={adminProfiles} allConfirmations={allConfirmations} onNewDocument={onNewDocument} onDeleteDocument={onDeleteDocument} onUpdateAdminDocument={onUpdateAdminDocument} /> : displayActive === "empleados" ? <EmpleadosSection adminProfiles={adminProfiles} adminRequests={adminRequests} departmentsList={departmentsList} onUpdateProfile={onUpdateAdminProfile} /> : displayActive === "encuestas" ? <EncuestasSection polls={polls} myVotes={myVotes} pollResults={pollResults} userId={userId} profile={profile} onPollCreated={onPollCreated} onVoted={onVoted} onPollClosed={onPollClosed} onPollDeleted={onPollDeleted} /> : displayActive === "comisiones" ? <ComisionesSection profile={profile} userId={userId} exchangeRate={exchangeRate} mySales={mySales} allSales={allSales} onExchangeRateUpdated={onExchangeRateUpdated} onSaleDeleted={onSaleDeleted} showToast={showToast} /> : displayActive === "alta-empleado" ? <AltaEmpleadoSection departmentsList={departmentsList} /> : <PlaceholderSection title={sectionTitle} />}
        </div>
      </div>
      {profile && profile.role !== "admin" && profile.role !== "inactivo" && userId && <SupportChatWidget userId={userId}/>}
      {(profile?.role === "admin") && userId && <AdminSupportChatWidget adminId={userId}/>}
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = logged out
  const [profile, setProfile] = useState(null);
  const [allRequests, setAllRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [reports, setReports] = useState([]);
  const [adminRequests,      setAdminRequests]      = useState([]);
  const [adminReports,       setAdminReports]        = useState([]);
  const [adminAnnouncements, setAdminAnnouncements]  = useState([]);
  const [adminDocuments,     setAdminDocuments]      = useState([]);
  const [adminProfiles,      setAdminProfiles]       = useState([]);
  const [departments,        setDepartments]         = useState([]);
  const [departmentsList,    setDepartmentsList]     = useState([]);
  const [solicitudesUnread,  setSolicitudesUnread]   = useState(0);
  const [teamVacations,      setTeamVacations]       = useState([]);
  const [recognitions,       setRecognitions]        = useState([]);
  const [toast,              setToast]               = useState(null);
  const toastTimerRef = useRef(null);
  function showToast(toastObj) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(toastObj);
    toastTimerRef.current = setTimeout(() => { setToast(null); toastTimerRef.current = null; }, 5000);
  }
  const [teamDirectory,      setTeamDirectory]       = useState([]);
  const [polls,              setPolls]               = useState([]);
  const [myVotes,            setMyVotes]             = useState({});
  const [pollResults,        setPollResults]         = useState({});
  const [exchangeRate,       setExchangeRate]        = useState(null);
  const [mySales,            setMySales]            = useState([]);
  const [allSales,           setAllSales]            = useState([]);
  const [myConfirmations,    setMyConfirmations]     = useState({}); // { [document_id]: confirmed_at }
  const [allConfirmations,   setAllConfirmations]    = useState([]); // admin only

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null);
      if (!s) { setProfile(null); setAllRequests([]); setAnnouncements([]); setDocuments([]); setUpcomingBirthdays([]); setReports([]); setAdminRequests([]); setAdminReports([]); setAdminAnnouncements([]); setAdminDocuments([]); setAdminProfiles([]); setDepartments([]); setDepartmentsList([]); setTeamVacations([]); setRecognitions([]); setToast(null); setTeamDirectory([]); setPolls([]); setMyVotes({}); setPollResults({}); setExchangeRate(null); setMySales([]); setAllSales([]); setMyConfirmations({}); setAllConfirmations([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => { if (data) setProfile(data); });
    supabase
      .from("requests")
      .select("*, reviewer:profiles!reviewed_by(full_name)")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setAllRequests(data); });
    supabase
      .from("reports")
      .select("*, reviewer:profiles!reviewed_by(full_name)")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setReports(data); });
  }, [session]);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("announcements")
      .select("*")
      .lte("publish_at", new Date().toISOString())
      .or(buildAudienceFilter("audience_list", profile.departments))
      .order("publish_at", { ascending: false })
      .then(({ data }) => { if (data) setAnnouncements(data); });
    supabase
      .from("documents")
      .select("*")
      .eq("archived", false)
      .or(buildAudienceFilter("departments", profile.departments))
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setDocuments(data); });
    supabase.from("document_confirmations").select("document_id, confirmed_at").eq("user_id", profile.id)
      .then(({ data }) => {
        if (!data) return;
        const map = {};
        data.forEach(c => { map[c.document_id] = c.confirmed_at; });
        setMyConfirmations(map);
      });
    supabase.rpc("get_recognitions_feed")
      .then(({ data }) => { if (data) setRecognitions(data); });
    supabase.rpc("get_team_directory")
      .then(({ data }) => { if (data) setTeamDirectory(data); });
    supabase.from("polls").select("*").order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        setPolls(data);
        data.filter(p => p.status === "activa").forEach(p => {
          supabase.rpc("get_poll_results", { poll_id_input: p.id }).then(({ data: res }) => {
            if (!res) return;
            const map = {}; res.forEach(r => { map[r.option_index] = r.votes; });
            setPollResults(prev => ({ ...prev, [p.id]: map }));
          });
        });
      });
    supabase.from("poll_votes").select("poll_id, option_index").eq("user_id", profile.id)
      .then(({ data }) => {
        if (!data) return;
        const map = {}; data.forEach(v => { map[v.poll_id] = v.option_index; });
        setMyVotes(map);
      });

    supabase.from("exchange_rate").select("*").order("updated_at", { ascending: false }).limit(1).single().then(({ data }) => { if (data) setExchangeRate(data); });
    if (profile.commission_eligible) {
      supabase.from("commission_sales").select("*").eq("user_id", profile.id).order("sale_date", { ascending: false }).then(({ data }) => { if (data) setMySales(data); });
    }
    if (profile.role === "admin") {
      supabase.from("commission_sales").select("*, profiles(full_name)").order("sale_date", { ascending: false }).then(({ data }) => { if (data) setAllSales(data); });
    }

    supabase.rpc("get_team_vacations").then(({ data }) => {
      if (data) setTeamVacations(data.map(r => ({
        start_date: r.start_date,
        end_date:   r.end_date,
        profiles: { full_name: r.full_name, department: r.department, departments: r.departments },
      })));
    });
    supabase.rpc("get_birthdays").then(({ data }) => {
      if (!data) return;
      const today = new Date(); today.setHours(0,0,0,0);
      const processed = data.map(p => {
        const bd = new Date(p.birth_date + "T12:00:00");
        let next = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
        if (next < today) next = new Date(today.getFullYear() + 1, bd.getMonth(), bd.getDate());
        const shortDate = `${next.getDate()} ${MONTH_NAMES[next.getMonth()].slice(0,3).toLowerCase()}`;
        return { full_name: p.full_name, date: shortDate, _next: next };
      });
      processed.sort((a, b) => a._next - b._next);
      setUpcomingBirthdays(processed.slice(0, 5).map(({ full_name, date }) => ({ full_name, date })));
    });
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    if (profile.role !== "admin") return;
    supabase.from("requests").select("*, profiles!requests_user_id_fkey(full_name, department), reviewer:profiles!reviewed_by(full_name)").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setAdminRequests(data); });
    supabase.from("reports").select("*, profiles!reports_user_id_fkey(full_name, department), reviewer:profiles!reviewed_by(full_name)").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setAdminReports(data);
      });
    supabase.from("announcements").select("*, profiles!announcements_created_by_fkey(full_name)").order("publish_at", { ascending: false })
      .then(({ data }) => { if (data) setAdminAnnouncements(data); });
    supabase.from("documents").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setAdminDocuments(data); });
    supabase.from("document_confirmations").select("document_id, user_id, confirmed_at, profiles(full_name)")
      .then(({ data }) => { if (data) setAllConfirmations(data); });
    supabase.from("profiles").select("*").order("full_name", { ascending: true })
      .then(({ data }) => {
        if (!data) return;
        setAdminProfiles(data);
        const unique = [...new Set(data.map(p => p.department).filter(Boolean))].sort();
        setDepartments(unique);
      });
    supabase.from("departments").select("*").order("name")
      .then(({ data }) => { if (data) setDepartmentsList(data); });
  }, [profile]);

  // Unlock AudioContext on first user interaction so it's ready when Realtime fires
  useEffect(() => {
    document.addEventListener("click", unlockAudio, { once: true });
    return () => document.removeEventListener("click", unlockAudio);
  }, []);

  // ── Realtime subscriptions ──
  useEffect(() => {
    if (!profile || !session?.user) return;

    const userId    = session.user.id;
    const isAdmin   = profile.role === "admin";
    const userDepts = Array.isArray(profile.departments) ? profile.departments : [];

    function audienceMatch(list) {
      if (!Array.isArray(list)) return false;
      return list.includes("todos") || userDepts.some(d => list.includes(d));
    }
    function deptsMatch(list) {
      if (!Array.isArray(list)) return false;
      return list.includes("todos") || userDepts.some(d => list.includes(d));
    }

    const ch = supabase.channel("portal-realtime-" + userId);

    // ── announcements ──
    ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "announcements" }, ({ new: row }) => {
      if (new Date(row.publish_at) > new Date()) return;
      if (audienceMatch(row.audience_list)) {
        setAnnouncements(prev => prev.some(a => a.id === row.id) ? prev : [row, ...prev]);
        playNotificationPing();
        showToast({ message: `Nuevo comunicado: ${row.title}`, Icon: Bell });
      }
      if (isAdmin) {
        supabase.from("announcements").select("*, profiles!announcements_created_by_fkey(full_name)").eq("id", row.id).single()
          .then(({ data }) => { if (data) setAdminAnnouncements(prev => prev.some(a => a.id === data.id) ? prev : [data, ...prev]); });
      }
    });
    ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "announcements" }, ({ new: row }) => {
      setAnnouncements(prev => prev.map(a => a.id === row.id ? { ...a, ...row } : a));
      if (isAdmin) setAdminAnnouncements(prev => prev.map(a => a.id === row.id ? { ...a, ...row } : a));
    });
    ch.on("postgres_changes", { event: "DELETE", schema: "public", table: "announcements" }, ({ old: row }) => {
      setAnnouncements(prev => prev.filter(a => a.id !== row.id));
      if (isAdmin) setAdminAnnouncements(prev => prev.filter(a => a.id !== row.id));
    });

    // ── documents ──
    ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "documents" }, ({ new: row }) => {
      if (deptsMatch(row.departments)) {
        setDocuments(prev => prev.some(d => d.id === row.id) ? prev : [row, ...prev]);
      }
      if (isAdmin) setAdminDocuments(prev => prev.some(d => d.id === row.id) ? prev : [row, ...prev]);
    });
    ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "documents" }, ({ new: row }) => {
      setDocuments(prev => prev.map(d => d.id === row.id ? { ...d, ...row } : d));
      if (isAdmin) setAdminDocuments(prev => prev.map(d => d.id === row.id ? { ...d, ...row } : d));
    });
    ch.on("postgres_changes", { event: "DELETE", schema: "public", table: "documents" }, ({ old: row }) => {
      setDocuments(prev => prev.filter(d => d.id !== row.id));
      if (isAdmin) setAdminDocuments(prev => prev.filter(d => d.id !== row.id));
    });

    // ── employee's own requests/reports: status updates ──
    ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "requests", filter: `user_id=eq.${userId}` }, ({ new: row, old: oldRow }) => {
      const prevWasPending = !oldRow?.status || oldRow.status === "pendiente";
      if (!isAdmin && prevWasPending && row.status !== "pendiente") {
        playNotificationPing(); // sound first, state update follows in the same microtask batch
        setSolicitudesUnread(n => n + 1);
      }
      setAllRequests(prev => prev.map(r => r.id === row.id ? { ...r, ...row } : r));
    });
    ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "reports", filter: `user_id=eq.${userId}` }, ({ new: row, old: oldRow }) => {
      const prevWasPending = !oldRow?.status || oldRow.status === "pendiente";
      if (!isAdmin && prevWasPending && row.status !== "pendiente") {
        playNotificationPing();
        setSolicitudesUnread(n => n + 1);
      }
      setReports(prev => prev.map(r => r.id === row.id ? { ...r, ...row } : r));
    });

    // ── admin: all requests & reports ──
    if (isAdmin) {
      ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "requests" }, ({ new: row }) => {
        if (row.status === "pendiente" && row.user_id !== userId) playNotificationPing();
        supabase.from("requests").select("*, profiles!requests_user_id_fkey(full_name, department), reviewer:profiles!reviewed_by(full_name)").eq("id", row.id).single()
          .then(({ data }) => { if (data) setAdminRequests(prev => prev.some(r => r.id === data.id) ? prev : [data, ...prev]); });
      });
      ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "requests" }, ({ new: row }) => {
        setAdminRequests(prev => prev.map(r => r.id === row.id ? { ...r, ...row } : r));
      });
      ch.on("postgres_changes", { event: "DELETE", schema: "public", table: "requests" }, ({ old: row }) => {
        setAdminRequests(prev => prev.filter(r => r.id !== row.id));
      });
      ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "reports" }, ({ new: row }) => {
        if (row.status === "pendiente" && row.user_id !== userId) playNotificationPing();
        supabase.from("reports").select("*, profiles!reports_user_id_fkey(full_name, department), reviewer:profiles!reviewed_by(full_name)").eq("id", row.id).single()
          .then(({ data }) => { if (data) setAdminReports(prev => prev.some(r => r.id === data.id) ? prev : [data, ...prev]); });
      });
      ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "reports" }, ({ new: row }) => {
        setAdminReports(prev => prev.map(r => r.id === row.id ? { ...r, ...row } : r));
      });
      ch.on("postgres_changes", { event: "DELETE", schema: "public", table: "reports" }, ({ old: row }) => {
        setAdminReports(prev => prev.filter(r => r.id !== row.id));
      });
    }

    // ── team vacation calendar: refresh when any vacation changes approval ──
    ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "requests" }, ({ new: row }) => {
      if (row.type === "vacaciones") {
        supabase.rpc("get_team_vacations").then(({ data }) => {
          if (data) setTeamVacations(data.map(r => ({
            start_date: r.start_date,
            end_date:   r.end_date,
            profiles: { full_name: r.full_name, department: r.department, departments: r.departments },
          })));
        });
      }
    });

    // ── recognitions: new entry ──
    ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "recognitions" }, ({ new: row }) => {
      supabase.rpc("get_recognitions_feed").then(({ data }) => {
        if (!data) return;
        setRecognitions(data);
        const added = data.find(r => r.id === row.id);
        if (added && added.to_user_id === session?.user?.id) {
          playNotificationPing();
          showToast({ message: `¡${added.from_name ?? "Un compañero"} te reconoció por ${added.category}!`, Icon: Award });
        }
      });
    });

    // ── recognitions: deleted by admin ──
    ch.on("postgres_changes", { event: "DELETE", schema: "public", table: "recognitions" }, ({ old: row }) => {
      setRecognitions(prev => prev.filter(r => r.id !== row.id));
    });

    // ── polls ──
    ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "polls" }, ({ new: row }) => {
      setPolls(prev => prev.some(p => p.id === row.id) ? prev : [row, ...prev]);
      playNotificationPing();
      showToast({ message: `Nueva encuesta: ${row.question}`, Icon: BarChart3 });
    });
    ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "polls" }, ({ new: row }) => {
      setPolls(prev => prev.map(p => p.id === row.id ? { ...p, ...row } : p));
    });
    ch.on("postgres_changes", { event: "DELETE", schema: "public", table: "polls" }, ({ old: row }) => {
      setPolls(prev => prev.filter(p => p.id !== row.id));
    });

    // ── poll votes: refresh results for affected poll ──
    function refreshPollResults(pollId) {
      supabase.rpc("get_poll_results", { poll_id_input: pollId }).then(({ data }) => {
        if (!data) return;
        const map = {}; data.forEach(r => { map[r.option_index] = r.votes; });
        setPollResults(prev => ({ ...prev, [pollId]: map }));
      });
    }
    ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "poll_votes" }, ({ new: row }) => {
      refreshPollResults(row.poll_id);
    });
    ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "poll_votes" }, ({ new: row }) => {
      refreshPollResults(row.poll_id);
    });

    // ── commission_sales realtime ──
    if (isAdmin) {
      const refreshAllSales = () => supabase.from("commission_sales").select("*, profiles(full_name)").order("sale_date", { ascending: false }).then(({ data }) => { if (data) setAllSales(data); });
      ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "commission_sales" }, refreshAllSales);
      ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "commission_sales" }, refreshAllSales);
      ch.on("postgres_changes", { event: "DELETE", schema: "public", table: "commission_sales" }, refreshAllSales);
    } else if (profile.commission_eligible) {
      ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "commission_sales", filter: `user_id=eq.${userId}` }, ({ new: row }) => setMySales(prev => prev.some(s => s.id === row.id) ? prev : [row, ...prev]));
      ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "commission_sales", filter: `user_id=eq.${userId}` }, ({ new: row }) => setMySales(prev => prev.map(s => s.id === row.id ? { ...s, ...row } : s)));
      ch.on("postgres_changes", { event: "DELETE", schema: "public", table: "commission_sales", filter: `user_id=eq.${userId}` }, ({ old: row }) => setMySales(prev => prev.filter(s => s.id !== row.id)));
    }
    if (isAdmin || profile.commission_eligible) {
      ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "exchange_rate" }, ({ new: row }) => setExchangeRate(row));
    }

    // ── document confirmations ──
    ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "document_confirmations" }, ({ new: row }) => {
      if (row.user_id === userId) {
        setMyConfirmations(prev => ({ ...prev, [row.document_id]: row.confirmed_at }));
      }
      if (isAdmin) {
        supabase.from("document_confirmations").select("document_id, user_id, confirmed_at, profiles(full_name)").eq("document_id", row.document_id).eq("user_id", row.user_id).single()
          .then(({ data }) => { if (data) setAllConfirmations(prev => prev.some(c => c.document_id === data.document_id && c.user_id === data.user_id) ? prev : [...prev, data]); });
      }
    });

    ch.subscribe();
    return () => { ch.unsubscribe(); supabase.removeChannel(ch); };
  }, [profile, session]);

  if (session === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.bg, fontFamily: "'Manrope', sans-serif", color: COLORS.textMuted, fontSize: 14 }}>
        Cargando...
      </div>
    );
  }

  if (session && profile?.role === "inactivo") {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:COLORS.bg, fontFamily:"'Manrope', sans-serif" }}>
        <style>{FONTS}</style>
        <div style={{ textAlign:"center", padding:32, maxWidth:400 }}>
          <p style={{ color:"#c0392b", fontSize:15, fontWeight:700, marginBottom:8 }}>Tu cuenta ha sido desactivada.</p>
          <p style={{ color:COLORS.textMuted, fontSize:13, marginBottom:24 }}>Contacta a administración para más información.</p>
          <button onClick={() => supabase.auth.signOut()} style={{
            background:"transparent", border:`1.5px solid ${COLORS.border}`,
            color:COLORS.textMuted, cursor:"pointer", borderRadius:8,
            padding:"8px 20px", fontSize:13, fontFamily:"'Manrope', sans-serif",
            transition:"all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=COLORS.primary; e.currentTarget.style.color=COLORS.primary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=COLORS.border; e.currentTarget.style.color=COLORS.textMuted; }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  const recognitionsUnread = session?.user
    ? recognitions.filter(r => r.to_user_id === session.user.id && !r.read_by_recipient).length
    : 0;

  function markRecognitionsRead() {
    if (!session?.user?.id) return;
    const uid = session.user.id;
    // No .eq("read_by_recipient", false) filter: PostgreSQL "= false" skips NULL rows.
    // Remove the filter so rows with NULL (missing DEFAULT false) are also marked read.
    supabase.from("recognitions").update({ read_by_recipient: true }).eq("to_user_id", uid);
    setRecognitions(prev => prev.map(r =>
      r.to_user_id === uid && !r.read_by_recipient ? { ...r, read_by_recipient: true } : r
    ));
  }

  return (
    <div>
      <style>{FONTS}</style>
      {session
        ? <Dashboard
            onLogout={() => supabase.auth.signOut()}
            profile={profile}
            allRequests={allRequests}
            onNewRequest={r => setAllRequests(prev => [r, ...prev])}
            onDeleteRequest={id => setAllRequests(prev => prev.filter(r => r.id !== id))}
            reports={reports}
            onNewReport={r => setReports(prev => [r, ...prev])}
            onDeleteReport={id => setReports(prev => prev.filter(r => r.id !== id))}
            announcements={announcements}
            documents={documents}
            upcomingBirthdays={upcomingBirthdays}
            adminRequests={adminRequests}
            adminReports={adminReports}
            onUpdateAdminRequest={(id, changes) => { setAdminRequests(prev => prev.map(r => r.id === id ? { ...r, ...changes } : r)); setAllRequests(prev => prev.map(r => r.id === id ? { ...r, ...changes } : r)); }}
            onUpdateAdminReport={(id, changes)  => setAdminReports(prev  => prev.map(r => r.id === id ? { ...r, ...changes } : r))}
            onDeleteAdminRequest={id => { setAdminRequests(prev => prev.filter(r => r.id !== id)); setAllRequests(prev => prev.filter(r => r.id !== id)); }}
            onVacationCancelled={(uid, exactBalance) => { if (uid === profile?.id) setProfile(prev => ({ ...prev, vacation_balance: exactBalance })); }}
            adminAnnouncements={adminAnnouncements}
            onNewAnnouncement={a => setAdminAnnouncements(prev => [a, ...prev])}
            onDeleteAnnouncement={id => { setAnnouncements(prev => prev.filter(a => a.id !== id)); setAdminAnnouncements(prev => prev.filter(a => a.id !== id)); }}
            adminDocuments={adminDocuments}
            onNewDocument={d => setAdminDocuments(prev => [d, ...prev])}
            onDeleteDocument={id => setAdminDocuments(prev => prev.filter(d => d.id !== id))}
            onUpdateAdminDocument={d => setAdminDocuments(prev => prev.map(x => x.id === d.id ? d : x))}
            adminProfiles={adminProfiles}
            departments={departments}
            departmentsList={departmentsList}
            onUpdateAdminProfile={updatedEmp => setAdminProfiles(prev => prev.map(p => p.id === updatedEmp.id ? updatedEmp : p))}
            userId={session?.user?.id}
            solicitudesUnread={solicitudesUnread}
            onClearSolicitudesUnread={() => setSolicitudesUnread(0)}
            teamVacations={teamVacations}
            recognitions={recognitions}
            onNewRecognition={r => setRecognitions(prev => prev.some(x => x.id === r.id) ? prev : [r, ...prev])}
            onDeleteRecognition={id => setRecognitions(prev => prev.filter(r => r.id !== id))}
            teamDirectory={teamDirectory}
            recognitionsUnread={recognitionsUnread}
            onMarkRecognitionsRead={markRecognitionsRead}
            polls={polls}
            myVotes={myVotes}
            pollResults={pollResults}
            onVoted={(pollId, idx) => setMyVotes(prev => ({ ...prev, [pollId]: idx }))}
            onPollCreated={p => setPolls(prev => prev.some(x => x.id === p.id) ? prev : [p, ...prev])}
            onPollClosed={id => setPolls(prev => prev.map(p => p.id === id ? { ...p, status: "cerrada" } : p))}
            onPollDeleted={id => setPolls(prev => prev.filter(p => p.id !== id))}
            exchangeRate={exchangeRate}
            mySales={mySales}
            allSales={allSales}
            onExchangeRateUpdated={r => setExchangeRate(r)}
            onSaleDeleted={id => setMySales(prev => prev.filter(s => s.id !== id))}
            showToast={showToast}
            onAliasUpdated={alias => setProfile(prev => ({ ...prev, alias }))}
            myConfirmations={myConfirmations}
            allConfirmations={allConfirmations}
            onConfirmRead={(docId, confirmedAt) => setMyConfirmations(prev => ({ ...prev, [docId]: confirmedAt }))}
            onNewConfirmation={c => setAllConfirmations(prev => prev.some(x => x.document_id === c.document_id && x.user_id === c.user_id) ? prev : [...prev, c])}
          />
        : <LoginScreen onLogin={() => {}} />
      }
      <ToastNotification toast={toast} />
    </div>
  );
}

