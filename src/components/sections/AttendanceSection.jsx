import React, { useState } from "react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { translateError } from "../../utils/errors.js";
import { fmtMinutes, fmtClockTime, fmtTimestampDateCR } from "../../utils/attendance.js";
import { useIpLocation } from "../../hooks/useIpLocation.js";
import { Card, CardHeader } from "../ui/Card.jsx";

function Badge({ label, color, background }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
      color, background, borderRadius: 4, padding: "2px 7px",
      fontFamily: "'Manrope', sans-serif", display: "inline-block", whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

export function AttendanceBadges({ record }) {
  if (!record) return null;
  return (
    <>
      {record.status === "abierto" && <Badge label="En curso" color={COLORS.gold} background="rgba(201,162,78,0.12)" />}
      {record.status === "pendiente_correccion" && <Badge label="Corregido" color="#5a7ec7" background="rgba(100,140,220,0.12)" />}
      {record.late_minutes > 0 && <Badge label={`Atraso ${fmtMinutes(record.late_minutes)}`} color="#c0392b" background="rgba(192,57,43,0.1)" />}
      {record.overtime_minutes > 0 && <Badge label={`Extra ${fmtMinutes(record.overtime_minutes)}`} color={COLORS.greenSoft} background="rgba(44,99,86,0.1)" />}
      {record.out_of_range && <Badge label="Fuera de rango" color="#c0392b" background="rgba(192,57,43,0.1)" />}
    </>
  );
}

export function AttendanceSection({ myAttendance = [], userId, onClockIn, onClockOut }) {
  const { getPosition, loading: geoLoading } = useIpLocation();
  const [acting, setActing] = useState(false);
  const [error,  setError]  = useState(null);

  const openRecord = myAttendance.find(r => r.status === "abierto");
  const isWorking = !!openRecord;

  // La ubicación es best-effort: si no se puede determinar por IP, el marcaje
  // se registra igual, solo que sin coordenadas (sin verificación de rango).
  async function handleClockIn() {
    setActing(true); setError(null);
    const pos = await getPosition().catch(() => null);
    try {
      const { data, error: insertError } = await supabase.from("attendance_records").insert({
        user_id: userId,
        clock_in_lat: pos?.lat ?? null,
        clock_in_lng: pos?.lng ?? null,
      }).select().single();
      if (insertError) throw insertError;
      onClockIn?.(data);
    } catch (err) {
      setError(translateError(err.message));
    } finally {
      setActing(false);
    }
  }

  async function handleClockOut() {
    if (!openRecord) return;
    setActing(true); setError(null);
    const pos = await getPosition().catch(() => null);
    try {
      const { data, error: updateError } = await supabase.from("attendance_records").update({
        clock_out: new Date().toISOString(),
        clock_out_lat: pos?.lat ?? null,
        clock_out_lng: pos?.lng ?? null,
      }).eq("id", openRecord.id).select().single();
      if (updateError) throw updateError;
      onClockOut?.(data);
    } catch (err) {
      setError(translateError(err.message));
    } finally {
      setActing(false);
    }
  }

  const busy = acting || geoLoading;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Card>
        <CardHeader title="Marcar asistencia" />
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, padding:"8px 0" }}>
          {isWorking && (
            <p style={{ fontSize:13, color:COLORS.textMuted, margin:0 }}>
              Entrada marcada a las <strong style={{ color:COLORS.text }}>{fmtClockTime(openRecord.clock_in)}</strong>
            </p>
          )}
          <button onClick={isWorking ? handleClockOut : handleClockIn} disabled={busy} style={{
            padding:"16px 44px", borderRadius:14, border:"none",
            background: busy ? COLORS.border : isWorking ? "linear-gradient(135deg, #d16b60, #c0392b)" : `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
            color:"#FFF", fontSize:16, fontWeight:700, cursor: busy ? "not-allowed" : "pointer",
            fontFamily:"'Manrope', sans-serif", opacity: busy ? 0.75 : 1, transition:"all 0.15s",
            boxShadow: isWorking ? "0 4px 14px rgba(192,57,43,0.3)" : "0 4px 14px rgba(201,162,78,0.35)",
          }}>
            {busy ? "Obteniendo ubicación..." : isWorking ? "Marcar salida" : "Marcar entrada"}
          </button>
          {error && <p style={{ fontSize:12, color:"#e07070", margin:0, textAlign:"center", maxWidth:320 }}>{error}</p>}
        </div>
      </Card>

      <Card>
        <CardHeader title="Mi historial" />
        {myAttendance.length === 0 ? (
          <p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>Aún no tienes marcajes registrados.</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column" }}>
            {myAttendance.map(rec => (
              <div key={rec.id} style={{ padding:"12px 0", borderBottom:`1px solid ${COLORS.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:COLORS.text }}>{fmtTimestampDateCR(rec.clock_in)}</div>
                    <div style={{ fontSize:12, color:COLORS.textMuted, marginTop:2 }}>
                      {fmtClockTime(rec.clock_in)} — {rec.clock_out ? fmtClockTime(rec.clock_out) : "en curso"}
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", justifyContent:"flex-end" }}>
                    <AttendanceBadges record={rec} />
                    <span style={{ fontSize:13, fontWeight:700, color:COLORS.text, marginLeft:4 }}>{fmtMinutes(rec.worked_minutes)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
