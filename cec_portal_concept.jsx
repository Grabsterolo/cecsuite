import React, { useState } from "react";
import {
  Bell,
  FileText,
  CalendarDays,
  User,
  LogOut,
  Home,
  ChevronRight,
  Download,
  Clock,
  CheckCircle2,
  Cake,
} from "lucide-react";

const COLORS = {
  bg: "#FAFAF8",
  panel: "#FFFFFF",
  panelAlt: "#F4F1EA",
  gold: "#C9A24E",
  goldSoft: "#E4C77A",
  green: "#1F4A40",
  greenSoft: "#2C6356",
  text: "#1F4A40",
  textMuted: "#6B8C80",
  border: "rgba(31,74,64,0.12)",
  sidebar: "#1F4A40",
  sidebarMuted: "rgba(255,255,255,0.55)",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Manrope:wght@400;500;600;700&display=swap');
`;

/* Logo blanco (/logo-blanco.png) — directo sobre fondos oscuros */
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
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 18, color: "#FFFFFF", letterSpacing: "0.08em" }}>
        Centro Europeo
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 22, color: COLORS.goldSoft, letterSpacing: "0.16em" }}>
        DE CIRUGÍA
      </div>
    </div>
  );
}

/* ─────────────────────────── LOGIN ─────────────────────────── */

function LoginScreen({ onLogin }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily: "'Manrope', sans-serif",
    }}>
      {/* Panel izquierdo */}
      <div style={{
        flex: "0 0 45%",
        background: COLORS.sidebar,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 56px",
      }}>
        <Logo width="100%" />

        <div style={{
          marginTop: 40,
          fontSize: 11,
          letterSpacing: "0.4em",
          color: "rgba(255,255,255,0.45)",
          textTransform: "uppercase",
          textAlign: "center",
        }}>
          Portal de Colaboradores
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        background: "#FFFFFF",
      }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 34,
            fontWeight: 600,
            marginBottom: 8,
            color: COLORS.green,
          }}>
            Bienvenido de nuevo
          </h1>
          <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 36 }}>
            Ingresa con tu cuenta institucional para continuar.
          </p>

          <button
            onClick={onLogin}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              background: "#FFFFFF",
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: "13px 16px",
              color: COLORS.text,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "border-color 0.2s, box-shadow 0.2s",
              boxShadow: "0 1px 3px rgba(31,74,64,0.06)",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.gold; e.currentTarget.style.boxShadow = "0 2px 8px rgba(201,162,78,0.18)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = "0 1px 3px rgba(31,74,64,0.06)"; }}
          >
            <svg width="18" height="18" viewBox="0 0 23 23" style={{ flexShrink: 0 }}>
              <rect x="1" y="1" width="10" height="10" fill="#F25022" />
              <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
              <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
              <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
            </svg>
            Continuar con Microsoft
          </button>

          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            margin: "28px 0",
            color: COLORS.textMuted, fontSize: 12,
          }}>
            <div style={{ flex: 1, height: 1, background: COLORS.border }} />
            o con tu correo
            <div style={{ flex: 1, height: 1, background: COLORS.border }} />
          </div>

          <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 6, fontWeight: 500 }}>
            Correo corporativo
          </label>
          <input
            type="email"
            placeholder="nombre@cec.cr"
            style={{
              width: "100%",
              background: "#FFFFFF",
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: 8,
              padding: "11px 14px",
              color: COLORS.text,
              fontSize: 14,
              marginBottom: 16,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "'Manrope', sans-serif",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = COLORS.gold}
            onBlur={e => e.target.style.borderColor = COLORS.border}
          />
          <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 6, fontWeight: 500 }}>
            Contraseña
          </label>
          <input
            type="password"
            placeholder="••••••••"
            style={{
              width: "100%",
              background: "#FFFFFF",
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: 8,
              padding: "11px 14px",
              color: COLORS.text,
              fontSize: 14,
              marginBottom: 28,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "'Manrope', sans-serif",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = COLORS.gold}
            onBlur={e => e.target.style.borderColor = COLORS.border}
          />

          <button
            onClick={onLogin}
            style={{
              width: "100%",
              background: `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
              border: "none",
              borderRadius: 8,
              padding: "13px 16px",
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.02em",
              fontFamily: "'Manrope', sans-serif",
              boxShadow: "0 4px 14px rgba(201,162,78,0.35)",
              transition: "box-shadow 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(201,162,78,0.5)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 14px rgba(201,162,78,0.35)"}
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── DASHBOARD ─────────────────────────── */

