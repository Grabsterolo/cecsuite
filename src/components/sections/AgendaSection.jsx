import React, { useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { inputStyle, taStyle, btnCancelStyle, btnSubmitStyle } from "../../styles/forms.js";
import { Card } from "../ui/Card.jsx";
import { StatusBadge } from "../ui/StatusBadge.jsx";
import { ModalShell } from "../ui/ModalShell.jsx";
import { useIsMobile } from "../../hooks/useIsMobile.js";
import { useClinical } from "../../context/ClinicalContext.jsx";

const SPECIALTIES = ["Cirugía", "Medicina Estética", "Consulta Médica"];
const STATUS_FLOW = ["programada", "confirmada", "completada", "cancelada", "no_asistio"];
const STATUS_LABELS = { programada: "Programada", confirmada: "Confirmada", completada: "Completada", cancelada: "Cancelada", no_asistio: "No asistió" };

function fmtHour(iso) {
  return new Date(iso).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayLabel(key, todayKey, tomorrowKey) {
  if (key === todayKey) return "Hoy";
  if (key === tomorrowKey) return "Mañana";
  const [y, m, d] = key.split("-").map(Number);
  const str = new Date(y, m - 1, d).toLocaleDateString("es-CR", { weekday: "long", day: "numeric", month: "long" });
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function canEditAppointment(appt, profile, userId) {
  if (profile?.role === "admin" || profile?.role === "recepcion") return true;
  if (profile?.role === "doctor") return appt.doctor_id === userId;
  return false;
}

function NuevaCitaModal({ patients, doctors, userId, onClose }) {
  const isMobile = useIsMobile();
  const [patientSearch, setPatientSearch] = useState("");
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [specialty, setSpecialty] = useState(SPECIALTIES[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("30");
  const [room, setRoom] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filteredPatients = patients.filter(p => {
    if (!patientSearch) return true;
    const q = patientSearch.toLowerCase();
    return (p.full_name ?? "").toLowerCase().includes(q) || (p.id_number ?? "").toLowerCase().includes(q);
  });

  async function handleSave() {
    setError(null);
    if (!patientId) { setError("Selecciona un paciente."); return; }
    if (!date || !time) { setError("Selecciona fecha y hora."); return; }
    setLoading(true);
    const scheduled_at = new Date(`${date}T${time}:00`).toISOString();
    const { error: insertError } = await supabase.from("appointments").insert({
      patient_id: patientId,
      doctor_id: doctorId || null,
      specialty: specialty || null,
      duration_minutes: duration ? Number(duration) : 30,
      room: room.trim() || null,
      reason: reason.trim() || null,
      created_by: userId,
      scheduled_at,
    });
    setLoading(false);
    if (insertError) { setError(insertError.message); return; }
    onClose();
  }

  const fl = (text) => (
    <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 6, fontWeight: 600, letterSpacing: "0.02em" }}>{text}</label>
  );
  const inp = { ...inputStyle, fontSize: 14, padding: "10px 14px" };
  const selStyle = { ...inp, cursor: "pointer", appearance: "auto" };

  return (
    <ModalShell onClose={onClose} title="Nueva cita">
      <div style={{ marginBottom: 14 }}>
        {fl("Paciente")}
        <input
          type="text" value={patientSearch} onChange={e => setPatientSearch(e.target.value)}
          placeholder="Buscar por nombre o cédula..." style={{ ...inp, marginBottom: 8 }}
          onFocus={e => e.target.style.borderColor = COLORS.gold}
          onBlur={e => e.target.style.borderColor = COLORS.border}
        />
        <div style={{ maxHeight: 140, overflowY: "auto", border: `1.5px solid ${COLORS.border}`, borderRadius: 8 }}>
          {filteredPatients.length === 0 ? (
            <div style={{ padding: 12, fontSize: 13, color: COLORS.textMuted }}>Sin resultados.</div>
          ) : filteredPatients.slice(0, 30).map(p => {
            const selected = patientId === p.id;
            return (
              <div key={p.id} onClick={() => setPatientId(p.id)} style={{
                padding: "9px 12px", cursor: "pointer", fontSize: 13,
                background: selected ? "rgba(201,162,78,0.12)" : "transparent",
                color: selected ? COLORS.green : COLORS.text,
                fontWeight: selected ? 700 : 400,
                borderBottom: `1px solid ${COLORS.border}`,
              }}>
                {p.full_name}{p.id_number ? ` · ${p.id_number}` : ""}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          {fl("Doctor")}
          <select value={doctorId} onChange={e => setDoctorId(e.target.value)} style={selStyle}>
            <option value="">Sin asignar</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
          </select>
        </div>
        <div>
          {fl("Especialidad")}
          <select value={specialty} onChange={e => setSpecialty(e.target.value)} style={selStyle}>
            {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          {fl("Fecha")}
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} />
        </div>
        <div>
          {fl("Hora")}
          <input type="time" value={time} onChange={e => setTime(e.target.value)} style={inp} />
        </div>
        <div>
          {fl("Duración (min)")}
          <input type="number" min="5" step="5" value={duration} onChange={e => setDuration(e.target.value)} style={inp} />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        {fl("Sala")}
        <input type="text" value={room} onChange={e => setRoom(e.target.value)} placeholder="Ej. Consultorio 2" style={inp} />
      </div>

      <div style={{ marginBottom: 20 }}>
        {fl("Motivo")}
        <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="Motivo de la consulta..." style={taStyle} />
      </div>

      {error && <p style={{ fontSize: 12, color: "#e07070", margin: "0 0 14px" }}>{error}</p>}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onClose} style={btnCancelStyle}>Cancelar</button>
        <button onClick={handleSave} disabled={loading} style={{ ...btnSubmitStyle, opacity: loading ? 0.75 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Guardando..." : "Crear cita"}
        </button>
      </div>
    </ModalShell>
  );
}

function StatusSelect({ appt, onChange, updating }) {
  return (
    <select
      value={appt.status ?? "programada"}
      disabled={updating}
      onChange={e => onChange(appt.id, e.target.value)}
      style={{
        fontSize: 12, fontWeight: 600, borderRadius: 7, padding: "5px 8px",
        border: `1.5px solid ${COLORS.border}`, background: COLORS.inputBg, color: COLORS.text,
        fontFamily: "'Manrope', sans-serif", cursor: updating ? "not-allowed" : "pointer", appearance: "auto",
      }}
    >
      {STATUS_FLOW.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
    </select>
  );
}

export function AgendaSection({ profile, userId }) {
  const isMobile = useIsMobile();
  const { patients, appointments, doctors, loading } = useClinical();
  const [onlyMine, setOnlyMine] = useState(profile?.role === "doctor");
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const canToggle = profile?.role === "admin" || profile?.role === "recepcion";

  async function handleStatusChange(id, status) {
    setUpdatingId(id);
    await supabase.from("appointments").update({ status }).eq("id", id);
    setUpdatingId(null);
  }

  const visible = onlyMine ? appointments.filter(a => a.doctor_id === userId) : appointments;
  const sorted = [...visible].sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

  const now = new Date();
  const todayKey = dateKey(now);
  const tomorrowKey = dateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));

  const groups = sorted.reduce((acc, a) => {
    const key = dateKey(new Date(a.scheduled_at));
    (acc[key] ||= []).push(a);
    return acc;
  }, {});
  const groupKeys = Object.keys(groups).sort();

  const rowInfo = (a) => ({
    patientName: a.patient?.full_name ?? "Paciente sin nombre",
    doctorName: a.doctor?.full_name ?? "Sin asignar",
    specialty: a.specialty ?? "—",
    room: a.room ?? "—",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {modalOpen && (
        <NuevaCitaModal patients={patients} doctors={doctors} userId={userId} onClose={() => setModalOpen(false)} />
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        {canToggle ? (
          <button onClick={() => setOnlyMine(v => !v)} style={{
            fontSize: 12, fontWeight: 600, color: onlyMine ? COLORS.green : COLORS.textMuted,
            background: onlyMine ? "rgba(201,162,78,0.12)" : "transparent",
            border: `1.5px solid ${onlyMine ? COLORS.gold : COLORS.border}`,
            borderRadius: 20, padding: "6px 14px", cursor: "pointer", fontFamily: "'Manrope', sans-serif",
          }}>
            {onlyMine ? "Viendo: solo mis citas" : "Viendo: todas las citas"}
          </button>
        ) : <div />}
        <button onClick={() => setModalOpen(true)} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
          border: "none", borderRadius: 8, padding: "9px 16px", color: "#FFF",
          fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif",
          boxShadow: "0 4px 14px rgba(201,162,78,0.35)",
        }}>
          <Plus size={15} /> Nueva cita
        </button>
      </div>

      {loading ? (
        <Card><p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0 }}>Cargando citas…</p></Card>
      ) : sorted.length === 0 ? (
        <Card><p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0 }}>No hay citas programadas para hoy.</p></Card>
      ) : (
        groupKeys.map(key => (
          <div key={key}>
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.gold, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
              {dayLabel(key, todayKey, tomorrowKey)}
            </div>

            {isMobile ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {groups[key].map(a => {
                  const info = rowInfo(a);
                  const editable = canEditAppointment(a, profile, userId);
                  return (
                    <Card key={a.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                        <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 15, fontWeight: 700, color: COLORS.green }}>{info.patientName}</div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, flexShrink: 0 }}>{fmtHour(a.scheduled_at)}</span>
                      </div>
                      <div style={{ fontSize: 13, color: COLORS.textMuted, display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
                        <span>Doctor: {info.doctorName}</span>
                        <span>Especialidad: {info.specialty}</span>
                        <span>Sala: {info.room}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        {editable ? (
                          <StatusSelect appt={a} onChange={handleStatusChange} updating={updatingId === a.id} />
                        ) : (
                          <StatusBadge status={a.status} />
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Manrope', sans-serif" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                        {["Hora", "Paciente", "Doctor", "Especialidad", "Sala", "Estado"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "14px 20px", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: COLORS.textMuted, fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {groups[key].map(a => {
                        const info = rowInfo(a);
                        const editable = canEditAppointment(a, profile, userId);
                        return (
                          <tr key={a.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                            <td style={{ padding: "14px 20px", fontSize: 13, color: COLORS.text, fontWeight: 700, whiteSpace: "nowrap" }}>{fmtHour(a.scheduled_at)}</td>
                            <td style={{ padding: "14px 20px", fontSize: 13, color: COLORS.text, fontWeight: 600, whiteSpace: "nowrap" }}>{info.patientName}</td>
                            <td style={{ padding: "14px 20px", fontSize: 13, color: COLORS.textMuted, whiteSpace: "nowrap" }}>{info.doctorName}</td>
                            <td style={{ padding: "14px 20px", fontSize: 13, color: COLORS.textMuted, whiteSpace: "nowrap" }}>{info.specialty}</td>
                            <td style={{ padding: "14px 20px", fontSize: 13, color: COLORS.textMuted, whiteSpace: "nowrap" }}>{info.room}</td>
                            <td style={{ padding: "14px 20px", whiteSpace: "nowrap" }}>
                              {editable ? (
                                <StatusSelect appt={a} onChange={handleStatusChange} updating={updatingId === a.id} />
                              ) : (
                                <StatusBadge status={a.status} />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        ))
      )}
    </div>
  );
}
