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

/*
  CEC — Portal de Colaboradores
  Concepto v1

  Tokens
  - Fondo principal: #0B0E0D (casi negro, como el logo)
  - Panel / tarjeta: #121A18
  - Panel elevado: #1B2624
  - Acento dorado: #C9A24E / gradiente #E4C77A -> #A6802F
  - Acento verde institucional: #1F4A40 / #2C6356
  - Texto principal: #F3F1EA
  - Texto secundario: #8FA29B

  Tipografía
  - Display: "Cormorant Garamond" (serif, eco del logotipo)
  - Cuerpo / UI: "Manrope"

  Elemento de firma
  - El lazo del infinito del logo reinterpretado como una línea
    fina dorada que conecta secciones (separadores curvos),
    y como el indicador de "progreso" del saldo de vacaciones.
*/

const COLORS = {
  bg: "#0B0E0D",
  panel: "#121A18",
  panelAlt: "#1B2624",
  gold: "#C9A24E",
  goldSoft: "#E4C77A",
  green: "#1F4A40",
  greenSoft: "#2C6356",
  text: "#F3F1EA",
  textMuted: "#8FA29B",
  border: "rgba(201,162,78,0.18)",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Manrope:wght@400;500;600;700&display=swap');
`;

function InfinityDivider({ width = 64 }) {
  return (
    <svg
      width={width}
      height="14"
      viewBox="0 0 64 14"
      style={{ display: "block" }}
    >
      <path
        d="M2 7 C2 2 8 2 11 7 C14 12 20 12 23 7 C20 2 14 2 11 7 M62 7 C62 2 56 2 53 7 C50 12 44 12 41 7 C44 2 50 2 53 7 M23 7 H41"
        fill="none"
        stroke={COLORS.gold}
        strokeWidth="1.2"
        opacity="0.6"
      />
    </svg>
  );
}

function Logo({ size = 34 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <path
          d="M30 30 C18 30 18 70 30 70 C42 70 58 30 70 30 C82 30 82 70 70 70"
          fill="none"
          stroke={COLORS.gold}
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
      <div style={{ lineHeight: 1.05 }}>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontSize: size * 0.42,
            color: COLORS.text,
            letterSpacing: "0.04em",
          }}
        >
          Centro Europeo
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
            fontSize: size * 0.5,
            color: COLORS.goldSoft,
            letterSpacing: "0.14em",
          }}
        >
          DE CIRUGÍA
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- LOGIN ---------------------------- */

function LoginScreen({ onLogin }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      {/* left brand panel */}
      <div
        style={{
          flex: "1 1 45%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 48,
          position: "relative",
          borderRight: `1px solid ${COLORS.border}`,
        }}
        className="hidden md:flex"
      >
        <div style={{ textAlign: "center" }}>
          <svg width="160" height="160" viewBox="0 0 100 100" style={{ margin: "0 auto" }}>
            <path
              d="M30 30 C18 30 18 70 30 70 C42 70 58 30 70 30 C82 30 82 70 70 70"
              fill="none"
              stroke={COLORS.gold}
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              fontSize: 30,
              marginTop: 24,
              letterSpacing: "0.06em",
            }}
          >
            Centro Europeo
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: 38,
              color: COLORS.goldSoft,
              letterSpacing: "0.18em",
              marginTop: 4,
            }}
          >
            DE CIRUGÍA
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 13,
              letterSpacing: "0.3em",
              color: COLORS.textMuted,
            }}
          >
            PORTAL DE COLABORADORES
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              letterSpacing: "0.2em",
              color: COLORS.gold,
              fontWeight: 600,
            }}
          >
            DESDE 1976
          </div>
        </div>
      </div>

      {/* right form panel */}
      <div
        style={{
          flex: "1 1 55%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div style={{ width: "100%", maxWidth: 380 }}>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 32,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Bienvenido de nuevo
          </h1>
          <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 32 }}>
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
              background: "#1f1f1f",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: "13px 16px",
              color: COLORS.text,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = COLORS.gold)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = COLORS.border)}
          >
            <svg width="18" height="18" viewBox="0 0 23 23">
              <rect x="1" y="1" width="10" height="10" fill="#F25022" />
              <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
              <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
              <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
            </svg>
            Continuar con Microsoft
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "28px 0",
              color: COLORS.textMuted,
              fontSize: 12,
            }}
          >
            <div style={{ flex: 1, height: 1, background: COLORS.border }} />
            o con tu correo
            <div style={{ flex: 1, height: 1, background: COLORS.border }} />
          </div>

          <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 6 }}>
            Correo corporativo
          </label>
          <input
            type="email"
            placeholder="nombre@cec.cr"
            style={{
              width: "100%",
              background: COLORS.panel,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              padding: "11px 14px",
              color: COLORS.text,
              fontSize: 14,
              marginBottom: 16,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 6 }}>
            Contraseña
          </label>
          <input
            type="password"
            placeholder="••••••••"
            style={{
              width: "100%",
              background: COLORS.panel,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              padding: "11px 14px",
              color: COLORS.text,
              fontSize: 14,
              marginBottom: 24,
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          <button
            onClick={onLogin}
            style={{
              width: "100%",
              background: `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
              border: "none",
              borderRadius: 8,
              padding: "13px 16px",
              color: "#1a1300",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- DASHBOARD --------------------------- */

const NAV_ITEMS = [
  { key: "inicio", label: "Inicio", icon: Home },
  { key: "comunicados", label: "Comunicados", icon: Bell },
  { key: "documentos", label: "Documentos", icon: FileText },
  { key: "vacaciones", label: "Vacaciones", icon: CalendarDays },
  { key: "perfil", label: "Mi perfil", icon: User },
];

const ANNOUNCEMENTS = [
  {
    title: "Nuevo protocolo de bioseguridad en quirófano",
    date: "10 jun 2026",
    tag: "Operaciones",
  },
  {
    title: "Horario especial — semana del 23 al 27 de junio",
    date: "8 jun 2026",
    tag: "Administración",
  },
  {
    title: "Capacitación: manejo de historia clínica digital",
    date: "5 jun 2026",
    tag: "Capacitación",
  },
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
    <div
      style={{
        width: 240,
        background: COLORS.panel,
        borderRight: `1px solid ${COLORS.border}`,
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        height: "100vh",
        position: "sticky",
        top: 0,
        flexShrink: 0,
      }}
      className="hidden md:flex"
    >
      <div style={{ padding: "0 8px 28px" }}>
        <Logo size={30} />
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
                padding: "10px 12px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "'Manrope', sans-serif",
                color: isActive ? COLORS.bg : COLORS.text,
                background: isActive
                  ? `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`
                  : "transparent",
                transition: "background 0.15s",
              }}
            >
              <Icon size={17} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto" }}>
        <div style={{ padding: "0 8px", marginBottom: 12 }}>
          <InfinityDivider width={80} />
        </div>
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 12px",
            borderRadius: 8,
            border: "none",
            background: "transparent",
            color: COLORS.textMuted,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "'Manrope', sans-serif",
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
          }}
        >
          <LogOut size={17} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div
      style={{
        background: COLORS.panel,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        padding: 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, action }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: 16,
      }}
    >
      <h3
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 20,
          fontWeight: 600,
          color: COLORS.text,
          margin: 0,
        }}
      >
        {title}
      </h3>
      {action}
    </div>
  );
}

