import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { inputStyle, taStyle, btnSubmitStyle } from "../../styles/forms.js";
import { translateError } from "../../utils/errors.js";
import { useIsMobile } from "../../hooks/useIsMobile.js";
import { Card, CardHeader } from "../ui/Card.jsx";
import { Tag } from "../ui/StatusBadge.jsx";
import { DeptTag } from "../ui/DeptTag.jsx";

export function GestionComunicadosSection({ adminAnnouncements = [], departmentsList = [], onNewAnnouncement, onDeleteAnnouncement }) {
  const isMobile = useIsMobile();
  const [deletingId,  setDeletingId]  = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  async function handleDeleteAnn(a) {
    if (!window.confirm("¿Eliminar este comunicado? Esta acción no se puede deshacer.")) return;
    setDeletingId(a.id);
    setDeleteError(null);
    const { error } = await supabase.from("announcements").delete().eq("id", a.id);
    setDeletingId(null);
    if (error) { setDeleteError(a.id); return; }
    onDeleteAnnouncement?.(a.id);
  }
  const nowLocal = () => {
    const d = new Date();
    d.setSeconds(0, 0);
    // Adjust for local timezone so datetime-local input shows the correct local time
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };
  const [expandedAnnouncements, setExpandedAnnouncements] = useState({});
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
      {adminAnnouncements.length === 0 ? (
        <Card><p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>No hay comunicados creados.</p></Card>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {adminAnnouncements.map((a, i) => {
            const isScheduled = a.publish_at && new Date(a.publish_at) > now;
            const isExpanded = expandedAnnouncements[a.id ?? i];
            const authorName = a.profiles?.full_name || null;
            return (
              <Card key={a.id ?? i}>
                <div style={{ fontSize:14, fontWeight:600, color:COLORS.text, marginBottom:4, wordBreak:"break-word" }}>{a.title}</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center", marginBottom:4 }}>
                  {a.tag && <Tag label={a.tag} />}
                  <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                    <span style={{ fontSize:11, color:COLORS.textMuted }}>Audiencia:</span>
                    {Array.isArray(a.audience_list) && a.audience_list.includes("todos")
                      ? <span style={{ fontSize:11, fontWeight:700, color:COLORS.textMuted }}>Todos los departamentos</span>
                      : Array.isArray(a.audience_list)
                        ? a.audience_list.map((d, di) => <DeptTag key={di} dept={d} />)
                        : a.audience === "todos"
                          ? <span style={{ fontSize:11, fontWeight:700, color:COLORS.textMuted }}>Todos los departamentos</span>
                          : a.audience
                            ? <DeptTag dept={a.audience} />
                            : <span style={{ fontSize:11, color:COLORS.textMuted }}>—</span>
                    }
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <span style={{ fontSize:11, color:COLORS.textMuted }}>{fmtPublishAt(a.publish_at)}</span>
                  {isScheduled && (
                    <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.06em", padding:"2px 7px", borderRadius:4, background:"rgba(100,140,220,0.12)", color:"#5a7ec7" }}>
                      PROGRAMADO
                    </span>
                  )}
                  {authorName && (
                    <span style={{ fontSize:11, color:COLORS.textMuted }}>· Creado por: <strong>{authorName}</strong></span>
                  )}
                </div>
                {isExpanded && a.body && (
                  <div style={{ marginTop:10, fontSize:13, color:COLORS.text, lineHeight:1.65, whiteSpace:"pre-wrap", wordBreak:"break-word", background:COLORS.panelAlt, borderRadius:7, padding:"10px 12px", fontFamily:"'Manrope', sans-serif" }}>
                    {a.body}
                  </div>
                )}
                {a.body && (
                  <button
                    onClick={() => setExpandedAnnouncements(prev => ({ ...prev, [a.id ?? i]: !prev[a.id ?? i] }))}
                    style={{ marginTop:8, background:"none", border:"none", color:COLORS.gold, fontSize:12, fontWeight:600, cursor:"pointer", padding:0, fontFamily:"'Manrope', sans-serif" }}
                  >
                    {isExpanded ? "Ver menos" : "Ver más"}
                  </button>
                )}
                {deleteError === a.id && <p style={{ fontSize:11, color:"#c0392b", margin:"6px 0 0" }}>No se pudo eliminar. Intenta de nuevo.</p>}
                <div style={{ marginTop:10, display:"flex", justifyContent:"flex-end" }}>
                  <button
                    onClick={() => handleDeleteAnn(a)}
                    disabled={deletingId === a.id}
                    style={{ fontSize:11, fontWeight:600, color:"#c0392b", background:"rgba(192,57,43,0.06)", border:"1px solid rgba(192,57,43,0.18)", borderRadius:6, padding:"4px 10px", cursor:deletingId===a.id?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:5, fontFamily:"'Manrope', sans-serif", opacity:deletingId===a.id?0.6:1 }}
                  >
                    <Trash2 size={11} /> {deletingId===a.id ? "Eliminando..." : "Eliminar"}
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
