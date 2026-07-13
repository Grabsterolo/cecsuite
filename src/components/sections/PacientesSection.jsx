import React, { useState } from "react";
import { COLORS } from "../../constants/colors.js";
import { inputStyle } from "../../styles/forms.js";
import { Card } from "../ui/Card.jsx";
import { useIsMobile } from "../../hooks/useIsMobile.js";
import { useClinical } from "../../context/ClinicalContext.jsx";

function fmtBirthDate(str) {
  if (!str) return "—";
  const [y, m, d] = str.split("-").map(Number);
  const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d} ${months[m - 1]} ${y}`;
}

export function PacientesSection() {
  const isMobile = useIsMobile();
  const { patients, loading } = useClinical();
  const [search, setSearch] = useState("");

  const filtered = patients.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.full_name ?? "").toLowerCase().includes(q) || (p.id_number ?? "").toLowerCase().includes(q);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <input
        type="text" value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Buscar por nombre o cédula..."
        style={{ ...inputStyle, fontSize: 13, padding: "9px 12px" }}
        onFocus={e => e.target.style.borderColor = COLORS.gold}
        onBlur={e => e.target.style.borderColor = COLORS.border}
      />

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
