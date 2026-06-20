import React, { useState } from "react";
import { Plus } from "lucide-react";
import { COLORS } from "../../constants/colors.js";
import { VAC_TOTAL } from "../../constants/nav.js";
import { fmtSupaDate } from "../../utils/format.js";
import { getEffectiveDays } from "../../utils/dates.js";
import { Card, CardHeader } from "../ui/Card.jsx";
import { StatusBadge } from "../ui/StatusBadge.jsx";
import { CrearSolicitudModal } from "../forms/SolicitudForms.jsx";

export function VacationSection({ profile, vacationRequests, onNewRequest }) {
  const vacationBalance = profile?.vacation_balance ?? VAC_TOTAL;
  const approvedDays  = vacationRequests.filter(r => r.status === "aprobado").reduce((a, r) => a + getEffectiveDays(r), 0);
  const pendingDays   = vacationRequests.filter(r => r.status === "pendiente").reduce((a, r) => a + getEffectiveDays(r), 0);
  const availableDays = Math.max(0, vacationBalance);
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
