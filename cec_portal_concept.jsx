import React, { useState, useEffect, useCallback } from "react";
import {
  Bell, FileText, CalendarDays, CalendarCheck, User, LogOut,
  Home, ChevronRight, ChevronLeft, Download, Clock, CheckCircle2, Cake, Menu, X, Plus, Edit2, Trash2, AlertTriangle, ClipboardCheck, Megaphone, FileUp, Users, UserPlus,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "./src/lib/supabase";

function translateError(msg = "") {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("email not confirmed")) return "El correo no ha sido confirmado. Revisa tu bandeja de entrada.";
  if (m.includes("user already registered") || m.includes("already registered")) return "Este correo ya está registrado.";
  if (m.includes("password should be at least")) return "La contraseña debe tener al menos 6 caracteres.";
  if (m.includes("signups not allowed") || m.includes("signup is disabled")) return "El registro no está disponible en este momento.";
  if (m.includes("too many requests") || m.includes("rate limit")) return "Demasiados intentos. Espera un momento e intenta de nuevo.";
  if (m.includes("network") || m.includes("failed to fetch") || m.includes("fetch")) return "Error de conexión. Verifica tu internet.";
  if (m.includes("jwt expired") || m.includes("session expired")) return "Tu sesión ha expirado. Vuelve a iniciar sesión.";
  if (m.includes("row-level security") || m.includes("rls") || m.includes("policy")) return "No tienes permisos para realizar esta acción.";
  if (m.includes("duplicate") || m.includes("unique")) return "Ya existe un registro con estos datos.";
  if (m.includes("not found") || m.includes("no rows")) return "No se encontró el registro solicitado.";
  if (m.includes("storage") || m.includes("upload")) return "Error al subir el archivo. Intenta de nuevo.";
  return msg || "Ocurrió un error inesperado. Intenta de nuevo.";
}

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
@keyframes loginFadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes goldLineGrow {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes wordOut {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-8px); }
}
@keyframes wordIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes dashboardIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes sectionOut {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-5px); }
}
@keyframes sectionIn {
  from { opacity: 0; transform: translateY(5px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes confettiFall {
  0%   { opacity: 0.4; transform: translateY(-10px) rotate(0deg); }
  85%  { opacity: 0.25; }
  100% { opacity: 0;   transform: translateY(100vh) rotate(540deg); }
}
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
}
`;

const SIDEBAR_BG = "linear-gradient(168deg, #24584C 0%, #1F4A40 40%, #152E27 100%)";

const INFINITY_PATH = "M30 30 C18 30 18 70 30 70 C42 70 58 30 70 30 C82 30 82 70 70 70 C58 70 42 30 30 30";

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
  padding: "12px 14px", color: "#1F4A40", fontSize: 16,
  outline: "none", boxSizing: "border-box",
  fontFamily: "'Manrope', sans-serif", transition: "border-color 0.2s", display: "block",
};

const ROTATING_WORDS = ["comunicados", "vacaciones", "documentos", "permisos", "reportes", "tu equipo"];

function RotatingWord({ noAnim }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (noAnim) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % ROTATING_WORDS.length); setVisible(true); }, 330);
    }, 2200);
    return () => clearInterval(id);
  }, [noAnim]);

  const wordAnim = noAnim ? {} : visible
    ? { animation: "wordIn 0.35s ease-out both" }
    : { animation: "wordOut 0.32s ease-in both" };

  return (
    <div style={{ display:"flex", alignItems:"baseline", flexWrap:"wrap", columnGap:4, fontSize:13, color:COLORS.textMuted, marginBottom:10, lineHeight:1.6 }}>
      <span>Accede a:</span>
      <span style={{ overflow:"hidden", display:"inline-block", height:"1.35em", verticalAlign:"text-bottom" }}>
        <span style={{ color:COLORS.gold, fontWeight:600, display:"block", ...wordAnim }}>
          {ROTATING_WORDS[noAnim ? 0 : idx]}
        </span>
      </span>
    </div>
  );
}

function LoginForm({ onLogin }) {
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const noAnim = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const anim = (delay) => noAnim ? {} : { animation: `loginFadeUp 0.55s ease-out ${delay}ms both` };

  async function handleLogin() {
    setError(null);
    if (!emailValue.trim()) { setError("Ingresa tu correo corporativo."); return; }
    if (!passwordValue) { setError("Ingresa tu contraseña."); return; }
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email: emailValue.trim(), password: passwordValue });
    setLoading(false);
    if (authError) setError(translateError(authError.message));
  }

  return (
    <>
      <div style={{
        width: 100, height: 3,
        background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.goldSoft})`,
        borderRadius: 2, marginBottom: 20, transformOrigin: "left center",
        ...(noAnim ? {} : { animation: "goldLineGrow 0.65s ease-out both" }),
      }} />
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 600, marginBottom: 12, color: COLORS.green, lineHeight: 1.15, ...anim(80) }}>
        Te damos la bienvenida<br />al Portal CEC
      </h1>
      <div style={anim(160)}><RotatingWord noAnim={noAnim} /></div>
      <p style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 28, lineHeight: 1.6, ...anim(220) }}>
        Ingresa con tu correo institucional para continuar.
      </p>
      <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 6, fontWeight: 600, letterSpacing: "0.02em", ...anim(280) }}>Correo corporativo</label>
      <input
        type="email" placeholder="nombre@cec.co.cr" value={emailValue}
        onChange={e => setEmailValue(e.target.value)}
        style={{ ...inputStyle, marginBottom: 14, ...anim(320) }}
        onFocus={e => e.target.style.borderColor = COLORS.gold}
        onBlur={e => e.target.style.borderColor = COLORS.border}
      />
      <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 6, fontWeight: 600, letterSpacing: "0.02em", ...anim(360) }}>Contraseña</label>
      <input
        type="password" placeholder="••••••••" value={passwordValue}
        onChange={e => setPasswordValue(e.target.value)}
        onKeyDown={e => e.key === "Enter" && !loading && handleLogin()}
        style={{ ...inputStyle, marginBottom: 24, ...anim(400) }}
        onFocus={e => e.target.style.borderColor = COLORS.gold}
        onBlur={e => e.target.style.borderColor = COLORS.border}
      />
      {error && (
        <p style={{ fontSize: 12, color: "#e07070", marginBottom: 14, marginTop: -10, lineHeight: 1.5 }}>{error}</p>
      )}
      <button
        type="button" onClick={handleLogin} disabled={loading}
        style={{
          ...anim(460),
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
  const noAnim = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const anim = (delay) => noAnim ? {} : { animation: `loginFadeUp 0.55s ease-out ${delay}ms both` };

  if (isMobile) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Manrope', sans-serif", background: "#FFF" }}>
        {/* Compact top banner */}
        <div style={{ background: SIDEBAR_BG, padding: "28px 32px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={anim(0)}><Logo width={200} /></div>
          <div style={{ width: 50, height: 1.5, background: COLORS.gold, opacity: 0.6, ...anim(80) }} />
          <div style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", ...anim(140) }}>
            Portal de Colaboradores
          </div>
        </div>
        {/* Form area */}
        <div style={{ flex: 1, padding: "28px 28px 48px" }}>
          <LoginForm onLogin={onLogin} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Manrope', sans-serif" }}>

      {/* ── Panel izquierdo ── */}
      <div style={{
        flex: "0 0 45%", background: SIDEBAR_BG,
        display: "flex", flexDirection: "column", justifyContent: "center",
        alignItems: "center", padding: "60px 56px", gap: 10,
      }}>
        <div style={anim(0)}><Logo width={380} /></div>
        <div style={{ width: 80, height: 2, background: COLORS.gold, opacity: 0.7, ...anim(100) }} />
        <div style={{ fontSize: 14, letterSpacing: "0.35em", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", textAlign: "center", fontWeight: 500, ...anim(180) }}>
          Portal de Colaboradores
        </div>
      </div>

      {/* ── Panel derecho — formulario ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 56px", background: "#FFF", position: "relative", overflow: "hidden" }}>
        <div style={{ width: "100%", maxWidth: 360, position: "relative" }}>
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
        position: "fixed", top:0, right:0, bottom:0, left:0, background: "rgba(0,0,0,0.5)", zIndex: 90,
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
        overflowY: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexShrink: 0 }}>
          <Logo width={130} />
          <button onClick={onClose} style={{
            border: "none", background: "rgba(255,255,255,0.1)", color: "#FFF",
            cursor: "pointer", borderRadius: 8, width: 34, height: 34,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 16, flexShrink: 0 }} />
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, overflowY: "auto", flex: 1, paddingBottom: 8 }}>
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
              <button onClick={() => { setActive("documentos-admin"); onClose(); }} style={{
                display:"flex", alignItems:"center", gap:14,
                padding:"12px 14px", borderRadius:10, border:"none",
                cursor:"pointer", textAlign:"left", fontSize:15, fontWeight:600,
                fontFamily:"'Manrope', sans-serif",
                color: active === "documentos-admin" ? "#FFF" : COLORS.sidebarMuted,
                background: active === "documentos-admin" ? `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})` : "transparent",
                transition:"background 0.15s, color 0.15s",
              }}>
                <FileUp size={19} />Gestionar documentos
              </button>
              <button onClick={() => { setActive("empleados"); onClose(); }} style={{
                display:"flex", alignItems:"center", gap:14,
                padding:"12px 14px", borderRadius:10, border:"none",
                cursor:"pointer", textAlign:"left", fontSize:15, fontWeight:600,
                fontFamily:"'Manrope', sans-serif",
                color: active === "empleados" ? "#FFF" : COLORS.sidebarMuted,
                background: active === "empleados" ? `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})` : "transparent",
                transition:"background 0.15s, color 0.15s",
              }}>
                <Users size={19} />Empleados
              </button>
              <button onClick={() => { setActive("alta-empleado"); onClose(); }} style={{
                display:"flex", alignItems:"center", gap:14,
                padding:"12px 14px", borderRadius:10, border:"none",
                cursor:"pointer", textAlign:"left", fontSize:15, fontWeight:600,
                fontFamily:"'Manrope', sans-serif",
                color: active === "alta-empleado" ? "#FFF" : COLORS.sidebarMuted,
                background: active === "alta-empleado" ? `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})` : "transparent",
                transition:"background 0.15s, color 0.15s",
              }}>
                <UserPlus size={19} />Gestión de empleados
              </button>
            </>
          )}
        </nav>
        <div style={{ flexShrink: 0, marginTop: 8 }}>
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
            {(() => {
              const isActive3 = active === "documentos-admin";
              return (
                <button
                  onClick={() => setActive("documentos-admin")}
                  style={{
                    display:"flex", alignItems:"center", gap:12,
                    padding:"10px 14px", borderRadius:8, border:"none",
                    cursor:"pointer", textAlign:"left",
                    fontSize:14, fontWeight:600,
                    fontFamily:"'Manrope', sans-serif",
                    color: isActive3 ? "#FFFFFF" : COLORS.sidebarMuted,
                    background: isActive3 ? `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})` : "transparent",
                    transition:"background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={e => { if (!isActive3) { e.currentTarget.style.background="rgba(255,255,255,0.08)"; e.currentTarget.style.color="#FFFFFF"; } }}
                  onMouseLeave={e => { if (!isActive3) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color=COLORS.sidebarMuted; } }}
                >
                  <FileUp size={16} />Gestionar documentos
                </button>
              );
            })()}
            {(() => {
              const isA = active === "empleados";
              return (
                <button onClick={() => setActive("empleados")} style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"10px 14px", borderRadius:8, border:"none",
                  cursor:"pointer", textAlign:"left", fontSize:14, fontWeight:600,
                  fontFamily:"'Manrope', sans-serif",
                  color: isA ? "#FFFFFF" : COLORS.sidebarMuted,
                  background: isA ? `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})` : "transparent",
                  transition:"background 0.15s, color 0.15s",
                }}
                  onMouseEnter={e => { if (!isA) { e.currentTarget.style.background="rgba(255,255,255,0.08)"; e.currentTarget.style.color="#FFFFFF"; } }}
                  onMouseLeave={e => { if (!isA) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color=COLORS.sidebarMuted; } }}
                >
                  <Users size={16} />Empleados
                </button>
              );
            })()}
            {(() => {
              const isA = active === "alta-empleado";
              return (
                <button onClick={() => setActive("alta-empleado")} style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"10px 14px", borderRadius:8, border:"none",
                  cursor:"pointer", textAlign:"left", fontSize:14, fontWeight:600,
                  fontFamily:"'Manrope', sans-serif",
                  color: isA ? "#FFFFFF" : COLORS.sidebarMuted,
                  background: isA ? `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})` : "transparent",
                  transition:"background 0.15s, color 0.15s",
                }}
                  onMouseEnter={e => { if (!isA) { e.currentTarget.style.background="rgba(255,255,255,0.08)"; e.currentTarget.style.color="#FFFFFF"; } }}
                  onMouseLeave={e => { if (!isA) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color=COLORS.sidebarMuted; } }}
                >
                  <UserPlus size={16} />Gestión de empleados
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
  const noAnim = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [pct, setPct] = useState(noAnim ? 1 : 0);

  useEffect(() => {
    if (noAnim) return;
    const duration = 900;
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setPct(eased);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [noAnim]);

  const safeUsed = Math.min(used, total);
  const safeReq  = Math.min(requested, total - safeUsed);
  const available = total - safeUsed - safeReq;
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

const MOTIVATIONAL_MESSAGES = [
  "Cada día es una oportunidad para marcar la diferencia en la vida de alguien.",
  "El buen trabajo en equipo convierte lo difícil en posible.",
  "La atención con calidad empieza con la actitud de cada uno.",
  "Pequeñas mejoras constantes construyen grandes resultados.",
  "Tu dedicación hoy es el bienestar de alguien mañana.",
  "Un equipo que se apoya produce lo mejor en cada paciente.",
  "La excelencia no es un acto puntual, es un hábito.",
  "Cada paciente bien atendido es una misión cumplida.",
  "El cuidado genuino se nota. Gracias por traerlo cada día.",
  "Los detalles son lo que separa lo bueno de lo excepcional.",
  "Trabajar con propósito hace que el esfuerzo valga la pena.",
  "La confianza del paciente se gana con constancia y respeto.",
  "Hoy es un buen día para hacer el trabajo con orgullo.",
  "La comunicación clara es tan importante como la técnica.",
  "Un ambiente positivo es también parte del tratamiento.",
  "El trabajo bien hecho habla por sí solo.",
  "Cada turno es una nueva oportunidad de hacer las cosas con excelencia.",
  "La empatía es la herramienta más poderosa en salud.",
  "El respeto entre colegas se refleja en la calidad del servicio.",
  "Estar presente de verdad marca la diferencia para quienes nos necesitan.",
  "La salud de las personas depende del compromiso de cada uno aquí.",
  "Lo que hacemos importa más de lo que a veces percibimos.",
];

function getDailyMessage() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return MOTIVATIONAL_MESSAGES[dayOfYear % MOTIVATIONAL_MESSAGES.length];
}
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
function CalendarWidget({ startDate, endDate, onChange, minDate }) {
  const now = new Date();
  const [yr, setYr] = useState(startDate ? startDate.getFullYear() : now.getFullYear());
  const [mo, setMo] = useState(startDate ? startDate.getMonth() : now.getMonth());

  // Build a fixed 42-cell grid (6 rows × 7 cols)
  const firstWeekday = new Date(yr, mo, 1).getDay();
  const daysInMonth  = new Date(yr, mo + 1, 0).getDate();
  const prevMo = mo === 0 ? 11 : mo - 1;
  const prevYr = mo === 0 ? yr - 1 : yr;
  const daysInPrev = new Date(prevYr, prevMo + 1, 0).getDate();
  const nextMo = mo === 11 ? 0 : mo + 1;
  const nextYr = mo === 11 ? yr + 1 : yr;

  const cells = [];
  // trailing days from previous month
  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ d: daysInPrev - i, m: prevMo, y: prevYr, overflow: true });
  }
  // current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ d, m: mo, y: yr, overflow: false });
  }
  // leading days from next month
  while (cells.length < 42) {
    cells.push({ d: cells.length - firstWeekday - daysInMonth + 1, m: nextMo, y: nextYr, overflow: true });
  }

  function click(cell) {
    const d = new Date(cell.y, cell.m, cell.d);
    if (minDate && d < minDate) return;
    // navigate to that month if overflow cell
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

/* ── Modal shell ── */
function ModalShell({ onClose, title, children }) {
  return (
    <div style={{ position:"fixed", top:0, right:0, bottom:0, left:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
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
function VacationForm({ onClose, onSubmit, editData, onNewRequest, availableDays, existingRequests = [] }) {
  const [startDate, setStartDate] = useState(editData?.startDate || null);
  const [endDate,   setEndDate]   = useState(editData?.endDate   || null);
  const [comment,   setComment]   = useState(editData?.comment   || "");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const wd = calcWorkDays(startDate, endDate);
  const toDate = (d) => d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` : null;

  const today = new Date(); today.setHours(0,0,0,0);
  const isPastStart = startDate && startDate < today;
  const exceedsBalance = availableDays != null && endDate && wd > availableDays;
  const rangeEnd = endDate || startDate;
  const overlapping = startDate && rangeEnd
    ? existingRequests.filter(r => {
        if (r.status !== "pendiente" && r.status !== "aprobado") return false;
        if (editData && r.id === editData.id) return false;
        const rs = new Date(r.start_date + "T12:00:00");
        const re = r.end_date ? new Date(r.end_date + "T12:00:00") : rs;
        return startDate <= re && rangeEnd >= rs;
      })
    : [];

  async function submit() {
    setError(null);
    if (!startDate) return;
    if (isPastStart) return;
    if (overlapping.length > 0) return;
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
    if (insertError) { setError(translateError(insertError.message)); return; }
    if (onNewRequest) onNewRequest(data);
    onClose();
  }

  return (
    <ModalShell onClose={onClose} title={editData ? "Editar solicitud" : "Solicitud de Vacaciones"}>
      <CalendarWidget startDate={startDate} endDate={endDate} onChange={(s,e) => { setStartDate(s); setEndDate(e); }} minDate={today} />
      {startDate && (
        <div style={{ marginTop:12, padding:"10px 14px", background:COLORS.panelAlt, borderRadius:8, fontSize:12, color:COLORS.textMuted }}>
          <div><span style={{ fontWeight:600, color:COLORS.green }}>Inicio: </span>{fmtDate(startDate)}</div>
          {endDate && <>
            <div style={{ marginTop:2 }}><span style={{ fontWeight:600, color:COLORS.green }}>Fin: </span>{fmtDate(endDate)}</div>
            <div style={{ marginTop:2 }}><span style={{ fontWeight:700, color:COLORS.gold }}>{wd} días hábiles</span></div>
          {exceedsBalance && (
            <div style={{ marginTop:8, fontSize:12, color:"#c0392b" }}>
              No tienes suficientes días disponibles. Tienes <strong>{availableDays}</strong> días disponibles y estás solicitando <strong>{wd}</strong>.
            </div>
          )}
          </>}
        </div>
      )}
      {isPastStart && (
        <div style={{ marginTop:8, fontSize:12, color:"#c0392b" }}>
          No se pueden solicitar fechas en el pasado.
        </div>
      )}
      {overlapping.length > 0 && (
        <div style={{ marginTop:8, fontSize:12, color:"#c0392b" }}>
          Ya tienes una solicitud de vacaciones que se solapa con estas fechas
          {" "}(del {overlapping[0].start_date} al {overlapping[0].end_date || overlapping[0].start_date}).
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
        <button onClick={submit} disabled={loading || !!exceedsBalance || !!isPastStart || overlapping.length > 0} style={{ ...btnSubmitStyle, opacity:(startDate&&!loading&&!exceedsBalance&&!isPastStart&&overlapping.length===0)?1:0.5, cursor:(loading||exceedsBalance||isPastStart||overlapping.length>0)?"not-allowed":"pointer" }}>
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
  const todayP = new Date(); todayP.setHours(0,0,0,0);
  const isPastStartP = startDate && startDate < todayP;

  async function submit() {
    setError(null);
    if (!tipoPermiso || !startDate) return;
    if (isPastStartP) return;
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
    if (insertError) { setError(translateError(insertError.message)); return; }
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
      <CalendarWidget startDate={startDate} endDate={endDate} onChange={(s,e) => { setStartDate(s); setEndDate(e); }} minDate={todayP} />
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
      {isPastStartP && (
        <div style={{ marginTop:8, fontSize:12, color:"#c0392b" }}>
          No se pueden solicitar fechas en el pasado.
        </div>
      )}
      {error && <p style={{ fontSize:12, color:"#e07070", margin:"12px 0 0" }}>{error}</p>}
      <div style={{ display:"flex", gap:10, marginTop:20 }}>
        <button onClick={onClose} style={btnCancelStyle}>Cancelar</button>
        <button onClick={submit} disabled={loading || !!isPastStartP} style={{ ...btnSubmitStyle, opacity:(tipoPermiso&&startDate&&!loading&&!isPastStartP)?1:0.5, cursor:(loading||isPastStartP)?"not-allowed":"pointer" }}>
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
      if (uploadError) { setError(translateError(uploadError.message)); setLoadingMsg(null); return; }
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
    if (insertError) { setError(translateError(insertError.message)); return; }
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
function CrearSolicitudModal({ onClose, onSubmit, editData, initialTipo, onNewRequest, onNewReport, availableDays, existingVacationRequests }) {
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

  if (tipo === "vacaciones") return <VacationForm onClose={onClose} onSubmit={handleSubmit} editData={editData} onNewRequest={onNewRequest} availableDays={availableDays} existingRequests={existingVacationRequests}/>;
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
        <div style={{ color:COLORS.text, fontWeight:600, fontSize:13, wordBreak:"break-word" }}>{s.label}</div>
        {s.subtitle && <div style={{ color:COLORS.textMuted, fontSize:11, marginTop:2, lineHeight:1.5, wordBreak:"break-word" }}>{s.subtitle}</div>}
        {s.location && <div style={{ color:COLORS.textMuted, fontSize:11, marginTop:2 }}>📍 {s.location}</div>}
        {dateStr && <div style={{ color:COLORS.textMuted, fontSize:11, marginTop:3 }}>{dateStr}</div>}
        {s.reviewerName && s.status !== "pendiente" && (
          <div style={{ fontSize:11, marginTop:3, color: s.status === "aprobado" ? COLORS.green : "#c0392b", fontWeight:500 }}>
            {s.status === "aprobado" ? "Aprobado" : "Rechazado"} por {s.reviewerName}
          </div>
        )}
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

/* ── Signed-URL download button for private documents bucket ── */
function DocDownloadBtn({ fileUrl, label, iconOnly = false }) {
  const [loading, setLoading] = useState(false);
  async function open() {
    if (!fileUrl) return;
    setLoading(true);
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(fileUrl, 60);
    setLoading(false);
    if (error || !data?.signedUrl) { alert("No se pudo abrir el documento. Intenta de nuevo."); return; }
    window.open(data.signedUrl, "_blank", "noreferrer");
  }
  if (iconOnly) return (
    <button onClick={open} disabled={loading} title={loading ? "Abriendo..." : "Descargar"} style={{ background:"none", border:"none", cursor:loading?"wait":"pointer", padding:0, lineHeight:0 }}>
      <Download size={14} color={loading ? COLORS.textMuted : COLORS.gold} />
    </button>
  );
  return (
    <button onClick={open} disabled={loading} style={{ display:"flex", alignItems:"center", gap:5, color:loading?COLORS.textMuted:COLORS.gold, fontSize:12, fontWeight:600, background:"none", border:"none", cursor:loading?"wait":"pointer", fontFamily:"'Manrope', sans-serif", padding:0, flexShrink:0, marginLeft:12 }}>
      <Download size={14} />{loading ? "Abriendo..." : (label ?? "Descargar")}
    </button>
  );
}

function DashboardHome({ isMobile, setActive, allSolicitudes = [], vacData = {}, announcements = [], documents = [], upcomingBirthdays = [], onNewRequest, onNewReport, existingVacationRequests = [] }) {
  const [modal, setModal] = useState(null); // null | "new-sol"
  const { approvedDays = 0, pendingDays = 0, availableDays = 0, vacationBalance = VAC_TOTAL } = vacData;

  return (
    <>
      {modal === "new-sol" && (
        <CrearSolicitudModal onClose={() => setModal(null)} onSubmit={() => setModal(null)} editData={null} onNewRequest={onNewRequest} onNewReport={onNewReport} availableDays={availableDays} existingVacationRequests={existingVacationRequests} />
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
                    <div style={{ fontSize: 14, color: COLORS.text, fontWeight: 500, wordBreak:"break-word" }}>{a.title}</div>
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
                {doc.file_url && <DocDownloadBtn fileUrl={doc.file_url} iconOnly />}
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

function SolicitudesSection({ allSolicitudes = [], onNewRequest, onNewReport, availableDays, existingVacationRequests = [] }) {
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
          availableDays={availableDays}
          existingVacationRequests={existingVacationRequests}
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
  return (
    <Card>
      <div style={{ display:"flex", flexDirection:"column" }}>
        {documents.map((doc, i) => (
          <div key={doc.id ?? i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${COLORS.border}` }}>
            <span style={{ display:"flex", alignItems:"center", gap:8, minWidth:0, flex:1 }}>
              <FileText size={14} color={COLORS.textMuted} style={{ flexShrink:0 }} />
              <span style={{ minWidth:0 }}>
                <span style={{ fontSize:13, color:COLORS.text, fontWeight:500, wordBreak:"break-word" }}>{doc.title}</span>
                {doc.category && (
                  <span style={{ marginLeft:8, fontSize:10, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:COLORS.gold, background:"rgba(201,162,78,0.1)", borderRadius:4, padding:"1px 6px" }}>{doc.category}</span>
                )}
              </span>
            </span>
            {doc.file_url && <DocDownloadBtn fileUrl={doc.file_url} />}
          </div>
        ))}
      </div>
    </Card>
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
          <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, fontWeight:600, color:COLORS.green, margin:"0 0 10px", lineHeight:1.3, wordBreak:"break-word" }}>{a.title}</h3>
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
          availableDays={availableDays}
          existingVacationRequests={vacationRequests}
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
                  {r.reviewer?.full_name && r.status !== "pendiente" && (
                    <div style={{ fontSize:11, marginTop:3, color: r.status === "aprobado" ? COLORS.green : "#c0392b", fontWeight:500 }}>
                      {r.status === "aprobado" ? "Aprobado" : "Rechazado"} por {r.reviewer.full_name}
                    </div>
                  )}
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

function AltaEmpleadoSection({ departmentsList = [] }) {
  const isMobile = useIsMobile();
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [fullName,      setFullName]      = useState("");
  const [position,      setPosition]      = useState("");
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [hireDate,      setHireDate]      = useState("");
  const [birthDate,     setBirthDate]     = useState("");
  const [role,          setRole]          = useState("empleado");
  const [vacBalance,    setVacBalance]    = useState("");
  const [vacPerYear,    setVacPerYear]    = useState("12");
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [partialErr,    setPartialErr]    = useState(null);
  const [successInfo,   setSuccessInfo]   = useState(null);

  function toggleDept(name) {
    setSelectedDepts(prev => prev.includes(name) ? prev.filter(d => d !== name) : [...prev, name]);
  }

  function generatePassword() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pwd = "";
    for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    setPassword(pwd);
  }

  async function handleCreate() {
    setError(null); setPartialErr(null); setSuccessInfo(null);
    if (!email.trim() || !password || !fullName.trim() || selectedDepts.length === 0) {
      setError("Correo, contraseña, nombre completo y al menos un departamento son obligatorios.");
      return;
    }
    setLoading(true);
    const tempClient = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { data, error: signUpError } = await tempClient.auth.signUp({ email: email.trim(), password });
    if (signUpError) { setError(translateError(signUpError.message)); setLoading(false); return; }
    const userId = data?.user?.id;
    if (!userId) {
      setError("No se pudo obtener el ID del nuevo usuario. Es posible que el correo ya esté registrado.");
      setLoading(false); return;
    }
    const { error: profileError } = await supabase.from("profiles").update({
      full_name:             fullName.trim(),
      position:              position.trim() || null,
      departments:           selectedDepts,
      hire_date:             hireDate   || null,
      birth_date:            birthDate  || null,
      role,
      vacation_balance:      vacBalance  !== "" ? Number(vacBalance)  : VAC_TOTAL,
      vacation_days_per_year: vacPerYear !== "" ? Number(vacPerYear) : VAC_TOTAL,
    }).eq("id", userId);
    setLoading(false);
    if (profileError) {
      setPartialErr(`El usuario fue creado en autenticación (ID: ${userId}) pero no se pudo actualizar el perfil: ${profileError.message}`);
      return;
    }
    const savedEmail = email.trim();
    const savedPwd   = password;
    setEmail(""); setPassword(""); setFullName(""); setPosition("");
    setSelectedDepts([]); setHireDate(""); setBirthDate("");
    setRole("empleado"); setVacBalance(""); setVacPerYear("12");
    setSuccessInfo({ email: savedEmail, password: savedPwd });
  }

  const fl = (text, optional) => (
    <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>
      {text}{optional && <span style={{ fontWeight:400 }}> (opcional)</span>}
    </label>
  );
  const inp = { ...inputStyle, fontSize:14, padding:"10px 14px" };
  const selStyle = { width:"100%", background:COLORS.inputBg, border:`1.5px solid ${COLORS.border}`, borderRadius:8, padding:"11px 14px", color:COLORS.text, fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"'Manrope', sans-serif", cursor:"pointer", appearance:"auto" };

  return (
    <Card>
      <CardHeader title="Nuevo empleado" />

      {/* Credenciales */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr", gap:12, marginBottom:14 }}>
        <div>
          {fl("Correo corporativo")}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@cec.cr" style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Contraseña temporal")}
          <div style={{ display:"flex", gap:8 }}>
            <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña…" style={{ ...inp, flex:1 }}
              onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
            <button onClick={generatePassword} title="Generar contraseña" style={{
              border:`1.5px solid ${COLORS.border}`, background:COLORS.inputBg, borderRadius:8, padding:"0 12px",
              color:COLORS.textMuted, fontSize:12, fontWeight:600, cursor:"pointer",
              fontFamily:"'Manrope', sans-serif", whiteSpace:"nowrap", flexShrink:0,
            }}>Generar</button>
          </div>
        </div>
      </div>

      {/* Datos personales */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr", gap:12, marginBottom:14 }}>
        <div>
          {fl("Nombre completo")}
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nombre Apellido" style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Puesto", true)}
          <input type="text" value={position} onChange={e => setPosition(e.target.value)} placeholder="Ej. Enfermera, Recepcionista" style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
      </div>

      {/* Departamentos */}
      <div style={{ marginBottom:14 }}>
        {fl("Departamentos")}
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {departmentsList.length === 0
            ? <span style={{ fontSize:13, color:COLORS.textMuted }}>No hay departamentos registrados.</span>
            : departmentsList.map(dept => {
                const sel = selectedDepts.includes(dept.name);
                return (
                  <button type="button" key={dept.id} onClick={() => toggleDept(dept.name)} style={{
                    display:"inline-flex", alignItems:"center", padding:"5px 12px", borderRadius:20,
                    cursor:"pointer", fontSize:12, fontWeight:sel?600:400,
                    border:`1.5px solid ${sel?COLORS.gold:COLORS.border}`,
                    background:sel?"rgba(201,162,78,0.12)":COLORS.panel,
                    color:sel?COLORS.green:COLORS.textMuted,
                    transition:"all 0.15s", fontFamily:"'Manrope', sans-serif",
                  }}>
                    {dept.name}
                  </button>
                );
              })
          }
        </div>
      </div>

      {/* Fechas */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr", gap:12, marginBottom:14 }}>
        <div>
          {fl("Fecha de ingreso", true)}
          <input type="date" value={hireDate} onChange={e => setHireDate(e.target.value)} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Fecha de nacimiento", true)}
          <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
      </div>

      {/* Rol y vacaciones */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap:12, marginBottom:20 }}>
        <div>
          {fl("Rol")}
          <select value={role} onChange={e => setRole(e.target.value)} style={selStyle}>
            <option value="empleado">Empleado</option>
            <option value="rrhh">RRHH</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          {fl("Saldo vacaciones inicial", true)}
          <input type="number" min="0" value={vacBalance} onChange={e => setVacBalance(e.target.value)} placeholder={String(VAC_TOTAL)} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Días por año", true)}
          <input type="number" min="0" value={vacPerYear} onChange={e => setVacPerYear(e.target.value)} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
      </div>

      {error && <p style={{ fontSize:12, color:"#e07070", margin:"0 0 12px" }}>{error}</p>}
      {partialErr && (
        <div style={{ fontSize:12, color:"#e07070", background:"rgba(192,57,43,0.06)", borderRadius:7, padding:"10px 12px", margin:"0 0 12px", lineHeight:1.6 }}>
          ⚠️ {partialErr}
        </div>
      )}
      {successInfo && (
        <div style={{ fontSize:13, background:"rgba(44,99,86,0.08)", borderRadius:8, padding:"12px 16px", margin:"0 0 16px", lineHeight:1.8, border:`1px solid rgba(44,99,86,0.2)` }}>
          <div style={{ fontWeight:700, color:COLORS.green, marginBottom:6 }}>✓ Empleado creado correctamente</div>
          <div style={{ color:COLORS.text }}>Correo: <strong>{successInfo.email}</strong></div>
          <div style={{ color:COLORS.text }}>Contraseña temporal: <strong style={{ fontFamily:"monospace", letterSpacing:"0.05em" }}>{successInfo.password}</strong></div>
          <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:6 }}>Comparte estos datos con el empleado para que pueda ingresar al portal.</div>
        </div>
      )}

      <button onClick={handleCreate} disabled={loading} style={{
        ...btnSubmitStyle, width:"100%", opacity: loading ? 0.75 : 1, cursor: loading ? "not-allowed" : "pointer",
      }}>
        {loading ? "Creando..." : "Crear empleado"}
      </button>
    </Card>
  );
}

