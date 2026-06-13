import React, { useState, useEffect, useCallback } from "react";
import {
  Bell, FileText, CalendarDays, CalendarCheck, User, LogOut,
  Home, ChevronRight, ChevronLeft, Download, Clock, CheckCircle2, Cake, Menu, X, Plus, Edit2, Trash2, AlertTriangle,
} from "lucide-react";
import { supabase } from "./src/lib/supabase";

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
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleLogin() {
    setError(null);
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: emailValue,
      password: passwordValue,
    });
    setLoading(false);
    if (authError) setError(authError.message);
  }

  return (
    <>
      <div style={{ width: 32, height: 3, background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.goldSoft})`, borderRadius: 2, marginBottom: 20 }} />
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, marginBottom: 6, color: COLORS.green, lineHeight: 1.1 }}>
        Bienvenido<br />de nuevo
      </h1>
      <p style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 36, lineHeight: 1.6 }}>
        Ingresa con tu cuenta institucional para continuar.
      </p>
      {/* Continuar con Microsoft — pendiente de configurar */}
      {/* <button ...>Continuar con Microsoft</button> */}
      {/* <div style={{ ...divisor }}>o con tu correo</div> */}
      <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 6, fontWeight: 600, letterSpacing: "0.02em" }}>Correo corporativo</label>
      <input
        type="email"
        placeholder="nombre@cec.co.cr"
        value={emailValue}
        onChange={e => setEmailValue(e.target.value)}
        style={{ ...inputStyle, marginBottom: 14 }}
        onFocus={e => e.target.style.borderColor = COLORS.gold}
        onBlur={e => e.target.style.borderColor = COLORS.border}
      />
      <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 6, fontWeight: 600, letterSpacing: "0.02em" }}>Contraseña</label>
      <input
        type="password"
        placeholder="••••••••"
        value={passwordValue}
        onChange={e => setPasswordValue(e.target.value)}
        onKeyDown={e => e.key === "Enter" && !loading && handleLogin()}
        style={{ ...inputStyle, marginBottom: 24 }}
        onFocus={e => e.target.style.borderColor = COLORS.gold}
        onBlur={e => e.target.style.borderColor = COLORS.border}
      />
      {error && (
        <p style={{ fontSize: 12, color: "#e07070", marginBottom: 14, marginTop: -10, lineHeight: 1.5 }}>
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handleLogin}
        disabled={loading}
        style={{
          width: "100%", background: `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
          border: "none", borderRadius: 8, padding: "13px 16px", color: "#FFF",
          fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
          letterSpacing: "0.04em", fontFamily: "'Manrope', sans-serif",
          boxShadow: "0 4px 16px rgba(201,162,78,0.4)", transition: "box-shadow 0.2s, transform 0.15s",
          opacity: loading ? 0.75 : 1,
        }}
        onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = "0 6px 22px rgba(201,162,78,0.55)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(201,162,78,0.4)"; e.currentTarget.style.transform = "none"; }}
      >
        {loading ? "Ingresando..." : "Iniciar sesión"}
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
  { key: "vacaciones",  label: "Vacaciones",  icon: CalendarCheck },
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

const VAC_TOTAL = 12;

