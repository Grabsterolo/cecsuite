import React, { useState, useEffect, useRef } from "react";
import { X, MessageCircle, Send, Check, CheckCheck, ChevronLeft, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { playNotificationPing } from "../../utils/audio.js";

function fmtChatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (msgDay.getTime() === today.getTime())
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export function SupportChatWidget({ userId }) {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState(null); // null = not yet loaded
  const [input,    setInput]    = useState("");
  const [sending,  setSending]  = useState(false);
  const [unread,   setUnread]   = useState(false);
  const bottomRef = useRef(null);
  const openRef2  = useRef(false);
  useEffect(() => { openRef2.current = open; }, [open]);

  // Load messages on first open
  useEffect(() => {
    if (!open || messages !== null) return;
    supabase.from("support_messages").select("*").eq("user_id", userId).order("created_at", { ascending: true })
      .then(({ data }) => setMessages(data || []));
  }, [open]);

  // Mark admin messages as read when panel opens
  useEffect(() => {
    if (!open) return;
    setUnread(false);
    supabase.from("support_messages").update({ read_by_employee: true })
      .eq("user_id", userId).eq("read_by_employee", false);
  }, [open]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime: admin replies + read-receipt updates
  useEffect(() => {
    const ch = supabase.channel("support-emp-" + userId)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: `user_id=eq.${userId}` }, ({ new: row }) => {
        if (row.sender_id === userId) {
          // Replace the oldest pending optimistic message with the real DB row so its id matches future UPDATE events
          setMessages(prev => {
            if (!prev) return [row];
            const optIdx = prev.findIndex(m => String(m.id).startsWith("opt-"));
            if (optIdx !== -1) return prev.map((m, i) => i === optIdx ? row : m);
            return prev.some(m => m.id === row.id) ? prev : [...prev, row];
          });
          return;
        }
        if (openRef2.current) {
          setMessages(prev => prev ? (prev.some(m => m.id === row.id) ? prev : [...prev, row]) : [row]);
          supabase.from("support_messages").update({ read_by_employee: true }).eq("id", row.id);
        } else {
          playNotificationPing();
          setUnread(true);
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "support_messages", filter: `user_id=eq.${userId}` }, ({ new: row }) => {
        // Update read_by_admin flag on own messages so receipt icon updates in real time
        if (row.sender_id === userId && row.read_by_admin) {
          setMessages(prev => prev ? prev.map(m => m.id === row.id ? { ...m, read_by_admin: true } : m) : prev);
        }
      })
      .subscribe();
    return () => { ch.unsubscribe(); supabase.removeChannel(ch); };
  }, [userId]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    const optimistic = { id: "opt-" + Date.now(), user_id: userId, sender_id: userId, message: text, created_at: new Date().toISOString(), read_by_admin: false, read_by_employee: true };
    setMessages(prev => [...(prev || []), optimistic]);
    setInput("");
    await supabase.from("support_messages").insert({ user_id: userId, sender_id: userId, message: text, read_by_admin: false, read_by_employee: true });
    setSending(false);
  }

  const isMineStyle = { background:"rgba(201,162,78,0.15)", border:"1px solid rgba(201,162,78,0.3)", borderRadius:"14px 14px 4px 14px" };
  const isTheirsStyle = { background:COLORS.panelAlt, border:`1px solid ${COLORS.border}`, borderRadius:"14px 14px 14px 4px" };

  return (
    <>
      {open && (
        <div style={{
          position:"fixed", bottom:90, right:24, width:340, height:420,
          background:COLORS.panel, borderRadius:16, border:`1px solid ${COLORS.border}`,
          boxShadow:"0 8px 32px rgba(0,0,0,0.14)", display:"flex", flexDirection:"column",
          zIndex:200, fontFamily:"'Manrope', sans-serif", animation:"sectionIn 0.2s ease-out both",
        }}>
          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 16px", borderBottom:`1px solid ${COLORS.border}`, flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#27ae60", flexShrink:0 }} />
              <span style={{ fontSize:14, fontWeight:700, color:COLORS.green }}>Soporte</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.textMuted, display:"flex", padding:4 }}>
              <X size={16}/>
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }}>
            {messages === null ? (
              <p style={{ color:COLORS.textMuted, fontSize:12, textAlign:"center", marginTop:24 }}>Cargando...</p>
            ) : messages.length === 0 ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", textAlign:"center", gap:12 }}>
                <MessageCircle size={28} color={COLORS.gold}/>
                <p style={{ color:COLORS.textMuted, fontSize:13, lineHeight:1.55, margin:0, maxWidth:220 }}>
                  ¿Tienes alguna duda o necesitas ayuda? Escríbenos y te responderemos pronto.
                </p>
              </div>
            ) : messages.map((msg, i) => {
              const mine = msg.sender_id === userId;
              return (
                <div key={msg.id || i} style={{ display:"flex", flexDirection:"column", alignItems: mine ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth:"80%", padding:"8px 12px", fontSize:13, color:COLORS.text, lineHeight:1.5, ...(mine ? isMineStyle : isTheirsStyle) }}>
                    {msg.message}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:3, marginTop:3 }}>
                    <span style={{ fontSize:10, color:COLORS.textMuted }}>{fmtChatTime(msg.created_at)}</span>
                    {mine && (
                      msg.read_by_admin
                        ? <CheckCheck size={12} color={COLORS.gold} />
                        : <Check size={12} color={COLORS.textMuted} />
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div style={{ padding:"10px 12px", borderTop:`1px solid ${COLORS.border}`, display:"flex", gap:8, flexShrink:0 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Escribe un mensaje..."
              style={{ flex:1, padding:"8px 12px", borderRadius:20, border:`1px solid ${COLORS.border}`, background:COLORS.inputBg, color:COLORS.text, fontSize:13, fontFamily:"'Manrope', sans-serif", outline:"none" }}
            />
            <button onClick={handleSend} disabled={!input.trim() || sending} style={{
              width:36, height:36, borderRadius:"50%", border:"none", flexShrink:0,
              cursor:(!input.trim() || sending) ? "not-allowed" : "pointer",
              background:(!input.trim() || sending) ? COLORS.border : `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
              display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s",
            }}>
              <Send size={14} color="#FFF"/>
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position:"fixed", bottom:24, right:24, width:56, height:56, borderRadius:"50%",
          background:`linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
          border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 4px 20px rgba(201,162,78,0.45)", zIndex:200, transition:"transform 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform="scale(1.08)"}
        onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
      >
        <MessageCircle size={24} color="#FFF"/>
        {unread && <div style={{ position:"absolute", top:4, right:4, width:10, height:10, borderRadius:"50%", background:"#e74c3c", border:"2px solid #FFF" }}/>}
      </button>
    </>
  );
}

export function AdminSupportChatWidget({ adminId }) {
  const [open,         setOpen]         = useState(false);
  const [view,         setView]         = useState("list"); // "list" | "chat"
  const [conversations,setConversations]= useState(null);  // null = not loaded
  const [selectedConv, setSelectedConv] = useState(null);  // { userId, full_name, hasUnread }
  const [chatMessages, setChatMessages] = useState([]);
  const [input,        setInput]        = useState("");
  const [sending,      setSending]      = useState(false);
  const [badge,        setBadge]        = useState(0);
  const [deletingId,   setDeletingId]   = useState(null); // userId pending delete confirm
  const [deleteError,  setDeleteError]  = useState(null);
  const bottomRef        = useRef(null);
  const viewRef          = useRef("list");
  const selectedRef      = useRef(null);
  const openRef          = useRef(false);
  const pendingFetchsRef = useRef(new Set());
  const loadingConvRef   = useRef(null);
  useEffect(() => { viewRef.current     = view; },         [view]);
  useEffect(() => { selectedRef.current = selectedConv; }, [selectedConv]);
  useEffect(() => { openRef.current     = open; },         [open]);

  function buildConversations(data) {
    const map = {};
    for (const msg of data) {
      const uid = msg.user_id;
      if (!map[uid]) {
        map[uid] = {
          userId: uid,
          full_name: msg.profiles?.full_name || "Empleado",
          lastMessage: msg.message,
          lastTime: msg.created_at,
          hasUnread: false,
        };
      }
      if (!msg.read_by_admin && msg.sender_id !== adminId) map[uid].hasUnread = true;
    }
    return Object.values(map).sort((a, b) => {
      if (a.hasUnread !== b.hasUnread) return a.hasUnread ? -1 : 1;
      return new Date(b.lastTime) - new Date(a.lastTime);
    });
  }

  // Single source of truth for badge: derive from conversations when loaded, query DB before first open
  useEffect(() => {
    if (conversations !== null) {
      setBadge(conversations.filter(c => c.hasUnread).length);
      return;
    }
    supabase.from("support_messages").select("user_id").eq("read_by_admin", false).neq("sender_id", adminId)
      .then(({ data }) => { if (data) setBadge(new Set(data.map(m => m.user_id)).size); });
  }, [conversations, adminId]);

  // Load conversations on first open
  useEffect(() => {
    if (!open || conversations !== null) return;
    supabase.from("support_messages")
      .select("*, profiles!support_messages_user_id_fkey(full_name)")
      .order("created_at", { ascending: false })
      .then(({ data }) => setConversations(buildConversations(data || [])));
  }, [open]);

  // Auto-scroll in chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  async function openConversation(conv) {
    setSelectedConv(conv);
    setView("chat");
    setChatMessages([]);
    loadingConvRef.current = conv.userId;
    const { data } = await supabase.from("support_messages").select("*")
      .eq("user_id", conv.userId).order("created_at", { ascending: true });
    if (loadingConvRef.current !== conv.userId) return; // admin switched conversation before fetch resolved
    setChatMessages(data || []);
    await supabase.from("support_messages").update({ read_by_admin: true })
      .eq("user_id", conv.userId).eq("read_by_admin", false);
    setConversations(prev => prev ? prev.map(c =>
      c.userId === conv.userId ? { ...c, hasUnread: false } : c
    ).sort((a, b) => {
      if (a.hasUnread !== b.hasUnread) return a.hasUnread ? -1 : 1;
      return new Date(b.lastTime) - new Date(a.lastTime);
    }) : prev);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || sending || !selectedConv) return;
    setSending(true);
    const optimistic = { id:"opt-"+Date.now(), user_id:selectedConv.userId, sender_id:adminId, message:text, created_at:new Date().toISOString(), read_by_admin:true, read_by_employee:false };
    setChatMessages(prev => [...prev, optimistic]);
    setInput("");
    await supabase.from("support_messages").insert({ user_id:selectedConv.userId, sender_id:adminId, message:text, read_by_admin:true, read_by_employee:false });
    setSending(false);
  }

  async function deleteConversation(userId) {
    setDeleteError(null);
    const { error } = await supabase.from("support_messages").delete().eq("user_id", userId);
    if (error) {
      setDeleteError("No se pudo eliminar. Verifica los permisos.");
      return;
    }
    setConversations(prev => prev ? prev.filter(c => c.userId !== userId) : prev);
    setDeletingId(null);
    if (selectedConv?.userId === userId) { setView("list"); setSelectedConv(null); setChatMessages([]); }
  }

  // Realtime: all new employee messages + read-receipt updates for admin's own messages
  useEffect(() => {
    const ch = supabase.channel("support-admin-" + adminId)
      .on("postgres_changes", { event:"UPDATE", schema:"public", table:"support_messages", filter:`sender_id=eq.${adminId}` }, ({ new: row }) => {
        // When employee reads an admin message, update read_by_employee in local state
        if (row.read_by_employee && selectedRef.current?.userId === row.user_id) {
          setChatMessages(prev => prev.map(m => m.id === row.id ? { ...m, read_by_employee: true } : m));
        }
      })
      .on("postgres_changes", { event:"INSERT", schema:"public", table:"support_messages" }, ({ new: row }) => {
        if (row.sender_id === adminId) return;
        playNotificationPing();
        const inThisChat = openRef.current && viewRef.current === "chat" && selectedRef.current?.userId === row.user_id;
        if (inThisChat) {
          setChatMessages(prev => prev.some(m => m.id === row.id) ? prev : [...prev, row]);
          supabase.from("support_messages").update({ read_by_admin:true }).eq("id", row.id);
        }
        // Update conversations list; if not yet loaded, just increment badge directly
        setConversations(prev => {
          if (!prev) {
            setBadge(n => n + 1);
            return prev;
          }
          const exists = prev.some(c => c.userId === row.user_id);
          let next;
          if (exists) {
            next = prev.map(c => c.userId === row.user_id
              ? { ...c, lastMessage: row.message, lastTime: row.created_at, hasUnread: inThisChat ? false : true }
              : c);
          } else {
            // New conversation — fetch name once per user_id (guard against rapid duplicates)
            if (!pendingFetchsRef.current.has(row.user_id)) {
              pendingFetchsRef.current.add(row.user_id);
              supabase.from("profiles").select("full_name").eq("id", row.user_id).single()
                .then(({ data }) => {
                  pendingFetchsRef.current.delete(row.user_id);
                  setConversations(p => {
                    if (!p) return p;
                    if (p.some(c => c.userId === row.user_id)) return p;
                    return [...p, {
                      userId: row.user_id, full_name: data?.full_name || "Empleado",
                      lastMessage: row.message, lastTime: row.created_at, hasUnread: !inThisChat,
                    }].sort((a, b) => {
                      if (a.hasUnread !== b.hasUnread) return a.hasUnread ? -1 : 1;
                      return new Date(b.lastTime) - new Date(a.lastTime);
                    });
                  });
                });
            }
            return prev;
          }
          return next.sort((a, b) => {
            if (a.hasUnread !== b.hasUnread) return a.hasUnread ? -1 : 1;
            return new Date(b.lastTime) - new Date(a.lastTime);
          });
        });
      })
      .subscribe();
    return () => { ch.unsubscribe(); supabase.removeChannel(ch); };
  }, [adminId]);

  const panelStyle = {
    position:"fixed", bottom:90, right:24, width:340, height:440,
    background:COLORS.panel, borderRadius:16, border:`1px solid ${COLORS.border}`,
    boxShadow:"0 8px 32px rgba(0,0,0,0.14)", display:"flex", flexDirection:"column",
    zIndex:200, fontFamily:"'Manrope', sans-serif", animation:"sectionIn 0.2s ease-out both",
  };

  return (
    <>
      {open && (
        <div style={panelStyle}>
          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 16px", borderBottom:`1px solid ${COLORS.border}`, flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {view === "chat" && (
                <button onClick={() => { setView("list"); setSelectedConv(null); setDeletingId(null); }} style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.textMuted, display:"flex", padding:"0 4px 0 0" }}>
                  <ChevronLeft size={18}/>
                </button>
              )}
              <span style={{ fontSize:14, fontWeight:700, color:COLORS.green }}>
                {view === "list" ? "Soporte" : (selectedConv?.full_name || "Chat")}
              </span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              {view === "chat" && selectedConv && (
                <button onClick={() => setDeletingId(selectedConv.userId)} title="Eliminar chat" style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.textMuted, display:"flex", padding:4, transition:"color 0.12s" }}
                  onMouseEnter={e => e.currentTarget.style.color="#c0392b"}
                  onMouseLeave={e => e.currentTarget.style.color=COLORS.textMuted}
                >
                  <Trash2 size={15}/>
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.textMuted, display:"flex", padding:4 }}>
                <X size={16}/>
              </button>
            </div>
          </div>
          {/* Inline delete confirm in chat view */}
          {view === "chat" && deletingId === selectedConv?.userId && (
            <div style={{ padding:"8px 16px", background:"rgba(192,57,43,0.06)", borderBottom:`1px solid rgba(192,57,43,0.15)`, flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontSize:12, color:"#c0392b", fontWeight:600 }}>¿Eliminar este chat?</span>
                <div style={{ display:"flex", gap:6 }}>
                  <button onClick={() => deleteConversation(selectedConv.userId)} style={{ fontSize:11, fontWeight:700, color:"#FFF", background:"#c0392b", border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>Eliminar</button>
                  <button onClick={() => { setDeletingId(null); setDeleteError(null); }} style={{ fontSize:11, fontWeight:600, color:COLORS.textMuted, background:"transparent", border:`1px solid ${COLORS.border}`, borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>Cancelar</button>
                </div>
              </div>
              {deleteError && <p style={{ fontSize:11, color:"#c0392b", margin:"5px 0 0", fontFamily:"'Manrope', sans-serif" }}>{deleteError}</p>}
            </div>
          )}

          {/* LIST view */}
          {view === "list" && (
            <div style={{ flex:1, overflowY:"auto" }}>
              {conversations === null ? (
                <p style={{ color:COLORS.textMuted, fontSize:12, textAlign:"center", marginTop:24 }}>Cargando...</p>
              ) : conversations.length === 0 ? (
                <p style={{ color:COLORS.textMuted, fontSize:13, textAlign:"center", margin:"32px 20px" }}>No hay conversaciones de soporte.</p>
              ) : conversations.map(conv => (
                <div key={conv.userId} style={{ borderBottom:`1px solid ${COLORS.border}` }}>
                  {deletingId === conv.userId ? (
                    <div style={{ padding:"10px 16px", background:"rgba(192,57,43,0.05)" }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <span style={{ fontSize:12, color:"#c0392b", fontWeight:600 }}>¿Eliminar este chat?</span>
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={() => deleteConversation(conv.userId)} style={{ fontSize:11, fontWeight:700, color:"#FFF", background:"#c0392b", border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>Eliminar</button>
                          <button onClick={() => { setDeletingId(null); setDeleteError(null); }} style={{ fontSize:11, fontWeight:600, color:COLORS.textMuted, background:"transparent", border:`1px solid ${COLORS.border}`, borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>Cancelar</button>
                        </div>
                      </div>
                      {deleteError && <p style={{ fontSize:11, color:"#c0392b", margin:"5px 0 0", fontFamily:"'Manrope', sans-serif" }}>{deleteError}</p>}
                    </div>
                  ) : (
                    <div onClick={() => openConversation(conv)} style={{
                      display:"flex", alignItems:"center", gap:10, padding:"11px 16px",
                      cursor:"pointer",
                      background: conv.hasUnread ? "rgba(201,162,78,0.06)" : "transparent",
                      transition:"background 0.12s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background="rgba(31,74,64,0.05)"}
                      onMouseLeave={e => e.currentTarget.style.background= conv.hasUnread ? "rgba(201,162,78,0.06)" : "transparent"}
                    >
                      <div style={{ width:36, height:36, borderRadius:"50%", background:COLORS.panelAlt, border:`1px solid ${COLORS.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:14, fontWeight:700, color:COLORS.textMuted }}>
                        {(conv.full_name || "E")[0].toUpperCase()}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:2 }}>
                          <span style={{ fontSize:13, fontWeight: conv.hasUnread ? 700 : 600, color:COLORS.text }}>{conv.full_name}</span>
                          <span style={{ fontSize:10, color:COLORS.textMuted, flexShrink:0 }}>{fmtChatTime(conv.lastTime)}</span>
                        </div>
                        <span style={{ fontSize:12, color: conv.hasUnread ? COLORS.text : COLORS.textMuted, display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {conv.lastMessage}
                        </span>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setDeletingId(conv.userId); }}
                        title="Eliminar chat"
                        style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.textMuted, padding:4, display:"flex", flexShrink:0, transition:"color 0.12s" }}
                        onMouseEnter={e => e.currentTarget.style.color="#c0392b"}
                        onMouseLeave={e => e.currentTarget.style.color=COLORS.textMuted}
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* CHAT view */}
          {view === "chat" && (
            <>
              <div style={{ flex:1, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }}>
                {chatMessages.length === 0 ? (
                  <p style={{ color:COLORS.textMuted, fontSize:12, textAlign:"center", marginTop:24 }}>Sin mensajes aún.</p>
                ) : chatMessages.map((msg, i) => {
                  const mine = msg.sender_id === adminId;
                  return (
                    <div key={msg.id || i} style={{ display:"flex", flexDirection:"column", alignItems: mine ? "flex-end" : "flex-start" }}>
                      <div style={{ maxWidth:"80%", padding:"8px 12px", fontSize:13, color:COLORS.text, lineHeight:1.5,
                        background: mine ? "rgba(201,162,78,0.15)" : COLORS.panelAlt,
                        border: mine ? "1px solid rgba(201,162,78,0.3)" : `1px solid ${COLORS.border}`,
                        borderRadius: mine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      }}>
                        {msg.message}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:3, marginTop:3 }}>
                        <span style={{ fontSize:10, color:COLORS.textMuted }}>{fmtChatTime(msg.created_at)}</span>
                        {mine && (
                          msg.read_by_employee
                            ? <CheckCheck size={12} color={COLORS.gold} />
                            : <Check size={12} color={COLORS.textMuted} />
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef}/>
              </div>
              <div style={{ padding:"10px 12px", borderTop:`1px solid ${COLORS.border}`, display:"flex", gap:8, flexShrink:0 }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Responder..."
                  style={{ flex:1, padding:"8px 12px", borderRadius:20, border:`1px solid ${COLORS.border}`, background:COLORS.inputBg, color:COLORS.text, fontSize:13, fontFamily:"'Manrope', sans-serif", outline:"none" }}
                />
                <button onClick={handleSend} disabled={!input.trim() || sending} style={{
                  width:36, height:36, borderRadius:"50%", border:"none", flexShrink:0,
                  cursor:(!input.trim() || sending) ? "not-allowed" : "pointer",
                  background:(!input.trim() || sending) ? COLORS.border : `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
                  display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s",
                }}>
                  <Send size={14} color="#FFF"/>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position:"fixed", bottom:24, right:24, width:56, height:56, borderRadius:"50%",
          background:`linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
          border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 4px 20px rgba(201,162,78,0.45)", zIndex:200, transition:"transform 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform="scale(1.08)"}
        onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
      >
        <MessageCircle size={24} color="#FFF"/>
        {badge > 0 && (
          <div style={{ position:"absolute", top:2, right:2, minWidth:18, height:18, borderRadius:9, background:"#e74c3c", border:"2px solid #FFF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:"#FFF", padding:"0 3px" }}>
            {badge}
          </div>
        )}
      </button>
    </>
  );
}