function EditEmployeeModal({ emp, departmentsList, onClose, onSave }) {
  const isMobile = useIsMobile();
  const [fullName,    setFullName]    = useState(emp.full_name ?? "");
  const [position,    setPosition]    = useState(emp.position ?? "");
  const [selectedDepts, setSelectedDepts] = useState(
    Array.isArray(emp.departments) ? emp.departments : (emp.department ? [emp.department] : [])
  );
  const [hireDate,    setHireDate]    = useState(emp.hire_date ?? "");
  const [birthDate,   setBirthDate]   = useState(emp.birth_date ?? "");
  const [role,        setRole]        = useState(emp.role ?? "empleado");
  const [vacBalance,  setVacBalance]  = useState(emp.vacation_balance !== undefined && emp.vacation_balance !== null ? String(emp.vacation_balance) : "");
  const [vacPerYear,  setVacPerYear]  = useState(emp.vacation_days_per_year !== undefined && emp.vacation_days_per_year !== null ? String(emp.vacation_days_per_year) : "12");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);

  function toggleDept(name) {
    setSelectedDepts(prev => prev.includes(name) ? prev.filter(d => d !== name) : [...prev, name]);
  }

  async function handleSave() {
    setError(null);
    if (!fullName.trim() || selectedDepts.length === 0) {
      setError("Nombre completo y al menos un departamento son obligatorios.");
      return;
    }
    setLoading(true);
    const updates = {
      full_name:              fullName.trim(),
      position:               position.trim() || null,
      departments:            selectedDepts,
      hire_date:              hireDate  || null,
      birth_date:             birthDate || null,
      role,
      vacation_balance:       vacBalance  !== "" ? Number(vacBalance)  : VAC_TOTAL,
      vacation_days_per_year: vacPerYear  !== "" ? Number(vacPerYear)  : VAC_TOTAL,
    };
    const { error: updateError } = await supabase.from("profiles").update(updates).eq("id", emp.id);
    setLoading(false);
    if (updateError) { setError(translateError(updateError.message)); return; }
    onSave({ ...emp, ...updates });
  }

  const fl = (text, optional) => (
    <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>
      {text}{optional && <span style={{ fontWeight:400 }}> (opcional)</span>}
    </label>
  );
  const inp = { ...inputStyle, fontSize:14, padding:"10px 14px" };
  const selStyle = { width:"100%", background:COLORS.inputBg, border:`1.5px solid ${COLORS.border}`, borderRadius:8, padding:"11px 14px", color:COLORS.text, fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"'Manrope', sans-serif", cursor:"pointer", appearance:"auto" };

  return (
    <ModalShell onClose={onClose} title={`Editar: ${emp.full_name ?? "empleado"}`}>
      <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr", gap:12, marginBottom:14 }}>
        <div style={{ gridColumn:isMobile ? "1" : "span 2" }}>
          {fl("Nombre completo")}
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Puesto", true)}
          <input type="text" value={position} onChange={e => setPosition(e.target.value)} placeholder="Ej. Enfermera" style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Rol")}
          <select value={role} onChange={e => setRole(e.target.value)} style={selStyle}>
            <option value="empleado">Empleado</option>
            <option value="rrhh">RRHH</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom:14 }}>
        {fl("Departamentos")}
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {departmentsList.length === 0
            ? <span style={{ fontSize:13, color:COLORS.textMuted }}>No hay departamentos registrados.</span>
            : departmentsList.map(dept => {
                const sel = selectedDepts.includes(dept.name);
                return (
                  <button type="button" key={dept.id} onClick={() => toggleDept(dept.name)} style={{
                    display:"inline-flex", alignItems:"center", padding:"5px 12px", borderRadius:20,
                    cursor:"pointer", fontSize:12, fontWeight:sel?600:400,
                    border:`1.5px solid ${sel?COLORS.gold:COLORS.border}`,
                    background:sel?"rgba(201,162,78,0.12)":COLORS.panel,
                    color:sel?COLORS.green:COLORS.textMuted,
                    transition:"all 0.15s", fontFamily:"'Manrope', sans-serif",
                  }}>{dept.name}</button>
                );
              })
          }
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr", gap:12, marginBottom:14 }}>
        <div>
          {fl("Fecha de ingreso", true)}
          <input type="date" value={hireDate} onChange={e => setHireDate(e.target.value)} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Fecha de nacimiento", true)}
          <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Saldo vacaciones", true)}
          <input type="number" min="0" value={vacBalance} onChange={e => setVacBalance(e.target.value)} placeholder={String(VAC_TOTAL)} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Días por año", true)}
          <input type="number" min="0" value={vacPerYear} onChange={e => setVacPerYear(e.target.value)} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
      </div>

      {error && <p style={{ fontSize:12, color:"#e07070", margin:"0 0 12px" }}>{error}</p>}
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onClose} style={btnCancelStyle}>Cancelar</button>
        <button onClick={handleSave} disabled={loading} style={{ ...btnSubmitStyle, opacity:loading?0.75:1, cursor:loading?"not-allowed":"pointer" }}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </ModalShell>
  );
}

