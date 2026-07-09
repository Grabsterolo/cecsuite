import React, { useState, useEffect } from "react";
import { MapPin, Edit2 } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { taStyle, btnSubmitStyle, compactInputStyle } from "../../styles/forms.js";
import { translateError } from "../../utils/errors.js";
import { fmtMinutes, fmtClockTime, fmtTimestampDateCR, getTodayCR, dateCR, toDatetimeLocalCR, fromDatetimeLocalCR } from "../../utils/attendance.js";
import { useGeolocation } from "../../hooks/useGeolocation.js";
import { Card, CardHeader } from "../ui/Card.jsx";
import { DeptTag } from "../ui/DeptTag.jsx";
import { ModalShell } from "../ui/ModalShell.jsx";
import { AttendanceBadges } from "./AttendanceSection.jsx";

function CorrectRecordModal({ record, userId, onClose, onSaved }) {
  const [editClockIn,  setEditClockIn]  = useState(toDatetimeLocalCR(record.clock_in));
  const [editClockOut, setEditClockOut] = useState(toDatetimeLocalCR(record.clock_out));
  const [notes,        setNotes]        = useState(record.notes || "");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  async function handleSave() {
    if (!editClockIn) { setError("La hora de entrada es obligatoria."); return; }
    setLoading(true); setError(null);
    const { data, error: updateError } = await supabase.from("attendance_records").update({
      clock_in:  fromDatetimeLocalCR(editClockIn),
      clock_out: editClockOut ? fromDatetimeLocalCR(editClockOut) : null,
      status: "pendiente_correccion",
      notes: notes.trim() || null,
      corrected_by: userId,
      corrected_at: new Date().toISOString(),
    }).eq("id", record.id).select("*, profiles!attendance_records_user_id_fkey(full_name, departments)").single();
    setLoading(false);
    if (updateError) { setError(translateError(updateError.message)); return; }
    onSaved(data);
  }

  const fieldLabel = (text) => (
    <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>{text}</label>
  );

  return (
    <ModalShell onClose={onClose} title="Corregir registro">
      <p style={{ fontSize:13, color:COLORS.textMuted, margin:"0 0 16px" }}>
        {record.profiles?.full_name ?? "—"} · {fmtTimestampDateCR(record.clock_in)}
      </p>
      {fieldLabel("Entrada")}
      <input type="datetime-local" value={editClockIn} onChange={e => setEditClockIn(e.target.value)} style={{ ...compactInputStyle, marginBottom:14, display:"block" }}
        onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
      {fieldLabel("Salida (opcional)")}
      <input type="datetime-local" value={editClockOut} onChange={e => setEditClockOut(e.target.value)} style={{ ...compactInputStyle, marginBottom:14, display:"block" }}
        onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
      {fieldLabel("Nota de corrección (opcional)")}
      <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Motivo de la corrección..." rows={3} style={{ ...taStyle, marginBottom:14 }}
        onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
      {error && <p style={{ fontSize:12, color:"#e07070", margin:"0 0 12px" }}>{error}</p>}
      <button onClick={handleSave} disabled={loading} style={{
        ...btnSubmitStyle, width:"100%", opacity: loading ? 0.75 : 1, cursor: loading ? "not-allowed" : "pointer",
      }}>
        {loading ? "Guardando..." : "Guardar corrección"}
      </button>
    </ModalShell>
  );
}