function VacationDonut({ used = 0, requested = 0, total = VAC_TOTAL }) {
  const safeUsed = Math.min(used, total);
  const safeReq  = Math.min(requested, total - safeUsed);
  const available = total - safeUsed - safeReq;
  const usedDeg = Math.round((safeUsed / total) * 360);
  const reqDeg  = Math.round((safeReq  / total) * 360);

  const gradient = `conic-gradient(
    ${COLORS.gold}     0deg ${usedDeg}deg,
    ${COLORS.goldSoft} ${usedDeg}deg ${usedDeg + reqDeg}deg,
    ${COLORS.panelAlt} ${usedDeg + reqDeg}deg 360deg
  )`;

  return (
    <div style={{ width:120, height:120, borderRadius:"50%", background:gradient, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <div style={{ width:86, height:86, borderRadius:"50%", background:COLORS.panel, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:1 }}>
        <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:34, fontWeight:700, color:COLORS.green, lineHeight:1 }}>{available}</span>
        <span style={{ fontSize:9, color:COLORS.textMuted, letterSpacing:"0.04em" }}>disponibles</span>
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
const TIPOS_REPORTE = ["Daño a instalaciones","Daño a equipos","Incidente de seguridad","Situación de riesgo","Conducta inapropiada","Otro"];

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

/* ── Formulario reporte ── */
function ReporteForm({ onClose, onSubmit, editData }) {
  const [tipoReporte, setTipoReporte] = useState(editData?.tipoReporte || "");
  const [asunto, setAsunto]           = useState(editData?.asunto || "");
  const [descripcion, setDescripcion] = useState(editData?.descripcion || "");
  const [ubicacion, setUbicacion]     = useState(editData?.ubicacion || "");

  function submit() {
    if (!tipoReporte || !asunto) return;
    onSubmit({ tipo:"reporte", tipoReporte, asunto, descripcion, ubicacion });
  }

  const inputSm = { ...taStyle, resize:"none", height:40, padding:"10px 14px", fontSize:14 };

  return (
    <ModalShell onClose={onClose} title={editData ? "Editar reporte" : "Nuevo Reporte"}>
      <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>Tipo de reporte</label>
      <select value={tipoReporte} onChange={e => setTipoReporte(e.target.value)} style={{
        width:"100%", background:COLORS.inputBg, border:`1.5px solid ${tipoReporte?COLORS.gold:COLORS.border}`,
        borderRadius:8, padding:"11px 14px", color:tipoReporte?COLORS.text:"#9aaea8",
        fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:14,
        fontFamily:"'Manrope', sans-serif", cursor:"pointer", appearance:"auto", transition:"border-color 0.2s",
      }}>
        <option value="" disabled>Selecciona una categoría…</option>
        {TIPOS_REPORTE.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>Asunto</label>
      <input type="text" value={asunto} onChange={e => setAsunto(e.target.value)} placeholder="Título breve del reporte..." style={{ ...inputSm, marginBottom:14, display:"block" }}
        onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
      <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>Descripción</label>
      <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Describe la situación con el mayor detalle posible..." rows={4} style={{ ...taStyle, marginBottom:14 }}
        onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
      <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>Ubicación <span style={{ fontWeight:400 }}>(opcional)</span></label>
      <input type="text" value={ubicacion} onChange={e => setUbicacion(e.target.value)} placeholder="Ej. Sala de cirugía, recepción..." style={{ ...inputSm, marginBottom:20, display:"block" }}
        onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onClose} style={btnCancelStyle}>Cancelar</button>
        <button onClick={submit} style={{ ...btnSubmitStyle, opacity:(tipoReporte&&asunto)?1:0.5 }}>{editData ? "Guardar cambios" : "Enviar reporte"}</button>
      </div>
    </ModalShell>
  );
}

/* ── Modal selector de tipo + routing ── */
function CrearSolicitudModal({ onClose, onSubmit, editData, initialTipo }) {
  const [tipo, setTipo] = useState(editData?.tipo || initialTipo || null);

  function handleSubmit(data) { onSubmit(data); onClose(); }

  if (!tipo) {
    const opciones = [
      { key:"vacaciones", icon:CalendarDays,   label:"Vacaciones", desc:"Días de descanso" },
      { key:"permiso",    icon:FileText,        label:"Permiso",    desc:"Médico, personal u otro" },
      { key:"reporte",    icon:AlertTriangle,   label:"Reporte",    desc:"Daños, incidentes, situaciones" },
    ];
    return (
      <ModalShell onClose={onClose} title="Nueva Solicitud">
        <p style={{ color:COLORS.textMuted, fontSize:13, marginBottom:20 }}>Selecciona el tipo de solicitud:</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:12, marginBottom:16 }}>
          {opciones.map(({ key, icon:Icon, label, desc }) => (
            <button key={key} onClick={() => setTipo(key)} style={{
              flex:"1 1 calc(33% - 8px)", minWidth:90, display:"flex", flexDirection:"column", alignItems:"center", gap:10,
              padding:"20px 12px", borderRadius:12, border:`2px solid ${COLORS.border}`,
              background:COLORS.inputBg, cursor:"pointer", textAlign:"center",
              fontFamily:"'Manrope', sans-serif", transition:"all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=COLORS.gold; e.currentTarget.style.background="rgba(201,162,78,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=COLORS.border; e.currentTarget.style.background=COLORS.inputBg; }}
            >
              <Icon size={26} color={COLORS.gold}/>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:COLORS.green }}>{label}</div>
                <div style={{ fontSize:10, color:COLORS.textMuted, marginTop:2 }}>{desc}</div>
              </div>
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ ...btnCancelStyle, width:"100%" }}>Cancelar</button>
      </ModalShell>
    );
  }

  if (tipo === "vacaciones") return <VacationForm onClose={onClose} onSubmit={handleSubmit} editData={editData}/>;
  if (tipo === "permiso")    return <PermisoForm  onClose={onClose} onSubmit={handleSubmit} editData={editData}/>;
  return <ReporteForm onClose={onClose} onSubmit={handleSubmit} editData={editData}/>;
}

