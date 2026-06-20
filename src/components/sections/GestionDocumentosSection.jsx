import React, { useState } from "react";
import { Archive, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { inputStyle, btnSubmitStyle } from "../../styles/forms.js";
import { translateError } from "../../utils/errors.js";
import { useIsMobile } from "../../hooks/useIsMobile.js";
import { Card, CardHeader } from "../ui/Card.jsx";
import { Tag } from "../ui/StatusBadge.jsx";
import { DeptTag } from "../ui/DeptTag.jsx";
import { DocDownloadBtn } from "../ui/DocDownloadBtn.jsx";

export function GestionDocumentosSection({ adminDocuments = [], departmentsList = [], adminProfiles = [], allConfirmations = [], onNewDocument, onDeleteDocument, onUpdateAdminDocument }) {
  const isMobile = useIsMobile();
  const [title,                 setTitle]                 = useState("");
  const [category,              setCategory]              = useState("");
  const [deptTodos,             setDeptTodos]             = useState(true);
  const [selectedDepts,         setSelectedDepts]         = useState([]);
  const [requiresConfirmation,  setRequiresConfirmation]  = useState(false);
  const [file,          setFile]          = useState(null);
  const [status,        setStatus]        = useState(null); // null | "uploading" | "saving"
  const [error,         setError]         = useState(null);
  const [success,       setSuccess]       = useState(false);
  const [archiving,     setArchiving]     = useState({}); // { [id]: true }
  const [deleting,      setDeleting]      = useState({}); // { [id]: true } for permanent delete
  const [confirmArchive,   setConfirmArchive]   = useState(null); // doc.id
  const [confirmPermaDel,  setConfirmPermaDel]  = useState(null); // doc.id
  const [showArchived,     setShowArchived]     = useState(false);
  const [expandConfirm,    setExpandConfirm]    = useState(null); // doc.id | null

  async function handleArchive(doc) {
    setArchiving(prev => ({ ...prev, [doc.id]: true }));
    const { error } = await supabase.from("documents").update({ archived: true }).eq("id", doc.id);
    setArchiving(prev => ({ ...prev, [doc.id]: false }));
    if (error) { setError(translateError(error.message)); return; }
    onUpdateAdminDocument?.({ ...doc, archived: true });
    setConfirmArchive(null);
  }

  async function handleRestore(doc) {
    setArchiving(prev => ({ ...prev, [doc.id]: true }));
    const { error } = await supabase.from("documents").update({ archived: false }).eq("id", doc.id);
    setArchiving(prev => ({ ...prev, [doc.id]: false }));
    if (error) { setError(translateError(error.message)); return; }
    onUpdateAdminDocument?.({ ...doc, archived: false });
  }

  async function handlePermaDel(doc) {
    const confCount = allConfirmations.filter(c => c.document_id === doc.id).length;
    if (confCount > 0) {
      setError(`No se puede eliminar — hay ${confCount} confirmación${confCount !== 1 ? "es" : ""} registrada${confCount !== 1 ? "s" : ""}.`);
      setConfirmPermaDel(null);
      return;
    }
    setDeleting(prev => ({ ...prev, [doc.id]: true }));
    if (doc.file_url) {
      try { await supabase.storage.from("documents").remove([doc.file_url]); } catch (_) {}
    }
    const { error: delError } = await supabase.from("documents").delete().eq("id", doc.id);
    setDeleting(prev => ({ ...prev, [doc.id]: false }));
    if (delError) { setError(translateError(delError.message)); return; }
    onDeleteDocument(doc.id);
    setConfirmPermaDel(null);
  }

  function handleFile(e) { setFile(e.target.files?.[0] ?? null); }

  async function handleSubmit() {
    setError(null);
    setSuccess(false);
    if (!title.trim() || !category.trim() || !file) {
      setError("Título, categoría y archivo son obligatorios.");
      return;
    }
    setStatus("uploading");
    const { data: { user } } = await supabase.auth.getUser();
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("documents").upload(fileName, file);
    if (uploadError) { setError(translateError(uploadError.message)); setStatus(null); return; }
    setStatus("saving");
    const { data, error: insertError } = await supabase.from("documents").insert({
      title: title.trim(),
      category: category.trim(),
      departments: deptTodos ? ["todos"] : selectedDepts,
      file_url: fileName,
      uploaded_by: user.id,
      requires_confirmation: requiresConfirmation,
    }).select().single();
    setStatus(null);
    if (insertError) { setError(translateError(insertError.message)); return; }
    onNewDocument(data);
    setTitle(""); setCategory(""); setDeptTodos(true); setSelectedDepts([]); setFile(null); setRequiresConfirmation(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  }

  const fieldLabel = (text) => (
    <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>{text}</label>
  );
  const dateInputStyle = { ...inputStyle, fontSize:14, padding:"10px 14px" };
  const isLoading = !!status;

  function fmtDateStr(str) {
    if (!str) return "—";
    const d = new Date(str);
    const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <Card>
        <CardHeader title="Subir documento" />
        {fieldLabel("Título")}
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Nombre del documento" style={{ ...dateInputStyle, marginBottom:14, display:"block" }}
          onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr", gap:12, marginBottom:14 }}>
          <div>
            {fieldLabel("Categoría")}
            <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Ej. Protocolo, Manual" style={dateInputStyle}
              onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
          </div>
          <div>
            {fieldLabel("Departamento")}
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
                </>);
              })()}
            </div>
          </div>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", fontSize:13, fontWeight:500, color:COLORS.text }}>
            <input type="checkbox" checked={requiresConfirmation} onChange={e => setRequiresConfirmation(e.target.checked)} style={{ width:16, height:16, accentColor:COLORS.green }} />
            Requiere confirmación de lectura
          </label>
        </div>
        {fieldLabel("Archivo")}
        <label style={{ display:"block", marginBottom:16, cursor:"pointer" }}>
          <div style={{ background:COLORS.inputBg, border:`1.5px dashed ${COLORS.border}`, borderRadius:8, padding:"11px 14px", fontSize:13, color: file ? COLORS.text : COLORS.textMuted, fontFamily:"'Manrope', sans-serif" }}>
            {file ? file.name : "Seleccionar archivo…"}
          </div>
          <input type="file" onChange={handleFile} style={{ display:"none" }} />
        </label>
        {error   && <p style={{ fontSize:12, color:"#e07070", margin:"0 0 12px" }}>{error}</p>}
        {success && <p style={{ fontSize:12, color:COLORS.greenSoft, fontWeight:600, margin:"0 0 12px" }}>✓ Documento subido correctamente.</p>}
        <button onClick={handleSubmit} disabled={isLoading} style={{
          ...btnSubmitStyle, width:"100%", opacity: isLoading ? 0.75 : 1, cursor: isLoading ? "not-allowed" : "pointer",
        }}>
          {status === "uploading" ? "Subiendo archivo..." : status === "saving" ? "Guardando..." : "Subir documento"}
        </button>
      </Card>

      <Card>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <span style={{ fontSize:14, fontWeight:700, color:COLORS.text }}>Documentos subidos</span>
          <div style={{ display:"flex", gap:4 }}>
            {["activos","archivados"].map(tab => (
              <button key={tab} onClick={() => setShowArchived(tab === "archivados")} style={{
                border:"none", borderRadius:6, padding:"4px 12px", fontSize:12, fontWeight:600, cursor:"pointer",
                fontFamily:"'Manrope', sans-serif",
                background: (tab === "archivados") === showArchived ? COLORS.green : COLORS.panelAlt,
                color:      (tab === "archivados") === showArchived ? "#FFF" : COLORS.textMuted,
              }}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
            ))}
          </div>
        </div>
        {(() => {
          const displayedDocs = adminDocuments.filter(d => showArchived ? d.archived : !d.archived);
          if (displayedDocs.length === 0) return <p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>{showArchived ? "No hay documentos archivados." : "No hay documentos activos."}</p>;
          return (
          <div style={{ display:"flex", flexDirection:"column" }}>
            {displayedDocs.map((doc, i) => {
              const isArchiving  = !!archiving[doc.id];
              const isDeleting   = !!deleting[doc.id];
              const isConfirmingArchive = confirmArchive === doc.id;
              const isConfirmingPermaDel = confirmPermaDel === doc.id;
              return (
                <div key={doc.id ?? i} style={{ padding:"12px 0", borderBottom:`1px solid ${COLORS.border}`, opacity: doc.archived ? 0.72 : 1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                        <span style={{ fontSize:13, fontWeight:600, color: doc.archived ? COLORS.textMuted : COLORS.text, wordBreak:"break-word" }}>{doc.title}</span>
                        {doc.archived && <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:COLORS.textMuted, background:COLORS.panelAlt, borderRadius:4, padding:"1px 6px" }}>Archivado</span>}
                      </div>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                        {doc.category && <Tag label={doc.category} />}
                        {Array.isArray(doc.departments) ? (
                          doc.departments.length === 0
                            ? <span style={{ fontSize:11, color:COLORS.textMuted }}>Todos los departamentos</span>
                            : doc.departments.map((d, di) => <DeptTag key={di} dept={d} />)
                        ) : doc.department
                          ? <DeptTag dept={doc.department} />
                          : <span style={{ fontSize:11, color:COLORS.textMuted }}>Todos los departamentos</span>
                        }
                        <span style={{ fontSize:11, color:COLORS.textMuted }}>· {fmtDateStr(doc.created_at)}</span>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                      {doc.file_url && <DocDownloadBtn fileUrl={doc.file_url} />}
                      {doc.archived ? (
                        <button onClick={() => handleRestore(doc)} disabled={isArchiving} title="Restaurar" style={{
                          border:"none", background:"rgba(44,99,86,0.1)", color:COLORS.greenSoft,
                          cursor:isArchiving?"not-allowed":"pointer", borderRadius:6, padding:"4px 10px",
                          fontSize:11, fontWeight:700, fontFamily:"'Manrope', sans-serif", opacity:isArchiving?0.6:1,
                        }}>{isArchiving ? "..." : "Restaurar"}</button>
                      ) : doc.requires_confirmation ? (
                        <button onClick={() => setConfirmArchive(isConfirmingArchive ? null : doc.id)} disabled={isArchiving} title="Archivar" style={{
                          border:"none", background:COLORS.panelAlt, color:COLORS.textMuted,
                          cursor:isArchiving?"not-allowed":"pointer", borderRadius:6, width:30, height:30,
                          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                        }}>
                          <Archive size={13}/>
                        </button>
                      ) : (
                        <button onClick={() => setConfirmPermaDel(isConfirmingPermaDel ? null : doc.id)} disabled={isDeleting} title="Eliminar" style={{
                          border:"none", background:"rgba(192,57,43,0.08)", color:"#c0392b",
                          cursor:isDeleting?"not-allowed":"pointer", borderRadius:6, width:30, height:30,
                          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                        }}>
                          <Trash2 size={13}/>
                        </button>
                      )}
                    </div>
                  </div>
                  {isConfirmingArchive && (
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8, padding:"8px 10px", background:COLORS.panelAlt, borderRadius:7 }}>
                      <span style={{ fontSize:12, color:COLORS.text, flex:1 }}>¿Archivar este documento? Dejará de ser visible para los empleados. <span style={{ color:COLORS.textMuted }}>Se archiva para preservar el historial de confirmaciones.</span></span>
                      <button onClick={() => handleArchive(doc)} disabled={isArchiving} style={{
                        border:"none", background:COLORS.green, color:"#FFF", borderRadius:6,
                        padding:"5px 12px", fontSize:12, fontWeight:700, cursor:"pointer",
                        fontFamily:"'Manrope', sans-serif", opacity:isArchiving?0.6:1,
                      }}>{isArchiving ? "Archivando..." : "Sí, archivar"}</button>
                      <button onClick={() => setConfirmArchive(null)} style={{
                        border:"none", background:"transparent", color:COLORS.textMuted, borderRadius:6,
                        padding:"5px 12px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Manrope', sans-serif",
                      }}>Cancelar</button>
                    </div>
                  )}
                  {isConfirmingPermaDel && (
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8, padding:"8px 10px", background:"rgba(192,57,43,0.06)", borderRadius:7 }}>
                      <span style={{ fontSize:12, color:"#c0392b", flex:1 }}>¿Eliminar permanentemente? No se puede deshacer.</span>
                      <button onClick={() => handlePermaDel(doc)} disabled={isDeleting} style={{
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
                  {doc.requires_confirmation && (() => {
                    const docConfs = allConfirmations.filter(c => c.document_id === doc.id);
                    const confirmedIds = new Set(docConfs.map(c => c.user_id));
                    const eligible = adminProfiles.filter(p => p.role !== "inactivo" && (Array.isArray(doc.departments) && (doc.departments.includes("todos") || (Array.isArray(p.departments) && p.departments.some(d => doc.departments.includes(d))))));
                    const notConfirmed = eligible.filter(p => !confirmedIds.has(p.id));
                    const isOpen = expandConfirm === doc.id;
                    return (
                      <div style={{ marginTop:8 }}>
                        <button onClick={() => setExpandConfirm(isOpen ? null : doc.id)} style={{ background:"none", border:`1px solid ${COLORS.border}`, borderRadius:6, padding:"3px 10px", fontSize:11, color:COLORS.textMuted, cursor:"pointer", fontFamily:"'Manrope', sans-serif", fontWeight:600 }}>
                          {isOpen ? "Ocultar confirmaciones" : `Ver confirmaciones (${docConfs.length}/${eligible.length})`}
                        </button>
                        {isOpen && (
                          <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:4 }}>
                            {docConfs.map(c => (
                              <div key={c.user_id} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:COLORS.greenSoft }}>
                                <span style={{ fontWeight:600 }}>✓</span>
                                <span>{c.profiles?.full_name ?? c.user_id}</span>
                                <span style={{ color:COLORS.textMuted, fontSize:11 }}>· {c.confirmed_at ? new Date(c.confirmed_at).toLocaleDateString("es-ES", { day:"2-digit", month:"short", year:"numeric" }) : ""}</span>
                              </div>
                            ))}
                            {notConfirmed.map(p => (
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
          );
        })()}
      </Card>
    </div>
  );
}