function EmpleadosSection({ adminProfiles = [], adminRequests = [], departmentsList = [], onUpdateProfile }) {
  const [search,      setSearch]      = useState("");
  const [filterDept,  setFilterDept]  = useState("todos");
  const [editingEmp,  setEditingEmp]  = useState(null);
  const [savedEmpId,  setSavedEmpId]  = useState(null);

  const departments = [...new Set(adminProfiles.flatMap(p =>
    Array.isArray(p.departments) ? p.departments : (p.department ? [p.department] : [])
  ).filter(Boolean))].sort();

  const filtered = adminProfiles.filter(p => {
    const matchSearch = !search || (p.full_name ?? "").toLowerCase().includes(search.toLowerCase());
    const empDepts = Array.isArray(p.departments) ? p.departments : (p.department ? [p.department] : []);
    const matchDept   = filterDept === "todos" || empDepts.includes(filterDept);
    return matchSearch && matchDept;
  });

  function handleSaved(updatedEmp) {
    onUpdateProfile(updatedEmp);
    setEditingEmp(null);
    setSavedEmpId(updatedEmp.id);
    setTimeout(() => setSavedEmpId(null), 3000);
  }

  function getVacStats(userId) {
    const reqs = adminRequests.filter(r => r.user_id === userId && r.type === "vacaciones");
    const approved = reqs.filter(r => r.status === "aprobado").reduce((a, r) => a + (r.days_requested ?? 0), 0);
    const pending  = reqs.filter(r => r.status === "pendiente").reduce((a, r) => a + (r.days_requested ?? 0), 0);
    return { approved, pending };
  }

  function fmtHireDate(str) {
    if (!str) return "—";
    const [y, m, d] = str.split("-").map(Number);
    const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
    return `${d} ${months[m-1]} ${y}`;
  }

  const pendingTotal = adminRequests.filter(r => r.type === "vacaciones" && r.status === "pendiente").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {editingEmp && (
        <EditEmployeeModal
          emp={editingEmp}
          departmentsList={departmentsList}
          onClose={() => setEditingEmp(null)}
          onSave={handleSaved}
        />
      )}
      {/* Resumen rápido */}
      <Card>
        <div style={{ display:"flex", gap:0 }}>
          <div style={{ flex:1, textAlign:"center", padding:"12px 8px" }}>
            <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:36, fontWeight:700, color:COLORS.green, lineHeight:1 }}>{adminProfiles.length}</div>
            <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:4, fontWeight:600 }}>Colaboradores</div>
          </div>
          <div style={{ width:1, background:COLORS.border, margin:"8px 0" }}/>
          <div style={{ flex:1, textAlign:"center", padding:"12px 8px" }}>
            <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:36, fontWeight:700, color:COLORS.gold, lineHeight:1 }}>{pendingTotal}</div>
            <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:4, fontWeight:600 }}>Solicitudes de vacaciones pendientes</div>
          </div>
          <div style={{ width:1, background:COLORS.border, margin:"8px 0" }}/>
          <div style={{ flex:1, textAlign:"center", padding:"12px 8px" }}>
            <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:36, fontWeight:700, color:COLORS.greenSoft, lineHeight:1 }}>{departments.length}</div>
            <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:4, fontWeight:600 }}>Departamentos</div>
          </div>
        </div>
      </Card>

      {/* Filtros */}
      <div style={{ display:"flex", gap:10 }}>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre..."
          style={{ ...inputStyle, flex:1, fontSize:13, padding:"9px 12px" }}
          onFocus={e => e.target.style.borderColor=COLORS.gold}
          onBlur={e => e.target.style.borderColor=COLORS.border}
        />
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{
          background:COLORS.inputBg, border:`1.5px solid ${COLORS.border}`, borderRadius:8,
          padding:"9px 12px", color:COLORS.text, fontSize:13, outline:"none",
          fontFamily:"'Manrope', sans-serif", cursor:"pointer", appearance:"auto", flexShrink:0,
        }}>
          <option value="todos">Todos los departamentos</option>
          {departmentsList.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
      </div>

      {/* Lista de empleados */}
      {filtered.length === 0 ? (
        <Card><p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>No se encontraron colaboradores.</p></Card>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {filtered.map(emp => {
            const total    = emp.vacation_balance ?? VAC_TOTAL;
            const { approved, pending } = getVacStats(emp.id);
            const available = Math.max(0, total - approved);
            const usedPct   = Math.min(100, Math.round((approved / total) * 100));
            const pendPct   = Math.min(100 - usedPct, Math.round((pending / total) * 100));
            const showRole  = emp.role === "admin" || emp.role === "rrhh";
            return (
              <Card key={emp.id}>
                {savedEmpId === emp.id && (
                  <div style={{ fontSize:12, color:COLORS.greenSoft, fontWeight:600, marginBottom:10 }}>✓ Cambios guardados correctamente.</div>
                )}
                <div style={{ display:"flex", alignItems:"flex-start", gap:14, flexWrap:"wrap" }}>
                  {/* Avatar iniciales */}
                  <div style={{
                    width:44, height:44, borderRadius:12, flexShrink:0,
                    background:`linear-gradient(135deg, ${COLORS.green}, ${COLORS.greenSoft})`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"'Cormorant Garamond', serif", fontSize:18, fontWeight:700, color:"#FFF",
                  }}>
                    {(emp.full_name ?? "?").split(/\s+/).slice(0,2).map(w => w[0]).join("").toUpperCase()}
                  </div>
                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:2 }}>
                      <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:19, fontWeight:600, color:COLORS.green, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", minWidth:0, maxWidth:"100%" }}>{emp.full_name ?? "—"}</span>
                      {showRole && (
                        <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:COLORS.gold, background:"rgba(201,162,78,0.12)", borderRadius:5, padding:"2px 8px" }}>
                          {emp.role === "admin" ? "Admin" : "RRHH"}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize:12, color:COLORS.textMuted, marginBottom:6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {[emp.position, Array.isArray(emp.departments) ? emp.departments.join(", ") : emp.department].filter(Boolean).join(" · ") || "—"}
                      {emp.hire_date ? <span style={{ marginLeft:8 }}>· Ingreso: {fmtHireDate(emp.hire_date)}</span> : null}
                    </div>
                    {/* Barra de vacaciones */}
                    <div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:11, color:COLORS.textMuted, fontWeight:600 }}>Vacaciones</span>
                        <span style={{ fontSize:11, color:COLORS.textMuted }}>
                          <span style={{ color:COLORS.green, fontWeight:700 }}>{available}</span> disponibles ·{" "}
                          <span style={{ color:COLORS.gold, fontWeight:700 }}>{approved}</span> tomados{" "}
                          {pending > 0 && <><span style={{ color:COLORS.goldSoft, fontWeight:700 }}>· {pending}</span> en solicitud</>}
                          {" "}/ {total}
                        </span>
                      </div>
                      <div style={{ height:6, borderRadius:4, background:COLORS.panelAlt, overflow:"hidden", display:"flex" }}>
                        <div style={{ width:`${usedPct}%`, background:COLORS.gold, transition:"width 0.3s" }}/>
                        <div style={{ width:`${pendPct}%`, background:COLORS.goldSoft, transition:"width 0.3s" }}/>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setEditingEmp(emp)} title="Editar empleado" style={{
                    border:`1.5px solid ${COLORS.border}`, background:COLORS.inputBg,
                    color:COLORS.textMuted, cursor:"pointer", borderRadius:8,
                    width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center",
                    flexShrink:0, transition:"all 0.15s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=COLORS.gold; e.currentTarget.style.color=COLORS.gold; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor=COLORS.border; e.currentTarget.style.color=COLORS.textMuted; }}
                  >
                    <Edit2 size={14}/>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GestionDocumentosSection({ adminDocuments = [], departmentsList = [], onNewDocument, onDeleteDocument }) {
  const isMobile = useIsMobile();
  const [title,         setTitle]         = useState("");
  const [category,      setCategory]      = useState("");
  const [deptTodos,     setDeptTodos]     = useState(true);
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [file,       setFile]       = useState(null);
  const [status,     setStatus]     = useState(null); // null | "uploading" | "saving"
  const [error,      setError]      = useState(null);
  const [success,    setSuccess]    = useState(false);
  const [deleting,   setDeleting]   = useState({}); // { [id]: true }
  const [confirmDel, setConfirmDel] = useState(null); // id pending confirmation

  async function handleDelete(doc) {
    setDeleting(prev => ({ ...prev, [doc.id]: true }));
    // Best-effort: remove file from storage using path extracted from URL
    if (doc.file_url) {
      try { await supabase.storage.from("documents").remove([doc.file_url]); } catch (_) {}
    }
    const { error: delError } = await supabase.from("documents").delete().eq("id", doc.id);
    setDeleting(prev => ({ ...prev, [doc.id]: false }));
    if (delError) { setError(translateError(delError.message)); return; }
    onDeleteDocument(doc.id);
    setConfirmDel(null);
  }

  function handleFile(e) { setFile(e.target.files?.[0] ?? null); }

  async function handleSubmit() {
    setError(null);
    setSuccess(false);
    if (!title.trim() || !category.trim() || !file) {
      setError("Título, categoría y archivo son obligatorios.");
      return;
    }
    setStatus("uploading");
    const { data: { user } } = await supabase.auth.getUser();
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("documents").upload(fileName, file);
    if (uploadError) { setError(translateError(uploadError.message)); setStatus(null); return; }
    setStatus("saving");
    const { data, error: insertError } = await supabase.from("documents").insert({
      title: title.trim(),
      category: category.trim(),
      departments: deptTodos ? ["todos"] : selectedDepts,
      file_url: fileName,
      uploaded_by: user.id,
    }).select().single();
    setStatus(null);
    if (insertError) { setError(translateError(insertError.message)); return; }
    onNewDocument(data);
    setTitle(""); setCategory(""); setDeptTodos(true); setSelectedDepts([]); setFile(null);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  }

  const fieldLabel = (text) => (
    <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>{text}</label>
  );
  const dateInputStyle = { ...inputStyle, fontSize:14, padding:"10px 14px" };
  const isLoading = !!status;

  function fmtDate(str) {
    if (!str) return "—";
    const d = new Date(str);
    const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Card>
        <CardHeader title="Subir documento" />
        {fieldLabel("Título")}
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Nombre del documento" style={{ ...dateInputStyle, marginBottom:14, display:"block" }}
          onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr", gap:12, marginBottom:14 }}>
          <div>
            {fieldLabel("Categoría")}
            <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Ej. Protocolo, Manual" style={dateInputStyle}
              onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
          </div>
          <div>
            {fieldLabel("Departamento")}
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {(() => {
                const chipBase = (sel) => ({
                  display:"inline-flex", alignItems:"center", padding:"5px 12px", borderRadius:20,
                  cursor:"pointer", fontSize:12, fontWeight:sel?600:400,
                  border:`1.5px solid ${sel?COLORS.gold:COLORS.border}`,
                  background:sel?"rgba(201,162,78,0.12)":COLORS.panel,
                  color:sel?COLORS.green:COLORS.textMuted,
                  transition:"all 0.15s", fontFamily:"'Manrope', sans-serif",
                });
                return (<>
                  <button type="button" onClick={() => { setDeptTodos(true); setSelectedDepts([]); }} style={chipBase(deptTodos)}>
                    Todos los departamentos
                  </button>
                  {departmentsList.map(dept => {
                    const sel = selectedDepts.includes(dept.name);
                    return (
                      <button type="button" key={dept.id} onClick={() => { setDeptTodos(false); setSelectedDepts(prev => sel ? prev.filter(d => d !== dept.name) : [...prev, dept.name]); }} style={chipBase(sel)}>
                        {dept.name}
                      </button>
                    );
                  })}
                </>);
              })()}
            </div>
          </div>
        </div>
        {fieldLabel("Archivo")}
        <label style={{ display:"block", marginBottom:16, cursor:"pointer" }}>
          <div style={{ background:COLORS.inputBg, border:`1.5px dashed ${COLORS.border}`, borderRadius:8, padding:"11px 14px", fontSize:13, color: file ? COLORS.text : COLORS.textMuted, fontFamily:"'Manrope', sans-serif" }}>
            {file ? file.name : "Seleccionar archivo…"}
          </div>
          <input type="file" onChange={handleFile} style={{ display:"none" }} />
        </label>
        {error   && <p style={{ fontSize:12, color:"#e07070", margin:"0 0 12px" }}>{error}</p>}
        {success && <p style={{ fontSize:12, color:COLORS.greenSoft, fontWeight:600, margin:"0 0 12px" }}>✓ Documento subido correctamente.</p>}
        <button onClick={handleSubmit} disabled={isLoading} style={{
          ...btnSubmitStyle, width:"100%", opacity: isLoading ? 0.75 : 1, cursor: isLoading ? "not-allowed" : "pointer",
        }}>
          {status === "uploading" ? "Subiendo archivo..." : status === "saving" ? "Guardando..." : "Subir documento"}
        </button>
      </Card>

      <Card>
        <CardHeader title="Documentos subidos" />
        {adminDocuments.length === 0 ? (
          <p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>No hay documentos subidos.</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column" }}>
            {adminDocuments.map((doc, i) => {
              const isConfirming = confirmDel === doc.id;
              const isDeleting   = !!deleting[doc.id];
              return (
                <div key={doc.id ?? i} style={{ padding:"12px 0", borderBottom:`1px solid ${COLORS.border}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:COLORS.text, marginBottom:4, wordBreak:"break-word" }}>{doc.title}</div>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                        {doc.category && <Tag label={doc.category} />}
                        <span style={{ fontSize:11, color:COLORS.textMuted }}>{Array.isArray(doc.departments) ? (doc.departments.length === 0 ? "Todos los departamentos" : doc.departments.join(", ")) : (doc.department || "Todos los departamentos")}</span>
                        <span style={{ fontSize:11, color:COLORS.textMuted }}>· {fmtDate(doc.created_at)}</span>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                      {doc.file_url && <DocDownloadBtn fileUrl={doc.file_url} />}
                      <button onClick={() => setConfirmDel(isConfirming ? null : doc.id)} disabled={isDeleting} title="Eliminar" style={{
                        border:"none", background:"rgba(192,57,43,0.08)", color:"#c0392b",
                        cursor:"pointer", borderRadius:6, width:30, height:30,
                        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                      }}>
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </div>
                  {isConfirming && (
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8, padding:"8px 10px", background:"rgba(192,57,43,0.06)", borderRadius:7 }}>
                      <span style={{ fontSize:12, color:"#c0392b", flex:1 }}>¿Eliminar este documento?</span>
                      <button onClick={() => handleDelete(doc)} disabled={isDeleting} style={{
                        border:"none", background:"#c0392b", color:"#FFF", borderRadius:6,
                        padding:"5px 12px", fontSize:12, fontWeight:700, cursor:"pointer",
                        fontFamily:"'Manrope', sans-serif", opacity: isDeleting ? 0.6 : 1,
                      }}>{isDeleting ? "Eliminando..." : "Sí, eliminar"}</button>
                      <button onClick={() => setConfirmDel(null)} style={{
                        border:"none", background:COLORS.panelAlt, color:COLORS.textMuted, borderRadius:6,
                        padding:"5px 12px", fontSize:12, fontWeight:600, cursor:"pointer",
                        fontFamily:"'Manrope', sans-serif",
                      }}>Cancelar</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function GestionComunicadosSection({ adminAnnouncements = [], departmentsList = [], onNewAnnouncement }) {
  const isMobile = useIsMobile();
  const nowLocal = () => {
    const d = new Date();
    d.setSeconds(0, 0);
    // Adjust for local timezone so datetime-local input shows the correct local time
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };
  const [title,     setTitle]     = useState("");
  const [tag,       setTag]       = useState("");
  const [body,      setBody]      = useState("");
  const [audienceTodos, setAudienceTodos] = useState(true);
  const [audienceDepts, setAudienceDepts] = useState([]);
  const [publishAt, setPublishAt] = useState(nowLocal);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [success,   setSuccess]   = useState(false);

  async function handlePublish() {
    setError(null);
    setSuccess(false);
    if (!title.trim() || !body.trim()) { setError("El título y el contenido son obligatorios."); return; }
    if (!audienceTodos && audienceDepts.length === 0) { setError("Selecciona al menos una audiencia."); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error: insertError } = await supabase.from("announcements").insert({
      title: title.trim(),
      tag:   tag.trim() || null,
      body:  body.trim(),
      audience_list: audienceTodos ? ["todos"] : audienceDepts,
      publish_at: new Date(publishAt).toISOString(),
      created_by: user.id,
    }).select().single();
    setLoading(false);
    if (insertError) { setError(translateError(insertError.message)); return; }
    onNewAnnouncement(data);
    setTitle(""); setTag(""); setBody(""); setAudienceTodos(true); setAudienceDepts([]); setPublishAt(nowLocal());
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
        <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr", gap:12, marginBottom:14 }}>
          <div>
            {fieldLabel("Etiqueta")}
            <input type="text" value={tag} onChange={e => setTag(e.target.value)} placeholder="Ej. General, Operaciones" style={dateInputStyle}
              onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
          </div>
          <div>
            {fieldLabel("Audiencia")}
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {(() => {
                const chipBase = (sel) => ({
                  display:"inline-flex", alignItems:"center", padding:"5px 12px", borderRadius:20,
                  cursor:"pointer", fontSize:12, fontWeight:sel?600:400,
                  border:`1.5px solid ${sel?COLORS.gold:COLORS.border}`,
                  background:sel?"rgba(201,162,78,0.12)":COLORS.panel,
                  color:sel?COLORS.green:COLORS.textMuted,
                  transition:"all 0.15s", fontFamily:"'Manrope', sans-serif",
                });
                return (<>
                  <button type="button" onClick={() => { setAudienceTodos(true); setAudienceDepts([]); }} style={chipBase(audienceTodos)}>
                    Todos los departamentos
                  </button>
                  {departmentsList.map(dept => {
                    const sel = audienceDepts.includes(dept.name);
                    return (
                      <button type="button" key={dept.id} onClick={() => { setAudienceTodos(false); setAudienceDepts(prev => sel ? prev.filter(d => d !== dept.name) : [...prev, dept.name]); }} style={chipBase(sel)}>
                        {dept.name}
                      </button>
                    );
                  })}
                </>);
              })()}
            </div>
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
                    <div style={{ fontSize:14, fontWeight:600, color:COLORS.text, marginBottom:4, wordBreak:"break-word" }}>{a.title}</div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center", marginBottom:4 }}>
                      {a.tag && <Tag label={a.tag} />}
                      <span style={{ fontSize:11, color:COLORS.textMuted }}>
                        Audiencia: <strong>{Array.isArray(a.audience_list) ? (a.audience_list.includes("todos") ? "Todos los departamentos" : a.audience_list.join(", ")) : (a.audience === "todos" ? "Todos los departamentos" : (a.audience || "—"))}</strong>
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

function AprobacionesSection({ adminRequests = [], adminReports = [], onUpdateAdminRequest, onUpdateAdminReport, reviewerName }) {
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
      reviewerName: r.reviewer?.full_name || null,
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
      reviewerName: r.reviewer?.full_name || null,
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
    if (error) { setErrors(prev => ({ ...prev, [key]: translateError(error.message) })); return; }
    if (item.kind === "request") onUpdateAdminRequest(item.id, { status: newStatus, reviewer: { full_name: reviewerName } });
    else                          onUpdateAdminReport(item.id,  { status: newStatus, reviewer: { full_name: reviewerName } });
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
            <div style={{ fontSize:13, fontWeight:600, color:COLORS.text, marginBottom:2, wordBreak:"break-word" }}>{item.label}</div>
            {item.subtitle && <div style={{ fontSize:11, color:COLORS.textMuted, lineHeight:1.5, marginBottom:2, wordBreak:"break-word" }}>{item.subtitle}</div>}
            {item.comment && <div style={{ fontSize:11, color:COLORS.textMuted, lineHeight:1.5, marginBottom:2, wordBreak:"break-word" }}><span style={{ fontWeight:600 }}>Nota:</span> {item.comment}</div>}
            {item.location && <div style={{ fontSize:11, color:COLORS.textMuted, marginBottom:2 }}>📍 {item.location}</div>}
            <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:2 }}>{fmtSupaDate((item.created_at ?? "").slice(0,10))}</div>
            {item.reviewerName && item.status !== "pendiente" && (
              <div style={{ fontSize:11, marginTop:4, color: item.status === "aprobado" ? COLORS.green : "#c0392b", fontWeight:600 }}>
                {item.status === "aprobado" ? "Aprobado" : "Rechazado"} por {item.reviewerName}
              </div>
            )}
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

function isBirthdayToday(birthDate) {
  if (!birthDate) return false;
  const today = new Date();
  const bd = new Date(birthDate + "T12:00:00");
  return bd.getMonth() === today.getMonth() && bd.getDate() === today.getDate();
}

const CONFETTI_PARTICLES = [
  { left: "4%",  delay: 0,    dur: 3.8, color: "#C9A24E", size: 8,  rect: true  },
  { left: "10%", delay: 0.6,  dur: 4.5, color: "#1F4A40", size: 6,  rect: false },
  { left: "17%", delay: 1.2,  dur: 3.3, color: "#D4B97A", size: 9,  rect: true  },
  { left: "24%", delay: 0.3,  dur: 4.8, color: "#C9A24E", size: 7,  rect: false },
  { left: "31%", delay: 1.8,  dur: 3.6, color: "#1F4A40", size: 8,  rect: true  },
  { left: "38%", delay: 0.9,  dur: 4.2, color: "#F0EBE0", size: 6,  rect: false },
  { left: "45%", delay: 2.1,  dur: 3.9, color: "#C9A24E", size: 10, rect: true  },
  { left: "52%", delay: 0.5,  dur: 4.6, color: "#D4B97A", size: 7,  rect: true  },
  { left: "59%", delay: 1.5,  dur: 3.3, color: "#1F4A40", size: 8,  rect: false },
  { left: "66%", delay: 0.8,  dur: 4.9, color: "#C9A24E", size: 6,  rect: true  },
  { left: "72%", delay: 2.4,  dur: 3.6, color: "#D4B97A", size: 9,  rect: false },
  { left: "78%", delay: 1.1,  dur: 4.3, color: "#C9A24E", size: 7,  rect: true  },
  { left: "84%", delay: 0.2,  dur: 3.9, color: "#1F4A40", size: 8,  rect: false },
  { left: "90%", delay: 1.7,  dur: 4.6, color: "#D4B97A", size: 6,  rect: true  },
  { left: "96%", delay: 0.7,  dur: 3.3, color: "#C9A24E", size: 10, rect: false },
  { left: "7%",  delay: 2.8,  dur: 4.1, color: "#D4B97A", size: 7,  rect: true  },
  { left: "43%", delay: 3.2,  dur: 3.7, color: "#1F4A40", size: 6,  rect: false },
  { left: "70%", delay: 1.9,  dur: 4.4, color: "#C9A24E", size: 8,  rect: true  },
];

function BirthdayConfetti() {
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

function Dashboard({ onLogout, profile, allRequests = [], onNewRequest, reports = [], onNewReport, announcements = [], documents = [], upcomingBirthdays = [], adminRequests = [], adminReports = [], onUpdateAdminRequest, onUpdateAdminReport, adminAnnouncements = [], onNewAnnouncement, adminDocuments = [], onNewDocument, onDeleteDocument, adminProfiles = [], departments = [], departmentsList = [], onUpdateAdminProfile }) {
  const [active, setActive] = useState("inicio");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const noAnim = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [displayActive, setDisplayActive] = useState("inicio");
  const [sectionPhase, setSectionPhase] = useState(null); // null = no anim on first mount
  const navigate = useCallback((next) => {
    if (next === displayActive) return;
    setActive(next);
    if (noAnim) { setDisplayActive(next); return; }
    setSectionPhase("out");
    setTimeout(() => { setDisplayActive(next); setSectionPhase("in"); }, 170);
  }, [displayActive, noAnim]);
  const sectionAnim = (!sectionPhase || noAnim) ? {} : sectionPhase === "out"
    ? { animation: "sectionOut 0.17s ease-in both" }
    : { animation: "sectionIn 0.22s ease-out both" };
  const [dashDone, setDashDone] = useState(false);
  const dashboardInAnim = (!dashDone && !noAnim) ? { animation: "dashboardIn 0.45s ease-out both" } : {};

  const sectionTitle = { inicio: "Inicio", vacaciones: "Vacaciones", comunicados: "Comunicados", documentos: "Documentos", solicitudes: "Solicitudes", perfil: "Mi perfil", aprobaciones: "Aprobaciones", "comunicados-admin": "Gestionar comunicados", "documentos-admin": "Gestionar documentos", empleados: "Empleados", "alta-empleado": "Gestión de empleados" }[displayActive];

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
      reviewerName: r.reviewer?.full_name || null,
      reviewed_at: r.reviewed_at || null,
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

  const now = new Date();
  const hour = now.getHours();
  const timeGreeting = hour >= 5 && hour < 12 ? "Buenos días"
    : hour >= 12 && hour < 19 ? "Buenas tardes"
    : "Buenas noches";
  const greeting = profile?.full_name
    ? `${timeGreeting}, ${profile.full_name.split(" ")[0]}`
    : timeGreeting;
  const DAY_NAMES = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const todayStr = `${DAY_NAMES[now.getDay()]} ${now.getDate()} de ${MONTH_NAMES[now.getMonth()].toLowerCase()} de ${now.getFullYear()}`;
  const isBirthday = isBirthdayToday(profile?.birth_date);
  const firstName = profile?.full_name?.split(" ")[0] || "";
  const dailyMessage = getDailyMessage();

  if (isMobile) {
    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'Manrope', sans-serif" }}>
        {/* Header fijo móvil */}
        <div style={{
          position: "sticky", top: 0, zIndex: 50, width: "100%", boxSizing: "border-box",
          background: SIDEBAR_BG, padding: "10px 14px",
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
        {isBirthday && !noAnim && <BirthdayConfetti />}
        <MobileDrawer open={drawerOpen} onClose={closeDrawer} active={active} setActive={navigate} onLogout={onLogout} profile={profile} pendingApprovalCount={pendingApprovalCount} />
        <div style={{ padding: "24px 16px 48px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.22em", color: COLORS.gold, marginBottom: 4, textTransform: "uppercase", fontWeight: 600 }}>
            {todayStr}
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, margin: "0 0 6px", color: COLORS.green }}>
            {displayActive === "inicio" ? greeting : sectionTitle}
          </h1>
          {isBirthday && displayActive === "inicio" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 10px" }}>
              <Cake size={18} color={COLORS.gold} />
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: COLORS.gold }}>
                ¡Feliz cumpleaños!
              </span>
            </div>
          )}
          {displayActive === "inicio" && (
            <p style={{ fontSize: 13, color: COLORS.textMuted, margin: "0 0 20px", lineHeight: 1.55, fontStyle: "italic" }}>
              {dailyMessage}
            </p>
          )}
          {displayActive === "inicio" ? <DashboardHome isMobile={true} setActive={navigate} allSolicitudes={allSolicitudes} vacData={vacData} announcements={announcements} documents={documents} upcomingBirthdays={upcomingBirthdays} onNewRequest={onNewRequest} onNewReport={onNewReport} existingVacationRequests={vacationRequests} /> : displayActive === "vacaciones" ? <VacationSection profile={profile} vacationRequests={vacationRequests} onNewRequest={onNewRequest} /> : displayActive === "comunicados" ? <AnnouncementsSection announcements={announcements} /> : displayActive === "documentos" ? <DocumentsSection documents={documents} /> : displayActive === "solicitudes" ? <SolicitudesSection allSolicitudes={allSolicitudes} onNewRequest={onNewRequest} onNewReport={onNewReport} availableDays={availableDays} existingVacationRequests={vacationRequests} /> : displayActive === "perfil" ? <ProfileSection profile={profile} /> : displayActive === "aprobaciones" ? <AprobacionesSection adminRequests={adminRequests} adminReports={adminReports} onUpdateAdminRequest={onUpdateAdminRequest} onUpdateAdminReport={onUpdateAdminReport} reviewerName={profile?.full_name} /> : displayActive === "comunicados-admin" ? <GestionComunicadosSection adminAnnouncements={adminAnnouncements} departmentsList={departmentsList} onNewAnnouncement={onNewAnnouncement} /> : displayActive === "documentos-admin" ? <GestionDocumentosSection adminDocuments={adminDocuments} departmentsList={departmentsList} onNewDocument={onNewDocument} onDeleteDocument={onDeleteDocument} /> : displayActive === "empleados" ? <EmpleadosSection adminProfiles={adminProfiles} adminRequests={adminRequests} departmentsList={departmentsList} onUpdateProfile={onUpdateAdminProfile} /> : displayActive === "alta-empleado" ? <AltaEmpleadoSection departmentsList={departmentsList} /> : <PlaceholderSection title={sectionTitle} />}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", background: COLORS.bg, minHeight: "100vh", fontFamily: "'Manrope', sans-serif", ...dashboardInAnim }} onAnimationEnd={(e) => { if (e.animationName === "dashboardIn") setDashDone(true); }}>
      {isBirthday && !noAnim && <BirthdayConfetti />}
      <Sidebar active={active} setActive={navigate} onLogout={onLogout} profile={profile} pendingApprovalCount={pendingApprovalCount} />
      <div style={{ flex: 1, padding: "36px 40px", minWidth: 0 }}>
        <div style={sectionAnim} onAnimationEnd={(e) => { if (e.animationName === "sectionIn") setSectionPhase(null); }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.25em", color: COLORS.gold, marginBottom: 6, textTransform: "uppercase", fontWeight: 600 }}>
              {todayStr}
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, margin: "0 0 6px", color: COLORS.green }}>
              {displayActive === "inicio" ? greeting : sectionTitle}
            </h1>
            {isBirthday && displayActive === "inicio" && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0 10px" }}>
                <Cake size={20} color={COLORS.gold} />
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: COLORS.gold }}>
                  ¡Feliz cumpleaños!
                </span>
              </div>
            )}
            {displayActive === "inicio" && (
              <p style={{ fontSize: 14, color: COLORS.textMuted, margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
                {dailyMessage}
              </p>
            )}
          </div>
          {displayActive === "inicio" ? <DashboardHome isMobile={false} setActive={navigate} allSolicitudes={allSolicitudes} vacData={vacData} announcements={announcements} documents={documents} upcomingBirthdays={upcomingBirthdays} onNewRequest={onNewRequest} onNewReport={onNewReport} existingVacationRequests={vacationRequests} /> : displayActive === "vacaciones" ? <VacationSection profile={profile} vacationRequests={vacationRequests} onNewRequest={onNewRequest} /> : displayActive === "comunicados" ? <AnnouncementsSection announcements={announcements} /> : displayActive === "documentos" ? <DocumentsSection documents={documents} /> : displayActive === "solicitudes" ? <SolicitudesSection allSolicitudes={allSolicitudes} onNewRequest={onNewRequest} onNewReport={onNewReport} availableDays={availableDays} existingVacationRequests={vacationRequests} /> : displayActive === "perfil" ? <ProfileSection profile={profile} /> : displayActive === "aprobaciones" ? <AprobacionesSection adminRequests={adminRequests} adminReports={adminReports} onUpdateAdminRequest={onUpdateAdminRequest} onUpdateAdminReport={onUpdateAdminReport} reviewerName={profile?.full_name} /> : displayActive === "comunicados-admin" ? <GestionComunicadosSection adminAnnouncements={adminAnnouncements} departmentsList={departmentsList} onNewAnnouncement={onNewAnnouncement} /> : displayActive === "documentos-admin" ? <GestionDocumentosSection adminDocuments={adminDocuments} departmentsList={departmentsList} onNewDocument={onNewDocument} onDeleteDocument={onDeleteDocument} /> : displayActive === "empleados" ? <EmpleadosSection adminProfiles={adminProfiles} adminRequests={adminRequests} departmentsList={departmentsList} onUpdateProfile={onUpdateAdminProfile} /> : displayActive === "alta-empleado" ? <AltaEmpleadoSection departmentsList={departmentsList} /> : <PlaceholderSection title={sectionTitle} />}
        </div>
      </div>
    </div>
  );
}

function buildAudienceFilter(column, userDepartments) {
  const depts = userDepartments || [];
  const escaped = depts.map(d => `"${d}"`).join(",");
  if (escaped) return `${column}.cs.{todos},${column}.ov.{${escaped}}`;
  return `${column}.cs.{todos}`;
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
  const [adminDocuments,     setAdminDocuments]      = useState([]);
  const [adminProfiles,      setAdminProfiles]       = useState([]);
  const [departments,        setDepartments]         = useState([]);
  const [departmentsList,    setDepartmentsList]     = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null);
      if (!s) { setProfile(null); setAllRequests([]); setAnnouncements([]); setDocuments([]); setUpcomingBirthdays([]); setReports([]); setAdminRequests([]); setAdminReports([]); setAdminAnnouncements([]); setAdminDocuments([]); setAdminProfiles([]); setDepartments([]); setDepartmentsList([]); }
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
      .select("*, reviewer:profiles!reviewed_by(full_name)")
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
    if (!profile) return;
    supabase
      .from("announcements")
      .select("*")
      .lte("publish_at", new Date().toISOString())
      .or(buildAudienceFilter("audience_list", profile.departments))
      .order("publish_at", { ascending: false })
      .then(({ data }) => { if (data) setAnnouncements(data); });
    supabase
      .from("documents")
      .select("*")
      .or(buildAudienceFilter("departments", profile.departments))
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
    supabase.from("requests").select("*, profiles!requests_user_id_fkey(full_name, department), reviewer:profiles!reviewed_by(full_name)").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setAdminRequests(data); });
    supabase.from("reports").select("*, profiles!reports_user_id_fkey(full_name, department), reviewer:profiles!reviewed_by(full_name)").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setAdminReports(data);
      });
    supabase.from("announcements").select("*").order("publish_at", { ascending: false })
      .then(({ data }) => { if (data) setAdminAnnouncements(data); });
    supabase.from("documents").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setAdminDocuments(data); });
    supabase.from("profiles").select("*").order("full_name", { ascending: true })
      .then(({ data }) => {
        if (!data) return;
        setAdminProfiles(data);
        const unique = [...new Set(data.map(p => p.department).filter(Boolean))].sort();
        setDepartments(unique);
      });
    supabase.from("departments").select("*").order("name")
      .then(({ data }) => { if (data) setDepartmentsList(data); });
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
            adminDocuments={adminDocuments}
            onNewDocument={d => setAdminDocuments(prev => [d, ...prev])}
            onDeleteDocument={id => setAdminDocuments(prev => prev.filter(d => d.id !== id))}
            adminProfiles={adminProfiles}
            departments={departments}
            departmentsList={departmentsList}
            onUpdateAdminProfile={updatedEmp => setAdminProfiles(prev => prev.map(p => p.id === updatedEmp.id ? updatedEmp : p))}
          />
        : <LoginScreen onLogin={() => {}} />
      }
    </div>
  );
}

