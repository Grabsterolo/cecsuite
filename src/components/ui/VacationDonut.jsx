import React, { useState, useEffect } from "react";
import { COLORS } from "../../constants/colors.js";
import { VAC_TOTAL } from "../../constants/nav.js";

export function VacationDonut({ used = 0, requested = 0, total = VAC_TOTAL }) {
  const noAnim = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [pct, setPct] = useState(noAnim ? 1 : 0);

  useEffect(() => {
    if (noAnim) return;
    const duration = 900;
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setPct(eased);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [noAnim]);

  const safeUsed = Math.min(used, total);
  const safeReq  = Math.min(requested, total - safeUsed);
  const available = total - safeUsed;
  const usedDeg = (safeUsed / total) * 360 * pct;
  const reqDeg  = (safeReq  / total) * 360 * pct;

  const gradient = `conic-gradient(
    ${COLORS.gold}     0deg ${usedDeg}deg,
    ${COLORS.goldSoft} ${usedDeg}deg ${usedDeg + reqDeg}deg,
    ${COLORS.panelAlt} ${usedDeg + reqDeg}deg 360deg
  )`;

  return (
    <div style={{ width:160, height:160, borderRadius:"50%", background:gradient, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <div style={{ width:116, height:116, borderRadius:"50%", background:COLORS.panel, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2 }}>
        <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:44, fontWeight:700, color:COLORS.green, lineHeight:1 }}>{available}</span>
        <span style={{ fontSize:10, color:COLORS.textMuted, letterSpacing:"0.04em" }}>disponibles</span>
      </div>
    </div>
  );
}
