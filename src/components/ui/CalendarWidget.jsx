import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COLORS } from "../../constants/colors.js";
import { MONTH_NAMES, DAY_NAMES } from "../../constants/nav.js";

export function CalendarWidget({ startDate, endDate, onChange, minDate }) {
  const now = new Date();
  const [yr, setYr] = useState(startDate ? startDate.getFullYear() : now.getFullYear());
  const [mo, setMo] = useState(startDate ? startDate.getMonth() : now.getMonth());

  const firstWeekday = new Date(yr, mo, 1).getDay();
  const daysInMonth  = new Date(yr, mo + 1, 0).getDate();
  const prevMo = mo === 0 ? 11 : mo - 1;
  const prevYr = mo === 0 ? yr - 1 : yr;
  const daysInPrev = new Date(prevYr, prevMo + 1, 0).getDate();
  const nextMo = mo === 11 ? 0 : mo + 1;
  const nextYr = mo === 11 ? yr + 1 : yr;

  const cells = [];
  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ d: daysInPrev - i, m: prevMo, y: prevYr, overflow: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ d, m: mo, y: yr, overflow: false });
  }
  while (cells.length < 42) {
    cells.push({ d: cells.length - firstWeekday - daysInMonth + 1, m: nextMo, y: nextYr, overflow: true });
  }

  function click(cell) {
    const d = new Date(cell.y, cell.m, cell.d);
    if (minDate && d < minDate) return;
    if (cell.overflow) { setYr(cell.y); setMo(cell.m); }
    if (!startDate || endDate)                     { onChange(d, null); }
    else if (d.getTime() === startDate.getTime())  { onChange(null, null); }
    else if (d < startDate)                        { onChange(d, null); }
    else                                           { onChange(startDate, d); }
  }

  function cellState(cell) {
    const t = new Date(cell.y, cell.m, cell.d).getTime();
    if (startDate && t === startDate.getTime()) return "s";
    if (endDate   && t === endDate.getTime())   return "e";
    if (startDate && endDate && t > startDate.getTime() && t < endDate.getTime()) return "r";
    return "";
  }

  const navBtn = { border:"none", background:"rgba(31,74,64,0.07)", cursor:"pointer", color:COLORS.green, display:"flex", padding:"6px 8px", borderRadius:8 };

  return (
    <>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <button style={navBtn} onClick={() => mo===0?(setMo(11),setYr(y=>y-1)):setMo(m=>m-1)}><ChevronLeft size={16}/></button>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button onClick={() => setYr(y=>y-1)} style={{ border:"none", background:"transparent", cursor:"pointer", color:COLORS.textMuted, fontSize:16, padding:"0 2px" }}>‹</button>
          <span style={{ fontWeight:700, color:COLORS.green, fontSize:15, minWidth:154, textAlign:"center" }}>{MONTH_NAMES[mo]} {yr}</span>
          <button onClick={() => setYr(y=>y+1)} style={{ border:"none", background:"transparent", cursor:"pointer", color:COLORS.textMuted, fontSize:16, padding:"0 2px" }}>›</button>
        </div>
        <button style={navBtn} onClick={() => mo===11?(setMo(0),setYr(y=>y+1)):setMo(m=>m+1)}><ChevronRight size={16}/></button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:4 }}>
        {DAY_NAMES.map(d => <div key={d} style={{ textAlign:"center", fontSize:11, fontWeight:700, color:COLORS.textMuted, padding:"3px 0" }}>{d}</div>)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
        {cells.map((cell, i) => {
          const s = cellState(cell);
          const ep = s==="s" || s==="e";
          const date = new Date(cell.y, cell.m, cell.d);
          const isPast = minDate && date < minDate;
          return (
            <button key={i} onClick={() => click(cell)} disabled={isPast} style={{
              height:36, border:"none", borderRadius:6, fontSize:13,
              cursor: isPast ? "default" : "pointer",
              background: isPast ? "transparent" : ep ? COLORS.gold : s==="r" ? "rgba(201,162,78,0.18)" : "transparent",
              color: isPast ? "#b0bbb8" : cell.overflow ? COLORS.textMuted : ep ? "#FFF" : COLORS.text,
              fontWeight: ep ? 700 : 400,
              opacity: cell.overflow ? 0.45 : 1,
              transition:"background 0.1s",
            }}>{cell.d}</button>
          );
        })}
      </div>
    </>
  );
}
