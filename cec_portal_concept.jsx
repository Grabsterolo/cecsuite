import React, { useState, useEffect, useCallback } from "react";
import {
  Bell, FileText, CalendarDays, CalendarCheck, User, LogOut,
  Home, ChevronRight, ChevronLeft, Download, Clock, CheckCircle2, Cake, Menu, X, Plus, Edit2, Trash2, AlertTriangle, ClipboardCheck, Megaphone,
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
function MobileDrawer({ open, onClose, active, setActive, onLogout, profile, pendingApprovalCount = 0 }) {
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
          {(profile?.role === "admin" || profile?.role === "rrhh") && (
            <>
              <div style={{ height:1, background:"rgba(255,255,255,0.08)", margin:"10px 4px 6px" }} />
              <div style={{ fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(255,255,255,0.35)", fontWeight:700, padding:"0 14px 4px" }}>Administración</div>
              <button onClick={() => { setActive("aprobaciones"); onClose(); }} style={{
                display:"flex", alignItems:"center", gap:14,
                padding:"12px 14px", borderRadius:10, border:"none",
                cursor:"pointer", textAlign:"left", fontSize:15, fontWeight:600,
                fontFamily:"'Manrope', sans-serif",
                color: active === "aprobaciones" ? "#FFF" : COLORS.sidebarMuted,
                background: active === "aprobaciones" ? `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})` : "transparent",
                transition:"background 0.15s, color 0.15s",
              }}>
                <ClipboardCheck size={19} />Aprobaciones
                {pendingApprovalCount > 0 && (
                  <span style={{
                    marginLeft:"auto", minWidth:20, height:20, borderRadius:10,
                    background: active === "aprobaciones" ? "rgba(255,255,255,0.3)" : COLORS.gold,
                    color:"#FFF", fontSize:11, fontWeight:700,
                    display:"flex", alignItems:"center", justifyContent:"center", padding:"0 6px",
                  }}>{pendingApprovalCount}</span>
                )}
              </button>
              <button onClick={() => { setActive("comunicados-admin"); onClose(); }} style={{
                display:"flex", alignItems:"center", gap:14,
                padding:"12px 14px", borderRadius:10, border:"none",
                cursor:"pointer", textAlign:"left", fontSize:15, fontWeight:600,
                fontFamily:"'Manrope', sans-serif",
                color: active === "comunicados-admin" ? "#FFF" : COLORS.sidebarMuted,
                background: active === "comunicados-admin" ? `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})` : "transparent",
                transition:"background 0.15s, color 0.15s",
              }}>
                <Megaphone size={19} />Gestionar comunicados
              </button>
            </>
          )}
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

function Sidebar({ active, setActive, onLogout, profile, pendingApprovalCount = 0 }) {
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
        {(profile?.role === "admin" || profile?.role === "rrhh") && (
          <>
            <div style={{ height:1, background:"rgba(255,255,255,0.08)", margin:"10px 4px 6px" }} />
            <div style={{ fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(255,255,255,0.35)", fontWeight:700, padding:"0 14px 4px" }}>Administración</div>
            {(() => {
              const isActive = active === "aprobaciones";
              return (
                <button
                  onClick={() => setActive("aprobaciones")}
                  style={{
                    display:"flex", alignItems:"center", gap:12,
                    padding:"10px 14px", borderRadius:8, border:"none",
                    cursor:"pointer", textAlign:"left",
                    fontSize:14, fontWeight:600,
                    fontFamily:"'Manrope', sans-serif",
                    color: isActive ? "#FFFFFF" : COLORS.sidebarMuted,
                    background: isActive ? `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})` : "transparent",
                    transition:"background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background="rgba(255,255,255,0.08)"; e.currentTarget.style.color="#FFFFFF"; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color=COLORS.sidebarMuted; } }}
                >
                  <ClipboardCheck size={16} />Aprobaciones
                  {pendingApprovalCount > 0 && (
                    <span style={{
                      marginLeft:"auto", minWidth:18, height:18, borderRadius:9,
                      background: isActive ? "rgba(255,255,255,0.3)" : COLORS.gold,
                      color:"#FFF", fontSize:10, fontWeight:700,
                      display:"flex", alignItems:"center", justifyContent:"center", padding:"0 5px",
                    }}>{pendingApprovalCount}</span>
                  )}
                </button>
              );
            })()}
            {(() => {
              const isActive2 = active === "comunicados-admin";
              return (
                <button
                  onClick={() => setActive("comunicados-admin")}
                  style={{
                    display:"flex", alignItems:"center", gap:12,
                    padding:"10px 14px", borderRadius:8, border:"none",
                    cursor:"pointer", textAlign:"left",
                    fontSize:14, fontWeight:600,
                    fontFamily:"'Manrope', sans-serif",
                    color: isActive2 ? "#FFFFFF" : COLORS.sidebarMuted,
                    background: isActive2 ? `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})` : "transparent",
                    transition:"background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={e => { if (!isActive2) { e.currentTarget.style.background="rgba(255,255,255,0.08)"; e.currentTarget.style.color="#FFFFFF"; } }}
                  onMouseLeave={e => { if (!isActive2) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color=COLORS.sidebarMuted; } }}
                >
                  <Megaphone size={16} />Gestionar comunicados
                </button>
              );
            })()}
          </>
        )}
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


function fmtSupaDate(str) {
  if (!str) return "—";
  const d = new Date(str + "T12:00:00");
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0,3)} ${d.getFullYear()}`;
}
function fmtSupaShort(str) {
  if (!str) return "—";
  const d = new Date(str + "T12:00:00");
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0,3).toLowerCase()}`;
}

function StatusBadge({ status }) {
  const styles = {
    pendiente: { color: COLORS.gold,    background: "rgba(201,162,78,0.12)" },
    aprobado:  { color: "#2C6356",      background: "rgba(44,99,86,0.1)"    },
    rechazado: { color: "#c0392b",      background: "rgba(192,57,43,0.1)"   },
  };
  const s = styles[status] ?? { color: COLORS.textMuted, background: COLORS.panelAlt };
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "—";
  return (
    <span style={{ fontSize:11, fontWeight:700, borderRadius:5, padding:"3px 9px", letterSpacing:"0.04em", whiteSpace:"nowrap", ...s }}>
      {label}
    </span>
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
function VacationForm({ onClose, onSubmit, editData, onNewRequest }) {
  const [startDate, setStartDate] = useState(editData?.startDate || null);
  const [endDate,   setEndDate]   = useState(editData?.endDate   || null);
  const [comment,   setComment]   = useState(editData?.comment   || "");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const wd = calcWorkDays(startDate, endDate);
  const toDate = (d) => d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` : null;

  async function submit() {
    setError(null);
    if (!startDate) return;
    if (editData) { onSubmit({ tipo:"vacaciones", startDate, endDate, comment }); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error: insertError } = await supabase.from("requests").insert({
      user_id: user?.id,
      type: "vacaciones",
      status: "pendiente",
      start_date: toDate(startDate),
      end_date: toDate(endDate),
      days_requested: wd,
      comment: comment.trim() || null,
    }).select().single();
    setLoading(false);
    if (insertError) { setError(insertError.message); return; }
    if (onNewRequest) onNewRequest(data);
    onClose();
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
      <div style={{ marginTop:14 }}>
        <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>Comentario <span style={{ fontWeight:400 }}>(opcional)</span></label>
        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Información adicional..." rows={2} style={taStyle}
          onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
      </div>
      {error && <p style={{ fontSize:12, color:"#e07070", margin:"12px 0 0" }}>{error}</p>}
      <div style={{ display:"flex", gap:10, marginTop:20 }}>
        <button onClick={onClose} style={btnCancelStyle}>Cancelar</button>
        <button onClick={submit} disabled={loading} style={{ ...btnSubmitStyle, opacity:(startDate&&!loading)?1:0.5, cursor:loading?"not-allowed":"pointer" }}>
          {loading ? "Enviando..." : editData ? "Guardar cambios" : "Solicitar"}
        </button>
      </div>
    </ModalShell>
  );
}

/* ── Formulario permiso ── */
function PermisoForm({ onClose, onSubmit, editData, onNewRequest }) {
  const [tipoPermiso, setTipoPermiso] = useState(editData?.tipoPermiso || "");
  const [startDate, setStartDate] = useState(editData?.startDate || null);
  const [endDate,   setEndDate]   = useState(editData?.endDate   || null);
  const [notes,     setNotes]     = useState(editData?.notes || "");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  const workDays = calcWorkDays(startDate, endDate);

  async function submit() {
    setError(null);
    if (!tipoPermiso || !startDate) return;
    if (editData) { onSubmit({ tipo:"permiso", tipoPermiso, startDate, endDate, notes }); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const toDate = (d) => d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` : null;
    const { data, error: insertError } = await supabase.from("requests").insert({
      user_id: user?.id,
      type: "permiso",
      category: tipoPermiso,
      status: "pendiente",
      start_date: toDate(startDate),
      end_date: toDate(endDate),
      days_requested: workDays,
      comment: notes.trim() || null,
    }).select().single();
    setLoading(false);
    if (insertError) { setError(insertError.message); return; }
    if (onNewRequest) onNewRequest(data);
    onClose();
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
          {endDate && <>
            <div style={{ marginTop:2 }}><span style={{ fontWeight:600, color:COLORS.green }}>Fin: </span>{fmtDate(endDate)}</div>
            <div style={{ marginTop:2 }}><span style={{ fontWeight:700, color:COLORS.gold }}>{workDays} días hábiles</span></div>
          </>}
        </div>
      )}
      <div style={{ marginTop:14 }}>
        <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>Notas adicionales</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Información adicional o justificación..." rows={2} style={taStyle}
          onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
      </div>
      {error && <p style={{ fontSize:12, color:"#e07070", margin:"12px 0 0" }}>{error}</p>}
      <div style={{ display:"flex", gap:10, marginTop:20 }}>
        <button onClick={onClose} style={btnCancelStyle}>Cancelar</button>
        <button onClick={submit} disabled={loading} style={{ ...btnSubmitStyle, opacity:(tipoPermiso&&startDate&&!loading)?1:0.5, cursor:loading?"not-allowed":"pointer" }}>
          {loading ? "Enviando..." : editData ? "Guardar cambios" : "Solicitar"}
        </button>
      </div>
    </ModalShell>
  );
}

/* ── Formulario reporte ── */
function ReporteForm({ onClose, onSubmit, editData, onNewReport }) {
  const [category,    setCategory]    = useState(editData?.tipoReporte || "");
  const [description, setDescription] = useState(editData?.descripcion || "");
  const [location,    setLocation]    = useState(editData?.ubicacion || "");
  const [file,        setFile]        = useState(null);
  const [preview,     setPreview]     = useState(null);
  const [loadingMsg,  setLoadingMsg]  = useState(null); // null = idle
  const [error,       setError]       = useState(null);

  function handleFile(e) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = ev => setPreview(ev.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }

  async function submit() {
    setError(null);
    if (!category || !description.trim()) return;
    if (editData) { onSubmit({ tipo:"reporte", tipoReporte:category, descripcion:description, ubicacion:location }); return; }

    setLoadingMsg("Enviando...");
    const { data: { user } } = await supabase.auth.getUser();
    let photo_url = null;

    if (file) {
      setLoadingMsg("Subiendo foto...");
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("reports").upload(fileName, file);
      if (uploadError) { setError(uploadError.message); setLoadingMsg(null); return; }
      const { data: urlData } = supabase.storage.from("reports").getPublicUrl(fileName);
      photo_url = urlData.publicUrl;
      setLoadingMsg("Enviando...");
    }

    const { data, error: insertError } = await supabase.from("reports").insert({
      user_id: user.id,
      category,
      description: description.trim(),
      location: location.trim() || null,
      photo_url,
      status: "pendiente",
    }).select().single();

    setLoadingMsg(null);
    if (insertError) { setError(insertError.message); return; }
    if (onNewReport) onNewReport(data);
    onClose();
  }

  const inputSm = { ...taStyle, resize:"none", height:40, padding:"10px 14px", fontSize:14 };
  const loading = !!loadingMsg;

  return (
    <ModalShell onClose={onClose} title={editData ? "Editar reporte" : "Nuevo Reporte"}>
      <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>Tipo de reporte</label>
      <select value={category} onChange={e => setCategory(e.target.value)} style={{
        width:"100%", background:COLORS.inputBg, border:`1.5px solid ${category?COLORS.gold:COLORS.border}`,
        borderRadius:8, padding:"11px 14px", color:category?COLORS.text:"#9aaea8",
        fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:14,
        fontFamily:"'Manrope', sans-serif", cursor:"pointer", appearance:"auto", transition:"border-color 0.2s",
      }}>
        <option value="" disabled>Selecciona una categoría…</option>
        {TIPOS_REPORTE.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>Descripción</label>
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe la situación con el mayor detalle posible..." rows={4} style={{ ...taStyle, marginBottom:14 }}
        onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
      <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>Ubicación <span style={{ fontWeight:400 }}>(opcional)</span></label>
      <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Ej. Sala de cirugía, recepción..." style={{ ...inputSm, marginBottom:14, display:"block" }}
        onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
      <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>Foto <span style={{ fontWeight:400 }}>(opcional)</span></label>
      <label style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, cursor:"pointer" }}>
        <div style={{ flex:1, background:COLORS.inputBg, border:`1.5px dashed ${COLORS.border}`, borderRadius:8, padding:"10px 14px", fontSize:13, color:COLORS.textMuted, fontFamily:"'Manrope', sans-serif" }}>
          {file ? file.name : "Adjuntar foto (opcional)"}
        </div>
        <input type="file" accept="image/*" onChange={handleFile} style={{ display:"none" }} />
      </label>
      {preview && (
        <div style={{ marginBottom:14 }}>
          <img src={preview} alt="vista previa" style={{ width:"100%", maxHeight:160, objectFit:"cover", borderRadius:8, border:`1px solid ${COLORS.border}` }} />
        </div>
      )}
      {error && <p style={{ fontSize:12, color:"#e07070", margin:"0 0 12px" }}>{error}</p>}
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onClose} style={btnCancelStyle}>Cancelar</button>
        <button onClick={submit} disabled={loading} style={{ ...btnSubmitStyle, opacity:(category&&description.trim()&&!loading)?1:0.5, cursor:loading?"not-allowed":"pointer" }}>
          {loadingMsg ?? (editData ? "Guardar cambios" : "Enviar reporte")}
        </button>
      </div>
    </ModalShell>
  );
}

/* ── Modal selector de tipo + routing ── */
function CrearSolicitudModal({ onClose, onSubmit, editData, initialTipo, onNewRequest, onNewReport }) {
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

  if (tipo === "vacaciones") return <VacationForm onClose={onClose} onSubmit={handleSubmit} editData={editData} onNewRequest={onNewRequest}/>;
  if (tipo === "permiso")    return <PermisoForm  onClose={onClose} onSubmit={handleSubmit} editData={editData} onNewRequest={onNewRequest}/>;
  return <ReporteForm onClose={onClose} onSubmit={handleSubmit} editData={editData} onNewReport={onNewReport}/>;
}

/* ── Item individual de solicitud ── */
function SolicitudItem({ s }) {
  const isReport = s.kind === "report";
  const icon = isReport
    ? <AlertTriangle size={15} color={s.status === "pendiente" ? COLORS.gold : s.status === "aprobado" ? COLORS.greenSoft : "#c0392b"} />
    : s.status === "aprobado" ? <CheckCircle2 size={15} color={COLORS.greenSoft} />
    : <Clock size={15} color={s.status === "pendiente" ? COLORS.gold : COLORS.textMuted} />;
  const dateStr = s.created_at ? fmtSupaDate(s.created_at.slice(0,10)) : "";
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"11px 12px", borderRadius:8, background:"rgba(31,74,64,0.04)", border:`1px solid ${COLORS.border}` }}>
      <div style={{ marginTop:1, flexShrink:0 }}>{icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ color:COLORS.text, fontWeight:600, fontSize:13 }}>{s.label}</div>
        {s.subtitle && <div style={{ color:COLORS.textMuted, fontSize:11, marginTop:2, lineHeight:1.5 }}>{s.subtitle}</div>}
        {s.location && <div style={{ color:COLORS.textMuted, fontSize:11, marginTop:2 }}>📍 {s.location}</div>}
        {dateStr && <div style={{ color:COLORS.textMuted, fontSize:11, marginTop:3 }}>{dateStr}</div>}
      </div>
      {s.photo_url && (
        <img src={s.photo_url} alt="foto" style={{ width:44, height:44, borderRadius:6, objectFit:"cover", flexShrink:0, border:`1px solid ${COLORS.border}` }} />
      )}
      <div style={{ flexShrink:0, marginTop:1 }}><StatusBadge status={s.status} /></div>
    </div>
  );
}

const verTodosStyle = {
  display: "flex", alignItems: "center", gap: 4,
  fontSize: 12, color: COLORS.gold, cursor: "pointer",
  fontWeight: 600, background: "none", border: "none",
  fontFamily: "'Manrope', sans-serif", padding: 0,
};

function DashboardHome({ isMobile, setActive, allSolicitudes = [], vacData = {}, announcements = [], documents = [], upcomingBirthdays = [], onNewRequest, onNewReport }) {
  const [modal, setModal] = useState(null); // null | "new-sol"
  const { approvedDays = 0, pendingDays = 0, availableDays = 0, vacationBalance = VAC_TOTAL } = vacData;

  return (
    <>
      {modal === "new-sol" && (
        <CrearSolicitudModal onClose={() => setModal(null)} onSubmit={() => setModal(null)} editData={null} onNewRequest={onNewRequest} onNewReport={onNewReport} />
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
        {announcements.length === 0 ? (
          <p style={{ color:COLORS.textMuted, fontSize:13, margin:0 }}>No hay comunicados recientes.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {announcements.slice(0, 3).map((a, i) => {
              const d = a.publish_at ? new Date(a.publish_at) : null;
              const dateStr = d ? `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0,3)}` : "";
              return (
                <div key={a.id ?? i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  paddingBottom: 14, borderBottom: `1px solid ${COLORS.border}`,
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <div style={{ fontSize: 14, color: COLORS.text, fontWeight: 500 }}>{a.title}</div>
                    {a.tag && <Tag label={a.tag} />}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", marginLeft: 16 }}>
                    <Clock size={12} />{dateStr}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Documentos */}
      <Card>
        <CardHeader title="Documentos"
          action={<button style={verTodosStyle} onClick={() => setActive("documentos")}>Ver todos <ChevronRight size={14} /></button>}
        />
        {documents.length === 0 ? (
          <p style={{ color:COLORS.textMuted, fontSize:13, margin:0 }}>No hay documentos disponibles.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {documents.slice(0, 4).map((doc, i) => (
              <div key={doc.id ?? i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:13, color:COLORS.text, padding:"9px 0", borderBottom:`1px solid ${COLORS.border}` }}>
                <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <FileText size={14} color={COLORS.textMuted} />{doc.title}
                </span>
                {doc.file_url && (
                  <a href={doc.file_url} target="_blank" rel="noreferrer">
                    <Download size={14} color={COLORS.gold} style={{ cursor:"pointer", flexShrink:0 }} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Solicitudes — 3 más recientes */}
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
        {allSolicitudes.length === 0 ? (
          <p style={{ color:COLORS.textMuted, fontSize:13, margin:0 }}>Sin solicitudes activas.{" "}
            <button onClick={() => setModal("new-sol")} style={{ background:"none", border:"none", color:COLORS.gold, fontWeight:600, fontSize:13, cursor:"pointer", padding:0, fontFamily:"'Manrope', sans-serif" }}>Crear una</button>
          </p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {allSolicitudes.slice(0,3).map(s => (
              <SolicitudItem key={`${s.kind}-${s.id}`} s={s} />
            ))}
          </div>
        )}
      </Card>

      {/* Cumpleaños */}
      <Card>
        <CardHeader title="Próximos cumpleaños" />
        {upcomingBirthdays.length === 0 ? (
          <p style={{ color:COLORS.textMuted, fontSize:13, margin:0 }}>No hay cumpleaños próximos.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", fontSize: 13 }}>
            {upcomingBirthdays.slice(0, 3).map((b) => (
              <div key={b.full_name} style={{
                display: "flex", alignItems: "center", gap: 10,
                color: COLORS.text, padding: "9px 0",
                borderBottom: `1px solid ${COLORS.border}`,
              }}>
                <Cake size={16} color={COLORS.gold} />
                {b.full_name}
                <span style={{ marginLeft: "auto", color: COLORS.textMuted, fontSize: 12 }}>{b.date}</span>
              </div>
            ))}
          </div>
        )}
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

function SolicitudesSection({ allSolicitudes = [], onNewRequest, onNewReport }) {
  const [modal, setModal] = useState(false);

  return (
    <div>
      {modal && (
        <CrearSolicitudModal
          onClose={() => setModal(false)}
          onSubmit={() => setModal(false)}
          editData={null}
          onNewRequest={onNewRequest}
          onNewReport={onNewReport}
        />
      )}
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:20 }}>
        <button onClick={() => setModal(true)} style={{
          display:"flex", alignItems:"center", gap:8,
          background:`linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
          border:"none", borderRadius:8, padding:"10px 18px",
          color:"#FFF", fontSize:14, fontWeight:700, cursor:"pointer",
          fontFamily:"'Manrope', sans-serif", boxShadow:"0 4px 14px rgba(201,162,78,0.35)",
        }}><Plus size={16}/> Nueva solicitud</button>
      </div>
      <Card>
        <CardHeader title="Mis solicitudes" />
        {allSolicitudes.length === 0 ? (
          <p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>No tienes solicitudes. Crea una con el botón de arriba.</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {allSolicitudes.map(s => <SolicitudItem key={`${s.kind}-${s.id}`} s={s} />)}
          </div>
        )}
      </Card>
    </div>
  );
}

function DocumentsSection({ documents }) {
  if (documents.length === 0) {
    return <Card><p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>No hay documentos disponibles.</p></Card>;
  }

  const categories = [...new Set(documents.map(d => d.category).filter(Boolean))];
  const multiCat = categories.length > 1;

  const DocRow = ({ doc }) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${COLORS.border}` }}>
      <span style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:COLORS.text, fontWeight:500 }}>
        <FileText size={14} color={COLORS.textMuted} />{doc.title}
      </span>
      {doc.file_url && (
        <a href={doc.file_url} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:5, color:COLORS.gold, fontSize:12, fontWeight:600, textDecoration:"none", fontFamily:"'Manrope', sans-serif", flexShrink:0, marginLeft:12 }}>
          <Download size={14} />Descargar
        </a>
      )}
    </div>
  );

  if (!multiCat) {
    return (
      <Card>
        <CardHeader title="Documentos" />
        <div style={{ display:"flex", flexDirection:"column" }}>
          {documents.map((doc, i) => <DocRow key={doc.id ?? i} doc={doc} />)}
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {categories.map(cat => {
        const catDocs = documents.filter(d => d.category === cat);
        return (
          <Card key={cat}>
            <CardHeader title={cat} />
            <div style={{ display:"flex", flexDirection:"column" }}>
              {catDocs.map((doc, i) => <DocRow key={doc.id ?? i} doc={doc} />)}
            </div>
          </Card>
        );
      })}
      {documents.filter(d => !d.category).length > 0 && (
        <Card>
          <CardHeader title="General" />
          <div style={{ display:"flex", flexDirection:"column" }}>
            {documents.filter(d => !d.category).map((doc, i) => <DocRow key={doc.id ?? i} doc={doc} />)}
          </div>
        </Card>
      )}
    </div>
  );
}

function AnnouncementsSection({ announcements }) {
  function fmtFull(str) {
    if (!str) return "—";
    const d = new Date(str);
    const months = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
  }
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {announcements.length === 0 ? (
        <Card><p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>No hay comunicados disponibles.</p></Card>
      ) : announcements.map((a, i) => (
        <Card key={a.id ?? i}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <Tag label={a.tag || "Aviso"} />
            <span style={{ fontSize:12, color:COLORS.textMuted }}>{fmtFull(a.publish_at)}</span>
          </div>
          <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, fontWeight:600, color:COLORS.green, margin:"0 0 10px", lineHeight:1.3 }}>{a.title}</h3>
          {a.body && <p style={{ fontSize:14, color:COLORS.text, lineHeight:1.7, margin:0, whiteSpace:"pre-wrap" }}>{a.body}</p>}
        </Card>
      ))}
    </div>
  );
}

function VacationSection({ profile, vacationRequests, onNewRequest }) {
  const vacationBalance = profile?.vacation_balance ?? VAC_TOTAL;
  const approvedDays  = vacationRequests.filter(r => r.status === "aprobado").reduce((a, r) => a + (r.days_requested ?? 0), 0);
  const pendingDays   = vacationRequests.filter(r => r.status === "pendiente").reduce((a, r) => a + (r.days_requested ?? 0), 0);
  const availableDays = Math.max(0, vacationBalance - approvedDays);
  const [showModal, setShowModal] = useState(false);

  const statBox = (label, value, color) => (
    <div style={{ flex:1, textAlign:"center", padding:"16px 8px" }}>
      <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:42, fontWeight:700, color, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:4, fontWeight:600, letterSpacing:"0.03em" }}>{label}</div>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {showModal && (
        <CrearSolicitudModal
          onClose={() => setShowModal(false)}
          onSubmit={() => setShowModal(false)}
          editData={null}
          initialTipo="vacaciones"
          onNewRequest={onNewRequest}
          onNewReport={() => {}}
        />
      )}

      {/* Saldo */}
      <Card>
        <CardHeader title="Saldo de vacaciones"
          action={
            <button onClick={() => setShowModal(true)} style={{
              display:"flex", alignItems:"center", gap:6,
              background:`linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
              border:"none", borderRadius:7, padding:"7px 14px",
              color:"#FFF", fontSize:13, fontWeight:700, cursor:"pointer",
              fontFamily:"'Manrope', sans-serif", boxShadow:"0 3px 10px rgba(201,162,78,0.35)",
            }}><Plus size={14}/> Solicitar</button>
          }
        />
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

      {/* Historial */}
      <Card>
        <CardHeader title="Historial de solicitudes" />
        {vacationRequests.length === 0 ? (
          <p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>Aún no tienes solicitudes registradas.</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {vacationRequests.map((r, i) => (
              <div key={r.id ?? i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:`1px solid ${COLORS.border}` }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, color:COLORS.text, fontWeight:500 }}>
                    {fmtSupaDate(r.start_date)}{r.end_date ? ` — ${fmtSupaDate(r.end_date)}` : ""}
                  </div>
                  <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:2 }}>
                    {r.days_requested ?? "—"} días hábiles
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function GestionComunicadosSection({ adminAnnouncements = [], departments = [], onNewAnnouncement }) {
  const nowLocal = () => {
    const d = new Date();
    d.setSeconds(0, 0);
    return d.toISOString().slice(0, 16);
  };
  const [title,     setTitle]     = useState("");
  const [tag,       setTag]       = useState("");
  const [body,      setBody]      = useState("");
  const [audience,  setAudience]  = useState("todos");
  const [publishAt, setPublishAt] = useState(nowLocal);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [success,   setSuccess]   = useState(false);

  async function handlePublish() {
    setError(null);
    setSuccess(false);
    if (!title.trim() || !body.trim()) { setError("El título y el contenido son obligatorios."); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error: insertError } = await supabase.from("announcements").insert({
      title: title.trim(),
      tag:   tag.trim() || null,
      body:  body.trim(),
      audience,
      publish_at: new Date(publishAt).toISOString(),
      created_by: user.id,
    }).select().single();
    setLoading(false);
    if (insertError) { setError(insertError.message); return; }
    onNewAnnouncement(data);
    setTitle(""); setTag(""); setBody(""); setAudience("todos"); setPublishAt(nowLocal());
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  }

  const fieldLabel = (text) => (
    <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>{text}</label>
  );
  const dateInputStyle = { ...inputStyle, fontSize:14, padding:"10px 14px" };

  function fmtPublishAt(str) {
    if (!str) return "—";
    const d = new Date(str);
    const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  }

  const now = new Date();

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* Formulario */}
      <Card>
        <CardHeader title="Nuevo comunicado" />
        {fieldLabel("Título")}
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título del comunicado" style={{ ...dateInputStyle, marginBottom:14, display:"block" }}
          onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
          <div>
            {fieldLabel("Etiqueta")}
            <input type="text" value={tag} onChange={e => setTag(e.target.value)} placeholder="Ej. General, Operaciones" style={dateInputStyle}
              onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
          </div>
          <div>
            {fieldLabel("Audiencia")}
            <select value={audience} onChange={e => setAudience(e.target.value)} style={{
              width:"100%", background:COLORS.inputBg, border:`1.5px solid ${COLORS.border}`,
              borderRadius:8, padding:"11px 14px", color:COLORS.text,
              fontSize:14, outline:"none", boxSizing:"border-box",
              fontFamily:"'Manrope', sans-serif", cursor:"pointer", appearance:"auto",
            }}>
              <option value="todos">Todos</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        {fieldLabel("Contenido")}
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Escribe el contenido del comunicado..." rows={4} style={{ ...taStyle, marginBottom:14 }}
          onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        {fieldLabel("Fecha y hora de publicación")}
        <input type="datetime-local" value={publishAt} onChange={e => setPublishAt(e.target.value)} style={{ ...dateInputStyle, marginBottom:16, display:"block" }}
          onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        {error   && <p style={{ fontSize:12, color:"#e07070", margin:"0 0 12px" }}>{error}</p>}
        {success && <p style={{ fontSize:12, color:COLORS.greenSoft, fontWeight:600, margin:"0 0 12px" }}>✓ Comunicado publicado correctamente.</p>}
        <button onClick={handlePublish} disabled={loading} style={{
          ...btnSubmitStyle, width:"100%", opacity: loading ? 0.75 : 1, cursor: loading ? "not-allowed" : "pointer",
        }}>
          {loading ? "Publicando..." : "Publicar comunicado"}
        </button>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader title="Comunicados creados" />
        {adminAnnouncements.length === 0 ? (
          <p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>No hay comunicados creados.</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column" }}>
            {adminAnnouncements.map((a, i) => {
              const isScheduled = a.publish_at && new Date(a.publish_at) > now;
              return (
                <div key={a.id ?? i} style={{ padding:"12px 0", borderBottom:`1px solid ${COLORS.border}`, display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:COLORS.text, marginBottom:4 }}>{a.title}</div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center", marginBottom:4 }}>
                      {a.tag && <Tag label={a.tag} />}
                      <span style={{ fontSize:11, color:COLORS.textMuted }}>
                        Audiencia: <strong>{a.audience === "todos" ? "Todos" : a.audience}</strong>
                      </span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      <span style={{ fontSize:11, color:COLORS.textMuted }}>{fmtPublishAt(a.publish_at)}</span>
                      {isScheduled && (
                        <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.06em", padding:"2px 7px", borderRadius:4, background:"rgba(100,140,220,0.12)", color:"#5a7ec7" }}>
                          PROGRAMADO
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function AprobacionesSection({ adminRequests = [], adminReports = [], onUpdateAdminRequest, onUpdateAdminReport }) {
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState({});

  const allItems = [
    ...adminRequests.map(r => ({
      id: r.id, kind: "request",
      employeeName: r.profiles?.full_name ?? "—",
      department:   r.profiles?.department ?? "",
      label:   r.type === "vacaciones" ? "Vacaciones" : (r.category || "Permiso"),
      subtitle: r.start_date
        ? `${fmtSupaDate(r.start_date)}${r.end_date ? ` — ${fmtSupaDate(r.end_date)}` : ""} · ${r.days_requested ?? 0} días`
        : "",
      comment: r.comment || null,
      status: r.status, created_at: r.created_at,
    })),
    ...adminReports.map(r => ({
      id: r.id, kind: "report",
      employeeName: r.profiles?.full_name ?? "—",
      department:   r.profiles?.department ?? "",
      label:     r.category || "Reporte",
      subtitle:  r.description || "",
      location:  r.location,
      photo_url: r.photo_url,
      status: r.status, created_at: r.created_at,
    })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const pendientes = allItems.filter(i => i.status === "pendiente");
  const resueltos  = allItems.filter(i => i.status !== "pendiente");

  async function handleAction(item, newStatus) {
    const key = `${item.kind}-${item.id}`;
    setLoading(prev => ({ ...prev, [key]: newStatus }));
    setErrors(prev => ({ ...prev, [key]: null }));
    const { data: { user } } = await supabase.auth.getUser();
    const table = item.kind === "request" ? "requests" : "reports";
    const { error } = await supabase.from(table).update({
      status: newStatus,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", item.id);
    setLoading(prev => ({ ...prev, [key]: null }));
    if (error) { setErrors(prev => ({ ...prev, [key]: error.message })); return; }
    if (item.kind === "request") onUpdateAdminRequest(item.id, { status: newStatus });
    else                          onUpdateAdminReport(item.id,  { status: newStatus });
  }

  function renderItem(item) {
    const key = `${item.kind}-${item.id}`;
    const isPending = item.status === "pendiente";
    const isLoading = !!loading[key];
    const errMsg = errors[key];
    return (
      <div key={key} style={{ padding:"14px 16px", borderBottom:`1px solid ${COLORS.border}` }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
              <span style={{ fontSize:13, fontWeight:700, color:COLORS.green }}>{item.employeeName}</span>
              {item.department && <span style={{ fontSize:11, color:COLORS.textMuted }}>· {item.department}</span>}
            </div>
            <div style={{ fontSize:13, fontWeight:600, color:COLORS.text, marginBottom:2 }}>{item.label}</div>
            {item.subtitle && <div style={{ fontSize:11, color:COLORS.textMuted, lineHeight:1.5, marginBottom:2 }}>{item.subtitle}</div>}
            {item.comment && <div style={{ fontSize:11, color:COLORS.textMuted, lineHeight:1.5, marginBottom:2 }}><span style={{ fontWeight:600 }}>Nota:</span> {item.comment}</div>}
            {item.location && <div style={{ fontSize:11, color:COLORS.textMuted, marginBottom:2 }}>📍 {item.location}</div>}
            <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:2 }}>{fmtSupaDate((item.created_at ?? "").slice(0,10))}</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8, flexShrink:0 }}>
            {item.photo_url && (
              <img src={item.photo_url} alt="foto" style={{ width:48, height:48, borderRadius:7, objectFit:"cover", border:`1px solid ${COLORS.border}` }} />
            )}
            <StatusBadge status={item.status} />
          </div>
        </div>
        {isPending && (
          <div style={{ display:"flex", gap:8, marginTop:10 }}>
            <button onClick={() => handleAction(item, "aprobado")} disabled={isLoading} style={{
              flex:1, padding:"7px 0", borderRadius:7, border:"none",
              cursor:isLoading?"not-allowed":"pointer",
              background:"rgba(44,99,86,0.12)", color:COLORS.greenSoft,
              fontSize:13, fontWeight:700, fontFamily:"'Manrope', sans-serif",
              opacity:isLoading?0.6:1, transition:"background 0.15s",
            }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background="rgba(44,99,86,0.22)"; }}
              onMouseLeave={e => { if (!isLoading) e.currentTarget.style.background="rgba(44,99,86,0.12)"; }}
            >{loading[key] === "aprobado" ? "Aprobando..." : "Aprobar"}</button>
            <button onClick={() => handleAction(item, "rechazado")} disabled={isLoading} style={{
              flex:1, padding:"7px 0", borderRadius:7, border:"none",
              cursor:isLoading?"not-allowed":"pointer",
              background:"rgba(192,57,43,0.1)", color:"#c0392b",
              fontSize:13, fontWeight:700, fontFamily:"'Manrope', sans-serif",
              opacity:isLoading?0.6:1, transition:"background 0.15s",
            }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background="rgba(192,57,43,0.2)"; }}
              onMouseLeave={e => { if (!isLoading) e.currentTarget.style.background="rgba(192,57,43,0.1)"; }}
            >{loading[key] === "rechazado" ? "Rechazando..." : "Rechazar"}</button>
          </div>
        )}
        {errMsg && <p style={{ fontSize:11, color:"#e07070", margin:"6px 0 0" }}>{errMsg}</p>}
      </div>
    );
  }

  if (allItems.length === 0) {
    return <Card><p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>No hay solicitudes registradas.</p></Card>;
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {pendientes.length > 0 && (
        <Card>
          <CardHeader title={`Pendientes (${pendientes.length})`} />
          <div style={{ margin:"4px -16px -16px" }}>
            {pendientes.map(renderItem)}
          </div>
        </Card>
      )}
      {resueltos.length > 0 && (
        <Card>
          <CardHeader title="Resueltas" />
          <div style={{ margin:"4px -16px -16px" }}>
            {resueltos.map(renderItem)}
          </div>
        </Card>
      )}
    </div>
  );
}

function Dashboard({ onLogout, profile, allRequests = [], onNewRequest, reports = [], onNewReport, announcements = [], documents = [], upcomingBirthdays = [], adminRequests = [], adminReports = [], onUpdateAdminRequest, onUpdateAdminReport, adminAnnouncements = [], onNewAnnouncement, departments = [] }) {
  const [active, setActive] = useState("inicio");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const sectionTitle = { inicio: "Inicio", vacaciones: "Vacaciones", comunicados: "Comunicados", documentos: "Documentos", solicitudes: "Solicitudes", perfil: "Mi perfil", aprobaciones: "Aprobaciones", "comunicados-admin": "Gestionar comunicados" }[active];

  const pendingApprovalCount = (profile?.role === "admin" || profile?.role === "rrhh")
    ? adminRequests.filter(r => r.status === "pendiente").length + adminReports.filter(r => r.status === "pendiente").length
    : 0;

  const vacationRequests = allRequests.filter(r => r.type === "vacaciones");
  const allSolicitudes = [
    ...allRequests.map(r => ({
      id: r.id, kind: "request",
      label: r.type === "vacaciones" ? "Vacaciones" : (r.category || "Permiso"),
      subtitle: r.start_date
        ? `${fmtSupaShort(r.start_date)} → ${fmtSupaShort(r.end_date)} · ${r.days_requested ?? 0} días`
        : (r.comment || ""),
      status: r.status, created_at: r.created_at,
    })),
    ...reports.map(r => ({
      id: r.id, kind: "report",
      label: r.category || "Reporte",
      subtitle: r.description || "",
      location: r.location,
      photo_url: r.photo_url,
      status: r.status, created_at: r.created_at,
    })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const vacationBalance = profile?.vacation_balance ?? VAC_TOTAL;
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
        <MobileDrawer open={drawerOpen} onClose={closeDrawer} active={active} setActive={setActive} onLogout={onLogout} profile={profile} pendingApprovalCount={pendingApprovalCount} />
        <div style={{ padding: "24px 16px 48px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.22em", color: COLORS.gold, marginBottom: 4, textTransform: "uppercase", fontWeight: 600 }}>
            Viernes 12 de junio, 2026
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, margin: "0 0 22px", color: COLORS.green }}>
            {active === "inicio" ? greeting : sectionTitle}
          </h1>
          {active === "inicio" ? <DashboardHome isMobile={true} setActive={setActive} allSolicitudes={allSolicitudes} vacData={vacData} announcements={announcements} documents={documents} upcomingBirthdays={upcomingBirthdays} onNewRequest={onNewRequest} onNewReport={onNewReport} /> : active === "vacaciones" ? <VacationSection profile={profile} vacationRequests={vacationRequests} onNewRequest={onNewRequest} /> : active === "comunicados" ? <AnnouncementsSection announcements={announcements} /> : active === "documentos" ? <DocumentsSection documents={documents} /> : active === "solicitudes" ? <SolicitudesSection allSolicitudes={allSolicitudes} onNewRequest={onNewRequest} onNewReport={onNewReport} /> : active === "perfil" ? <ProfileSection profile={profile} /> : active === "aprobaciones" ? <AprobacionesSection adminRequests={adminRequests} adminReports={adminReports} onUpdateAdminRequest={onUpdateAdminRequest} onUpdateAdminReport={onUpdateAdminReport} /> : active === "comunicados-admin" ? <GestionComunicadosSection adminAnnouncements={adminAnnouncements} departments={departments} onNewAnnouncement={onNewAnnouncement} /> : <PlaceholderSection title={sectionTitle} />}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", background: COLORS.bg, minHeight: "100vh", fontFamily: "'Manrope', sans-serif" }}>
      <Sidebar active={active} setActive={setActive} onLogout={onLogout} profile={profile} pendingApprovalCount={pendingApprovalCount} />
      <div style={{ flex: 1, padding: "36px 40px", minWidth: 0 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.25em", color: COLORS.gold, marginBottom: 6, textTransform: "uppercase", fontWeight: 600 }}>
            Viernes 12 de junio, 2026
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, margin: 0, color: COLORS.green }}>
            {active === "inicio" ? greeting : sectionTitle}
          </h1>
        </div>
        {active === "inicio" ? <DashboardHome isMobile={false} setActive={setActive} allSolicitudes={allSolicitudes} vacData={vacData} announcements={announcements} documents={documents} upcomingBirthdays={upcomingBirthdays} onNewRequest={onNewRequest} onNewReport={onNewReport} /> : active === "vacaciones" ? <VacationSection profile={profile} vacationRequests={vacationRequests} onNewRequest={onNewRequest} /> : active === "comunicados" ? <AnnouncementsSection announcements={announcements} /> : active === "documentos" ? <DocumentsSection documents={documents} /> : active === "solicitudes" ? <SolicitudesSection allSolicitudes={allSolicitudes} onNewRequest={onNewRequest} onNewReport={onNewReport} /> : active === "perfil" ? <ProfileSection profile={profile} /> : active === "aprobaciones" ? <AprobacionesSection adminRequests={adminRequests} adminReports={adminReports} onUpdateAdminRequest={onUpdateAdminRequest} onUpdateAdminReport={onUpdateAdminReport} /> : active === "comunicados-admin" ? <GestionComunicadosSection adminAnnouncements={adminAnnouncements} departments={departments} onNewAnnouncement={onNewAnnouncement} /> : <PlaceholderSection title={sectionTitle} />}
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = logged out
  const [profile, setProfile] = useState(null);
  const [allRequests, setAllRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [reports, setReports] = useState([]);
  const [adminRequests,      setAdminRequests]      = useState([]);
  const [adminReports,       setAdminReports]        = useState([]);
  const [adminAnnouncements, setAdminAnnouncements]  = useState([]);
  const [departments,        setDepartments]         = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null);
      if (!s) { setProfile(null); setAllRequests([]); setAnnouncements([]); setDocuments([]); setUpcomingBirthdays([]); setReports([]); setAdminRequests([]); setAdminReports([]); setAdminAnnouncements([]); setDepartments([]); }
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
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setAllRequests(data); });
    supabase
      .from("reports")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setReports(data); });
  }, [session]);

  useEffect(() => {
    if (!profile?.department) return;
    supabase
      .from("announcements")
      .select("*")
      .lte("publish_at", new Date().toISOString())
      .or(`audience.eq.todos,audience.eq.${profile.department}`)
      .order("publish_at", { ascending: false })
      .then(({ data }) => { if (data) setAnnouncements(data); });
    supabase
      .from("documents")
      .select("*")
      .or(`department.is.null,department.eq.${profile.department}`)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setDocuments(data); });
    supabase.rpc("get_birthdays").then(({ data }) => {
      if (!data) return;
      const today = new Date(); today.setHours(0,0,0,0);
      const processed = data.map(p => {
        const bd = new Date(p.birth_date + "T12:00:00");
        let next = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
        if (next < today) next = new Date(today.getFullYear() + 1, bd.getMonth(), bd.getDate());
        const shortDate = `${next.getDate()} ${MONTH_NAMES[next.getMonth()].slice(0,3).toLowerCase()}`;
        return { full_name: p.full_name, date: shortDate, _next: next };
      });
      processed.sort((a, b) => a._next - b._next);
      setUpcomingBirthdays(processed.slice(0, 5).map(({ full_name, date }) => ({ full_name, date })));
    });
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    if (profile.role !== "admin" && profile.role !== "rrhh") return;
    supabase.from("requests").select("*, profiles!requests_user_id_fkey(full_name, department)").order("created_at", { ascending: false })
      .then(({ data, error }) => {
        console.log("[admin] requests data:", data, "error:", error);
        if (data) setAdminRequests(data);
      });
    supabase.from("reports").select("*, profiles!reports_user_id_fkey(full_name, department)").order("created_at", { ascending: false })
      .then(({ data, error }) => {
        console.log("[admin] reports data:", data, "error:", error);
        if (data) setAdminReports(data);
      });
    supabase.from("announcements").select("*").order("publish_at", { ascending: false })
      .then(({ data }) => { if (data) setAdminAnnouncements(data); });
    supabase.from("profiles").select("department")
      .then(({ data }) => {
        if (!data) return;
        const unique = [...new Set(data.map(p => p.department).filter(Boolean))].sort();
        setDepartments(unique);
      });
  }, [profile]);

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
        ? <Dashboard
            onLogout={() => supabase.auth.signOut()}
            profile={profile}
            allRequests={allRequests}
            onNewRequest={r => setAllRequests(prev => [r, ...prev])}
            reports={reports}
            onNewReport={r => setReports(prev => [r, ...prev])}
            announcements={announcements}
            documents={documents}
            upcomingBirthdays={upcomingBirthdays}
            adminRequests={adminRequests}
            adminReports={adminReports}
            onUpdateAdminRequest={(id, changes) => setAdminRequests(prev => prev.map(r => r.id === id ? { ...r, ...changes } : r))}
            onUpdateAdminReport={(id, changes)  => setAdminReports(prev  => prev.map(r => r.id === id ? { ...r, ...changes } : r))}
            adminAnnouncements={adminAnnouncements}
            onNewAnnouncement={a => setAdminAnnouncements(prev => [a, ...prev])}
            departments={departments}
          />
        : <LoginScreen onLogin={() => {}} />
      }
    </div>
  );
}

