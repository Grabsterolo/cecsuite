import React, { useEffect, useState } from "react";
import { Plus, AlertTriangle, Trash2, ChevronLeft } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { inputStyle, taStyle, btnCancelStyle, btnSubmitStyle, verTodosStyle } from "../../styles/forms.js";
import { translateError } from "../../utils/errors.js";
import { Card, CardHeader } from "../ui/Card.jsx";
import { ModalShell } from "../ui/ModalShell.jsx";
import { StatusBadge } from "../ui/StatusBadge.jsx";
import { useIsMobile } from "../../hooks/useIsMobile.js";
import { useClinical } from "../../context/ClinicalContext.jsx";

const GENDERS = ["Femenino", "Masculino", "Otro", "Prefiere no decir"];
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Desconocido"];
const DOCUMENT_TYPES = ["Cédula física", "DIMEX", "Pasaporte"];

function toArray(text) {
  return text.split(",").map(s => s.trim()).filter(Boolean);
}

function fmtBirthDate(str) {
  if (!str) return "—";
  const [y, m, d] = str.split("-").map(Number);
  const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d} ${months[m - 1]} ${y}`;
}

function fmtDate(iso) {
  const d = new Date(iso);
  const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtHour(iso) {
  return new Date(iso).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function calcAge(birthDateStr) {
  if (!birthDateStr) return null;
  const [y, m, d] = birthDateStr.split("-").map(Number);
  const today = new Date();
  let age = today.getFullYear() - y;
  const hadBirthdayThisYear = (today.getMonth() + 1 > m) || (today.getMonth() + 1 === m && today.getDate() >= d);
  if (!hadBirthdayThisYear) age--;
  return age >= 0 ? age : null;
}

function NuevoPacienteModal({ userId, onClose }) {
  const isMobile = useIsMobile();
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName1, setLastName1] = useState("");
  const [lastName2, setLastName2] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [allergies, setAllergies] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [chronicConditions, setChronicConditions] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const age = calcAge(birthDate);

  async function handleSave() {
    setError(null);
    if (!firstName.trim() || !lastName1.trim()) { setError("El nombre y el primer apellido son obligatorios."); return; }
    setLoading(true);
    const fullName = [firstName, middleName, lastName1, lastName2].map(s => s.trim()).filter(Boolean).join(" ");
    const { error: insertError } = await supabase.from("patients").insert({
      full_name: fullName,
      phone: phone.trim() || null,
      birth_date: birthDate || null,
      allergies: allergies.trim() ? toArray(allergies) : null,
      emergency_contact_name: emergencyName.trim() || null,
      emergency_contact_phone: emergencyPhone.trim() || null,
      document_type: documentType || null,
      id_number: idNumber.trim() || null,
      email: email.trim() || null,
      gender: gender || null,
      blood_type: bloodType || null,
      chronic_conditions: chronicConditions.trim() ? toArray(chronicConditions) : null,
      address: address.trim() || null,
      registered_by: userId,
      active: true,
    });
    setLoading(false);
    if (insertError) { setError(translateError(insertError.message)); return; }
    onClose();
  }

  const fl = (text) => (
    <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 6, fontWeight: 600, letterSpacing: "0.02em" }}>{text}</label>
  );
  const inp = { ...inputStyle, fontSize: 14, padding: "10px 14px" };
  const selStyle = { ...inp, cursor: "pointer", appearance: "auto" };
  const twoCol = { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 14 };

  return (
    <ModalShell onClose={onClose} title="Nuevo paciente" maxWidth={620}>
      <div style={twoCol}>
        <div>
          {fl("Nombre")}
          <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} style={inp} />
        </div>
        <div>
          {fl("Segundo nombre")}
          <input type="text" value={middleName} onChange={e => setMiddleName(e.target.value)} style={inp} />
        </div>
      </div>
      <div style={twoCol}>
        <div>
          {fl("Primer apellido")}
          <input type="text" value={lastName1} onChange={e => setLastName1(e.target.value)} style={inp} />
        </div>
        <div>
          {fl("Segundo apellido")}
          <input type="text" value={lastName2} onChange={e => setLastName2(e.target.value)} style={inp} />
        </div>
      </div>
      <div style={twoCol}>
        <div>
          {fl("Teléfono")}
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="8888-0000" style={inp} />
        </div>
        <div>
          {fl(age !== null ? `Fecha de nacimiento — ${age} años` : "Fecha de nacimiento")}
          <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} style={inp} />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        {fl("Alergias")}
        <input type="text" value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="Ej. Penicilina, mariscos (separadas por comas)" style={inp} />
      </div>
      <div style={twoCol}>
        <div>
          {fl("Contacto de emergencia — nombre")}
          <input type="text" value={emergencyName} onChange={e => setEmergencyName(e.target.value)} style={inp} />
        </div>
        <div>
          {fl("Contacto de emergencia — teléfono")}
          <input type="text" value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} style={inp} />
        </div>
      </div>

      <div style={{ height: 1, background: COLORS.border, margin: "6px 0 20px" }} />

      <div style={twoCol}>
        <div>
          {fl("Tipo de documento")}
          <select value={documentType} onChange={e => setDocumentType(e.target.value)} style={selStyle}>
            <option value="">Sin especificar</option>
            {DOCUMENT_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          {fl("Número de documento")}
          <input type="text" value={idNumber} onChange={e => setIdNumber(e.target.value)} style={inp} />
        </div>
      </div>
      <div style={twoCol}>
        <div>
          {fl("Correo electrónico")}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nombre@correo.com" style={inp} />
        </div>
        <div>
          {fl("Género")}
          <select value={gender} onChange={e => setGender(e.target.value)} style={selStyle}>
            <option value="">Sin especificar</option>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>
      <div style={twoCol}>
        <div>
          {fl("Tipo de sangre")}
          <select value={bloodType} onChange={e => setBloodType(e.target.value)} style={selStyle}>
            <option value="">Sin especificar</option>
            {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          {fl("Condiciones crónicas")}
          <input type="text" value={chronicConditions} onChange={e => setChronicConditions(e.target.value)} placeholder="Ej. Hipertensión, diabetes" style={inp} />
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        {fl("Dirección")}
        <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} style={taStyle} />
      </div>

      {error && <p style={{ fontSize: 12, color: "#e07070", margin: "0 0 14px" }}>{error}</p>}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onClose} style={btnCancelStyle}>Cancelar</button>
        <button onClick={handleSave} disabled={loading} style={{ ...btnSubmitStyle, opacity: loading ? 0.75 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Guardando..." : "Crear paciente"}
        </button>
      </div>
    </ModalShell>
  );
}

function DeletePatientModal({ patient, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleDelete() {
    setError(null);
    setLoading(true);
    const { error: deleteError } = await supabase.from("patients").delete().eq("id", patient.id);
    setLoading(false);
    if (deleteError) { setError(translateError(deleteError.message)); return; }
    onDeleted();
  }

  return (
    <ModalShell onClose={onClose} title="Eliminar paciente">
      <p style={{ fontSize: 13, color: COLORS.text, margin: "0 0 12px", lineHeight: 1.6 }}>
        Vas a eliminar a <strong>{patient.full_name}</strong> permanentemente.
      </p>
      <div style={{ fontSize: 12, color: "#c0392b", background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: 8, padding: "10px 12px", marginBottom: 18, lineHeight: 1.6 }}>
        Esta acción también borra todas sus citas, notas clínicas, documentos e historial médico. No se puede deshacer.
      </div>
      {error && <p style={{ fontSize: 12, color: "#e07070", margin: "0 0 14px" }}>{error}</p>}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onClose} disabled={loading} style={btnCancelStyle}>Cancelar</button>
        <button onClick={handleDelete} disabled={loading} style={{
          flex: 2, background: "#c0392b", border: "none", borderRadius: 8, padding: "11px 16px",
          color: "#FFF", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "'Manrope', sans-serif", opacity: loading ? 0.7 : 1,
        }}>
          {loading ? "Eliminando..." : "Sí, eliminar definitivamente"}
        </button>
      </div>
    </ModalShell>
  );
}

function ProfileField({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: COLORS.text }}>{value ?? "—"}</div>
    </div>
  );
}

function usePatientRecords(patientId, canSeeClinical) {
  const [appointments, setAppointments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [historyEvents, setHistoryEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const queries = [
      supabase.from("appointments").select("*, doctor:profiles!appointments_doctor_id_fkey(full_name)").eq("patient_id", patientId).order("scheduled_at", { ascending: false }),
      supabase.from("patient_documents").select("*").eq("patient_id", patientId).order("created_at", { ascending: false }),
    ];
    if (canSeeClinical) {
      queries.push(
        supabase.from("clinical_notes").select("*, doctor:profiles!clinical_notes_doctor_id_fkey(full_name)").eq("patient_id", patientId).order("created_at", { ascending: false }),
        supabase.from("medical_history_events").select("*, doctor:profiles!medical_history_events_doctor_id_fkey(full_name)").eq("patient_id", patientId).order("event_date", { ascending: false })
      );
    }

    Promise.all(queries).then((results) => {
      if (cancelled) return;
      setAppointments(results[0].data ?? []);
      setDocuments(results[1].data ?? []);
      setNotes(canSeeClinical ? (results[2]?.data ?? []) : []);
      setHistoryEvents(canSeeClinical ? (results[3]?.data ?? []) : []);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [patientId, canSeeClinical]);

  return { appointments, notes, documents, historyEvents, loading };
}

function PatientProfile({ patient, profile, onBack, onDeleted }) {
  const isMobile = useIsMobile();
  const canSeeClinical = profile?.role === "admin" || profile?.role === "doctor";
  const canDelete = profile?.role === "admin";
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { appointments, notes, documents, historyEvents, loading } = usePatientRecords(patient.id, canSeeClinical);

  const age = calcAge(patient.birth_date);
  const allergies = Array.isArray(patient.allergies) ? patient.allergies : [];
  const chronicConditions = Array.isArray(patient.chronic_conditions) ? patient.chronic_conditions : [];
  const gridCols = isMobile ? "1fr 1fr" : "1fr 1fr 1fr";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {deleteModalOpen && (
        <DeletePatientModal patient={patient} onClose={() => setDeleteModalOpen(false)} onDeleted={() => { setDeleteModalOpen(false); onDeleted(); }} />
      )}

      <button onClick={onBack} style={{ ...verTodosStyle, alignSelf: "flex-start" }}>
        <ChevronLeft size={14} /> Volver a pacientes
      </button>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: COLORS.green, margin: 0 }}>{patient.full_name}</h2>
          {canDelete && (
            <button onClick={() => setDeleteModalOpen(true)} style={{
              display: "flex", alignItems: "center", gap: 6, border: "1.5px solid #c0392b", background: "transparent",
              color: "#c0392b", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer",
              fontFamily: "'Manrope', sans-serif", flexShrink: 0,
            }}>
              <Trash2 size={14} /> Eliminar paciente
            </button>
          )}
        </div>

        {allergies.length > 0 && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px",
            background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)",
            borderRadius: 8, marginBottom: 18,
          }}>
            <AlertTriangle size={16} color="#c0392b" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#c0392b", marginBottom: 2 }}>Alergias</div>
              <div style={{ fontSize: 13, color: COLORS.text }}>{allergies.join(", ")}</div>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 18 }}>
          <ProfileField label="Tipo de documento" value={patient.document_type} />
          <ProfileField label="N.º de documento" value={patient.id_number} />
          <ProfileField label="Teléfono" value={patient.phone} />
          <ProfileField label="Correo" value={patient.email} />
          <ProfileField label="Nacimiento" value={patient.birth_date ? `${fmtBirthDate(patient.birth_date)}${age !== null ? ` (${age} a.)` : ""}` : null} />
          <ProfileField label="Género" value={patient.gender} />
          <ProfileField label="Tipo de sangre" value={patient.blood_type} />
          <ProfileField label="Condiciones crónicas" value={chronicConditions.length > 0 ? chronicConditions.join(", ") : null} />
          <ProfileField label="Contacto de emergencia" value={patient.emergency_contact_name ? `${patient.emergency_contact_name}${patient.emergency_contact_phone ? ` · ${patient.emergency_contact_phone}` : ""}` : null} />
        </div>
        {patient.address && (
          <div style={{ marginTop: 18 }}>
            <ProfileField label="Dirección" value={patient.address} />
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Citas" />
        {loading ? (
          <p style={{ color: COLORS.textMuted, fontSize: 13, margin: 0 }}>Cargando…</p>
        ) : appointments.length === 0 ? (
          <p style={{ color: COLORS.textMuted, fontSize: 13, margin: 0 }}>Sin citas registradas.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {appointments.map(a => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}`, gap: 10, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{fmtDate(a.scheduled_at)} · {fmtHour(a.scheduled_at)}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>{a.doctor?.full_name ?? "Sin asignar"}{a.specialty ? ` · ${a.specialty}` : ""}</div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {canSeeClinical && (
        <Card>
          <CardHeader title="Notas clínicas y recetas" />
          {loading ? (
            <p style={{ color: COLORS.textMuted, fontSize: 13, margin: 0 }}>Cargando…</p>
          ) : notes.length === 0 ? (
            <p style={{ color: COLORS.textMuted, fontSize: 13, margin: 0 }}>Sin notas clínicas registradas.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {notes.map(n => (
                <div key={n.id} style={{ paddingBottom: 14, borderBottom: `1px solid ${COLORS.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.green }}>{fmtDate(n.created_at)}</span>
                    <span style={{ fontSize: 12, color: COLORS.textMuted }}>{n.doctor?.full_name ?? "—"}</span>
                  </div>
                  {n.assessment && <p style={{ fontSize: 13, color: COLORS.text, margin: "0 0 6px" }}><strong>Diagnóstico:</strong> {n.assessment}</p>}
                  {n.plan && <p style={{ fontSize: 13, color: COLORS.text, margin: "0 0 6px" }}><strong>Plan:</strong> {n.plan}</p>}
                  {n.prescriptions && (
                    <div style={{ fontSize: 13, color: COLORS.text, background: COLORS.panelAlt, borderRadius: 6, padding: "8px 10px", marginTop: 6 }}>
                      <strong>Receta:</strong> {n.prescriptions}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <Card>
        <CardHeader title="Documentos" />
        {loading ? (
          <p style={{ color: COLORS.textMuted, fontSize: 13, margin: 0 }}>Cargando…</p>
        ) : documents.length === 0 ? (
          <p style={{ color: COLORS.textMuted, fontSize: 13, margin: 0 }}>Sin documentos.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {documents.map(d => (
              <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${COLORS.border}`, gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: COLORS.text, fontWeight: 600 }}>{d.title}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>{d.document_type ?? "Documento"} · {fmtDate(d.created_at)}</div>
                </div>
                {d.file_url && <a href={d.file_url} target="_blank" rel="noreferrer" style={{ ...verTodosStyle, flexShrink: 0 }}>Ver</a>}
              </div>
            ))}
          </div>
        )}
      </Card>

      {canSeeClinical && (
        <Card>
          <CardHeader title="Historial médico" />
          {loading ? (
            <p style={{ color: COLORS.textMuted, fontSize: 13, margin: 0 }}>Cargando…</p>
          ) : historyEvents.length === 0 ? (
            <p style={{ color: COLORS.textMuted, fontSize: 13, margin: 0 }}>Sin eventos registrados.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {historyEvents.map(h => (
                <div key={h.id} style={{ padding: "9px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.gold, marginBottom: 2 }}>{h.event_type ?? "Evento"}{h.event_date ? ` · ${fmtBirthDate(h.event_date)}` : ""}</div>
                  <div style={{ fontSize: 13, color: COLORS.text }}>{h.description}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export function PacientesSection({ userId, profile }) {
  const isMobile = useIsMobile();
  const { patients, loading } = useClinical();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const selectedPatient = selectedPatientId ? patients.find(p => p.id === selectedPatientId) ?? null : null;

  if (selectedPatient) {
    return (
      <PatientProfile
        patient={selectedPatient}
        profile={profile}
        onBack={() => setSelectedPatientId(null)}
        onDeleted={() => setSelectedPatientId(null)}
      />
    );
  }

  const filtered = patients.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.full_name ?? "").toLowerCase().includes(q) || (p.id_number ?? "").toLowerCase().includes(q);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {modalOpen && <NuevoPacienteModal userId={userId} onClose={() => setModalOpen(false)} />}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o cédula..."
          style={{ ...inputStyle, flex: 1, minWidth: 200, fontSize: 13, padding: "9px 12px" }}
          onFocus={e => e.target.style.borderColor = COLORS.gold}
          onBlur={e => e.target.style.borderColor = COLORS.border}
        />
        <button onClick={() => setModalOpen(true)} style={{
          display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
          background: `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
          border: "none", borderRadius: 8, padding: "9px 16px", color: "#FFF",
          fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif",
          boxShadow: "0 4px 14px rgba(201,162,78,0.35)",
        }}>
          <Plus size={15} /> Nuevo paciente
        </button>
      </div>

      {loading ? (
        <Card><p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0 }}>Cargando pacientes…</p></Card>
      ) : patients.length === 0 ? (
        <Card><p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0 }}>Aún no hay pacientes registrados.</p></Card>
      ) : filtered.length === 0 ? (
        <Card><p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0 }}>No se encontraron pacientes con ese criterio.</p></Card>
      ) : isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(p => (
            <Card key={p.id} style={{ cursor: "pointer" }} onClick={() => setSelectedPatientId(p.id)}>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 15, fontWeight: 700, color: COLORS.green, marginBottom: 8 }}>{p.full_name}</div>
              <div style={{ fontSize: 13, color: COLORS.textMuted, display: "flex", flexDirection: "column", gap: 4 }}>
                <span>Cédula: {p.id_number ?? "—"}</span>
                <span>Teléfono: {p.phone ?? "—"}</span>
                <span>Nacimiento: {fmtBirthDate(p.birth_date)}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Manrope', sans-serif" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  {["Nombre", "Cédula", "Teléfono", "Fecha de nacimiento"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "14px 20px", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: COLORS.textMuted, fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr
                    key={p.id} onClick={() => setSelectedPatientId(p.id)}
                    style={{ borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = COLORS.panelAlt}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 20px", fontSize: 13, color: COLORS.text, fontWeight: 600, whiteSpace: "nowrap" }}>{p.full_name}</td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: COLORS.textMuted, whiteSpace: "nowrap" }}>{p.id_number ?? "—"}</td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: COLORS.textMuted, whiteSpace: "nowrap" }}>{p.phone ?? "—"}</td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: COLORS.textMuted, whiteSpace: "nowrap" }}>{fmtBirthDate(p.birth_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
