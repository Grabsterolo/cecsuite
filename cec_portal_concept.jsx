import React, { useState, useEffect, useCallback } from "react";
import {
  Bell, FileText, CalendarDays, User, LogOut,
  Home, ChevronRight, Download, Clock, CheckCircle2, Cake, Menu, X,
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
  sidebar: "linear-gradient(170deg, #24584C 0%, #1F4A40 40%, #152E27 100%)",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Manrope:wght@400;500;600;700&display=swap');
* { -webkit-tap-highlight-color: transparent; }
`;

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
  const handleError = useCallback(() => setImgError(true), []);
  if (!imgError) {
    return (
      <img
        src="/logo-blanco.png"
        alt="Centro Europeo de Cirugía"
        style={{ width, height: "auto", display: "block", margin: "0 auto" }}
        onError={handleError}
      />
    );
  }
  return (
    <div style={{ textAlign: "center", lineHeight: 1.2 }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 18, color: "#FFF", letterSpacing: "0.08em" }}>Centro Europeo</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 22, color: COLORS.goldSoft, letterSpacing: "0.16em" }}>DE CIRUGÍA</div>
    </div>
  );
}

/* ─────────────────────────── LOGIN ─────────────────────────── */

const inputStyle = {
  width: "100%",
  background: COLORS.inputBg,
  border: `1.5px solid ${COLORS.border}`,
  borderRadius: 8,
  padding: "12px 14px",
  color: COLORS.text,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "'Manrope', sans-serif",
  transition: "border-color 0.2s",
  display: "block",
};

const labelStyle = {
  fontSize: 12, color: COLORS.textMuted,
  display: "block", marginBottom: 6,
  fontWeight: 600, letterSpacing: "0.02em",
};

function LoginForm({ onLogin }) {
  return (
    <>
      <div style={{ width: 32, height: 3, background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.goldSoft})`, borderRadius: 2, marginBottom: 20 }} />
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, marginBottom: 6, color: COLORS.green, lineHeight: 1.1 }}>
        Bienvenido<br />de nuevo
      </h1>
      <p style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 32, lineHeight: 1.6 }}>
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

      <label style={labelStyle}>Correo corporativo</label>
      <input type="email" placeholder="nombre@cec.co.cr" style={{ ...inputStyle, marginBottom: 14 }}
        onFocus={e => e.target.style.borderColor = COLORS.gold}
        onBlur={e => e.target.style.borderColor = COLORS.border}
      />
      <label style={labelStyle}>Contraseña</label>
      <input type="password" placeholder="••••••••" style={{ ...inputStyle, marginBottom: 24 }}
        onFocus={e => e.target.style.borderColor = COLORS.gold}
        onBlur={e => e.target.style.borderColor = COLORS.border}
      />

      <button onClick={onLogin} style={{
        width: "100%",
        background: `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
        border: "none", borderRadius: 8, padding: "13px 16px", color: "#FFF",
        fontSize: 14, fontWeight: 700, cursor: "pointer",
        letterSpacing: "0.04em", fontFamily: "'Manrope', sans-serif",
        boxShadow: "0 4px 16px rgba(201,162,78,0.4)",
        transition: "box-shadow 0.2s, transform 0.15s",
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
        <div style={{ background: COLORS.sidebar, padding: "48px 32px 36px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
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
      <div style={{ flex: "0 0 45%", background: COLORS.sidebar, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "60px 56px", gap: 10 }}>
        <Logo width={380} />
        <div style={{ width: 80, height: 2, background: COLORS.gold, opacity: 0.7 }} />
        <div style={{ fontSize: 14, letterSpacing: "0.35em", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", fontWeight: 500 }}>
          Portal de Colaboradores
        </div>
      </div>
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
  { key: "vacaciones",  label: "Vacaciones",  icon: CalendarDays },
  { key: "perfil",      label: "Mi perfil",   icon: User },
];

const ANNOUNCEMENTS = [
  { title: "Nuevo protocolo de bioseguridad en quirófano", date: "10 jun 2026", tag: "Operaciones" },
  { title: "Horario especial — semana del 23 al 27 de junio", date: "8 jun 2026", tag: "Administración" },
  { title: "Capacitación: manejo de historia clínica digital", date: "5 jun 2026", tag: "Capacitación" },
];

const DOCUMENTS = [
  "Reglamento interno de trabajo",
  "Política de vacaciones y permisos",
  "Manual de bioseguridad",
  "Recibo de pago — mayo 2026",
];

const BIRTHDAYS = [
  { name: "Andrea Solís", date: "14 jun" },
  { name: "Marco Vargas", date: "19 jun" },
];

/* Drawer lateral móvil con transición */
function MobileDrawer({ open, onClose, active, setActive, onLogout }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        zIndex: 90, opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.25s ease",
      }} />

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 272,
        background: COLORS.sidebar, zIndex: 100,
        display: "flex", flexDirection: "column", padding: "24px 16px",
        boxShadow: "-6px 0 32px rgba(0,0,0,0.3)",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <Logo width={140} />
          <button onClick={onClose} style={{
            border: "none", background: "rgba(255,255,255,0.1)", color: "#FFF",
            cursor: "pointer", borderRadius: 8, width: 34, height: 34,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          >
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
            transition: "color 0.15s",
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
      width: 252, background: COLORS.sidebar, display: "flex", flexDirection: "column",
      padding: "28px 14px", height: "100vh", position: "sticky", top: 0, flexShrink: 0,
      overflowY: "auto",
    }}>
      <div style={{ padding: "0 8px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 16 }}>
        <Logo width={160} />
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button key={item.key} onClick={() => setActive(item.key)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
              borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left",
              fontSize: 14, fontWeight: 600, fontFamily: "'Manrope', sans-serif",
              color: isActive ? "#FFF" : COLORS.sidebarMuted,
              background: isActive ? `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})` : "transparent",
              transition: "background 0.15s, color 0.15s",
            }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#FFF"; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = COLORS.sidebarMuted; } }}
            >
              <Icon size={16} />{item.label}
            </button>
          );
        })}
      </nav>
      <div style={{ marginTop: "auto" }}>
        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "0 8px 14px" }} />
        <button onClick={onLogout} style={{
          display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
          borderRadius: 8, border: "none", background: "transparent",
          color: COLORS.sidebarMuted, fontSize: 14, fontWeight: 600,
          fontFamily: "'Manrope', sans-serif", cursor: "pointer", width: "100%", transition: "color 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.color = "#FFF"}
          onMouseLeave={e => e.currentTarget.style.color = COLORS.sidebarMuted}
        >
          <LogOut size={16} />Cerrar sesión
        </button>
      </div>
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 20, boxShadow: "0 1px 6px rgba(31,74,64,0.06)", ...style }}>
      {children}
    </div>
  );
}

function CardHeader({ title, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: COLORS.green, margin: 0 }}>{title}</h3>
      {action}
    </div>
  );
}

function VacationDonut({ used = 9, total = 21 }) {
  const available = total - used;
  const deg = Math.round((used / total) * 360);
  return (
    <div style={{ width: 110, height: 110, borderRadius: "50%", flexShrink: 0, background: `conic-gradient(${COLORS.gold} 0deg ${deg}deg, ${COLORS.panelAlt} ${deg}deg 360deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: COLORS.panel, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 700, color: COLORS.green, lineHeight: 1 }}>{available}</span>
        <span style={{ fontSize: 10, color: COLORS.textMuted }}>días</span>
      </div>
    </div>
  );
}