const NAV_ITEMS = [
  { key: "inicio",       label: "Inicio",      icon: Home },
  { key: "comunicados",  label: "Comunicados", icon: Bell },
  { key: "documentos",   label: "Documentos",  icon: FileText },
  { key: "vacaciones",   label: "Vacaciones",  icon: CalendarDays },
  { key: "perfil",       label: "Mi perfil",   icon: User },
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

function Sidebar({ active, setActive, onLogout }) {
  return (
    <div style={{
      width: 252,
      background: COLORS.sidebar,
      display: "flex",
      flexDirection: "column",
      padding: "32px 16px",
      height: "100vh",
      position: "sticky",
      top: 0,
      flexShrink: 0,
    }}>
      <div style={{ padding: "0 8px 36px" }}>
        <Logo width={190} />
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
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontSize: 14,
                fontWeight: 600,
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
        <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "0 8px 16px" }} />
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: "transparent",
            color: COLORS.sidebarMuted,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "'Manrope', sans-serif",
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
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
      boxShadow: "0 1px 4px rgba(31,74,64,0.06)",
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

/* Indicador de vacaciones — solo CSS, sin SVG */
function VacationDonut({ used = 9, total = 21 }) {
  const available = total - used;
  const deg = Math.round((used / total) * 360);
  return (
    <div style={{
      width: 128,
      height: 128,
      borderRadius: "50%",
      background: `conic-gradient(${COLORS.gold} 0deg ${deg}deg, ${COLORS.panelAlt} ${deg}deg 360deg)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}>
      <div style={{
        width: 96,
        height: 96,
        borderRadius: "50%",
        background: COLORS.panel,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: COLORS.green, lineHeight: 1 }}>
          {available}
        </span>
        <span style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.04em" }}>
          días
        </span>
      </div>
    </div>
  );
}

function Tag({ label }) {
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: COLORS.gold,
      background: "rgba(201,162,78,0.1)",
      borderRadius: 4,
      padding: "2px 7px",
    }}>
      {label}
    </span>
  );
}

function DashboardHome() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>

      {/* Vacaciones */}
      <Card>
        <CardHeader title="Vacaciones" />
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <VacationDonut />
          <div style={{ flex: 1, fontSize: 13, color: COLORS.textMuted }}>
            <p style={{ margin: "0 0 6px" }}>
              <span style={{ color: COLORS.green, fontWeight: 700 }}>9</span> días tomados este año
            </p>
            <p style={{ margin: "0 0 18px" }}>
              <span style={{ color: COLORS.green, fontWeight: 700 }}>2</span> solicitudes pendientes
            </p>
            <button style={{
              background: "transparent",
              border: `1.5px solid ${COLORS.gold}`,
              color: COLORS.gold,
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Manrope', sans-serif",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(201,162,78,0.08)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              Solicitar vacaciones
            </button>
          </div>
        </div>
      </Card>

      {/* Comunicados */}
      <Card style={{ gridColumn: "span 2" }}>
        <CardHeader
          title="Comunicados recientes"
          action={
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: COLORS.gold, cursor: "pointer", fontWeight: 600 }}>
              Ver todos <ChevronRight size={14} />
            </span>
          }
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {ANNOUNCEMENTS.map((a) => (
            <div key={a.title} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              paddingBottom: 14, borderBottom: `1px solid ${COLORS.border}`,
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: 14, color: COLORS.text, fontWeight: 500 }}>{a.title}</div>
                <Tag label={a.tag} />
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", marginLeft: 16 }}>
                <Clock size={12} />
                {a.date}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Documentos */}
      <Card>
        <CardHeader title="Documentos" />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {DOCUMENTS.map((d) => (
            <div key={d} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              fontSize: 13, color: COLORS.text, padding: "8px 0",
              borderBottom: `1px solid ${COLORS.border}`,
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileText size={14} color={COLORS.textMuted} />
                {d}
              </span>
              <Download size={14} color={COLORS.gold} style={{ cursor: "pointer", flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </Card>

      {/* Estado de solicitudes */}
      <Card>
        <CardHeader title="Estado de solicitudes" />
        <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 13 }}>
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

      {/* Cumpleaños */}
      <Card>
        <CardHeader title="Próximos cumpleaños" />
        <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
          {BIRTHDAYS.map((b) => (
            <div key={b.name} style={{
              display: "flex", alignItems: "center", gap: 10,
              color: COLORS.text, padding: "8px 0",
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
  );
}

function PlaceholderSection({ title }) {
  return (
    <Card>
      <CardHeader title={title} />
      <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0 }}>
        Esta sección se desarrolla en la siguiente fase del concepto.
      </p>
    </Card>
  );
}

function Dashboard({ onLogout }) {
  const [active, setActive] = useState("inicio");

  const sectionTitle = {
    inicio: "Inicio", comunicados: "Comunicados",
    documentos: "Documentos", vacaciones: "Vacaciones", perfil: "Mi perfil",
  }[active];

  return (
    <div style={{ display: "flex", background: COLORS.bg, minHeight: "100vh", fontFamily: "'Manrope', sans-serif" }}>
      <Sidebar active={active} setActive={setActive} onLogout={onLogout} />

      <div style={{ flex: 1, padding: "36px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.25em", color: COLORS.gold, marginBottom: 6, textTransform: "uppercase", fontWeight: 600 }}>
              Viernes 12 de junio, 2026
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, margin: 0, color: COLORS.green }}>
              {active === "inicio" ? "Buenos días, Juan Pablo" : sectionTitle}
            </h1>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, color: "#FFFFFF",
            fontFamily: "'Cormorant Garamond', serif", fontSize: 18,
            boxShadow: "0 2px 8px rgba(201,162,78,0.35)",
          }}>
            JP
          </div>
        </div>

        {active === "inicio" ? <DashboardHome /> : <PlaceholderSection title={sectionTitle} />}
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
