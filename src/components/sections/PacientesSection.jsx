import React, { useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { inputStyle, taStyle, btnCancelStyle, btnSubmitStyle } from "../../styles/forms.js";
import { translateError } from "../../utils/errors.js";
import { Card } from "../ui/Card.jsx";
import { ModalShell } from "../ui/ModalShell.jsx";
import { useIsMobile } from "../../hooks/useIsMobile.js";
import { useClinical } from "../../context/ClinicalContext.jsx";

const GENDERS = ["Femenino", "Masculino", "Otro", "Prefiere no decir"];
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Desconocido"];

function toArray(text) {
  return text.split(",").map(s => s.trim()).filter(Boolean);
}

function fmtBirthDate(str) {
  if (!str) return "—";
  const [y, m, d] = str.split("-").map(Number);
  const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d} ${months[m - 1]} ${y}`;
}

function GroupTitle({ children }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.gold, letterSpacing: "0.06em", textTransform: "uppercase", margin: "20px 0 12px" }}>
      {children}
    </div>
  );
}

function NuevoPacienteModal({ userId, onClose }) {
  const isMobile = useIsMobile();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [allergies, setAllergies] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [chronicConditions, setChronicConditions] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    setError(null);
    if (!fullName.trim()) { setError("El nombre completo es obligatorio."); return; }
    setLoading(true);
    const { error: insertError } = await supabase.from("patients").insert({
      full_name: fullName.trim(),
      phone: phone.trim() || null,
      birth_date: birthDate || null,
      allergies: allergies.trim() ? toArray(allergies) : null,
      emergency_contact_name: emergencyName.trim() || null,
      emergency_contact_phone: emergencyPhone.trim() || null,
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
      <div style={{ marginBottom: 14 }}>
        {fl("Nombre completo")}
        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nombre y apellidos" style={inp} />
      </div>
      <div style={twoCol}>
        <div>
          {fl("Teléfono")}
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="8888-0000" style={inp} />
        </div>
        <div>
          {fl("Fecha de nacimiento")}
          <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} style={inp} />
        </div>
      </div>

      <div style={{ height: 1, background: COLORS.border }} />
      <GroupTitle>Para atenderlo bien</GroupTitle>

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

      <div style={{ height: 1, background: COLORS.border }} />
      <GroupTitle>Datos adicionales (opcional)</GroupTitle>

      <div style={twoCol}>
        <div>
          {fl("Cédula / documento")}
          <input type="text" value={idNumber} onChange={e => setIdNumber(e.target.value)} style={inp} />
        </div>
        <div>
          {fl("Correo electrónico")}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nombre@correo.com" style={inp} />
        </div>
      </div>
      <div style={twoCol}>
        <div>
          {fl("Género")}
          <select value={gender} onChange={e => setGender(e.target.value)} style={selStyle}>
            <option value="">Sin especificar</option>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          {fl("Tipo de sangre")}
          <select value={bloodType} onChange={e => setBloodType(e.target.value)} style={selStyle}>
            <option value="">Sin especificar</option>
            {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        {fl("Condiciones crónicas")}
        <input type="text" value={chronicConditions} onChange={e => setChronicConditions(e.target.value)} placeholder="Ej. Hipertensión, diabetes (separadas por comas)" style={inp} />
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

export function PacientesSection({ userId }) {
  const isMobile = useIsMobile();
  const { patients, loading } = useClinical();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

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
            <Card key={p.id}>
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
                  <tr key={p.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
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