/* ── Item individual de solicitud ── */
function SolicitudItem({ s, onDelete, onEdit }) {
  const enRevision = s.status === "en_revision";
  const isReporte = s.tipo === "reporte";

  const label = s.tipo === "vacaciones"
    ? `Vacaciones${s.endDate ? ` · ${calcWorkDays(s.startDate,s.endDate)} días hábiles` : ""}`
    : s.tipo === "reporte"
    ? (s.asunto || s.tipoReporte || "Reporte")
    : (s.tipoPermiso || "Permiso");

  const sub = isReporte
    ? (s.tipoReporte || "")
    : s.startDate
    ? fmtDate(s.startDate) + (s.endDate ? ` — ${fmtDate(s.endDate)}` : "")
    : "";

  const bgColor = isReporte
    ? (enRevision ? "rgba(201,162,78,0.07)" : "rgba(44,99,86,0.07)")
    : (enRevision ? "rgba(201,162,78,0.07)" : "rgba(44,99,86,0.07)");

  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:8, background: bgColor }}>
      {isReporte
        ? <AlertTriangle size={16} color={enRevision ? COLORS.gold : COLORS.greenSoft}/>
        : enRevision ? <Clock size={16} color={COLORS.gold}/> : <CheckCircle2 size={16} color={COLORS.greenSoft}/>
      }
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