function VacationRing({ used = 9, total = 21 }) {
  const pct = used / total;
  const r = 54;
  const c = 2 * Math.PI * r;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke={COLORS.panelAlt} strokeWidth="10" />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke={COLORS.gold}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${c * pct} ${c}`}
        transform="rotate(-90 70 70)"
      />
      <text
        x="70"
        y="64"
        textAnchor="middle"
        fontFamily="'Cormorant Garamond', serif"
        fontSize="34"
        fontWeight="700"
        fill={COLORS.text}
      >
        {total - used}
      </text>
      <text
        x="70"
        y="86"
        textAnchor="middle"
        fontFamily="'Manrope', sans-serif"
        fontSize="11"
        fill={COLORS.textMuted}
      >
        días disponibles
      </text>
    </svg>
  );
}

function DashboardHome() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 20,
      }}
    >
      {/* Vacaciones */}
      <Card style={{ gridColumn: "span 1" }}>
        <CardHeader title="Vacaciones" />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <VacationRing />
          <div style={{ flex: 1, fontSize: 13, color: COLORS.textMuted }}>
            <p style={{ margin: "0 0 6px" }}>
              <span style={{ color: COLORS.text, fontWeight: 700 }}>9</span> días tomados este año
            </p>
            <p style={{ margin: "0 0 16px" }}>
              <span style={{ color: COLORS.text, fontWeight: 700 }}>2</span> solicitudes pendientes
              de aprobación
            </p>
            <button
              style={{
                background: "transparent",
                border: `1px solid ${COLORS.gold}`,
                color: COLORS.goldSoft,
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Manrope', sans-serif",
              }}
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
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: COLORS.gold,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Ver todos <ChevronRight size={14} />
            </span>
          }
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ANNOUNCEMENTS.map((a) => (
            <div
              key={a.title}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: 12,
                borderBottom: `1px solid ${COLORS.border}`,
              }}
            >
              <div>
                <div style={{ fontSize: 14, color: COLORS.text, marginBottom: 4 }}>
                  {a.title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: COLORS.gold,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {a.tag}
                </div>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: COLORS.textMuted,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                }}
              >
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
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {DOCUMENTS.map((d) => (
            <div
              key={d}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 13,
                color: COLORS.text,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileText size={14} color={COLORS.textMuted} />
                {d}
              </span>
              <Download size={14} color={COLORS.gold} style={{ cursor: "pointer" }} />
            </div>
          ))}
        </div>
      </Card>

      {/* Solicitudes / estado */}
      <Card>
        <CardHeader title="Estado de solicitudes" />
        <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle2 size={16} color={COLORS.greenSoft} />
            <span style={{ color: COLORS.text }}>Permiso 2 jun — Aprobado</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Clock size={16} color={COLORS.gold} />
            <span style={{ color: COLORS.text }}>Vacaciones 1–5 jul — En revisión</span>
          </div>
        </div>
      </Card>

      {/* Cumpleaños */}
      <Card>
        <CardHeader title="Próximos cumpleaños" />
        <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
          {BIRTHDAYS.map((b) => (
            <div
              key={b.name}
              style={{ display: "flex", alignItems: "center", gap: 10, color: COLORS.text }}
            >
              <Cake size={16} color={COLORS.goldSoft} />
              {b.name}
              <span style={{ marginLeft: "auto", color: COLORS.textMuted, fontSize: 12 }}>
                {b.date}
              </span>
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
    inicio: "Inicio",
    comunicados: "Comunicados",
    documentos: "Documentos",
    vacaciones: "Vacaciones",
    perfil: "Mi perfil",
  }[active];

  return (
    <div style={{ display: "flex", background: COLORS.bg, color: COLORS.text, fontFamily: "'Manrope', sans-serif" }}>
      <Sidebar active={active} setActive={setActive} onLogout={onLogout} />

      <div style={{ flex: 1, padding: "32px 36px", maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: "0.2em", color: COLORS.gold, marginBottom: 6 }}>
              VIERNES 12 DE JUNIO, 2026
            </div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 34,
                fontWeight: 600,
                margin: 0,
              }}
            >
              {active === "inicio" ? "Buenos días, Juan Pablo" : sectionTitle}
            </h1>
          </div>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              color: COLORS.bg,
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 18,
            }}
          >
            JP
          </div>
        </div>

        {active === "inicio" ? <DashboardHome /> : <PlaceholderSection title={sectionTitle} />}
      </div>
    </div>
  );
}

/* ------------------------------ APP ------------------------------ */

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div>
      <style>{FONTS}</style>
      {loggedIn ? (
        <Dashboard onLogout={() => setLoggedIn(false)} />
      ) : (
        <LoginScreen onLogin={() => setLoggedIn(true)} />
      )}
    </div>
  );
}
