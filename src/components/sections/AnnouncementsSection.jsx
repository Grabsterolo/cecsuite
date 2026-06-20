import React, { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { btnCancelStyle } from "../../styles/forms.js";
import { fmtFull } from "../../utils/format.js";
import { Card } from "../ui/Card.jsx";
import { Tag } from "../ui/StatusBadge.jsx";

export function AnnouncementDetailModal({ announcement: a, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={onClose}
    >
      <div
        style={{ background:COLORS.panel, borderRadius:16, padding:"28px 28px 24px", width:"100%", maxWidth:780, maxHeight:"88vh", overflowY:"auto", boxShadow:"0 8px 40px rgba(31,74,64,0.22)", fontFamily:"'Manrope', sans-serif", animation:"sectionIn 0.18s ease-out both" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            {a.tag && <Tag label={a.tag} />}
            <span style={{ fontSize:12, color:COLORS.textMuted }}>{fmtFull(a.publish_at)}</span>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.textMuted, display:"flex", padding:4, flexShrink:0, marginLeft:12 }}>
            <X size={18} />
          </button>
        </div>
        <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:24, fontWeight:600, color:COLORS.green, margin:"0 0 16px", lineHeight:1.3, wordBreak:"break-word" }}>{a.title}</h2>
        {a.body
          ? <p style={{ fontSize:14, color:COLORS.text, lineHeight:1.75, margin:"0 0 16px", whiteSpace:"pre-wrap" }}>{a.body}</p>
          : <p style={{ fontSize:13, color:COLORS.textMuted, fontStyle:"italic", margin:"0 0 16px" }}>Este comunicado no tiene cuerpo de texto.</p>
        }
        {a.profiles?.full_name && (
          <p style={{ fontSize:12, color:COLORS.textMuted, margin:"0 0 20px" }}>Publicado por: <strong style={{ color:COLORS.text }}>{a.profiles.full_name}</strong></p>
        )}
        <button onClick={onClose} style={{ ...btnCancelStyle, flex:"none", width:"100%", marginTop:4 }}>Cerrar</button>
      </div>
    </div>
  );
}

export function AnnouncementsSection({ announcements, profile, onDeleteAnnouncement }) {
  const isAdmin = profile?.role === "admin";
  const [expanded,   setExpanded]   = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  async function handleDelete(a) {
    if (!window.confirm("¿Eliminar este comunicado? Esta acción no se puede deshacer.")) return;
    setDeletingId(a.id);
    setDeleteError(null);
    const { error } = await supabase.from("announcements").delete().eq("id", a.id);
    setDeletingId(null);
    if (error) { setDeleteError(a.id); return; }
    onDeleteAnnouncement?.(a.id);
  }
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {announcements.length === 0 ? (
        <Card><p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>No hay comunicados disponibles.</p></Card>
      ) : announcements.map((a, i) => {
        const key = a.id ?? i;
        const isExpanded = !!expanded[key];
        return (
          <Card key={key}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <Tag label={a.tag || "Aviso"} />
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:11, color:COLORS.textMuted, fontFamily:"'Manrope', sans-serif" }}>{fmtFull(a.publish_at)}</span>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(a)}
                    disabled={deletingId === a.id}
                    title="Eliminar comunicado"
                    style={{ background:"none", border:"none", cursor:deletingId===a.id?"not-allowed":"pointer", color:"rgba(192,57,43,0.6)", padding:2, display:"flex", alignItems:"center", opacity:deletingId===a.id?0.5:1, transition:"color 0.15s" }}
                    onMouseEnter={e => { if (deletingId!==a.id) e.currentTarget.style.color="#c0392b"; }}
                    onMouseLeave={e => { e.currentTarget.style.color="rgba(192,57,43,0.6)"; }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, fontWeight:600, color:COLORS.green, margin:"0 0 10px", lineHeight:1.3, wordBreak:"break-word" }}>{a.title}</h3>
            {isExpanded && a.body && (
              <p style={{ fontSize:14, color:COLORS.text, lineHeight:1.7, margin:"0 0 8px", whiteSpace:"pre-wrap", fontFamily:"'Manrope', sans-serif" }}>{a.body}</p>
            )}
            {deleteError === a.id && <p style={{ fontSize:11, color:"#c0392b", margin:"4px 0" }}>No se pudo eliminar. Intenta de nuevo.</p>}
            {a.body && (
              <button
                onClick={() => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))}
                style={{ background:"none", border:"none", color:COLORS.gold, fontSize:12, fontWeight:600, cursor:"pointer", padding:0, fontFamily:"'Manrope', sans-serif" }}
              >
                {isExpanded ? "Ver menos" : "Ver más"}
              </button>
            )}
          </Card>
        );
      })}
    </div>
  );
}
