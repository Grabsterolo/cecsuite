import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COLORS } from "../../constants/colors.js";
import { MONTH_NAMES, DAY_NAMES } from "../../constants/nav.js";
import { fmtSupaDate, getFirstNames } from "../../utils/format.js";
import { getDepartmentColor, getDepartmentTextColor } from "../../utils/departments.js";
import { Card } from "../ui/Card.jsx";
import { DeptTag } from "../ui/DeptTag.jsx";

export function TeamCalendarSection({ teamVacations = [] }) {
  const now = new Date();
  const [yr, setYr] = useState(now.getFullYear());
  const [mo, setMo] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(null); // "YYYY-MM-DD"

  const firstWeekday = new Date(yr, mo, 1).getDay();
  const daysInMonth  = new Date(yr, mo + 1, 0).getDate();
  const prevMo = mo === 0 ? 11 : mo - 1;
  const prevYr = mo === 0 ? yr - 1 : yr;
  const daysInPrev = new Date(prevYr, prevMo + 1, 0).getDate();
  const nextMo = mo === 11 ? 0 : mo + 1;
  const nextYr = mo === 11 ? yr + 1 : yr;

  const cells = [];
  for (let i = firstWeekday - 1; i >= 0; i--) cells.push({ d: daysInPrev - i, m: prevMo, y: prevYr, overflow: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ d, m: mo, y: yr, overflow: false });
  while (cells.length < 42) cells.push({ d: cells.length - firstWeekday - daysInMonth + 1, m: nextMo, y: nextYr, overflow: true });

  function toYMD(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function vacationersOnDay(cell) {
    const ymd = toYMD(cell.y, cell.m, cell.d);
    return teamVacations.filter(r => {
      const rs = (r.start_date || "").slice(0, 10);
      const re = (r.end_date   || r.start_date || "").slice(0, 10);
      return rs && ymd >= rs && ymd <= re;
    });
  }

  function navMonth(delta) {
    let nm = mo + delta, ny = yr;
    if (nm < 0) { nm = 11; ny--; }
    if (nm > 11) { nm = 0; ny++; }
    setMo(nm); setYr(ny); setSelectedDay(null);
  }

  const todayYMD = toYMD(now.getFullYear(), now.getMonth(), now.getDate());
  const getFirstName = name => getFirstNames(name) || "?";
  const getPrimaryDept = p => {
    const arr = p?.departments;
    return (Array.isArray(arr) && arr.length > 0) ? arr[0] : (p?.department || null);
  };
  function getInitials(name) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2);
  }

  // vacationers in the whole visible month (for empty-month message + legend)
  const monthStart = toYMD(yr, mo, 1);
  const monthEnd   = toYMD(yr, mo, daysInMonth);
  const monthVacationers = teamVacations.filter(r => {
    const rs = (r.start_date || "").slice(0, 10);
    const re = (r.end_date   || r.start_date || "").slice(0, 10);
    return rs && rs <= monthEnd && re >= monthStart;
  });
  const anyThisMonth = monthVacationers.length > 0;
  const legendDepts = [...new Set(monthVacationers.map(r => getPrimaryDept(r.profiles)).filter(Boolean))].sort();

  const selectedVacationers = selectedDay
    ? teamVacations.filter(r => {
        const rs = (r.start_date || "").slice(0, 10);
        const re = (r.end_date   || r.start_date || "").slice(0, 10);
        return rs && selectedDay >= rs && selectedDay <= re;
      })
    : [];

  const navBtn = { border:"none", background:"rgba(31,74,64,0.07)", cursor:"pointer", color:COLORS.green, display:"flex", padding:"6px 8px", borderRadius:8 };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <Card>
        {/* Month navigation */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <button style={navBtn} onClick={() => navMonth(-1)}><ChevronLeft size={16}/></button>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={() => setYr(y => y - 1)} style={{ border:"none", background:"transparent", cursor:"pointer", color:COLORS.textMuted, fontSize:16, padding:"0 2px" }}>‹</button>
            <span style={{ fontWeight:700, color:COLORS.green, fontSize:15, minWidth:154, textAlign:"center" }}>{MONTH_NAMES[mo]} {yr}</span>
            <button onClick={() => setYr(y => y + 1)} style={{ border:"none", background:"transparent", cursor:"pointer", color:COLORS.textMuted, fontSize:16, padding:"0 2px" }}>›</button>
          </div>
          <button style={navBtn} onClick={() => navMonth(1)}><ChevronRight size={16}/></button>
        </div>

        {/* Day headers */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:4 }}>
          {DAY_NAMES.map(d => (
            <div key={d} style={{ textAlign:"center", fontSize:11, fontWeight:700, color:COLORS.textMuted, padding:"3px 0" }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
          {cells.map((cell, i) => {
            const vacers = vacationersOnDay(cell);
            const ymd = toYMD(cell.y, cell.m, cell.d);
            const isToday = ymd === todayYMD;
            const isSelected = ymd === selectedDay;
            const isOverflow = cell.overflow;
            const hasVac = vacers.length > 0;

            return (
              <div
                key={i}
                onClick={() => !isOverflow && hasVac && setSelectedDay(isSelected ? null : ymd)}
                style={{
                  minHeight:56,
                  borderRadius:7,
                  padding:"4px 3px 3px",
                  background: isSelected
                    ? "rgba(31,74,64,0.12)"
                    : isToday
                    ? "rgba(201,162,78,0.10)"
                    : "transparent",
                  border: isToday
                    ? `1.5px solid ${COLORS.gold}`
                    : isSelected
                    ? `1.5px solid ${COLORS.green}`
                    : "1.5px solid transparent",
                  cursor: !isOverflow && hasVac ? "pointer" : "default",
                  opacity: isOverflow ? 0.3 : 1,
                  display:"flex", flexDirection:"column", alignItems:"flex-start", gap:2,
                  overflow:"hidden",
                  transition:"background 0.1s",
                }}
              >
                <span style={{
                  fontSize:10, fontWeight: isToday ? 700 : 400,
                  color: isToday ? COLORS.gold : COLORS.textMuted,
                  lineHeight:1, flexShrink:0, alignSelf:"flex-end",
                  marginBottom:1,
                }}>
                  {cell.d}
                </span>

                {/* Vacation indicators */}
                {hasVac && !isOverflow && (
                  <div style={{ display:"flex", flexDirection:"column", gap:1, width:"100%", overflow:"hidden" }}>
                    {vacers.slice(0, 2).map((r, vi) => {
                      const dept = getPrimaryDept(r.profiles);
                      return (
                        <div key={vi} style={{
                          background: getDepartmentColor(dept),
                          color: getDepartmentTextColor(dept),
                          borderRadius:3,
                          fontSize:9,
                          fontWeight:700,
                          padding:"1px 3px",
                          overflow:"hidden",
                          whiteSpace:"nowrap",
                          textOverflow:"ellipsis",
                          lineHeight:1.4,
                          width:"100%",
                          boxSizing:"border-box",
                        }}>
                          {getFirstName(r.profiles?.full_name)}
                        </div>
                      );
                    })}
                    {vacers.length > 2 && (
                      <div style={{
                        background:"rgba(31,74,64,0.15)",
                        color:COLORS.green,
                        borderRadius:3,
                        fontSize:9,
                        fontWeight:700,
                        padding:"1px 3px",
                        textAlign:"center",
                        lineHeight:1.4,
                      }}>
                        +{vacers.length - 2}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty month message */}
        {!anyThisMonth && (
          <p style={{ textAlign:"center", color:COLORS.textMuted, fontSize:13, marginTop:16, marginBottom:4 }}>
            Nadie del equipo tiene vacaciones programadas este mes.
          </p>
        )}
      </Card>

      {/* Detail panel for selected day */}
      {selectedDay && selectedVacationers.length > 0 && (
        <Card>
          <div style={{ marginBottom:10, fontSize:13, fontWeight:700, color:COLORS.green }}>
            {fmtSupaDate(selectedDay)} — {selectedVacationers.length} persona{selectedVacationers.length !== 1 ? "s" : ""} de vacaciones
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {selectedVacationers.map((r, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"8px 12px", borderRadius:8, background:COLORS.panelAlt,
              }}>
                <div style={{
                  width:32, height:32, borderRadius:16,
                  background: getDepartmentColor(getPrimaryDept(r.profiles)),
                  color: getDepartmentTextColor(getPrimaryDept(r.profiles)),
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:12, fontWeight:700, flexShrink:0,
                }}>
                  {getInitials(r.profiles?.full_name)}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:COLORS.text }}>{r.profiles?.full_name || "—"}</div>
                  {getPrimaryDept(r.profiles) && (
                    <div style={{ marginTop:3 }}><DeptTag dept={getPrimaryDept(r.profiles)} /></div>
                  )}
                  <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:4 }}>
                    {fmtSupaDate(r.start_date)} → {fmtSupaDate(r.end_date || r.start_date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Legend */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", padding:"0 2px", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:COLORS.textMuted }}>
          <div style={{ width:16, height:16, borderRadius:3, border:`1.5px solid ${COLORS.gold}` }}/>
          Hoy
        </div>
        {legendDepts.map(dept => (
          <div key={dept} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:COLORS.textMuted }}>
            <div style={{ width:16, height:16, borderRadius:3, background:getDepartmentColor(dept) }}/>
            {dept}
          </div>
        ))}
        {legendDepts.length === 0 && anyThisMonth && (
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:COLORS.textMuted }}>
            <div style={{ width:16, height:16, borderRadius:3, background:COLORS.gold }}/>
            Vacaciones aprobadas
          </div>
        )}
      </div>
    </div>
  );
}
