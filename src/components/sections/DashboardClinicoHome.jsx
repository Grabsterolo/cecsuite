import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { Card, CardHeader } from "../ui/Card.jsx";
import { useClinical } from "../../context/ClinicalContext.jsx";

function isSameDay(iso, ref) {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate();
}

function fmtHour(iso) {
  return new Date(iso).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function fmtDayShort(iso) {
  return new Date(iso).toLocaleDateString("es-CR", { day: "numeric", month: "short" });
}

export function DashboardClinicoHome({ isMobile, profile, userId }) {
  const { patients, appointments, loading } = useClinical();
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    supabase.from("appointment_requests").select("id", { count: "exact", head: true }).eq("status", "pendiente")
      .then(({ count }) => { if (typeof count === "number") setPendingRequests(count); });
  }, []);

  const now = new Date();
  const todayAppointments = appointments
    .filter(a => isSameDay(a.scheduled_at, now))
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

  const patientById = Object.fromEntries(patients.map(p => [p.id, p]));

  const groupedByHour = todayAppointments.reduce((acc, a) => {
    const hourLabel = fmtHour(a.scheduled_at).slice(0, 2) + ":00";
    (acc[hourLabel] ||= []).push(a);
    return acc;
  }, {});

  const isDoctor = profile?.role === "doctor";
  const myUpcoming = isDoctor
    ? appointments
        .filter(a => a.doctor_id === userId && new Date(a.scheduled_at) > now && !isSameDay(a.scheduled_at, now))
        .slice(0, 5)
    : [];

  const allergyAlerts = todayAppointments
    .map(a => patientById[a.patient_id])
    .filter(p => p && Array.isArray(p.allergies) && p.allergies.length > 0)
    .filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i);

  const span2 = isMobile ? {} : { gridColumn: "span 2" };

  return (
    <div style={isMobile
      ? { display: "flex", flexDirection: "column", gap: 14 }
      : { display: "grid", gridTemplateColumns: "1fr 1fr", gridAutoFlow: "dense", gap: 20 }
    }>
      <Card style={span2}>
        <CardHeader title="Citas de hoy" />
        {loading ? (
          <p style={{ color: COLORS.textMuted, fontSize: 13, margin: 0 }}>Cargando…</p>
        ) : todayAppointments.length === 0 ? (
          <p style={{ color: COLORS.textMuted, fontSize: 13, margin: 0 }}>No hay citas programadas para hoy.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {Object.entries(groupedByHour).map(([hour, apps]) => (
              <div key={hour}>
                <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.gold, letterSpacing: "0.06em", marginBottom: 6 }}>{hour}</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {apps.map(a => {
                    const patient = patientById[a.patient_id];
                    return (
                      <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}`, gap: 10 }}>
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 600 }}>{patient?.full_name ?? "Paciente sin nombre"}</span>
                          {a.reason && <span style={{ fontSize: 12, color: COLORS.textMuted, marginLeft: 8 }}>{a.reason}</span>}
                        </div>
                        <span style={{ fontSize: 12, color: COLORS.textMuted, flexShrink: 0 }}>{fmtHour(a.scheduled_at)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Solicitudes de cita" />
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 700, color: COLORS.green, margin: "0 0 4px", lineHeight: 1 }}>{pendingRequests}</p>
        <p style={{ fontSize: 13, color: COLORS.textMuted, margin: 0 }}>
          {pendingRequests === 0 ? "No hay solicitudes pendientes." : `Esperando revisión.`}
        </p>
      </Card>

      {isDoctor && (
        <Card>
          <CardHeader title="Tus próximos turnos" />
          {myUpcoming.length === 0 ? (
            <p style={{ color: COLORS.textMuted, fontSize: 13, margin: 0 }}>No tienes próximos turnos agendados.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {myUpcoming.map(a => {
                const patient = patientById[a.patient_id];
                return (
                  <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13, gap: 10 }}>
                    <span style={{ color: COLORS.text, fontWeight: 500, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{patient?.full_name ?? "—"}</span>
                    <span style={{ color: COLORS.textMuted, flexShrink: 0 }}>{fmtDayShort(a.scheduled_at)} · {fmtHour(a.scheduled_at)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {allergyAlerts.length > 0 && (
        <Card style={{ ...span2, border: "1.5px solid #c0392b" }}>
          <CardHeader title="Alerta de alergias — citas de hoy" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {allergyAlerts.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: COLORS.text }}>
                <AlertTriangle size={16} color="#c0392b" style={{ flexShrink: 0 }} />
                <strong>{p.full_name}</strong>
                <span style={{ color: COLORS.textMuted }}>— {p.allergies.join(", ")}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
