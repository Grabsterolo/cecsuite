import React, { useState, useEffect, useCallback } from "react";
import {
  Bell, FileText, CalendarDays, User, LogOut,
  Home, ChevronRight, ChevronLeft, Download, Clock, CheckCircle2, Cake, Menu, X, Plus, Edit2, Trash2,
} from "lucide-react";

const COLORS = {
  bg: "#FAFAF8",
  panel: "#FFFFFF",
  panelAlt: "#F4F1EA",
  inputBg: "#F7F5F0",
  gold: "#C9A24E",
  goldSoft: "#E4C77A",
  green: "#1F4A40",
  greenSoft: "#2C6356",
  text: "#1F4A40",
  textMuted: "#6B8C80",
  border: "rgba(31,74,64,0.12)",
  sidebarMuted: "rgba(255,255,255,0.55)",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Manrope:wght@400;500;600;700&display=swap');
* { -webkit-tap-highlight-color: transparent; }
`;

const SIDEBAR_BG = "linear-gradient(168deg, #24584C 0%, #1F4A40 40%, #152E27 100%)";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
}

function Logo({ width = 200 }) {
  const [imgError, setImgError] = useState(false);
  if (!imgError) {
    return (
      <img
        src="/logo-blanco.png"
        alt="Centro Europeo de Cirugía"
        style={{ width, height: "auto", display: "block", margin: "0 auto" }}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div style={{ textAlign: "center", lineHeight: 1.2 }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 18, color: "#FFFFFF", letterSpacing: "0.08em" }}>Centro Europeo</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 22, color: COLORS.goldSoft, letterSpacing: "0.16em" }}>DE CIRUGÍA</div>
    </div>
  );
}

/* ─────────────────────────── LOGIN ─────────────────────────── */

const inputStyle = {
  width: "100%", background: "#F7F5F0",
  border: "1.5px solid rgba(31,74,64,0.12)", borderRadius: 8,
  padding: "11px 14px", color: "#1F4A40", fontSize: 16,
  outline: "none", boxSizing: "border-box",
  fontFamily: "'Manrope', sans-serif", transition: "border-color 0.2s", display: "block",
};

function LoginForm({ onLogin }) {
  return (
    <>
      <div style={{ width: 32, height: 3, background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.goldSoft})`, borderRadius: 2, marginBottom: 20 }} />
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, marginBottom: 6, color: COLORS.green, lineHeight: 1.1 }}>
        Bienvenido<br />de nuevo
      </h1>
      <p style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 36, lineHeight: 1.6 }}>
        Ingresa con tu cuenta institucional para continuar.
      </p>
      <button onClick={onLogin} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        background: COLORS.inputBg, border: `1.5px solid ${COLORS.border}`,
        borderRadius: 10, padding: "12px 16px", color: COLORS.text,
        fontSize: 14, fontWeight: 600, cursor: "pointer",
        fontFamily: "'Manrope', sans-serif", transition: "border-color 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.gold}
        onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
      >
        <svg width="18" height="18" viewBox="0 0 23 23" style={{ flexShrink: 0 }}>
          <rect x="1" y="1" width="10" height="10" fill="#F25022" />
          <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
          <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
          <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
        </svg>
        Continuar con Microsoft
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0", color: COLORS.textMuted, fontSize: 12 }}>
        <div style={{ flex: 1, height: 1, background: COLORS.border }} />
        o con tu correo
        <div style={{ flex: 1, height: 1, background: COLORS.border }} />
      </div>
      <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 6, fontWeight: 600, letterSpacing: "0.02em" }}>Correo corporativo</label>
      <input type="email" placeholder="nombre@cec.co.cr" style={{ ...inputStyle, marginBottom: 14 }}
        onFocus={e => e.target.style.borderColor = COLORS.gold}
        onBlur={e => e.target.style.borderColor = COLORS.border}
      />
      <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 6, fontWeight: 600, letterSpacing: "0.02em" }}>Contraseña</label>
      <input type="password" placeholder="••••••••" style={{ ...inputStyle, marginBottom: 24 }}
        onFocus={e => e.target.style.borderColor = COLORS.gold}
        onBlur={e => e.target.style.borderColor = COLORS.border}
      />
      <button onClick={onLogin} style={{
        width: "100%", background: `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
        border: "none", borderRadius: 8, padding: "13px 16px", color: "#FFF",
        fontSize: 14, fontWeight: 700, cursor: "pointer",
        letterSpacing: "0.04em", fontFamily: "'Manrope', sans-serif",
        boxShadow: "0 4px 16px rgba(201,162,78,0.4)", transition: "box-shadow 0.2s, transform 0.15s",
      }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 22px rgba(201,162,78,0.55)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(201,162,78,0.4)"; e.currentTarget.style.transform = "none"; }}
      >
        Iniciar sesión
      </button>
    </>
  );
}

function LoginScreen({ onLogin }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Manrope', sans-serif", background: "#FFF" }}>
        <div style={{ background: SIDEBAR_BG, padding: "48px 32px 36px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <Logo width={240} />
          <div style={{ width: 60, height: 1.5, background: COLORS.gold, opacity: 0.7 }} />
          <div style={{ fontSize: 11, letterSpacing: "0.4em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
            Portal de Colaboradores
          </div>
        </div>
        <div style={{ flex: 1, padding: "32px 28px 48px" }}>
          <LoginForm onLogin={onLogin} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Manrope', sans-serif" }}>

      {/* ── Panel izquierdo ── */}
      <div style={{
        flex: "0 0 45%",
        background: SIDEBAR_BG,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 56px",
        gap: 10,
      }}>
        <Logo width={380} />

        {/* Separador dorado */}
        <div style={{ width: 80, height: 2, background: COLORS.gold, opacity: 0.7 }} />

        <div style={{
          fontSize: 14,
          letterSpacing: "0.35em",
          color: "rgba(255,255,255,0.55)",
          textTransform: "uppercase",
          textAlign: "center",
          fontWeight: 500,
        }}>
          Portal de Colaboradores
        </div>
      </div>

      {/* ── Panel derecho — formulario ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 56px", background: "#FFF" }}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <LoginForm onLogin={onLogin} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── DASHBOARD ─────────────────────────── */

const NAV_ITEMS = [
  { key: "inicio",      label: "Inicio",      icon: Home },
  { key: "comunicados", label: "Comunicados", icon: Bell },
  { key: "documentos",  label: "Documentos",  icon: FileText },
  { key: "solicitudes", label: "Solicitudes", icon: CalendarDays },
  { key: "perfil",      label: "Mi perfil",   icon: User },
];

const ANNOUNCEMENTS = [
  { title: "Dr. Chacón fuera del país entre el 1 y el 22 de junio", date: "1 jun 2026", tag: "Avisos" },
  { title: "Capacitación Merz", date: "8 jun 2026", tag: "Capacitación" },
];

const DOCUMENTS = [
  "Protocolo de Consulta",
  "Manual de facturación en EMA",
];

const BIRTHDAYS = [
  { name: "Maggie Araya", date: "3 ago" },
];

/* ── Drawer móvil ── */
function MobileDrawer({ open, onClose, active, setActive, onLogout }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90,
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.25s ease",
      }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 272,
        background: SIDEBAR_BG, zIndex: 100,
        display: "flex", flexDirection: "column", padding: "24px 16px",
        boxShadow: "-6px 0 32px rgba(0,0,0,0.3)",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <Logo width={130} />
          <button onClick={onClose} style={{
            border: "none", background: "rgba(255,255,255,0.1)", color: "#FFF",
            cursor: "pointer", borderRadius: 8, width: 34, height: 34,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 16 }} />
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button key={item.key} onClick={() => { setActive(item.key); onClose(); }} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 14px", borderRadius: 10, border: "none",
                cursor: "pointer", textAlign: "left", fontSize: 15, fontWeight: 600,
                fontFamily: "'Manrope', sans-serif",
                color: isActive ? "#FFF" : COLORS.sidebarMuted,
                background: isActive ? `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})` : "transparent",
                transition: "background 0.15s, color 0.15s",
              }}>
                <Icon size={19} />{item.label}
              </button>
            );
          })}
        </nav>
        <div style={{ marginTop: "auto" }}>
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "0 4px 14px" }} />
          <button onClick={() => { onClose(); onLogout(); }} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "12px 14px",
            borderRadius: 10, border: "none", background: "transparent",
            color: COLORS.sidebarMuted, fontSize: 15, fontWeight: 600,
            fontFamily: "'Manrope', sans-serif", cursor: "pointer", width: "100%",
          }}>
            <LogOut size={19} />Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}

function Sidebar({ active, setActive, onLogout }) {
  return (
    <div style={{
      width: 252,
      background: SIDEBAR_BG,
      display: "flex",
      flexDirection: "column",
      padding: "28px 14px",
      height: "100vh",
      position: "sticky",
      top: 0,
      flexShrink: 0,
    }}>
      <div style={{ padding: "0 8px 28px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 16 }}>
        <Logo width={160} />
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 8, border: "none",
                cursor: "pointer", textAlign: "left",
                fontSize: 14, fontWeight: 600,
                fontFamily: "'Manrope', sans-serif",
                color: isActive ? "#FFFFFF" : COLORS.sidebarMuted,
                background: isActive
                  ? `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`
                  : "transparent",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#FFFFFF"; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = COLORS.sidebarMuted; } }}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto" }}>
        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "0 8px 14px" }} />
        <button
          onClick={onLogout}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 14px", borderRadius: 8, border: "none",
            background: "transparent", color: COLORS.sidebarMuted,
            fontSize: 14, fontWeight: 600,
            fontFamily: "'Manrope', sans-serif",
            cursor: "pointer", width: "100%", textAlign: "left",
            transition: "color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#FFFFFF"}
          onMouseLeave={e => e.currentTarget.style.color = COLORS.sidebarMuted}
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: COLORS.panel,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 14,
      padding: 24,
      boxShadow: "0 1px 6px rgba(31,74,64,0.06)",
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardHeader({ title, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: COLORS.green, margin: 0 }}>
        {title}
      </h3>
      {action}
    </div>
  );
}

function VacationDonut({ used = 9, total = 21 }) {
  const available = total - used;
  const deg = Math.round((used / total) * 360);
  return (
    <div style={{
      width: 120, height: 120, borderRadius: "50%",
      background: `conic-gradient(${COLORS.gold} 0deg ${deg}deg, ${COLORS.panelAlt} ${deg}deg 360deg)`,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <div style={{
        width: 88, height: 88, borderRadius: "50%", background: COLORS.panel,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
      }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 700, color: COLORS.green, lineHeight: 1 }}>
          {available}
        </span>
        <span style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.04em" }}>días</span>
      </div>
    </div>
  );
}

function Tag({ label }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
      textTransform: "uppercase", color: COLORS.gold,
      background: "rgba(201,162,78,0.1)", borderRadius: 4, padding: "2px 7px",
    }}>
      {label}
    </span>
  );
}

/* ─────────────────────────── SOLICITUDES ─────────────────────────── */

const MONTH_NAMES   = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAY_NAMES     = ["Do","Lu","Ma","Mi","Ju","Vi","Sa"];
const TIPOS_PERMISO = ["Permiso médico","Permiso personal","Permiso por duelo","Permiso de estudio","Permiso de paternidad/maternidad","Otro"];

/* ── Helpers ── */
function calcWorkDays(start, end) {
  if (!start || !end) return 0;
  let n = 0; const d = new Date(start);
  while (d <= end) { if (d.getDay() !== 0 && d.getDay() !== 6) n++; d.setDate(d.getDate()+1); }
  return n;
}
function fmtDate(d) { return d ? `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0,3)} ${d.getFullYear()}` : "—"; }

/* ── Calendar widget (shared) ── */
function CalendarWidget({ startDate, endDate, onChange }) {
  const now = new Date();
  const [yr, setYr] = useState(startDate ? startDate.getFullYear() : now.getFullYear());
  const [mo, setMo] = useState(startDate ? startDate.getMonth() : now.getMonth());
  const days  = new Date(yr, mo+1, 0).getDate();
  const first = new Date(yr, mo, 1).getDay();

  function click(day) {
    const d = new Date(yr, mo, day);
    if (!startDate || endDate)                     { onChange(d, null); }
    else if (d.getTime() === startDate.getTime())  { onChange(null, null); }
    else if (d < startDate)                        { onChange(d, null); }
    else                                           { onChange(startDate, d); }
  }
  function st(day) {
    const t = new Date(yr, mo, day).getTime();
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
        {Array(first).fill(null).map((_,i) => <div key={`e${i}`}/>)}
        {Array(days).fill(null).map((_,i) => {
          const day=i+1, s=st(day), ep=s==="s"||s==="e";
          return (
            <button key={day} onClick={() => click(day)} style={{
              height:36, border:"none", cursor:"pointer", borderRadius:6, fontSize:13,
              background: ep?COLORS.gold:s==="r"?"rgba(201,162,78,0.18)":"transparent",
              color: ep?"#FFF":COLORS.text, fontWeight: ep?700:400, transition:"background 0.1s",
            }}>{day}</button>
          );
        })}
      </div>
    </>
  );
}

/* ── Modal shell ── */
function ModalShell({ onClose, title, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#FFF", borderRadius:16, padding:"28px 24px", width:"100%", maxWidth:420, maxHeight:"92vh", overflowY:"auto", boxShadow:"0 24px 64px rgba(0,0,0,0.25)", fontFamily:"'Manrope', sans-serif" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:24, fontWeight:600, color:COLORS.green, margin:0 }}>{title}</h2>
          <button onClick={onClose} style={{ border:"none", background:"transparent", cursor:"pointer", color:COLORS.textMuted, display:"flex", padding:4 }}><X size={20}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const taStyle = { width:"100%", background:COLORS.inputBg, border:`1.5px solid ${COLORS.border}`, borderRadius:8, padding:"10px 14px", color:COLORS.text, fontSize:14, outline:"none", boxSizing:"border-box", resize:"vertical", fontFamily:"'Manrope', sans-serif", transition:"border-color 0.2s" };
const btnCancelStyle = { flex:1, background:"transparent", border:`1.5px solid ${COLORS.border}`, borderRadius:8, padding:"11px 16px", color:COLORS.textMuted, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'Manrope', sans-serif" };
const btnSubmitStyle = { flex:2, background:`linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`, border:"none", borderRadius:8, padding:"11px 16px", color:"#FFF", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'Manrope', sans-serif", boxShadow:"0 4px 14px rgba(201,162,78,0.4)" };

/* ── Formulario vacaciones ── */
function VacationForm({ onClose, onSubmit, editData }) {
  const [startDate, setStartDate] = useState(editData?.startDate || null);
  const [endDate,   setEndDate]   = useState(editData?.endDate   || null);
  const [includeHolidays, setIncludeHolidays] = useState(editData?.includeHolidays || false);
  const [coverPerson, setCoverPerson] = useState(editData?.coverPerson || "");
  const wd = calcWorkDays(startDate, endDate);

  function submit() {
    if (!startDate) return;
    onSubmit({ tipo:"vacaciones", startDate, endDate, includeHolidays, coverPerson });
  }

  return (
    <ModalShell onClose={onClose} title={editData ? "Editar solicitud" : "Solicitud de Vacaciones"}>
      <CalendarWidget startDate={startDate} endDate={endDate} onChange={(s,e) => { setStartDate(s); setEndDate(e); }} />
      {startDate && (
        <div style={{ marginTop:12, padding:"10px 14px", background:COLORS.panelAlt, borderRadius:8, fontSize:12, color:COLORS.textMuted }}>
          <div><span style={{ fontWeight:600, color:COLORS.green }}>Inicio: </span>{fmtDate(startDate)}</div>
          {endDate && <>
            <div style={{ marginTop:2 }}><span style={{ fontWeight:600, color:COLORS.green }}>Fin: </span>{fmtDate(endDate)}</div>
            <div style={{ marginTop:2 }}><span style={{ fontWeight:700, color:COLORS.gold }}>{wd} días hábiles</span></div>
          </>}
        </div>
      )}
      <label style={{ display:"flex", alignItems:"center", gap:10, marginTop:14, cursor:"pointer", fontSize:13, color:COLORS.text, userSelect:"none" }}>
        <input type="checkbox" checked={includeHolidays} onChange={e => setIncludeHolidays(e.target.checked)} style={{ width:16, height:16, accentColor:COLORS.gold, cursor:"pointer" }} />
        Incluir feriados en el período
      </label>
      <div style={{ marginTop:14 }}>
        <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>¿Quién cubre tu ausencia?</label>
        <textarea value={coverPerson} onChange={e => setCoverPerson(e.target.value)} placeholder="Nombre del colaborador o indicación..." rows={2} style={taStyle}
          onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
      </div>
      <div style={{ display:"flex", gap:10, marginTop:20 }}>
        <button onClick={onClose} style={btnCancelStyle}>Cancelar</button>
        <button onClick={submit} style={{ ...btnSubmitStyle, opacity: startDate?1:0.5 }}>{editData ? "Guardar cambios" : "Solicitar"}</button>
      </div>
    </ModalShell>
  );
}

/* ── Formulario permiso ── */
function PermisoForm({ onClose, onSubmit, editData }) {
  const [tipoPermiso, setTipoPermiso] = useState(editData?.tipoPermiso || "");
  const [startDate, setStartDate] = useState(editData?.startDate || null);
  const [endDate,   setEndDate]   = useState(editData?.endDate   || null);
  const [notes, setNotes] = useState(editData?.notes || "");

  function submit() {
    if (!tipoPermiso || !startDate) return;
    onSubmit({ tipo:"permiso", tipoPermiso, startDate, endDate, notes });
  }

  return (
    <ModalShell onClose={onClose} title={editData ? "Editar solicitud" : "Solicitud de Permiso"}>
      <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>Tipo de permiso</label>
      <select value={tipoPermiso} onChange={e => setTipoPermiso(e.target.value)} style={{
        width:"100%", background:COLORS.inputBg, border:`1.5px solid ${tipoPermiso?COLORS.gold:COLORS.border}`,
        borderRadius:8, padding:"11px 14px", color: tipoPermiso?COLORS.text:"#9aaea8",
        fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:16,
        fontFamily:"'Manrope', sans-serif", cursor:"pointer", appearance:"auto",
        transition:"border-color 0.2s",
      }}>
        <option value="" disabled>Selecciona un tipo…</option>
        {TIPOS_PERMISO.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:8, fontWeight:600, letterSpacing:"0.02em" }}>Fechas</label>
      <CalendarWidget startDate={startDate} endDate={endDate} onChange={(s,e) => { setStartDate(s); setEndDate(e); }} />
      {startDate && (
        <div style={{ marginTop:10, padding:"10px 14px", background:COLORS.panelAlt, borderRadius:8, fontSize:12, color:COLORS.textMuted }}>
          <div><span style={{ fontWeight:600, color:COLORS.green }}>Inicio: </span>{fmtDate(startDate)}</div>
          {endDate && <div style={{ marginTop:2 }}><span style={{ fontWeight:600, color:COLORS.green }}>Fin: </span>{fmtDate(endDate)}</div>}
        </div>
      )}
      <div style={{ marginTop:14 }}>
        <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>Notas adicionales</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Información adicional o justificación..." rows={2} style={taStyle}
          onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
      </div>
      <div style={{ display:"flex", gap:10, marginTop:20 }}>
        <button onClick={onClose} style={btnCancelStyle}>Cancelar</button>
        <button onClick={submit} style={{ ...btnSubmitStyle, opacity:(tipoPermiso&&startDate)?1:0.5 }}>{editData ? "Guardar cambios" : "Solicitar"}</button>
      </div>
    </ModalShell>
  );
}

/* ── Modal selector de tipo + routing ── */
function CrearSolicitudModal({ onClose, onSubmit, editData, initialTipo }) {
  const [tipo, setTipo] = useState(editData?.tipo || initialTipo || null);

  function handleSubmit(data) { onSubmit(data); onClose(); }

  if (!tipo) {
    return (
      <ModalShell onClose={onClose} title="Nueva Solicitud">
        <p style={{ color:COLORS.textMuted, fontSize:13, marginBottom:20 }}>Selecciona el tipo de solicitud:</p>
        <div style={{ display:"flex", gap:12, marginBottom:16 }}>
          {[{ key:"vacaciones", icon:CalendarDays, label:"Vacaciones", desc:"Días de descanso" },
            { key:"permiso",    icon:FileText,     label:"Permiso",    desc:"Médico, personal u otro" }]
          .map(({ key, icon:Icon, label, desc }) => (
            <button key={key} onClick={() => setTipo(key)} style={{
              flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:10,
              padding:"20px 12px", borderRadius:12, border:`2px solid ${COLORS.border}`,
              background:COLORS.inputBg, cursor:"pointer", textAlign:"center",
              fontFamily:"'Manrope', sans-serif", transition:"all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=COLORS.gold; e.currentTarget.style.background="rgba(201,162,78,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=COLORS.border; e.currentTarget.style.background=COLORS.inputBg; }}
            >
              <Icon size={26} color={COLORS.gold}/>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:COLORS.green }}>{label}</div>
                <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:2 }}>{desc}</div>
              </div>
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ ...btnCancelStyle, width:"100%" }}>Cancelar</button>
      </ModalShell>
    );
  }

  return tipo === "vacaciones"
    ? <VacationForm onClose={onClose} onSubmit={handleSubmit} editData={editData}/>
    : <PermisoForm  onClose={onClose} onSubmit={handleSubmit} editData={editData}/>;
}

/* ── Item individual de solicitud ── */
function SolicitudItem({ s, onDelete, onEdit }) {
  const enRevision = s.status === "en_revision";
  const label = s.tipo === "vacaciones"
    ? `Vacaciones${s.endDate ? ` · ${calcWorkDays(s.startDate,s.endDate)} días hábiles` : ""}`
    : (s.tipoPermiso || "Permiso");
  const sub = s.startDate
    ? fmtDate(s.startDate) + (s.endDate ? ` — ${fmtDate(s.endDate)}` : "")
    : "";

  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:8, background: enRevision?"rgba(201,162,78,0.07)":"rgba(44,99,86,0.07)" }}>
      {enRevision ? <Clock size={16} color={COLORS.gold}/> : <CheckCircle2 size={16} color={COLORS.greenSoft}/>}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ color:COLORS.text, fontWeight:500, fontSize:13 }}>{label}</div>
        {sub && <div style={{ color:COLORS.textMuted, fontSize:11, marginTop:1 }}>{sub}</div>}
        <div style={{ color:enRevision?COLORS.gold:COLORS.greenSoft, fontSize:11, marginTop:1 }}>{enRevision?"En revisión":"Aprobado"}</div>
      </div>
      {enRevision && (
        <div style={{ display:"flex", gap:5, flexShrink:0 }}>
          <button onClick={() => onEdit(s)} title="Editar" style={{ border:"none", background:"rgba(31,74,64,0.08)", color:COLORS.green, cursor:"pointer", borderRadius:6, width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center" }}><Edit2 size={13}/></button>
          <button onClick={() => onDelete(s.id)} title="Eliminar" style={{ border:"none", background:"rgba(200,50,50,0.08)", color:"#c0392b", cursor:"pointer", borderRadius:6, width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center" }}><Trash2 size={13}/></button>
        </div>
      )}
    </div>
  );
}

const verTodosStyle = {
  display: "flex", alignItems: "center", gap: 4,
  fontSize: 12, color: COLORS.gold, cursor: "pointer",
  fontWeight: 600, background: "none", border: "none",
  fontFamily: "'Manrope', sans-serif", padding: 0,
};

function DashboardHome({ isMobile, setActive, solicitudes, onAdd, onDelete, onUpdate }) {
  const [modal, setModal] = useState(null); // null | "new-vac" | solicitud-object(edit)

  function handleSubmit(data) {
    if (modal && typeof modal === "object") onUpdate(modal.id, data);
    else onAdd(data);
    setModal(null);
  }

  return (
    <>
      {modal === "new-vac" && (
        <VacationForm onClose={() => setModal(null)} onSubmit={handleSubmit} editData={null} />
      )}
      {modal && typeof modal === "object" && (
        <CrearSolicitudModal onClose={() => setModal(null)} onSubmit={handleSubmit} editData={modal} />
      )}
    <div style={isMobile
      ? { display: "flex", flexDirection: "column", gap: 14 }
      : { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }
    }>

      {/* Vacaciones */}
      <Card>
        <CardHeader title="Vacaciones"
          action={<button style={verTodosStyle} onClick={() => setModal("new-vac")}>Solicitar <ChevronRight size={14} /></button>}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <VacationDonut />
          <div style={{ flex: 1, fontSize: 13, color: COLORS.textMuted }}>
            <p style={{ margin: "0 0 6px" }}>
              <span style={{ color: COLORS.green, fontWeight: 700 }}>9</span> días tomados
            </p>
            <p style={{ margin: 0 }}>
              <span style={{ color: COLORS.green, fontWeight: 700 }}>2</span> pendientes
            </p>
          </div>
        </div>
      </Card>

      {/* Comunicados — 2 columnas en desktop */}
      <Card style={isMobile ? {} : { gridColumn: "span 2" }}>
        <CardHeader
          title="Comunicados recientes"
          action={<button style={verTodosStyle} onClick={() => setActive("comunicados")}>Ver todos <ChevronRight size={14} /></button>}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {ANNOUNCEMENTS.map((a) => (
            <div key={a.title} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              paddingBottom: 14, borderBottom: `1px solid ${COLORS.border}`,
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ fontSize: 14, color: COLORS.text, fontWeight: 500 }}>{a.title}</div>
                <Tag label={a.tag} />
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", marginLeft: 16 }}>
                <Clock size={12} />{a.date}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Documentos */}
      <Card>
        <CardHeader title="Documentos"
          action={<button style={verTodosStyle} onClick={() => setActive("documentos")}>Ver todos <ChevronRight size={14} /></button>}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          {DOCUMENTS.map((d) => (
            <div key={d} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              fontSize: 13, color: COLORS.text, padding: "9px 0",
              borderBottom: `1px solid ${COLORS.border}`,
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileText size={14} color={COLORS.textMuted} />{d}
              </span>
              <Download size={14} color={COLORS.gold} style={{ cursor: "pointer", flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </Card>

      {/* Solicitudes — muestra las 2 más recientes */}
      <Card>
        <CardHeader title="Solicitudes"
          action={<button style={verTodosStyle} onClick={() => setActive("solicitudes")}>Ver todas <ChevronRight size={14} /></button>}
        />
        {solicitudes.length === 0 ? (
          <p style={{ color:COLORS.textMuted, fontSize:13, margin:0 }}>Sin solicitudes activas.</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {solicitudes.slice(0,2).map(s => (
              <SolicitudItem key={s.id} s={s} onDelete={onDelete} onEdit={sol => setModal(sol)} />
            ))}
          </div>
        )}
      </Card>

      {/* Cumpleaños */}
      <Card>
        <CardHeader title="Próximos cumpleaños" />
        <div style={{ display: "flex", flexDirection: "column", fontSize: 13 }}>
          {BIRTHDAYS.map((b) => (
            <div key={b.name} style={{
              display: "flex", alignItems: "center", gap: 10,
              color: COLORS.text, padding: "9px 0",
              borderBottom: `1px solid ${COLORS.border}`,
            }}>
              <Cake size={16} color={COLORS.gold} />
              {b.name}
              <span style={{ marginLeft: "auto", color: COLORS.textMuted, fontSize: 12 }}>{b.date}</span>
            </div>
          ))}
        </div>
      </Card>

    </div>
    </>
  );
}

function PlaceholderSection({ title }) {
  return (
    <Card>
      <CardHeader title={title} />
      <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0 }}>
        Esta sección se desarrolla en la siguiente fase.
      </p>
    </Card>
  );
}

function SolicitudesSection({ solicitudes, onAdd, onDelete, onUpdate }) {
  const [modal, setModal] = useState(false);
  const [editData, setEditData] = useState(null);

  function openEdit(s) { setEditData(s); setModal(true); }
  function openNew()   { setEditData(null); setModal(true); }
  function handleSubmit(data) {
    if (editData) onUpdate(editData.id, data); else onAdd(data);
    setModal(false); setEditData(null);
  }

  return (
    <div>
      {modal && <CrearSolicitudModal onClose={() => { setModal(false); setEditData(null); }} onSubmit={handleSubmit} editData={editData} />}
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:20 }}>
        <button onClick={openNew} style={{
          display:"flex", alignItems:"center", gap:8,
          background:`linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
          border:"none", borderRadius:8, padding:"10px 18px",
          color:"#FFF", fontSize:14, fontWeight:700, cursor:"pointer",
          fontFamily:"'Manrope', sans-serif", boxShadow:"0 4px 14px rgba(201,162,78,0.35)", transition:"box-shadow 0.2s, transform 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow="0 6px 20px rgba(201,162,78,0.5)"; e.currentTarget.style.transform="translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow="0 4px 14px rgba(201,162,78,0.35)"; e.currentTarget.style.transform="none"; }}
        ><Plus size={16}/> Crear Solicitud</button>
      </div>
      <Card>
        <CardHeader title="Mis solicitudes" />
        {solicitudes.length === 0 ? (
          <p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>No tienes solicitudes activas. Crea una con el botón de arriba.</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {solicitudes.map(s => (
              <SolicitudItem key={s.id} s={s} onDelete={onDelete} onEdit={openEdit} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Dashboard({ onLogout }) {
  const [active, setActive] = useState("inicio");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const isMobile = useIsMobile();
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const sectionTitle = { inicio: "Inicio", comunicados: "Comunicados", documentos: "Documentos", solicitudes: "Solicitudes", perfil: "Mi perfil" }[active];

  const addSolicitud    = useCallback(data => setSolicitudes(prev => [{ ...data, id: Date.now(), status:"en_revision", createdAt: new Date() }, ...prev]), []);
  const deleteSolicitud = useCallback(id   => setSolicitudes(prev => prev.filter(s => s.id !== id)), []);
  const updateSolicitud = useCallback((id, data) => setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, ...data } : s)), []);

  const solProps = { solicitudes, onAdd: addSolicitud, onDelete: deleteSolicitud, onUpdate: updateSolicitud };

  if (isMobile) {
    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'Manrope', sans-serif" }}>
        {/* Header fijo móvil */}
        <div style={{
          position: "sticky", top: 0, zIndex: 50,
          background: SIDEBAR_BG, padding: "12px 16px",
          display: "flex", alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ width: 42, flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Logo width={120} />
          </div>
          <button onClick={openDrawer} style={{
            width: 42, height: 42, border: "none",
            background: "rgba(255,255,255,0.1)", color: "#FFF",
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", borderRadius: 10, flexShrink: 0,
          }}>
            <Menu size={22} />
          </button>
        </div>
        <MobileDrawer open={drawerOpen} onClose={closeDrawer} active={active} setActive={setActive} onLogout={onLogout} />
        <div style={{ padding: "24px 16px 48px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.22em", color: COLORS.gold, marginBottom: 4, textTransform: "uppercase", fontWeight: 600 }}>
            Viernes 12 de junio, 2026
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, margin: "0 0 22px", color: COLORS.green }}>
            {active === "inicio" ? "Buenos días, Juan Pablo" : sectionTitle}
          </h1>
          {active === "inicio" ? <DashboardHome isMobile={true} setActive={setActive} {...solProps} /> : active === "solicitudes" ? <SolicitudesSection {...solProps} /> : <PlaceholderSection title={sectionTitle} />}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", background: COLORS.bg, minHeight: "100vh", fontFamily: "'Manrope', sans-serif" }}>
      <Sidebar active={active} setActive={setActive} onLogout={onLogout} />
      <div style={{ flex: 1, padding: "36px 40px", minWidth: 0 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.25em", color: COLORS.gold, marginBottom: 6, textTransform: "uppercase", fontWeight: 600 }}>
            Viernes 12 de junio, 2026
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, margin: 0, color: COLORS.green }}>
            {active === "inicio" ? "Buenos días, Juan Pablo" : sectionTitle}
          </h1>
        </div>
        {active === "inicio" ? <DashboardHome isMobile={false} setActive={setActive} {...solProps} /> : active === "solicitudes" ? <SolicitudesSection {...solProps} /> : <PlaceholderSection title={sectionTitle} />}
      </div>
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  return (
    <div>
      <style>{FONTS}</style>
      {loggedIn
        ? <Dashboard onLogout={() => setLoggedIn(false)} />
        : <LoginScreen onLogin={() => setLoggedIn(true)} />
      }
    </div>
  );
}

