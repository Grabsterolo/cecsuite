import React from "react";
import { Award } from "lucide-react";
import { COLORS } from "../../constants/colors.js";

export function ToastNotification({ toast }) {
  if (!toast) return null;
  const { message, Icon = Award } = toast;
  return (
    <div style={{
      position:"fixed", top:24, right:24, zIndex:9999,
      background:"#FAFAF8", border:`1.5px solid ${COLORS.gold}`,
      borderRadius:12, padding:"12px 18px",
      boxShadow:"0 4px 24px rgba(201,162,78,0.22)",
      display:"flex", alignItems:"center", gap:10, maxWidth:340,
      fontFamily:"'Manrope', sans-serif",
      animation:"sectionIn 0.2s ease-out both",
    }}>
      <Icon size={18} color={COLORS.gold} style={{ flexShrink:0 }} />
      <span style={{ fontSize:13, color:COLORS.text, fontWeight:600, lineHeight:1.4 }}>{message}</span>
    </div>
  );
}
