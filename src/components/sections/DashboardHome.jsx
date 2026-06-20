import React, { useState } from "react";
import { ChevronRight, Clock, FileText, Plus, Award, Cake } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { VAC_TOTAL, MONTH_NAMES } from "../../constants/nav.js";
import { verTodosStyle } from "../../styles/forms.js";
import { fmtSupaDate } from "../../utils/format.js";
import { Card, CardHeader } from "../ui/Card.jsx";
import { Tag } from "../ui/StatusBadge.jsx";
import { VacationDonut } from "../ui/VacationDonut.jsx";
import { DocDownloadBtn } from "../ui/DocDownloadBtn.jsx";
import { SolicitudItem } from "../ui/SolicitudItem.jsx";
import { CrearSolicitudModal } from "../forms/SolicitudForms.jsx";
import { AnnouncementDetailModal } from "./AnnouncementsSection.jsx";

export function DashboardHome({ isMobile, setActive, allSolicitudes = [], vacData = {}, announcements = [], documents = [], upcomingBirthdays = [], onNewRequest, onNewReport, existingVacationRequests = [], recognitions = [], polls = [], myVotes = {}, pollResults = {}, userId, onVoted, myConfirmations = {} }) {
  const [modal, setModal] = useState(null);
  const [announcementModal, setAnnouncementModal] = useState(null);
  const [pollPending, setPollPending] = useState(null); // selected option_index for active poll widget
  const [pollVoting, setPollVoting] = useState(false);
  const { approvedDays = 0, pendingDays = 0, availableDays = 0, vacationBalance = VAC_TOTAL } = vacData;
  const activePoll = polls.find(p => p.status === "activa" && myVotes[p.id] === undefined);

  return (
    <>
      {announcementModal && <AnnouncementDetailModal announcement={announcementModal} onClose={() => setAnnouncementModal(null)} />}
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
          <div style={{ flex:1, fontSize:15 }}>
            <p style={{ margin:"0 0 7px", color:COLORS.textMuted }}>
              <span style={{ color:COLORS.green, fontWeight:700 }}>{availableDays}</span> días disponibles
            </p>
            {approvedDays > 0 && (
              <p style={{ margin:"0 0 7px", color:COLORS.textMuted, display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ width:9, height:9, borderRadius:2, background:COLORS.gold, display:"inline-block", flexShrink:0 }}/>
                <span style={{ color:COLORS.green, fontWeight:700 }}>{approvedDays}</span> tomados
              </p>
            )}
            {pendingDays > 0 && (
              <p style={{ margin:"0 0 7px", color:COLORS.textMuted, display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ width:9, height:9, borderRadius:2, background:COLORS.goldSoft, display:"inline-block", flexShrink:0 }}/>
                <span style={{ color:COLORS.gold, fontWeight:700 }}>{pendingDays}</span> en solicitud
              </p>
            )}
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
                <div key={a.id ?? i} onClick={() => setAnnouncementModal(a)} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  paddingBottom: 14, borderBottom: `1px solid ${COLORS.border}`,
                  cursor: "pointer", borderRadius: 6, margin: "0 -6px",
                  padding: "8px 6px 14px",
                  transition: "background 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.panelAlt}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
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
        {(() => {
          const pendingConfirm = documents.filter(d => d.requires_confirmation && !myConfirmations[d.id]).length;
          return pendingConfirm > 0 ? (
            <button onClick={() => setActive("documentos")} style={{ background:"none", border:"none", padding:0, cursor:"pointer", display:"block", marginBottom:10, textAlign:"left" }}>
              <span style={{ fontSize:12, color:COLORS.gold, fontWeight:600, animation:"gentlePulse 2s ease-in-out infinite", display:"inline-block" }}>⚠ {pendingConfirm} documento{pendingConfirm !== 1 ? "s" : ""} pendiente{pendingConfirm !== 1 ? "s" : ""} de confirmar lectura</span>
            </button>
          ) : null;
        })()}
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

      {/* Encuesta activa */}
      {activePoll && (
        <Card style={{ border:`1.5px solid ${COLORS.gold}` }}>
          <CardHeader title="Encuesta activa"
            action={<button style={verTodosStyle} onClick={() => setActive("encuestas")}>Ver encuestas <ChevronRight size={14}/></button>}
          />
          <p style={{ fontSize:14, fontWeight:700, color:COLORS.green, margin:"0 0 12px", lineHeight:1.4 }}>{activePoll.question}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {activePoll.options.map((opt, idx) => (
              <label key={idx} style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer", fontSize:13, color:COLORS.text, fontWeight: pollPending === idx ? 600 : 400 }}>
                <input type="radio" name={`home-poll-${activePoll.id}`} checked={pollPending === idx}
                  onChange={() => setPollPending(idx)}
                  style={{ accentColor: COLORS.green, width:15, height:15, flexShrink:0 }}
                />
                {opt}
              </label>
            ))}
          </div>
          <button onClick={async () => {
            if (pollPending === null || pollPending === undefined || pollVoting) return;
            setPollVoting(true);
            const { error } = await supabase.from("poll_votes").insert({ poll_id: activePoll.id, user_id: userId, option_index: pollPending });
            setPollVoting(false);
            if (!error) { onVoted?.(activePoll.id, pollPending); setPollPending(null); }
          }} disabled={pollPending === null || pollPending === undefined || pollVoting} style={{
            marginTop:14, padding:"8px 18px", borderRadius:8, border:"none",
            background: (pollPending === null || pollPending === undefined || pollVoting) ? COLORS.border : `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
            color:"#FFF", fontSize:13, fontWeight:700,
            cursor: (pollPending === null || pollPending === undefined || pollVoting) ? "not-allowed" : "pointer",
            fontFamily:"'Manrope', sans-serif", opacity: (pollPending === null || pollPending === undefined || pollVoting) ? 0.7 : 1, transition:"all 0.15s",
          }}>{pollVoting ? "Enviando..." : "Votar"}</button>
        </Card>
      )}

      {/* Reconocimientos recientes */}
      <Card>
        <CardHeader title="Reconocimientos"
          action={<button style={verTodosStyle} onClick={() => setActive("reconocimientos")}>Ver todos <ChevronRight size={14}/></button>}
        />
        {recognitions.length === 0 ? (
          <p style={{ color:COLORS.textMuted, fontSize:13, margin:0 }}>Aún no hay reconocimientos.</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {recognitions.slice(0,3).map(r => (
              <div key={r.id} style={{ borderBottom:`1px solid ${COLORS.border}`, paddingBottom:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                  <Award size={12} color={COLORS.gold} style={{ flexShrink:0 }} />
                  <span style={{ fontSize:12, fontWeight:700, color:COLORS.green }}>
                    {r.from_name ?? "—"} → {r.to_name ?? "—"}
                  </span>
                  <span style={{ marginLeft:"auto", fontSize:10, color:COLORS.textMuted, flexShrink:0 }}>
                    {fmtSupaDate((r.created_at ?? "").slice(0,10))}
                  </span>
                </div>
                <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", color:COLORS.gold, background:"rgba(201,162,78,0.1)", borderRadius:4, padding:"1px 6px" }}>{r.category}</span>
                <p style={{ fontSize:12, color:COLORS.textMuted, margin:"4px 0 0", lineHeight:1.5, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{r.message}</p>
              </div>
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
