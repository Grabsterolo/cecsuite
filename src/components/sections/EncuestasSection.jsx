import React, { useState } from "react";
import { Check, BarChart3, Plus, X, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { translateError } from "../../utils/errors.js";
import { Card, CardHeader } from "../ui/Card.jsx";

function PollResultBars({ poll, pollResults = {}, myVoteIndex }) {
  const results = pollResults[poll.id] || {};
  const total = Object.values(results).reduce((s, v) => s + v, 0);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {poll.options.map((opt, idx) => {
        const votes = results[idx] ?? 0;
        const pct = total > 0 ? Math.round((votes / total) * 100) : 0;
        const isMyVote = myVoteIndex === idx;
        return (
          <div key={idx}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
              <span style={{ fontSize:13, fontWeight: isMyVote ? 700 : 500, color: isMyVote ? COLORS.green : COLORS.text, display:"flex", alignItems:"center", gap:5 }}>
                {isMyVote && <Check size={13} color={COLORS.green} />}
                {opt}
              </span>
              <span style={{ fontSize:12, color:COLORS.textMuted, flexShrink:0, marginLeft:8 }}>{votes} voto{votes !== 1 ? "s" : ""} · {pct}%</span>
            </div>
            <div style={{ height:8, borderRadius:4, background:COLORS.border, overflow:"hidden" }}>
              <div style={{ height:"100%", borderRadius:4, width:`${pct}%`, background: isMyVote ? `linear-gradient(90deg, ${COLORS.goldSoft}, ${COLORS.gold})` : COLORS.green, transition:"width 0.4s ease" }} />
            </div>
          </div>
        );
      })}
      <div style={{ fontSize:11, color:COLORS.textMuted }}>{total} voto{total !== 1 ? "s" : ""} totales</div>
    </div>
  );
}