function DashboardHome({ isMobile, setActive, solicitudes, onAdd, onDelete, onUpdate, vacData = {} }) {
  const [modal, setModal] = useState(null); // null | "new-vac" | "new-sol" | solicitud-object(edit)
  const { approvedDays = 0, pendingDays = 0, availableDays = 0, vacationBalance = VAC_TOTAL } = vacData;

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
      {modal === "new-sol" && (
        <CrearSolicitudModal onClose={() => setModal(null)} onSubmit={data => { onAdd(data); setModal(null); }} editData={null} />
      )}
      {modal && typeof modal === "object" && (
        <CrearSolicitudModal onClose={() => setModal(null)} onSubmit={handleSubmit} editData={modal} />
      )}
    <div style={isMobile
      ? { display: "flex", flexDirection: "column", gap: 14 }
      : { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }
    }>

      {/* Vacaciones — datos reales de Supabase */}
      <Card>
        <CardHeader title="Vacaciones"
          action={<button style={verTodosStyle} onClick={() => setActive("vacaciones")}>Ver detalle <ChevronRight size={14}/></button>}
        />
        <div style={{ display:"flex", alignItems:"center", gap:18 }}>
          <VacationDonut used={approvedDays} requested={pendingDays} total={vacationBalance} />
          <div style={{ flex:1, fontSize:13 }}>
            <p style={{ margin:"0 0 5px", color:COLORS.textMuted }}>
              <span style={{ color:COLORS.green, fontWeight:700 }}>{availableDays}</span> días disponibles
            </p>
            {approvedDays > 0 && (
              <p style={{ margin:"0 0 5px", color:COLORS.textMuted, display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ width:8, height:8, borderRadius:2, background:COLORS.gold, display:"inline-block", flexShrink:0 }}/>
                <span style={{ color:COLORS.green, fontWeight:700 }}>{approvedDays}</span> tomados
              </p>
            )}
            {pendingDays > 0 && (
              <p style={{ margin:"0 0 5px", color:COLORS.textMuted, display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ width:8, height:8, borderRadius:2, background:COLORS.goldSoft, display:"inline-block", flexShrink:0 }}/>
                <span style={{ color:COLORS.gold, fontWeight:700 }}>{pendingDays}</span> en solicitud
              </p>
            )}
            <p style={{ margin:"8px 0 0", fontSize:11, color:COLORS.textMuted }}>{vacationBalance} días totales</p>
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
          action={
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <button style={verTodosStyle} onClick={() => setActive("solicitudes")}>Ver todas <ChevronRight size={14} /></button>
              <button onClick={() => setModal("new-sol")} title="Nueva solicitud" style={{
                width:26, height:26, borderRadius:6, border:"none",
                background:`linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
                color:"#FFF", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 2px 8px rgba(201,162,78,0.35)", flexShrink:0,
              }}>
                <Plus size={13}/>
              </button>
            </div>
          }
        />
        {solicitudes.length === 0 ? (
          <p style={{ color:COLORS.textMuted, fontSize:13, margin:0 }}>Sin solicitudes activas.{" "}
            <button onClick={() => setModal("new-sol")} style={{ background:"none", border:"none", color:COLORS.gold, fontWeight:600, fontSize:13, cursor:"pointer", padding:0, fontFamily:"'Manrope', sans-serif" }}>Crear una</button>
          </p>
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

function ProfileSection({ profile }) {
  if (!profile) {
    return (
      <Card>
        <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0 }}>Cargando perfil...</p>
      </Card>
    );
  }

  function fmtHireDate(str) {
    if (!str) return "—";
    const [y, m, d] = str.split("-").map(Number);
    const months = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    return `${d} de ${months[m - 1]} de ${y}`;
  }

  const showRole = profile.role === "admin" || profile.role === "rrhh";
  const row = (label, value) => value ? (
    <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0", borderBottom:`1px solid ${COLORS.border}` }}>
      <span style={{ fontSize:13, color:COLORS.textMuted, fontWeight:600 }}>{label}</span>
      <span style={{ fontSize:13, color:COLORS.text }}>{value}</span>
    </div>
  ) : null;

  return (
    <Card>
      <CardHeader title="Mi perfil" />
      {row("Nombre completo", profile.full_name)}
      {row("Puesto", profile.position)}
      {row("Departamento", profile.department)}
      {row("Fecha de ingreso", fmtHireDate(profile.hire_date))}
      {showRole && (
        <div style={{ marginTop:14 }}>
          <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:COLORS.gold, background:"rgba(201,162,78,0.12)", borderRadius:6, padding:"4px 10px" }}>
            {profile.role === "admin" ? "Administrador" : "RRHH"}
          </span>
        </div>
      )}
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

function VacationSection({ profile, vacationRequests }) {
  const vacationBalance = profile?.vacation_balance ?? 0;
  const approvedDays = vacationRequests.filter(r => r.status === "aprobado").reduce((a, r) => a + (r.days_requested ?? 0), 0);
  const pendingDays  = vacationRequests.filter(r => r.status === "pendiente").reduce((a, r) => a + (r.days_requested ?? 0), 0);
  const availableDays = Math.max(0, vacationBalance - approvedDays);

  const statBox = (label, value, color) => (
    <div style={{ flex:1, textAlign:"center", padding:"16px 8px" }}>
      <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:42, fontWeight:700, color, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:4, fontWeight:600, letterSpacing:"0.03em" }}>{label}</div>
    </div>
  );

  const statusStyle = (status) => ({
    aprobado:  { color:"#2C6356", background:"rgba(44,99,86,0.1)"  },
    pendiente: { color:COLORS.gold, background:"rgba(201,162,78,0.1)" },
    rechazado: { color:"#c0392b", background:"rgba(192,57,43,0.1)"  },
  }[status] ?? { color:COLORS.textMuted, background:COLORS.panelAlt });

  function fmtSupaDate(str) {
    if (!str) return "—";
    const d = new Date(str + "T12:00:00");
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0,3)} ${d.getFullYear()}`;
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Card>
        <CardHeader title="Saldo de vacaciones" />
        <div style={{ display:"flex", borderTop:`1px solid ${COLORS.border}`, marginTop:4 }}>
          {statBox("Disponibles", availableDays, COLORS.green)}
          <div style={{ width:1, background:COLORS.border, margin:"12px 0" }}/>
          {statBox("Tomados", approvedDays, COLORS.gold)}
          <div style={{ width:1, background:COLORS.border, margin:"12px 0" }}/>
          {statBox("En solicitud", pendingDays, COLORS.goldSoft)}
        </div>
        <p style={{ margin:"12px 0 0", fontSize:11, color:COLORS.textMuted, textAlign:"center" }}>
          Saldo total: <strong>{vacationBalance}</strong> días
        </p>
      </Card>

      <Card>
        <CardHeader title="Historial de solicitudes" />
        {vacationRequests.length === 0 ? (
          <p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>Aún no tienes solicitudes registradas.</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {vacationRequests.map((r, i) => {
              const st = statusStyle(r.status);
              return (
                <div key={r.id ?? i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:`1px solid ${COLORS.border}` }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, color:COLORS.text, fontWeight:500 }}>
                      {fmtSupaDate(r.start_date)}
                      {r.end_date ? ` — ${fmtSupaDate(r.end_date)}` : ""}
                    </div>
                    <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:2 }}>
                      {r.days_requested ?? "—"} días hábiles
                    </div>
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, borderRadius:5, padding:"3px 9px", letterSpacing:"0.04em", ...st }}>
                    {r.status ?? "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function Dashboard({ onLogout, profile, vacationRequests }) {
  const [active, setActive] = useState("inicio");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const isMobile = useIsMobile();
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const sectionTitle = { inicio: "Inicio", vacaciones: "Vacaciones", comunicados: "Comunicados", documentos: "Documentos", solicitudes: "Solicitudes", perfil: "Mi perfil" }[active];

  const vacationBalance = profile?.vacation_balance ?? 0;
  const approvedDays  = vacationRequests.filter(r => r.status === "aprobado").reduce((a, r) => a + (r.days_requested ?? 0), 0);
  const pendingDays   = vacationRequests.filter(r => r.status === "pendiente").reduce((a, r) => a + (r.days_requested ?? 0), 0);
  const availableDays = Math.max(0, vacationBalance - approvedDays);
  const vacData = { approvedDays, pendingDays, availableDays, vacationBalance };

  function getInitials(name) {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  }
  const initials = getInitials(profile?.full_name);

  const hour = new Date().getHours();
  const timeGreeting = hour >= 5 && hour < 12 ? "Buenos días"
    : hour >= 12 && hour < 19 ? "Buenas tardes"
    : "Buenas noches";
  const greeting = profile?.full_name
    ? `${timeGreeting}, ${profile.full_name.split(" ")[0]}`
    : timeGreeting;

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
            {active === "inicio" ? greeting : sectionTitle}
          </h1>
          {active === "inicio" ? <DashboardHome isMobile={true} setActive={setActive} {...solProps} vacData={vacData} /> : active === "vacaciones" ? <VacationSection profile={profile} vacationRequests={vacationRequests} /> : active === "solicitudes" ? <SolicitudesSection {...solProps} /> : active === "perfil" ? <ProfileSection profile={profile} /> : <PlaceholderSection title={sectionTitle} />}
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
            {active === "inicio" ? greeting : sectionTitle}
          </h1>
        </div>
        {active === "inicio" ? <DashboardHome isMobile={false} setActive={setActive} {...solProps} vacData={vacData} /> : active === "vacaciones" ? <VacationSection profile={profile} vacationRequests={vacationRequests} /> : active === "solicitudes" ? <SolicitudesSection {...solProps} /> : active === "perfil" ? <ProfileSection profile={profile} /> : <PlaceholderSection title={sectionTitle} />}
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = logged out
  const [profile, setProfile] = useState(null);
  const [vacationRequests, setVacationRequests] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null);
      if (!s) { setProfile(null); setVacationRequests([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => { if (data) setProfile(data); });
    supabase
      .from("requests")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("type", "vacaciones")
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setVacationRequests(data); });
  }, [session]);

  if (session === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.bg, fontFamily: "'Manrope', sans-serif", color: COLORS.textMuted, fontSize: 14 }}>
        Cargando...
      </div>
    );
  }

  return (
    <div>
      <style>{FONTS}</style>
      {session
        ? <Dashboard onLogout={() => supabase.auth.signOut()} profile={profile} vacationRequests={vacationRequests} />
        : <LoginScreen onLogin={() => {}} />
      }
    </div>
  );
}

