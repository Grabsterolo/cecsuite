import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { inputStyle, taStyle, btnSubmitStyle } from "../../styles/forms.js";
import { translateError } from "../../utils/errors.js";
import { fmtSupaDate, fmtTimestampShort } from "../../utils/format.js";
import { Card, CardHeader } from "../ui/Card.jsx";
import { DeptTag } from "../ui/DeptTag.jsx";
import { PriorityTag, PrioritySelector } from "./TasksSection.jsx";

export function GestionTareasSection({ adminTasks = [], allTaskCompletions = [], adminProfiles = [], departmentsList = [], onNewTask, onUpdateTask, onDeleteTask }) {
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [priority,    setPriority]    = useState("media");
  const [dueDate,     setDueDate]     = useState("");
  const [assignMode,  setAssignMode]  = useState("persona"); // "persona" | "departamento"
  const [assignedTo,  setAssignedTo]  = useState("");
  const [deptTodos,   setDeptTodos]   = useState(true);
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [creating,    setCreating]    = useState(false);
  const [createError, setCreateError] = useState(null);
  const [success,     setSuccess]     = useState(false);

  const [tab, setTab] = useState("activas");
  const [error,          setError]          = useState(null);
  const [updating,       setUpdating]       = useState({});
  const [deleting,       setDeleting]       = useState({});
  const [confirmCancel,  setConfirmCancel]  = useState(null);
  const [confirmPermaDel, setConfirmPermaDel] = useState(null);
  const [expandConfirm,  setExpandConfirm]  = useState(null);

  const activeProfiles = adminProfiles.filter(p => p.role !== "inactivo");

  async function handleCreate() {
    const t = title.trim();
    setError(null);
    if (!t) { setCreateError("Escribe un título."); return; }
    if (assignMode === "persona" && !assignedTo) { setCreateError("Selecciona una persona."); return; }
    if (assignMode === "departamento" && !deptTodos && selectedDepts.length === 0) { setCreateError("Selecciona al menos un departamento."); return; }
    setCreating(true); setCreateError(null);
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error: insertError } = await supabase.from("tasks").insert({
      title: t,
      description: description.trim() || null,
      created_by: user.id,
      priority,
      due_date: dueDate || null,
      assigned_to: assignMode === "persona" ? assignedTo : null,
      assigned_departments: assignMode === "departamento" ? (deptTodos ? ["todos"] : selectedDepts) : [],
    }).select("*, creator:profiles!created_by(full_name), assignee:profiles!assigned_to(full_name)").single();
    setCreating(false);
    if (insertError) { setCreateError(translateError(insertError.message)); return; }
    onNewTask?.(data);
    setTitle(""); setDescription(""); setPriority("media"); setDueDate("");
    setAssignedTo(""); setDeptTodos(true); setSelectedDepts([]);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  }

  async function handleCancel(task) {
    setUpdating(prev => ({ ...prev, [task.id]: true })); setError(null);
    const { error: updError } = await supabase.from("tasks").update({ status: "cancelada" }).eq("id", task.id);
    setUpdating(prev => ({ ...prev, [task.id]: false }));
    if (updError) { setError(translateError(updError.message)); return; }
    onUpdateTask?.({ ...task, status: "cancelada" });
    setConfirmCancel(null);
  }

  async function handleReactivate(task) {
    setUpdating(prev => ({ ...prev, [task.id]: true })); setError(null);
    const { error: updError } = await supabase.from("tasks").update({ status: "pendiente" }).eq("id", task.id);
    setUpdating(prev => ({ ...prev, [task.id]: false }));
    if (updError) { setError(translateError(updError.message)); return; }
    onUpdateTask?.({ ...task, status: "pendiente" });
  }

  async function handlePermaDel(task) {
    const compCount = allTaskCompletions.filter(c => c.task_id === task.id).length;
    if (compCount > 0) {
      setError(`No se puede eliminar — hay ${compCount} completación${compCount !== 1 ? "es" : ""} registrada${compCount !== 1 ? "s" : ""}. Cancela la tarea en su lugar.`);
      setConfirmPermaDel(null);
      return;
    }
    setDeleting(prev => ({ ...prev, [task.id]: true }));
    const { error: delError } = await supabase.from("tasks").delete().eq("id", task.id);
    setDeleting(prev => ({ ...prev, [task.id]: false }));
    if (delError) { setError(translateError(delError.message)); return; }
    onDeleteTask(task.id);
    setConfirmPermaDel(null);
  }

  const fieldLabel = (text) => (
    <label style={{ display:"block", fontSize:12, fontWeight:600, color:COLORS.textMuted, marginBottom:6 }}>{text}</label>
  );
  const chipBase = (sel) => ({
    display:"inline-flex", alignItems:"center", padding:"5px 12px", borderRadius:20,
    cursor:"pointer", fontSize:12, fontWeight:sel?600:400,
    border:`1.5px solid ${sel?COLORS.gold:COLORS.border}`,
    background:sel?"rgba(201,162,78,0.12)":COLORS.panel,
    color:sel?COLORS.green:COLORS.textMuted,
    transition:"all 0.15s", fontFamily:"'Manrope', sans-serif",
  });

  const displayedTasks = adminTasks.filter(t => tab === "canceladas" ? t.status === "cancelada" : t.status === "pendiente");

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Card>
        <CardHeader title="Nueva tarea" />
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div>
            {fieldLabel("Título")}
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título de la tarea" style={inputStyle} />
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
          <div>
            {fieldLabel("Asignar a")}
            <div style={{ display:"flex", gap:4, marginBottom:10 }}>
              {[["persona","Persona específica"],["departamento","Departamento(s)"]].map(([key,label]) => (
                <button key={key} type="button" onClick={() => setAssignMode(key)} style={{
                  border:"none", borderRadius:6, padding:"5px 12px", fontSize:12, fontWeight:600, cursor:"pointer",
                  fontFamily:"'Manrope', sans-serif",
                  background: assignMode === key ? COLORS.green : COLORS.panelAlt,
                  color:      assignMode === key ? "#FFF" : COLORS.textMuted,
                }}>{label}</button>
              ))}
            </div>
            {assignMode === "persona" ? (
              <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} style={{ ...inputStyle, width:"100%" }}>
                <option value="" style={{ color:"#1F4A40" }}>Selecciona una persona...</option>
                {activeProfiles.map(p => <option key={p.id} value={p.id} style={{ color:"#1F4A40" }}>{p.full_name}</option>)}
              </select>
            ) : (
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                <button type="button" onClick={() => { setDeptTodos(true); setSelectedDepts([]); }} style={chipBase(deptTodos)}>
                  Todos los departamentos
                </button>
                {departmentsList.map(dept => {
                  const sel = selectedDepts.includes(dept.name);
                  return (
                    <button type="button" key={dept.id} onClick={() => { setDeptTodos(false); setSelectedDepts(prev => sel ? prev.filter(d => d !== dept.name) : [...prev, dept.name]); }} style={chipBase(sel)}>
                      {dept.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {createError && <p style={{ fontSize:12, color:"#c0392b", margin:0 }}>{createError}</p>}
          {success && <p style={{ fontSize:12, color:COLORS.greenSoft, fontWeight:600, margin:0 }}>✓ Tarea creada correctamente.</p>}
          <button onClick={handleCreate} disabled={creating} style={{
            ...btnSubmitStyle, width:"100%", opacity: creating ? 0.75 : 1, cursor: creating ? "not-allowed" : "pointer",
          }}>
            {creating ? "Creando..." : "Crear tarea"}
          </button>
        </div>
      </Card>

      <Card>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <span style={{ fontSize:14, fontWeight:700, color:COLORS.text }}>Tareas creadas</span>
          <div style={{ display:"flex", gap:4 }}>
            {[["activas","Activas"],["canceladas","Canceladas"]].map(([key,label]) => (
              <button key={key} onClick={() => setTab(key)} style={{
                border:"none", borderRadius:6, padding:"4px 12px", fontSize:12, fontWeight:600, cursor:"pointer",
                fontFamily:"'Manrope', sans-serif",
                background: tab === key ? COLORS.green : COLORS.panelAlt,
                color:      tab === key ? "#FFF" : COLORS.textMuted,
              }}>{label}</button>
            ))}
          </div>
        </div>
        {error && <p style={{ fontSize:12, color:"#c0392b", margin:"0 0 12px" }}>{error}</p>}
        {displayedTasks.length === 0 ? (
          <p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>{tab === "canceladas" ? "No hay tareas canceladas." : "No hay tareas activas."}</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column" }}>
            {displayedTasks.map(task => {
              const isUpdating = !!updating[task.id];
              const isDeleting = !!deleting[task.id];
              const isIndividual = !!task.assigned_to;
              const isConfirmingCancel = confirmCancel === task.id;
              const isConfirmingPermaDel = confirmPermaDel === task.id;
              const isOpen = expandConfirm === task.id;
              const individualCompletion = isIndividual ? allTaskCompletions.find(c => c.task_id === task.id && c.user_id === task.assigned_to) : null;
              return (
                <div key={task.id} style={{ padding:"12px 0", borderBottom:`1px solid ${COLORS.border}`, opacity: task.status === "cancelada" ? 0.72 : 1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                        <span style={{ fontSize:13, fontWeight:600, color: task.status === "cancelada" ? COLORS.textMuted : COLORS.text, wordBreak:"break-word" }}>{task.title}</span>
                        <PriorityTag priority={task.priority} />
                        {task.status === "cancelada" && <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:COLORS.textMuted, background:COLORS.panelAlt, borderRadius:4, padding:"1px 6px" }}>Cancelada</span>}
                      </div>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                        {isIndividual
                          ? <span style={{ fontSize:11, color:COLORS.textMuted }}>Asignada a: <strong style={{ color:COLORS.text }}>{task.assignee?.full_name ?? "—"}</strong></span>
                          : (task.assigned_departments || []).includes("todos")
                            ? <span style={{ fontSize:11, fontWeight:700, color:COLORS.textMuted }}>Todos los departamentos</span>
                            : (task.assigned_departments || []).map((d, di) => <DeptTag key={di} dept={d} />)
                        }
                        {task.due_date && <span style={{ fontSize:11, color:COLORS.textMuted }}>· Vence: {fmtSupaDate(task.due_date)}</span>}
                        <span style={{ fontSize:11, color:COLORS.textMuted }}>· Creada: {fmtTimestampShort(task.created_at)}</span>
                      </div>
                      {isIndividual && (
                        <div style={{ marginTop:6, fontSize:12 }}>
                          {individualCompletion
                            ? <span style={{ color:COLORS.greenSoft, fontWeight:600 }}>✓ Completada el {fmtTimestampShort(individualCompletion.completed_at)}</span>
                            : <span style={{ color:COLORS.textMuted }}>Pendiente</span>
                          }
                        </div>
                      )}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                      {task.status === "cancelada" ? (
                        <button onClick={() => handleReactivate(task)} disabled={isUpdating} style={{
                          border:"none", background:"rgba(44,99,86,0.1)", color:COLORS.greenSoft,
                          cursor:isUpdating?"not-allowed":"pointer", borderRadius:6, padding:"4px 10px",
                          fontSize:11, fontWeight:700, fontFamily:"'Manrope', sans-serif", opacity:isUpdating?0.6:1,
                        }}>{isUpdating ? "..." : "Reactivar"}</button>
                      ) : (
                        <button onClick={() => setConfirmCancel(isConfirmingCancel ? null : task.id)} disabled={isUpdating} style={{
                          border:"none", background:COLORS.panelAlt, color:COLORS.textMuted,
                          cursor:isUpdating?"not-allowed":"pointer", borderRadius:6, padding:"4px 10px",
                          fontSize:11, fontWeight:700, fontFamily:"'Manrope', sans-serif",
                        }}>Cancelar</button>
                      )}
                      <button onClick={() => setConfirmPermaDel(isConfirmingPermaDel ? null : task.id)} disabled={isDeleting} title="Eliminar" style={{
                        border:"none", background:"rgba(192,57,43,0.08)", color:"#c0392b",
                        cursor:isDeleting?"not-allowed":"pointer", borderRadius:6, width:30, height:30,
                        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                      }}>
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </div>
                  {isConfirmingCancel && (
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8, padding:"8px 10px", background:COLORS.panelAlt, borderRadius:7 }}>
                      <span style={{ fontSize:12, color:COLORS.text, flex:1 }}>¿Cancelar esta tarea? Dejará de estar activa, pero se conserva el historial de completaciones.</span>
                      <button onClick={() => handleCancel(task)} disabled={isUpdating} style={{
                        border:"none", background:COLORS.green, color:"#FFF", borderRadius:6,
                        padding:"5px 12px", fontSize:12, fontWeight:700, cursor:"pointer",
                        fontFamily:"'Manrope', sans-serif", opacity:isUpdating?0.6:1,
                      }}>{isUpdating ? "Cancelando..." : "Sí, cancelar"}</button>
                      <button onClick={() => setConfirmCancel(null)} style={{
                        border:"none", background:"transparent", color:COLORS.textMuted, borderRadius:6,
                        padding:"5px 12px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Manrope', sans-serif",
                      }}>Cancelar</button>
                    </div>
                  )}
                  {isConfirmingPermaDel && (
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8, padding:"8px 10px", background:"rgba(192,57,43,0.06)", borderRadius:7 }}>
                      <span style={{ fontSize:12, color:"#c0392b", flex:1 }}>¿Eliminar permanentemente? No se puede deshacer.</span>
                      <button onClick={() => handlePermaDel(task)} disabled={isDeleting} style={{
                        border:"none", background:"#c0392b", color:"#FFF", borderRadius:6,
                        padding:"5px 12px", fontSize:12, fontWeight:700, cursor:"pointer",
                        fontFamily:"'Manrope', sans-serif", opacity:isDeleting?0.6:1,
                      }}>{isDeleting ? "Eliminando..." : "Sí, eliminar"}</button>
                      <button onClick={() => setConfirmPermaDel(null)} style={{
                        border:"none", background:"transparent", color:COLORS.textMuted, borderRadius:6,
                        padding:"5px 12px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Manrope', sans-serif",
                      }}>Cancelar</button>
                    </div>
                  )}
                  {!isIndividual && (() => {
                    const taskCompletions = allTaskCompletions.filter(c => c.task_id === task.id);
                    const completedIds = new Set(taskCompletions.map(c => c.user_id));
                    const eligible = activeProfiles.filter(p => (task.assigned_departments || []).includes("todos") || (Array.isArray(p.departments) && p.departments.some(d => (task.assigned_departments || []).includes(d))));
                    const notCompleted = eligible.filter(p => !completedIds.has(p.id));
                    return (
                      <div style={{ marginTop:8 }}>
                        <button onClick={() => setExpandConfirm(isOpen ? null : task.id)} style={{ background:"none", border:`1px solid ${COLORS.border}`, borderRadius:6, padding:"3px 10px", fontSize:11, color:COLORS.textMuted, cursor:"pointer", fontFamily:"'Manrope', sans-serif", fontWeight:600 }}>
                          {isOpen ? "Ocultar completaciones" : `Ver completaciones (${taskCompletions.length}/${eligible.length})`}
                        </button>
                        {isOpen && (
                          <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:4 }}>
                            {taskCompletions.map(c => (
                              <div key={c.user_id} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:COLORS.greenSoft }}>
                                <span style={{ fontWeight:600 }}>✓</span>
                                <span>{c.profiles?.full_name ?? c.user_id}</span>
                                <span style={{ color:COLORS.textMuted, fontSize:11 }}>· {c.completed_at ? new Date(c.completed_at).toLocaleDateString("es-ES", { day:"2-digit", month:"short", year:"numeric" }) : ""}</span>
                              </div>
                            ))}
                            {notCompleted.map(p => (
                              <div key={p.id} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:COLORS.textMuted }}>
                                <span style={{ fontWeight:600 }}>·</span>
                                <span>{p.full_name}</span>
                                <span style={{ fontSize:11, color:"rgba(192,57,43,0.8)" }}>pendiente</span>
                              </div>
                            ))}
                            {eligible.length === 0 && <span style={{ fontSize:12, color:COLORS.textMuted }}>Sin empleados con acceso.</span>}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
