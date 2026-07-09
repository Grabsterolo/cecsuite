import React, { useState } from "react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { translateError } from "../../utils/errors.js";
import { fmtMinutes, fmtClockTime, fmtTimestampDateCR, getThisWeekStartCR, fmtWeekRangeCR, sumWorkedMinutesInWeek } from "../../utils/attendance.js";
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
    </>
  );
}

// Botón único de marcar entrada/salida. Reutilizable en la sección de
// Asistencia y en el widget de Inicio.
export function ClockInOutButton({ myAttendance = [], userId, onClockIn, onClockOut, compact = false }) {
  const [acting, setActing] = useState(false);
  const [error,  setError]  = useState(null);

  const openRecord = myAttendance.find(r => r.status === "abierto");
  const isWorking = !!openRecord;

  async function handleClockIn() {
    setActing(true); setError(null);
    try {
      const { data, error: insertError } = await supabase.from("attendance_records").insert({ user_id: userId }).select().single();
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
    try {
      const { data, error: updateError } = await supabase.from("attendance_records").update({
        clock_out: new Date().toISOString(),
      }).eq("id", openRecord.id).select().single();
      if (updateError) throw updateError;
      onClockOut?.(data);
    } catch (err) {
      setError(translateError(err.message));
    } finally {
      setActing(false);
    }
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems: compact ? "flex-end" : "center", gap: compact ? 6 : 14 }}>
      {!compact && isWorking && (
        <p style={{ fontSize:13, color:COLORS.textMuted, margin:0 }}>
          Entrada marcada a las <strong style={{ color:COLORS.text }}>{fmtClockTime(openRecord.clock_in)}</strong>
        </p>
      )}
      <button onClick={isWorking ? handleClockOut : handleClockIn} disabled={acting} style={{
        padding: compact ? "9px 20px" : "16px 44px", borderRadius: compact ? 9 : 14, border:"none",
        background: acting ? COLORS.border : isWorking ? "linear-gradient(135deg, #d16b60, #c0392b)" : `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
        color:"#FFF", fontSize: compact ? 13 : 16, fontWeight:700, cursor: acting ? "not-allowed" : "pointer",
        fontFamily:"'Manrope', sans-serif", opacity: acting ? 0.75 : 1, transition:"all 0.15s", whiteSpace:"nowrap",
        boxShadow: isWorking ? "0 4px 14px rgba(192,57,43,0.3)" : "0 4px 14px rgba(201,162,78,0.35)",
      }}>
        {acting ? "..." : isWorking ? "Marcar salida" : "Marcar entrada"}
      </button>
      {error && <p style={{ fontSize:12, color:"#e07070", margin:0, textAlign: compact ? "right" : "center", maxWidth:280 }}>{error}</p>}
    </div>
  );
}

export function AttendanceSection({ myAttendance = [], userId, onClockIn, onClockOut }) {
  const weekStart = getThisWeekStartCR();
  const weekMinutes = sumWorkedMinutesInWeek(myAttendance, weekStart);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Card>
        <CardHeader title="Marcar asistencia" />
        <div style={{ display:"flex", justifyContent:"center", padding:"8px 0" }}>
          <ClockInOutButton myAttendance={myAttendance} userId={userId} onClockIn={onClockIn} onClockOut={onClockOut} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Esta semana" />
        <div style={{ display:"flex", alignItems:"baseline", gap:8, flexWrap:"wrap" }}>
          <span style={{ fontSize:26, fontWeight:800, color:COLORS.text }}>{fmtMinutes(weekMinutes)}</span>
        </div>
        <p style={{ fontSize:12, color:COLORS.textMuted, margin:"4px 0 0" }}>{fmtWeekRangeCR(weekStart)}</p>
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