export function EncuestasSection({ polls = [], myVotes = {}, pollResults = {}, userId, profile, onPollCreated, onVoted, onPollClosed, onPollDeleted }) {
  const isAdmin = profile?.role === "admin";
  const [question,     setQuestion]     = useState("");
  const [options,      setOptions]      = useState(["", ""]);
  const [creating,     setCreating]     = useState(false);
  const [createError,  setCreateError]  = useState(null);
  const [pendingVote,  setPendingVote]  = useState({});
  const [votingPoll,   setVotingPoll]   = useState(null);
  const [changingVote, setChangingVote] = useState({});
  const [confirmDel,   setConfirmDel]   = useState(null);
  const [deleting,     setDeleting]     = useState(null);
  const [voteError,    setVoteError]    = useState(null);

  async function handleCreate() {
    const q = question.trim();
    const opts = options.map(o => o.trim()).filter(Boolean);
    if (!q) { setCreateError("Escribe una pregunta."); return; }
    if (opts.length < 2) { setCreateError("Agrega al menos 2 opciones."); return; }
    setCreating(true); setCreateError(null);
    const { data, error } = await supabase.from("polls")
      .insert({ question: q, options: opts, created_by: userId, status: "activa" })
      .select("*").single();
    setCreating(false);
    if (error) { setCreateError(translateError(error.message)); return; }
    setQuestion(""); setOptions(["", ""]);
    onPollCreated?.(data);
  }

  async function handleVote(pollId, isUpdate) {
    const idx = pendingVote[pollId];
    if (idx === undefined) return;
    setVoteError(null);
    setVotingPoll(pollId);
    const { error } = isUpdate
      ? await supabase.from("poll_votes").update({ option_index: idx }).eq("poll_id", pollId).eq("user_id", userId)
      : await supabase.from("poll_votes").insert({ poll_id: pollId, user_id: userId, option_index: idx });
    setVotingPoll(null);
    if (error) {
      setVoteError("No se pudo registrar tu voto. Intenta de nuevo.");
      return;
    }
    onVoted?.(pollId, idx);
    setPendingVote(prev => { const n = { ...prev }; delete n[pollId]; return n; });
    setChangingVote(prev => { const n = { ...prev }; delete n[pollId]; return n; });
  }

  async function handleClose(pollId) {
    await supabase.from("polls").update({ status: "cerrada" }).eq("id", pollId);
    onPollClosed?.(pollId);
  }

  async function handleDelete(pollId) {
    setDeleting(pollId);
    await supabase.from("polls").delete().eq("id", pollId);
    setDeleting(null); setConfirmDel(null);
    onPollDeleted?.(pollId);
  }

  const inpStyle = { width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${COLORS.border}`, background:COLORS.inputBg, color:COLORS.text, fontSize:13, fontFamily:"'Manrope', sans-serif", outline:"none", boxSizing:"border-box" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {isAdmin && (
        <Card>
          <CardHeader title="Crear encuesta" />
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:COLORS.textMuted, marginBottom:5 }}>Pregunta</label>
              <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="¿Cuál es tu pregunta?" style={inpStyle} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:COLORS.textMuted, marginBottom:6 }}>Opciones</label>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {options.map((opt, i) => (
                  <div key={i} style={{ display:"flex", gap:6, alignItems:"center" }}>
                    <input value={opt} onChange={e => { const n = [...options]; n[i] = e.target.value; setOptions(n); }} placeholder={`Opción ${i + 1}`} style={{ ...inpStyle, flex:1 }} />
                    {options.length > 2 && (
                      <button onClick={() => setOptions(options.filter((_, j) => j !== i))} style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.textMuted, padding:4, display:"flex", flexShrink:0, transition:"color 0.12s" }}
                        onMouseEnter={e => e.currentTarget.style.color="#c0392b"}
                        onMouseLeave={e => e.currentTarget.style.color=COLORS.textMuted}
                      ><X size={14}/></button>
                    )}
                  </div>
                ))}
              </div>
              {options.length < 5 && (
                <button onClick={() => setOptions([...options, ""])} style={{ marginTop:8, display:"flex", alignItems:"center", gap:5, background:"none", border:"none", cursor:"pointer", color:COLORS.gold, fontSize:12, fontWeight:600, fontFamily:"'Manrope', sans-serif", padding:0 }}>
                  <Plus size={13}/> Agregar opción
                </button>
              )}
            </div>
            {createError && <p style={{ fontSize:12, color:"#c0392b", margin:0 }}>{createError}</p>}
            <button onClick={handleCreate} disabled={creating} style={{
              padding:"10px 0", borderRadius:9, border:"none",
              background: creating ? COLORS.border : `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
              color:"#FFF", fontSize:14, fontWeight:700,
              cursor: creating ? "not-allowed" : "pointer",
              fontFamily:"'Manrope', sans-serif", opacity: creating ? 0.7 : 1, transition:"all 0.15s",
            }}>{creating ? "Creando..." : "Crear encuesta"}</button>
          </div>
        </Card>
      )}

      {polls.length === 0 ? (
        <Card><p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>No hay encuestas por el momento.</p></Card>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {polls.map(poll => {
            const myvote = myVotes[poll.id];
            const isClosed = poll.status === "cerrada";
            const hasVoted = myvote !== undefined;
            const isChanging = !!changingVote[poll.id];
            const showResults = hasVoted && !isChanging;
            const showVoteForm = !isClosed && (!hasVoted || isChanging);
            const isSubmitting = votingPoll === poll.id;
            const noPending = pendingVote[poll.id] === undefined;
            return (
              <Card key={poll.id} style={{ padding:"16px 18px" }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      <BarChart3 size={15} color={isClosed ? COLORS.textMuted : COLORS.green} style={{ flexShrink:0 }} />
                      <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:COLORS.green, flex:1, lineHeight:1.3 }}>{poll.question}</h3>
                      {isClosed && (
                        <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:"#FFF", background:COLORS.textMuted, borderRadius:6, padding:"2px 8px", flexShrink:0 }}>Cerrada</span>
                      )}
                    </div>
                  </div>
                  {isAdmin && (
                    <div style={{ display:"flex", gap:6, flexShrink:0, alignItems:"center" }}>
                      {!isClosed && (
                        <button onClick={() => handleClose(poll.id)} style={{ fontSize:11, fontWeight:600, color:COLORS.textMuted, background:"none", border:`1px solid ${COLORS.border}`, borderRadius:6, padding:"3px 8px", cursor:"pointer", fontFamily:"'Manrope', sans-serif", transition:"all 0.12s", whiteSpace:"nowrap" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor=COLORS.green; e.currentTarget.style.color=COLORS.green; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor=COLORS.border; e.currentTarget.style.color=COLORS.textMuted; }}
                        >Cerrar</button>
                      )}
                      {confirmDel === poll.id ? (
                        <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                          <span style={{ fontSize:11, color:COLORS.textMuted, whiteSpace:"nowrap" }}>¿Eliminar?</span>
                          <button onClick={() => handleDelete(poll.id)} disabled={deleting === poll.id} style={{ fontSize:11, fontWeight:700, color:"#FFF", background:"#c0392b", border:"none", borderRadius:6, padding:"3px 8px", cursor:"pointer", fontFamily:"'Manrope', sans-serif" }}>
                            {deleting === poll.id ? "..." : "Sí"}
                          </button>
                          <button onClick={() => setConfirmDel(null)} style={{ fontSize:11, fontWeight:600, color:COLORS.textMuted, background:"none", border:`1px solid ${COLORS.border}`, borderRadius:6, padding:"3px 8px", cursor:"pointer", fontFamily:"'Manrope', sans-serif" }}>No</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDel(poll.id)} style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.textMuted, padding:4, display:"flex", transition:"color 0.12s" }}
                          onMouseEnter={e => e.currentTarget.style.color="#c0392b"}
                          onMouseLeave={e => e.currentTarget.style.color=COLORS.textMuted}
                        ><Trash2 size={14}/></button>
                      )}
                    </div>
                  )}
                </div>

                {showVoteForm && (
                  <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                    {poll.options.map((opt, idx) => (
                      <label key={idx} style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer", fontSize:13, color:COLORS.text, fontWeight: pendingVote[poll.id] === idx ? 600 : 400 }}>
                        <input type="radio" name={`poll-${poll.id}`} checked={pendingVote[poll.id] === idx}
                          onChange={() => setPendingVote(prev => ({ ...prev, [poll.id]: idx }))}
                          style={{ accentColor: COLORS.green, width:15, height:15, flexShrink:0 }}
                        />
                        {opt}
                      </label>
                    ))}
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginTop:4, flexWrap:"wrap" }}>
                      <button onClick={() => handleVote(poll.id, hasVoted)} disabled={isSubmitting || noPending} style={{
                        padding:"8px 18px", borderRadius:8, border:"none",
                        background: (isSubmitting || noPending) ? COLORS.border : `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
                        color:"#FFF", fontSize:13, fontWeight:700,
                        cursor: (isSubmitting || noPending) ? "not-allowed" : "pointer",
                        fontFamily:"'Manrope', sans-serif", opacity: (isSubmitting || noPending) ? 0.7 : 1, transition:"all 0.15s",
                      }}>{isSubmitting ? "Enviando..." : hasVoted ? "Actualizar voto" : "Votar"}</button>
                      {isChanging && (
                        <button onClick={() => setChangingVote(prev => { const n={...prev}; delete n[poll.id]; return n; })} style={{ fontSize:12, color:COLORS.textMuted, background:"none", border:"none", cursor:"pointer", fontFamily:"'Manrope', sans-serif", padding:0 }}>Cancelar</button>
                      )}
                    </div>
                    {voteError && <p style={{ fontSize:12, color:"#e07070", margin:"6px 0 0" }}>{voteError}</p>}
                  </div>
                )}

                {showResults && (
                  <>
                    <PollResultBars poll={poll} pollResults={pollResults} myVoteIndex={myvote} />
                    {!isClosed && (
                      <button onClick={() => setChangingVote(prev => ({ ...prev, [poll.id]: true }))} style={{ marginTop:10, fontSize:12, color:COLORS.gold, background:"none", border:"none", cursor:"pointer", fontFamily:"'Manrope', sans-serif", fontWeight:600, padding:0, textDecoration:"underline" }}>
                        Cambiar mi voto
                      </button>
                    )}
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
