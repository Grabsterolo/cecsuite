import React, { useState } from "react";
import { CalendarDays, FileText, AlertTriangle } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { TIPOS_PERMISO, TIPOS_REPORTE } from "../../constants/nav.js";
import { inputStyle, taStyle, btnCancelStyle, btnSubmitStyle } from "../../styles/forms.js";
import { translateError } from "../../utils/errors.js";
import { calcWorkDays, fmtDate } from "../../utils/dates.js";
import { ModalShell } from "../ui/ModalShell.jsx";
import { CalendarWidget } from "../ui/CalendarWidget.jsx";

export function VacationForm({ onClose, onSubmit, editData, onNewRequest, availableDays, existingRequests = [] }) {
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

  const toYMD = (d) => d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` : null;
  const startStr = startDate ? toYMD(startDate) : null;
  const endStr   = rangeEnd  ? toYMD(rangeEnd)  : null;

  const overlapping = startStr && endStr
    ? existingRequests.filter(r => {
        if (r.status !== "pendiente" && r.status !== "aprobado") return false;
        if (editData && r.id === editData.id) return false;
        const rs = (r.start_date || "").slice(0, 10);
        const re = (r.end_date   || r.start_date || "").slice(0, 10);
        if (!rs) return false;
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

export function PermisoForm({ onClose, onSubmit, editData, onNewRequest }) {
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

export function ReporteForm({ onClose, onSubmit, editData, onNewReport }) {
  const [category,    setCategory]    = useState(editData?.tipoReporte || "");
  const [description, setDescription] = useState(editData?.descripcion || "");
  const [location,    setLocation]    = useState(editData?.ubicacion || "");
  const [file,        setFile]        = useState(null);
  const [preview,     setPreview]     = useState(null);
  const [loadingMsg,  setLoadingMsg]  = useState(null);
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
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(f);
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

export function CrearSolicitudModal({ onClose, onSubmit, editData, initialTipo, onNewRequest, onNewReport, availableDays, existingVacationRequests }) {
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
