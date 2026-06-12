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
  Concepto v2 — Fondo blanco, gama del logo oficial

  Tokens
  - Fondo: #FFFFFF / #FAFAF8
  - Panel / tarjeta: #FFFFFF con borde sutil
  - Panel elevado: #F4F1EA
  - Verde institucional: #1F4A40 (color texto logo)
  - Verde suave: #2C6356
  - Dorado: #C9A24E (símbolo del logo)
  - Dorado suave: #E4C77A
  - Texto principal: #1F4A40
  - Texto secundario: #6B8C80
  - Sidebar: #1F4A40 (verde institucional)
*/

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
  borderGold: "rgba(201,162,78,0.3)",
  sidebar: "#1F4A40",
  sidebarText: "#FFFFFF",
  sidebarMuted: "rgba(255,255,255,0.55)",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Manrope:wght@400;500;600;700&display=swap');
`;

function InfinityDivider({ width = 64, dark = false }) {
  return (
    <svg width={width} height="14" viewBox="0 0 64 14" style={{ display: "block" }}>
      <path
        d="M2 7 C2 2 8 2 11 7 C14 12 20 12 23 7 C20 2 14 2 11 7 M62 7 C62 2 56 2 53 7 C50 12 44 12 41 7 C44 2 50 2 53 7 M23 7 H41"
        fill="none"
        stroke={dark ? COLORS.gold : COLORS.gold}
        strokeWidth="1.2"
        opacity="0.7"
      />
    </svg>
  );
}

/*
  Logo
  ────
  Carga desde /public según el contexto:
    onDark=false → /logo.png        (color, para fondos blancos)
    onDark=true  → /logo-blanco.png (blanco, para sidebar y panel verde)
  Si el archivo no existe muestra un SVG de respaldo.

  Para reemplazar: coloca los archivos en la carpeta /public del repositorio.
*/
function Logo({ size = 36, onDark = false, maxWidth }) {
  const [imgError, setImgError] = useState(false);
  const src = onDark ? "/logo-blanco.png" : "/logo.png";

  if (!imgError) {
    return (
      <img
        src={src}
        alt="Centro Europeo de Cirugía"
        style={{
          width: maxWidth || size * 4,
          maxWidth: "100%",
          height: "auto",
          objectFit: "contain",
          display: "block",
          margin: "0 auto",
        }}
        onError={() => setImgError(true)}
      />
    );
  }

  /* ── Fallback SVG ── */
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E4C77A" />
            <stop offset="100%" stopColor="#A6802F" />
          </linearGradient>
        </defs>
        <path
          d="M30 30 C18 30 18 70 30 70 C42 70 58 30 70 30 C82 30 82 70 70 70"
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
      <div style={{ lineHeight: 1.1 }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 600,
          fontSize: size * 0.38,
          color: onDark ? "#FFFFFF" : COLORS.green,
          letterSpacing: "0.08em",
        }}>
          Centro Europeo
        </div>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 700,
          fontSize: size * 0.46,
          color: onDark ? COLORS.goldSoft : COLORS.gold,
          letterSpacing: "0.16em",
        }}>
          DE CIRUGÍA
        </div>
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
      {/* Panel izquierdo — verde institucional */}
      <div style={{
        flex: "0 0 45%",
        background: COLORS.sidebar,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 48px",
      }}>
        {/* Logo de color sobre tarjeta blanca */}
        <div style={{
          background: "#FFFFFF",
          borderRadius: 20,
          padding: "40px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          width: "100%",
          maxWidth: 340,
        }}>
          <Logo maxWidth={280} onDark={false} />
        </div>

        <div style={{
          marginTop: 36,
          fontSize: 11,
          letterSpacing: "0.4em",
          color: "rgba(255,255,255,0.5)",
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

          {/* Microsoft button */}
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
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = COLORS.gold;
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(201,162,78,0.18)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = COLORS.border;
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(31,74,64,0.06)";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 23 23">
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
  { key: "inicio", label: "Inicio", icon: Home },
  { key: "comunicados", label: "Comunicados", icon: Bell },
  { key: "documentos", label: "Documentos", icon: FileText },
  { key: "vacaciones", label: "Vacaciones", icon: CalendarDays },
  { key: "perfil", label: "Mi perfil", icon: User },
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
      width: 240,
      background: COLORS.sidebar,
      display: "flex",
      flexDirection: "column",
      padding: "28px 16px",
      height: "100vh",
      position: "sticky",
      top: 0,
      flexShrink: 0,
    }}>
      {/* Logo en tarjeta blanca dentro del sidebar verde */}
      <div style={{
        margin: "0 4px 28px",
        background: "#FFFFFF",
        borderRadius: 12,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Logo maxWidth={172} onDark={false} />
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
        <div style={{ padding: "0 8px", marginBottom: 16 }}>
          <InfinityDivider width={80} />
        </div>
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
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 18,
    }}>
      <h3 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 20,
        fontWeight: 600,
        color: COLORS.green,
        margin: 0,
      }}>
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
        cx="70" cy="70" r={r}
        fill="none"
        stroke={COLORS.gold}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${c * pct} ${c}`}
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="64" textAnchor="middle"
        fontFamily="'Cormorant Garamond', serif" fontSize="34" fontWeight="700"
        fill={COLORS.green}>
        {total - used}
      </text>
      <text x="70" y="86" textAnchor="middle"
        fontFamily="'Manrope', sans-serif" fontSize="11"
        fill={COLORS.textMuted}>
        días disponibles
      </text>
    </svg>
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
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: 20,
    }}>
      {/* Vacaciones */}
      <Card>
        <CardHeader title="Vacaciones" />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <VacationRing />
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
              transition: "background 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,162,78,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
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
            <span style={{
              display: "flex", alignItems: "center", gap: 4,
              fontSize: 12, color: COLORS.gold, cursor: "pointer", fontWeight: 600,
            }}>
              Ver todos <ChevronRight size={14} />
            </span>
          }
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {ANNOUNCEMENTS.map((a) => (
            <div key={a.title} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: 14,
              borderBottom: `1px solid ${COLORS.border}`,
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: 14, color: COLORS.text, fontWeight: 500 }}>{a.title}</div>
                <Tag label={a.tag} />
              </div>
              <div style={{
                fontSize: 12, color: COLORS.textMuted,
                display: "flex", alignItems: "center", gap: 5,
                whiteSpace: "nowrap", marginLeft: 16,
              }}>
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
              display: "flex", justifyContent: "space-between",
              alignItems: "center", fontSize: 13, color: COLORS.text,
              padding: "8px 0",
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
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 8,
            background: "rgba(44,99,86,0.07)",
          }}>
            <CheckCircle2 size={16} color={COLORS.greenSoft} />
            <div>
              <div style={{ color: COLORS.text, fontWeight: 500 }}>Permiso 2 jun</div>
              <div style={{ color: COLORS.greenSoft, fontSize: 11, marginTop: 2 }}>Aprobado</div>
            </div>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 8,
            background: "rgba(201,162,78,0.07)",
          }}>
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
    <div style={{ display: "flex", background: COLORS.bg, color: COLORS.text, fontFamily: "'Manrope', sans-serif", minHeight: "100vh" }}>
      <Sidebar active={active} setActive={setActive} onLogout={onLogout} />

      <div style={{ flex: 1, padding: "36px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: 32,
        }}>
          <div>
            <div style={{
              fontSize: 11, letterSpacing: "0.25em",
              color: COLORS.gold, marginBottom: 6,
              textTransform: "uppercase", fontWeight: 600,
            }}>
              Viernes 12 de junio, 2026
            </div>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 36, fontWeight: 600,
              margin: 0, color: COLORS.green,
            }}>
              {active === "inicio" ? "Buenos días, Juan Pablo" : sectionTitle}
            </h1>
          </div>

          <div style={{
            width: 44, height: 44,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, color: "#FFFFFF",
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 18,
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

/* ─────────────────────────── APP ─────────────────────────── */

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