function Tag({ label }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: COLORS.gold, background: "rgba(201,162,78,0.1)", borderRadius: 4, padding: "2px 7px" }}>{label}</span>
  );
}

function DashboardHome({ isMobile }) {
  return (
    <div style={isMobile ? { display: "flex", flexDirection: "column", gap: 14 } : { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>

      <Card>
        <CardHeader title="Vacaciones" />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <VacationDonut />
          <div style={{ flex: 1, fontSize: 13, color: COLORS.textMuted }}>
            <p style={{ margin: "0 0 6px" }}><span style={{ color: COLORS.green, fontWeight: 700 }}>9</span> días tomados</p>
            <p style={{ margin: "0 0 16px" }}><span style={{ color: COLORS.green, fontWeight: 700 }}>2</span> pendientes</p>
            <button style={{ background: "transparent", border: `1.5px solid ${COLORS.gold}`, color: COLORS.gold, borderRadius: 7, padding: "7px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope', sans-serif", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(201,162,78,0.08)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >Solicitar</button>
          </div>
        </div>
      </Card>

      <Card style={isMobile ? {} : { gridColumn: "span 2" }}>
        <CardHeader title="Comunicados recientes" action={
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: COLORS.gold, cursor: "pointer", fontWeight: 600 }}>
            Ver todos <ChevronRight size={14} />
          </span>
        } />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {ANNOUNCEMENTS.map((a) => (
            <div key={a.title} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 14, borderBottom: `1px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ fontSize: 13, color: COLORS.text, fontWeight: 500 }}>{a.title}</div>
                <Tag label={a.tag} />
              </div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", marginLeft: 12 }}>
                <Clock size={11} />{a.date}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Documentos" />
        <div>
          {DOCUMENTS.map((d) => (
            <div key={d} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: COLORS.text, padding: "9px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}><FileText size={14} color={COLORS.textMuted} />{d}</span>
              <Download size={14} color={COLORS.gold} style={{ cursor: "pointer", flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Solicitudes" />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "rgba(44,99,86,0.07)" }}>
            <CheckCircle2 size={16} color={COLORS.greenSoft} />
            <div>
              <div style={{ color: COLORS.text, fontWeight: 500 }}>Permiso 2 jun</div>
              <div style={{ color: COLORS.greenSoft, fontSize: 11, marginTop: 2 }}>Aprobado</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "rgba(201,162,78,0.07)" }}>
            <Clock size={16} color={COLORS.gold} />
            <div>
              <div style={{ color: COLORS.text, fontWeight: 500 }}>Vacaciones 1–5 jul</div>
              <div style={{ color: COLORS.gold, fontSize: 11, marginTop: 2 }}>En revisión</div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Próximos cumpleaños" />
        <div>
          {BIRTHDAYS.map((b) => (
            <div key={b.name} style={{ display: "flex", alignItems: "center", gap: 10, color: COLORS.text, padding: "9px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <Cake size={16} color={COLORS.gold} />
              {b.name}
              <span style={{ marginLeft: "auto", color: COLORS.textMuted, fontSize: 12 }}>{b.date}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PlaceholderSection({ title }) {
  return (
    <Card>
      <CardHeader title={title} />
      <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0 }}>Esta sección se desarrolla en la siguiente fase.</p>
    </Card>
  );
}

function Dashboard({ onLogout }) {
  const [active, setActive] = useState("inicio");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const sectionTitle = { inicio: "Inicio", comunicados: "Comunicados", documentos: "Documentos", vacaciones: "Vacaciones", perfil: "Mi perfil" }[active];

  if (isMobile) {
    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'Manrope', sans-serif" }}>

        {/* Header fijo móvil */}
        <div style={{
          position: "sticky", top: 0, zIndex: 50,
          background: COLORS.sidebar,
          padding: "12px 16px",
          display: "flex", alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          {/* Espacio izquierdo para centrar el logo */}
          <div style={{ width: 42, flexShrink: 0 }} />
          {/* Logo centrado */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Logo width={120} />
          </div>
          {/* Hamburguesa */}
          <button onClick={openDrawer} style={{
            width: 42, height: 42, border: "none",
            background: "rgba(255,255,255,0.1)",
            color: "#FFF", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 10, flexShrink: 0,
            transition: "background 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Drawer */}
        <MobileDrawer
          open={drawerOpen}
          onClose={closeDrawer}
          active={active}
          setActive={setActive}
          onLogout={onLogout}
        />

        {/* Contenido */}
        <div style={{ padding: "24px 16px 48px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.22em", color: COLORS.gold, marginBottom: 4, textTransform: "uppercase", fontWeight: 600 }}>
            Viernes 12 de junio, 2026
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, margin: "0 0 22px", color: COLORS.green }}>
            {active === "inicio" ? "Buenos días, Juan Pablo" : sectionTitle}
          </h1>
          {active === "inicio" ? <DashboardHome isMobile={true} /> : <PlaceholderSection title={sectionTitle} />}
        </div>
      </div>
    );
  }

  /* ── Desktop ── */
  return (
    <div style={{ display: "flex", background: COLORS.bg, minHeight: "100vh", fontFamily: "'Manrope', sans-serif" }}>
      <Sidebar active={active} setActive={setActive} onLogout={onLogout} />
      <div style={{ flex: 1, padding: "36px 40px", minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.25em", color: COLORS.gold, marginBottom: 6, textTransform: "uppercase", fontWeight: 600 }}>
              Viernes 12 de junio, 2026
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, margin: 0, color: COLORS.green }}>
              {active === "inicio" ? "Buenos días, Juan Pablo" : sectionTitle}
            </h1>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#FFF", fontFamily: "'Cormorant Garamond', serif", fontSize: 17, boxShadow: "0 2px 8px rgba(201,162,78,0.35)", flexShrink: 0 }}>
            JP
          </div>
        </div>
        {active === "inicio" ? <DashboardHome isMobile={false} /> : <PlaceholderSection title={sectionTitle} />}
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
