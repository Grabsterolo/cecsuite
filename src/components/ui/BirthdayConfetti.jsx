import React from "react";
import { CONFETTI_PARTICLES } from "../../constants/nav.js";

export function BirthdayConfetti() {
  return (
    <div style={{ position: "fixed", top:0, right:0, bottom:0, left:0, pointerEvents: "none", zIndex: 9, overflow: "hidden" }}>
      {CONFETTI_PARTICLES.map((p, i) => (
        <div key={i} style={{
          position: "absolute", top: 0, left: p.left,
          width: p.size, height: p.rect ? Math.round(p.size * 1.5) : p.size,
          borderRadius: p.rect ? 2 : "50%",
          background: p.color,
          animation: `confettiFall ${p.dur}s ease-in ${p.delay}s infinite`,
        }} />
      ))}
    </div>
  );
}
