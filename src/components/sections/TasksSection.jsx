import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { inputStyle, taStyle, btnSubmitStyle } from "../../styles/forms.js";
import { translateError } from "../../utils/errors.js";
import { fmtSupaDate } from "../../utils/format.js";
import { Card, CardHeader } from "../ui/Card.jsx";

export const PRIORITY_META = {
  baja:  { label: "Baja",  color: COLORS.greenSoft, background: "rgba(44,99,86,0.1)" },
  media: { label: "Media", color: COLORS.gold,       background: "rgba(201,162,78,0.12)" },
  alta:  { label: "Alta",  color: "#c0392b",          background: "rgba(192,57,43,0.1)" },
};

export function PriorityTag({ priority }) {
  const m = PRIORITY_META[priority] ?? PRIORITY_META.media;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
      color: m.color, background: m.background, borderRadius: 4, padding: "2px 7px",
      fontFamily: "'Manrope', sans-serif", display: "inline-block", width: "fit-content", whiteSpace: "nowrap",
    }}>
      {m.label}
    </span>
  );
}

export function PrioritySelector({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {Object.entries(PRIORITY_META).map(([key, m]) => {
        const sel = value === key;
        return (
          <button type="button" key={key} onClick={() => onChange(key)} style={{
            display: "inline-flex", alignItems: "center", padding: "5px 12px", borderRadius: 20,
            cursor: "pointer", fontSize: 12, fontWeight: sel ? 600 : 400,
            border: `1.5px solid ${sel ? m.color : COLORS.border}`,
            background: sel ? m.background : COLORS.panel,
            color: sel ? m.color : COLORS.textMuted,
            transition: "all 0.15s", fontFamily: "'Manrope', sans-serif",
          }}>
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

export function TasksSection({ myTasks = [], myTaskCompletions = {}, profile, userId, departmentsList = [], onNewTask, onDeleteTask, onTaskCompleted, onTaskUncompleted }) {
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [priority,    setPriority]    = useState("media");
  const [dueDate,     setDueDate]     = useState("");
  const [creating,    setCreating]    = useState(false);
  const [createError, setCreateError] = useState(null);

  const [tab, setTab] = useState("pendientes");
  const [expanded,    setExpanded]    = useState({});
  const [actingId,    setActingId]    = useState(null);
  const [actionError, setActionError] = useState(null);
  const [confirmDel,  setConfirmDel]  = useState(null);

  async function handleCreate() {
    const t = title.trim();
    if (!t) { setCreateError("Escribe un título."); return; }
    setCreating(true); setCreateError(null);
    const { data, error } = await supabase.from("tasks").insert({
      title: t,
      description: description.trim() || null,
      created_by: userId,
      assigned_to: userId,
      assigned_departments: [],
      priority,
      due_date: dueDate || null,
    }).select("*, creator:profiles!created_by(full_name), assignee:profiles!assigned_to(full_name)").single();
    setCreating(false);
    if (error) { setCreateError(translateError(error.message)); return; }
    setTitle(""); setDescription(""); setPriority("media"); setDueDate("");
    onNewTask?.(data);
  }

  async function handleComplete(taskId) {
    setActingId(taskId); setActionError(null);
    const { data, error } = await supabase.from("task_completions").insert({ task_id: taskId, user_id: userId }).select().single();
    setActingId(null);
    if (error) { setActionError(taskId); return; }
    onTaskCompleted?.(taskId, data.completed_at);
  }

  async function handleUncomplete(taskId) {
    setActingId(taskId); setActionError(null);
    const { error } = await supabase.from("task_completions").delete().eq("task_id", taskId).eq("user_id", userId);
    setActingId(null);
    if (error) { setActionError(taskId); return; }
    onTaskUncompleted?.(taskId);
  }

  async function handleDeleteOwn(taskId) {
    setActingId(taskId);
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    setActingId(null);
    if (error) { setActionError(taskId); return; }
    setConfirmDel(null);
    onDeleteTask?.(taskId);
  }

  const fieldLabel = (text) => (
    <label style={{ display:"block", fontSize:12, fontWeight:600, color:COLORS.textMuted, marginBottom:6 }}>{text}</label>
  );

  const visibleTasks   = myTasks.filter(t => t.status !== "cancelada");
  const pendingTasks   = visibleTasks.filter(t => !myTaskCompletions[t.id]);
  const completedTasks = visibleTasks.filter(t => myTaskCompletions[t.id]);
  const displayedTasks = tab === "completadas" ? completedTasks : pendingTasks;

  const today = new Date(); today.setHours(0,0,0,0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Card>
        <CardHeader title="Nuevo pendiente" />
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div>
            {fieldLabel("Título")}
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="¿Qué necesitas hacer?" style={inputStyle} />
          </div>
          <div>
            {fieldLabel("Descripción (opcional)")}
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalles adicionales..." rows={3} style={taStyle} />
          </div>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
            <div>
              {fieldLabel("Prioridad")}
              <PrioritySelector value={priority} onChange={setPriority} />
            </div>
            <div>
              {fieldLabel("Fecha límite (opcional)")}
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ ...inputStyle, width:"auto" }} />
            </div>
          </div>
          {createError && <p style={{ fontSize:12, color:"#c0392b", margin:0 }}>{createError}</p>}
          <button onClick={handleCreate} disabled={creating} style={{
            ...btnSubmitStyle, width:"100%", opacity: creating ? 0.75 : 1, cursor: creating ? "not-allowed" : "pointer",
          }}>
            {creating ? "Creando..." : "Agregar pendiente"}
          </button>
        </div>
      </Card>

      <Card>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <span style={{ fontSize:14, fontWeight:700, color:COLORS.text }}>Mis tareas</span>
          <div style={{ display:"flex", gap:4 }}>
            {[["pendientes", `Pendientes${pendingTasks.length ? ` (${pendingTasks.length})` : ""}`], ["completadas", "Completadas"]].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} style={{
                border:"none", borderRadius:6, padding:"4px 12px", fontSize:12, fontWeight:600, cursor:"pointer",
                fontFamily:"'Manrope', sans-serif",
                background: tab === key ? COLORS.green : COLORS.panelAlt,
                color:      tab === key ? "#FFF" : COLORS.textMuted,
              }}>{label}</button>
            ))}
          </div>
        </div>

        {displayedTasks.length === 0 ? (
          <p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>
            {tab === "completadas" ? "Aún no has completado ninguna tarea." : "No tienes pendientes por ahora."}
          </p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column" }}>
            {displayedTasks.map(task => {
              const isCompleted = !!myTaskCompletions[task.id];
              const isOwn = task.created_by === userId && task.assigned_to === userId;
              const isExpanded = !!expanded[task.id];
              const isActing = actingId === task.id;
              const dueDateObj = task.due_date ? new Date(task.due_date + "T12:00:00") : null;
              const isOverdue = dueDateObj && !isCompleted && dueDateObj < today;
              const creatorName = task.creator?.full_name;
              const isConfirmingDel = confirmDel === task.id;
              return (
                <div key={task.id} style={{ padding:"14px 0", borderBottom:`1px solid ${COLORS.border}` }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5, flexWrap:"wrap" }}>
                        <span style={{ fontSize:14, fontWeight:600, color:COLORS.text, wordBreak:"break-word" }}>{task.title}</span>
                        <PriorityTag priority={task.priority} />
                        {isOverdue && (
                          <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:"#FFF", background:"#c0392b", borderRadius:4, padding:"2px 7px" }}>Vencida</span>
                        )}
                      </div>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center", fontSize:11, color:COLORS.textMuted }}>
                        {task.due_date && <span>Vence: {fmtSupaDate(task.due_date)}</span>}
                        {creatorName && task.created_by !== userId && <span>· Asignado por: <strong style={{ color:COLORS.text }}>{creatorName}</strong></span>}
                        {isCompleted && myTaskCompletions[task.id] && <span>· Completada el {fmtSupaDate(myTaskCompletions[task.id].slice(0,10))}</span>}
                      </div>
                      {isExpanded && task.description && (
                        <p style={{ marginTop:8, fontSize:13, color:COLORS.text, lineHeight:1.6, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>{task.description}</p>
                      )}
                      {task.description && (
                        <button onClick={() => setExpanded(prev => ({ ...prev, [task.id]: !prev[task.id] }))} style={{ marginTop:6, background:"none", border:"none", color:COLORS.gold, fontSize:12, fontWeight:600, cursor:"pointer", padding:0, fontFamily:"'Manrope', sans-serif" }}>
                          {isExpanded ? "Ver menos" : "Ver más"}
                        </button>
                      )}
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0 }}>
                      {isCompleted ? (
                        <button onClick={() => handleUncomplete(task.id)} disabled={isActing} style={{ fontSize:11, fontWeight:600, color:COLORS.textMuted, background:"none", border:`1px solid ${COLORS.border}`, borderRadius:6, padding:"4px 10px", cursor:isActing?"not-allowed":"pointer", fontFamily:"'Manrope', sans-serif", whiteSpace:"nowrap" }}>
                          {isActing ? "..." : "Deshacer"}
                        </button>
                      ) : (
                        <button onClick={() => handleComplete(task.id)} disabled={isActing} style={{
                          fontSize:12, fontWeight:700, color:"#FFF", whiteSpace:"nowrap",
                          background: isActing ? COLORS.border : `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
                          border:"none", borderRadius:8, padding:"7px 14px", cursor:isActing?"not-allowed":"pointer",
                          fontFamily:"'Manrope', sans-serif",
                        }}>
                          {isActing ? "..." : "Marcar completada"}
                        </button>
                      )}
                      {isOwn && (
                        isConfirmingDel ? (
                          <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                            <button onClick={() => handleDeleteOwn(task.id)} disabled={isActing} style={{ fontSize:11, fontWeight:700, color:"#FFF", background:"#c0392b", border:"none", borderRadius:6, padding:"3px 8px", cursor:"pointer", fontFamily:"'Manrope', sans-serif" }}>
                              {isActing ? "..." : "Sí"}
                            </button>
                            <button onClick={() => setConfirmDel(null)} style={{ fontSize:11, fontWeight:600, color:COLORS.textMuted, background:"none", border:`1px solid ${COLORS.border}`, borderRadius:6, padding:"3px 8px", cursor:"pointer", fontFamily:"'Manrope', sans-serif" }}>No</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDel(task.id)} title="Eliminar" style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.textMuted, padding:2, display:"flex" }}>
                            <Trash2 size={13}/>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                  {actionError === task.id && <p style={{ fontSize:11, color:"#c0392b", margin:"6px 0 0" }}>Ocurrió un error. Intenta de nuevo.</p>}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
