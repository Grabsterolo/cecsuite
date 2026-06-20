import React from "react";
import { AlertTriangle, CalendarDays, ClipboardList } from "lucide-react";
import { COLORS } from "../../constants/colors.js";

export function StatusBadge({ status }) {
  const styles = {
    pendiente:   { color: COLORS.gold,        background: "rgba(201,162,78,0.12)"  },
    aprobado:    { color: "#2C6356",           background: "rgba(44,99,86,0.1)"     },
    rechazado:   { color: "#c0392b",           background: "rgba(192,57,43,0.1)"    },
    atendido:    { color: "#2C6356",           background: "rgba(44,99,86,0.1)"     },
    descartado:  { color: COLORS.textMuted,    background: COLORS.panelAlt          },
  };
  const labels = { pendiente:"Pendiente", aprobado:"Aprobado", rechazado:"Rechazado", atendido:"Atendido", descartado:"Descartado" };
  const s = styles[status] ?? { color: COLORS.textMuted, background: COLORS.panelAlt };
  const label = labels[status] ?? (status ? status.charAt(0).toUpperCase() + status.slice(1) : "—");
  return (
    <span style={{ fontSize:11, fontWeight:700, borderRadius:5, padding:"3px 9px", letterSpacing:"0.04em", whiteSpace:"nowrap", fontFamily:"'Manrope', sans-serif", ...s }}>
      {label}
    </span>
  );
}

export function Tag({ label }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
      textTransform: "uppercase", color: COLORS.gold,
      background: "rgba(201,162,78,0.1)", borderRadius: 4, padding: "2px 7px",
      fontFamily: "'Manrope', sans-serif",
      display: "inline-block", width: "fit-content", alignSelf: "flex-start",
    }}>
      {label}
    </span>
  );
}

export function SolicitudIcon({ kind, type, size = 18 }) {
  if (kind === "report") return <AlertTriangle size={size} color={COLORS.gold} />;
  if (type === "vacaciones") return <CalendarDays size={size} color={COLORS.gold} />;
  return <ClipboardList size={size} color={COLORS.gold} />;
}
