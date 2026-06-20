import React, { useState, useEffect } from "react";
import { Award, X, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { RECOGNITION_CATEGORIES } from "../../constants/nav.js";
import { translateError } from "../../utils/errors.js";
import { fmtSupaDate } from "../../utils/format.js";
import { Card } from "../ui/Card.jsx";

export function RecognitionsSection({ recognitions = [], onNewRecognition, onDeleteRecognition, userId, profile, teamDirectory = [], onMarkRead, unreadCount = 0 }) {
  const [modal,    setModal]    = useState(false);
  const [toUser,   setToUser]   = useState("");
  const [category, setCategory] = useState("");
  const [message,  setMessage]  = useState("");
  const [sending,  setSending]  = useState(false);
  const [error,    setError]    = useState(null);
  const [success,  setSuccess]  = useState(false);

  const peers = teamDirectory.filter(p => p.id !== userId);

  // Auto-mark all as read while viewing this section
  useEffect(() => {
    if (unreadCount > 0) onMarkRead?.();
  }, [unreadCount]);

  function openModal() { setModal(true); setError(null); setSuccess(false); }
  function closeModal() { setModal(false); setToUser(""); setCategory(""); setMessage(""); setError(null); }

  async function handleSend() {
    if (!toUser || !category || !message.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }
    setSending(true); setError(null);
    const { error: err } = await supabase
      .from("recognitions")
      .insert({ from_user_id: userId, to_user_id: toUser, category, message: message.trim() });
    setSending(false);
    if (err) { setError(translateError(err.message)); return; }
    closeModal();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  async function handleDelete(id) {
    const { error: err } = await supabase.from("recognitions").delete().eq("id", id);
    if (!err) onDeleteRecognition?.(id);
  }

  const isAdmin = profile?.role === "admin";
  const selStyle = { width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${COLORS.border}`, background:COLORS.inputBg, color:COLORS.text, fontSize:13, fontFamily:"'Manrope', sans-serif", outline:"none" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {success && (
        <div style={{ padding:"10px 16px", background:"rgba(31,74,64,0.08)", border:`1px solid ${COLORS.green}`, borderRadius:10, display:"flex", alignItems:"center", gap:8 }}>
          <Award size={15} color={COLORS.green} />
          <span style={{ fontSize:13, color:COLORS.green, fontWeight:600 }}>¡Reconocimiento enviado con éxito!</span>
        </div>
      )}

      {modal && (
        <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:COLORS.panel, borderRadius:16, padding:28, width:"100%", maxWidth:420, boxShadow:"0 8px 32px rgba(31,74,64,0.18)", fontFamily:"'Manrope', sans-serif" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:22, fontWeight:600, color:COLORS.green, margin:0 }}>Dar un reconocimiento</h2>
              <button onClick={closeModal} style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.textMuted, display:"flex", padding:4 }}><X size={18}/></button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:COLORS.textMuted, marginBottom:5 }}>Compañero</label>
                <select value={toUser} onChange={e => setToUser(e.target.value)} style={selStyle}>
                  <option value="" style={{ color:"#1F4A40" }}>Selecciona un compañero...</option>
                  {peers.map(p => <option key={p.id} value={p.id} style={{ color:"#1F4A40" }}>{p.full_name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:COLORS.textMuted, marginBottom:5 }}>Categoría</label>
                <select value={category} onChange={e => setCategory(e.target.value)} style={selStyle}>
                  <option value="" style={{ color:"#1F4A40" }}>Selecciona una categoría...</option>
                  {RECOGNITION_CATEGORIES.map(c => <option key={c} value={c} style={{ color:"#1F4A40" }}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:COLORS.textMuted, marginBottom:5 }}>Mensaje</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Escribe por qué reconoces a esta persona..."
                  rows={4}
                  style={{ ...selStyle, resize:"vertical", boxSizing:"border-box" }}
                />
              </div>
              {error && <p style={{ fontSize:12, color:"#c0392b", margin:0 }}>{error}</p>}
              <button onClick={handleSend} disabled={sending} style={{
                padding:"11px 0", borderRadius:9, border:"none",
                background: sending ? COLORS.border : `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
                color:"#FFF", fontSize:14, fontWeight:700,
                cursor: sending ? "not-allowed" : "pointer",
                fontFamily:"'Manrope', sans-serif", opacity: sending ? 0.7 : 1, transition:"all 0.15s",
              }}>
                {sending ? "Enviando..." : "Enviar reconocimiento"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <button onClick={openModal} style={{
          display:"flex", alignItems:"center", gap:8,
          background:`linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
          border:"none", borderRadius:8, padding:"10px 18px",
          color:"#FFF", fontSize:14, fontWeight:700, cursor:"pointer",
          fontFamily:"'Manrope', sans-serif", boxShadow:"0 4px 14px rgba(201,162,78,0.35)",
        }}><Award size={16}/> Dar un reconocimiento</button>
      </div>

      {recognitions.length === 0 ? (
        <Card><p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>Aún no hay reconocimientos. ¡Sé el primero en reconocer a un compañero!</p></Card>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {recognitions.map(r => (
            <Card key={r.id} style={{ padding:"14px 16px" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap", marginBottom:5 }}>
                    <Award size={14} color={COLORS.gold} style={{ flexShrink:0 }} />
                    <span style={{ fontSize:13, fontWeight:700, color:COLORS.green }}>
                      {r.from_name ?? "—"} reconoció a {r.to_name ?? "—"}
                    </span>
                  </div>
                  <span style={{ display:"inline-block", fontSize:11, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", color:COLORS.gold, background:"rgba(201,162,78,0.12)", borderRadius:6, padding:"2px 8px", marginBottom:6 }}>{r.category}</span>
                  <p style={{ fontSize:13, color:COLORS.text, lineHeight:1.6, margin:"4px 0", wordBreak:"break-word" }}>{r.message}</p>
                  <span style={{ fontSize:11, color:COLORS.textMuted }}>{fmtSupaDate((r.created_at ?? "").slice(0,10))}</span>
                </div>
                {isAdmin && (
                  <button onClick={() => handleDelete(r.id)} title="Eliminar"
                    style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.textMuted, padding:4, flexShrink:0, display:"flex", transition:"color 0.12s" }}
                    onMouseEnter={e => e.currentTarget.style.color="#c0392b"}
                    onMouseLeave={e => e.currentTarget.style.color=COLORS.textMuted}
                  ><Trash2 size={14}/></button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
