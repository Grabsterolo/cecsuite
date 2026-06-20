import React, { useEffect } from "react";
import {
  LogOut, X, ClipboardCheck, Megaphone, FileUp, Users, UserPlus, DollarSign,
} from "lucide-react";
import { COLORS, SIDEBAR_BG } from "../../constants/colors.js";
import { NAV_ITEMS } from "../../constants/nav.js";
import { Logo } from "../ui/Logo.jsx";

export function MobileDrawer({ open, onClose, active, setActive, onLogout, profile, pendingApprovalCount = 0, solicitudesUnreadCount = 0 }) {
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
        <nav className="sidebar-nav" style={{ display: "flex", flexDirection: "column", gap: 4, overflowY: "auto", flex: 1, paddingBottom: 8 }}>
          {NAV_ITEMS.filter(item => !item.condition || item.condition(profile)).map((item) => {
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
                {item.key === "solicitudes" && solicitudesUnreadCount > 0 && (
                  <span style={{
                    marginLeft:"auto", minWidth:20, height:20, borderRadius:10,
                    background: isActive ? "rgba(255,255,255,0.3)" : "#e74c3c",
                    color:"#FFF", fontSize:11, fontWeight:700,
                    display:"flex", alignItems:"center", justifyContent:"center", padding:"0 6px",
                  }}>{solicitudesUnreadCount}</span>
                )}
              </button>
            );
          })}
          {(profile?.role === "admin") && (
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
              <button onClick={() => { setActive("comisiones"); onClose(); }} style={{
                display:"flex", alignItems:"center", gap:14,
                padding:"12px 14px", borderRadius:10, border:"none",
                cursor:"pointer", textAlign:"left", fontSize:15, fontWeight:600,
                fontFamily:"'Manrope', sans-serif",
                color: active === "comisiones" ? "#FFF" : COLORS.sidebarMuted,
                background: active === "comisiones" ? `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})` : "transparent",
                transition:"background 0.15s, color 0.15s",
              }}>
                <DollarSign size={19} />Comisiones
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

export function Sidebar({ active, setActive, onLogout, profile, pendingApprovalCount = 0, solicitudesUnreadCount = 0, recognitionsUnreadCount = 0, pollsUnvotedCount = 0 }) {
  return (
    <div style={{
      width: 252,
      background: SIDEBAR_BG,
      display: "flex",
      flexDirection: "column",
      padding: "28px 14px",
      height: "100vh",
      boxSizing: "border-box",
      position: "sticky",
      top: 0,
      flexShrink: 0,
    }}>
      <div style={{ padding: "0 8px 28px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 16, flexShrink: 0 }}>
        <Logo width={160} />
      </div>

      <nav className="sidebar-nav" style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, overflowY: "auto", minHeight: 0 }}>
        {NAV_ITEMS.filter(item => !item.condition || item.condition(profile)).map((item) => {
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
              {item.key === "solicitudes" && solicitudesUnreadCount > 0 && (
                <span style={{
                  marginLeft:"auto", minWidth:18, height:18, borderRadius:9,
                  background: isActive ? "rgba(255,255,255,0.3)" : "#e74c3c",
                  color:"#FFF", fontSize:10, fontWeight:700,
                  display:"flex", alignItems:"center", justifyContent:"center", padding:"0 5px",
                }}>{solicitudesUnreadCount}</span>
              )}
              {item.key === "reconocimientos" && recognitionsUnreadCount > 0 && (
                <span style={{
                  marginLeft:"auto", minWidth:18, height:18, borderRadius:9,
                  background: isActive ? "rgba(255,255,255,0.3)" : COLORS.gold,
                  color:"#FFF", fontSize:10, fontWeight:700,
                  display:"flex", alignItems:"center", justifyContent:"center", padding:"0 5px",
                }}>{recognitionsUnreadCount}</span>
              )}
              {item.key === "encuestas" && pollsUnvotedCount > 0 && (
                <span style={{
                  marginLeft:"auto", minWidth:18, height:18, borderRadius:9,
                  background: isActive ? "rgba(255,255,255,0.3)" : COLORS.green,
                  color:"#FFF", fontSize:10, fontWeight:700,
                  display:"flex", alignItems:"center", justifyContent:"center", padding:"0 5px",
                }}>{pollsUnvotedCount}</span>
              )}
            </button>
          );
        })}
        {(profile?.role === "admin") && (
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
              const isA = active === "comisiones";
              return (
                <button onClick={() => setActive("comisiones")} style={{
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
                  <DollarSign size={16} />Comisiones
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

      <div style={{ flexShrink: 0, marginTop: 8 }}>
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