export function GestionAsistenciaSection({ adminAttendance = [], attendanceSettings = null, departmentsList = [], userId, onUpdateAttendanceRecord, onSettingsUpdated }) {
  const { getPosition, loading: geoLoading, error: geoError } = useGeolocation();

  // ── settings form ──
  const [clinicLat,         setClinicLat]         = useState("");
  const [clinicLng,         setClinicLng]         = useState("");
  const [radiusMeters,      setRadiusMeters]      = useState("");
  const [shiftStart,        setShiftStart]        = useState("");
  const [shiftEnd,          setShiftEnd]          = useState("");
  const [toleranceMinutes,  setToleranceMinutes]  = useState("");
  const [settingsLoading,   setSettingsLoading]   = useState(false);
  const [settingsError,     setSettingsError]     = useState(null);
  const [settingsSuccess,   setSettingsSuccess]   = useState(false);

  useEffect(() => {
    if (!attendanceSettings) return;
    setClinicLat(attendanceSettings.clinic_lat != null ? String(attendanceSettings.clinic_lat) : "");
    setClinicLng(attendanceSettings.clinic_lng != null ? String(attendanceSettings.clinic_lng) : "");
    setRadiusMeters(String(attendanceSettings.radius_meters ?? ""));
    setShiftStart((attendanceSettings.shift_start || "").slice(0, 5));
    setShiftEnd((attendanceSettings.shift_end || "").slice(0, 5));
    setToleranceMinutes(String(attendanceSettings.tolerance_minutes ?? ""));
  }, [attendanceSettings]);

  async function handleUseMyLocation() {
    try {
      const pos = await getPosition();
      setClinicLat(String(pos.lat));
      setClinicLng(String(pos.lng));
    } catch (_) { /* geoError ya queda expuesto por el hook y se muestra debajo del botón */ }
  }

  async function handleSaveSettings() {
    setSettingsError(null); setSettingsSuccess(false);
    if (!shiftStart || !shiftEnd) { setSettingsError("El horario de turno es obligatorio."); return; }
    const radius = parseFloat(radiusMeters);
    const tolerance = parseInt(toleranceMinutes, 10);
    if (isNaN(radius) || radius <= 0) { setSettingsError("El radio debe ser un número positivo."); return; }
    if (isNaN(tolerance) || tolerance < 0) { setSettingsError("La tolerancia debe ser un número igual o mayor a 0."); return; }
    const lat = clinicLat.trim() ? parseFloat(clinicLat) : null;
    const lng = clinicLng.trim() ? parseFloat(clinicLng) : null;
    if ((clinicLat.trim() || clinicLng.trim()) && (lat === null || lng === null || isNaN(lat) || isNaN(lng))) {
      setSettingsError("Las coordenadas no son válidas.");
      return;
    }
    setSettingsLoading(true);
    const { data, error } = await supabase.from("attendance_settings").update({
      clinic_lat: lat,
      clinic_lng: lng,
      radius_meters: radius,
      shift_start: shiftStart,
      shift_end: shiftEnd,
      tolerance_minutes: tolerance,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    }).eq("id", 1).select().single();
    setSettingsLoading(false);
    if (error) { setSettingsError(translateError(error.message)); return; }
    onSettingsUpdated?.(data);
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 4000);
  }

  // ── team table ──
  const [filterDate, setFilterDate] = useState(getTodayCR());
  const [filterDept, setFilterDept] = useState("todos");
  const [correcting, setCorrecting] = useState(null);

  const filteredRecords = adminAttendance.filter(r => {
    const matchDate = !filterDate || dateCR(r.clock_in) === filterDate;
    const depts = Array.isArray(r.profiles?.departments) ? r.profiles.departments : [];
    const matchDept = filterDept === "todos" || depts.includes(filterDept);
    return matchDate && matchDept;
  });

  const fieldLabel = (text) => (
    <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>{text}</label>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {correcting && (
        <CorrectRecordModal
          record={correcting}
          userId={userId}
          onClose={() => setCorrecting(null)}
          onSaved={rec => { onUpdateAttendanceRecord?.(rec); setCorrecting(null); }}
        />
      )}

      <Card>
        <CardHeader title="Configuración de asistencia" />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
          <div>
            {fieldLabel("Latitud de la clínica")}
            <input value={clinicLat} onChange={e => setClinicLat(e.target.value)} placeholder="Ej. 9.9294953" style={{ ...compactInputStyle, display:"block" }}
              onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
          </div>
          <div>
            {fieldLabel("Longitud de la clínica")}
            <input value={clinicLng} onChange={e => setClinicLng(e.target.value)} placeholder="Ej. -84.1039514" style={{ ...compactInputStyle, display:"block" }}
              onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
          </div>
        </div>
        <button type="button" onClick={handleUseMyLocation} disabled={geoLoading} style={{
          display:"flex", alignItems:"center", gap:6, background:"none", border:`1px solid ${COLORS.border}`, borderRadius:8,
          padding:"6px 12px", fontSize:12, fontWeight:600, color:COLORS.textMuted, cursor:geoLoading?"not-allowed":"pointer",
          fontFamily:"'Manrope', sans-serif", marginBottom:16,
        }}>
          <MapPin size={13}/> {geoLoading ? "Obteniendo ubicación..." : "Usar mi ubicación actual"}
        </button>
        {geoError && <p style={{ fontSize:12, color:"#e07070", margin:"-10px 0 16px" }}>{geoError}</p>}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:16 }}>
          <div>
            {fieldLabel("Inicio de turno")}
            <input type="time" value={shiftStart} onChange={e => setShiftStart(e.target.value)} style={{ ...compactInputStyle, display:"block" }}
              onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
          </div>
          <div>
            {fieldLabel("Fin de turno")}
            <input type="time" value={shiftEnd} onChange={e => setShiftEnd(e.target.value)} style={{ ...compactInputStyle, display:"block" }}
              onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
          </div>
          <div>
            {fieldLabel("Radio permitido (m)")}
            <input type="number" min="0" value={radiusMeters} onChange={e => setRadiusMeters(e.target.value)} style={{ ...compactInputStyle, display:"block" }}
              onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
          </div>
        </div>
        <div style={{ maxWidth:220, marginBottom:16 }}>
          {fieldLabel("Tolerancia (minutos)")}
          <input type="number" min="0" value={toleranceMinutes} onChange={e => setToleranceMinutes(e.target.value)} style={{ ...compactInputStyle, display:"block" }}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        {settingsError && <p style={{ fontSize:12, color:"#e07070", margin:"0 0 12px" }}>{settingsError}</p>}
        {settingsSuccess && <p style={{ fontSize:12, color:COLORS.greenSoft, fontWeight:600, margin:"0 0 12px" }}>✓ Configuración guardada correctamente.</p>}
        <button onClick={handleSaveSettings} disabled={settingsLoading} style={{
          ...btnSubmitStyle, width:"100%", opacity: settingsLoading ? 0.75 : 1, cursor: settingsLoading ? "not-allowed" : "pointer",
        }}>
          {settingsLoading ? "Guardando..." : "Guardar configuración"}
        </button>
      </Card>

      <Card>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, flexWrap:"wrap", gap:10 }}>
          <span style={{ fontSize:14, fontWeight:700, color:COLORS.text }}>Asistencia del equipo</span>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ ...compactInputStyle, width:"auto" }}
              onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{
              background:COLORS.inputBg, border:`1.5px solid ${COLORS.border}`, borderRadius:8,
              padding:"10px 14px", color:COLORS.text, fontSize:14, outline:"none",
              fontFamily:"'Manrope', sans-serif", cursor:"pointer", appearance:"auto", flexShrink:0,
            }}>
              <option value="todos" style={{ color:"#1F4A40" }}>Todos los departamentos</option>
              {departmentsList.map(d => <option key={d.id} value={d.name} style={{ color:"#1F4A40" }}>{d.name}</option>)}
            </select>
          </div>
        </div>
        {filteredRecords.length === 0 ? (
          <p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>No hay marcajes para este filtro.</p>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:`1.5px solid ${COLORS.border}` }}>
                  <th style={{ textAlign:"left", padding:"8px 10px", color:COLORS.textMuted, fontWeight:600 }}>Empleado</th>
                  <th style={{ textAlign:"left", padding:"8px 10px", color:COLORS.textMuted, fontWeight:600 }}>Depto.</th>
                  <th style={{ textAlign:"left", padding:"8px 10px", color:COLORS.textMuted, fontWeight:600 }}>Entrada</th>
                  <th style={{ textAlign:"left", padding:"8px 10px", color:COLORS.textMuted, fontWeight:600 }}>Salida</th>
                  <th style={{ textAlign:"left", padding:"8px 10px", color:COLORS.textMuted, fontWeight:600 }}>Horas</th>
                  <th style={{ textAlign:"left", padding:"8px 10px", color:COLORS.textMuted, fontWeight:600 }}>Estado</th>
                  <th style={{ padding:"8px 10px" }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(rec => {
                  const depts = Array.isArray(rec.profiles?.departments) ? rec.profiles.departments : [];
                  return (
                    <tr key={rec.id} style={{ borderBottom:`1px solid ${COLORS.border}` }}>
                      <td style={{ padding:"9px 10px", fontWeight:600, color:COLORS.text, whiteSpace:"nowrap" }}>{rec.profiles?.full_name ?? "—"}</td>
                      <td style={{ padding:"9px 10px" }}>
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                          {depts.map((d, di) => <DeptTag key={di} dept={d} />)}
                        </div>
                      </td>
                      <td style={{ padding:"9px 10px", color:COLORS.text, whiteSpace:"nowrap" }}>{fmtClockTime(rec.clock_in)}</td>
                      <td style={{ padding:"9px 10px", color:COLORS.text, whiteSpace:"nowrap" }}>{rec.clock_out ? fmtClockTime(rec.clock_out) : "en curso"}</td>
                      <td style={{ padding:"9px 10px", color:COLORS.text, fontWeight:600, whiteSpace:"nowrap" }}>{fmtMinutes(rec.worked_minutes)}</td>
                      <td style={{ padding:"9px 10px" }}>
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                          <AttendanceBadges record={rec} />
                        </div>
                      </td>
                      <td style={{ padding:"9px 10px", textAlign:"right" }}>
                        <button onClick={() => setCorrecting(rec)} title="Corregir" style={{
                          background:"none", border:"none", cursor:"pointer", color:COLORS.textMuted, padding:4, display:"flex", marginLeft:"auto",
                        }}>
                          <Edit2 size={14}/>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
