import React, { useState } from "react";
import { createClient as _createSupabaseClient } from "@supabase/supabase-js";
import { Edit2, KeyRound, UserX } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { VAC_TOTAL } from "../../constants/nav.js";
import { inputStyle, btnSubmitStyle, btnCancelStyle } from "../../styles/forms.js";
import { translateError } from "../../utils/errors.js";
import { getEffectiveDays } from "../../utils/dates.js";
import { useIsMobile } from "../../hooks/useIsMobile.js";
import { Card, CardHeader } from "../ui/Card.jsx";
import { DeptTag } from "../ui/DeptTag.jsx";
import { ModalShell } from "../ui/ModalShell.jsx";

export function AltaEmpleadoSection({ departmentsList = [] }) {
  const isMobile = useIsMobile();
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [fullName,      setFullName]      = useState("");
  const [alias,         setAlias]         = useState("");
  const [position,      setPosition]      = useState("");
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [hireDate,      setHireDate]      = useState("");
  const [birthDate,     setBirthDate]     = useState("");
  const [role,               setRole]               = useState("empleado");
  const [vacBalance,         setVacBalance]         = useState("");
  const [commissionEligible, setCommissionEligible] = useState(false);
  const [loading,            setLoading]            = useState(false);
  const [error,              setError]              = useState(null);
  const [partialErr,         setPartialErr]         = useState(null);
  const [successInfo,        setSuccessInfo]        = useState(null);

  function toggleDept(name) {
    setSelectedDepts(prev => prev.includes(name) ? prev.filter(d => d !== name) : [...prev, name]);
  }

  function generatePassword() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pwd = "";
    for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    setPassword(pwd);
  }

  async function handleCreate() {
    setError(null); setPartialErr(null); setSuccessInfo(null);
    if (!email.trim() || !password || !fullName.trim() || selectedDepts.length === 0) {
      setError("Correo, contraseña, nombre completo y al menos un departamento son obligatorios.");
      return;
    }
    setLoading(true);

    // Snapshot admin session BEFORE touching tempClient so we can restore it
    const { data: { session: adminSession } } = await supabase.auth.getSession();

    const tempClient = _createSupabaseClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { data, error: signUpError } = await tempClient.auth.signUp({ email: email.trim(), password });
    if (signUpError) { setError(translateError(signUpError.message)); setLoading(false); return; }
    const userId = data?.user?.id;
    if (!userId) {
      setError("No se pudo obtener el ID del nuevo usuario. Es posible que el correo ya esté registrado.");
      setLoading(false); return;
    }

    // Explicitly restore admin session — signUp on the temp client can pollute
    // the shared auth state even when persistSession:false is set
    if (adminSession) {
      await supabase.auth.setSession({
        access_token:  adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id:                    userId,
      full_name:             fullName.trim(),
      alias:                 alias.trim() || null,
      position:              position.trim() || null,
      departments:           selectedDepts,
      hire_date:             hireDate   || null,
      birth_date:            birthDate  || null,
      role,
      vacation_balance:       vacBalance  !== "" ? Number(vacBalance)  : VAC_TOTAL,
      commission_eligible:    commissionEligible,
    }, { onConflict: "id" });
    setLoading(false);
    if (profileError) {
      setPartialErr(
        `El usuario fue creado en autenticación (ID: ${userId}) pero no se pudo actualizar el perfil.\n` +
        `message: ${profileError.message}\n` +
        `code: ${profileError.code ?? "—"}\n` +
        `details: ${profileError.details ?? "—"}\n` +
        `hint: ${profileError.hint ?? "—"}`
      );
      return;
    }
    const savedEmail = email.trim();
    const savedPwd   = password;
    setEmail(""); setPassword(""); setFullName(""); setAlias(""); setPosition("");
    setSelectedDepts([]); setHireDate(""); setBirthDate("");
    setRole("empleado"); setVacBalance(""); setCommissionEligible(false);
    setSuccessInfo({ email: savedEmail, password: savedPwd });
  }

  const fl = (text, optional) => (
    <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>
      {text}{optional && <span style={{ fontWeight:400 }}> (opcional)</span>}
    </label>
  );
  const inp = { ...inputStyle, fontSize:14, padding:"10px 14px" };
  const selStyle = { width:"100%", background:COLORS.inputBg, border:`1.5px solid ${COLORS.border}`, borderRadius:8, padding:"11px 14px", color:COLORS.text, fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"'Manrope', sans-serif", cursor:"pointer", appearance:"auto" };

  return (
    <Card>
      <CardHeader title="Nuevo empleado" />

      {/* Credenciales */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr", gap:12, marginBottom:14 }}>
        <div>
          {fl("Correo corporativo")}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@cec.cr" style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Contraseña temporal")}
          <div style={{ display:"flex", gap:8 }}>
            <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña…" style={{ ...inp, flex:1 }}
              onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
            <button onClick={generatePassword} title="Generar contraseña" style={{
              border:`1.5px solid ${COLORS.border}`, background:COLORS.inputBg, borderRadius:8, padding:"0 12px",
              color:COLORS.textMuted, fontSize:12, fontWeight:600, cursor:"pointer",
              fontFamily:"'Manrope', sans-serif", whiteSpace:"nowrap", flexShrink:0,
            }}>Generar</button>
          </div>
        </div>
      </div>

      {/* Datos personales */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr", gap:12, marginBottom:14 }}>
        <div>
          {fl("Nombre completo")}
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nombre Apellido" style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Alias / ¿Cómo llamarlo?", true)}
          <input type="text" value={alias} onChange={e => { if (e.target.value.length <= 30) setAlias(e.target.value); }} placeholder="Apodo o nombre corto" maxLength={30} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Puesto", true)}
          <input type="text" value={position} onChange={e => setPosition(e.target.value)} placeholder="Ej. Enfermera, Recepcionista" style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
      </div>

      {/* Departamentos */}
      <div style={{ marginBottom:14 }}>
        {fl("Departamentos")}
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {departmentsList.length === 0
            ? <span style={{ fontSize:13, color:COLORS.textMuted }}>No hay departamentos registrados.</span>
            : departmentsList.map(dept => {
                const sel = selectedDepts.includes(dept.name);
                return (
                  <button type="button" key={dept.id} onClick={() => toggleDept(dept.name)} style={{
                    display:"inline-flex", alignItems:"center", padding:"5px 12px", borderRadius:20,
                    cursor:"pointer", fontSize:12, fontWeight:sel?600:400,
                    border:`1.5px solid ${sel?COLORS.gold:COLORS.border}`,
                    background:sel?"rgba(201,162,78,0.12)":COLORS.panel,
                    color:sel?COLORS.green:COLORS.textMuted,
                    transition:"all 0.15s", fontFamily:"'Manrope', sans-serif",
                  }}>
                    {dept.name}
                  </button>
                );
              })
          }
        </div>
      </div>

      {/* Fechas */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr", gap:12, marginBottom:14, alignItems:"end" }}>
        <div>
          {fl("Fecha de ingreso", true)}
          <input type="date" value={hireDate} onChange={e => setHireDate(e.target.value)} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Fecha de nacimiento", true)}
          <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
      </div>

      {/* Rol y vacaciones */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap:12, marginBottom:20 }}>
        <div>
          {fl("Rol")}
          <select value={role} onChange={e => setRole(e.target.value)} style={selStyle}>
            <option value="empleado" style={{ color:"#1F4A40" }}>Empleado</option>

            <option value="admin"    style={{ color:"#1F4A40" }}>Admin</option>
          </select>
        </div>
        <div>
          {fl("Saldo vacaciones inicial", true)}
          <input type="number" min="0" value={vacBalance} onChange={e => setVacBalance(e.target.value)} placeholder={String(VAC_TOTAL)} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
      </div>

      {/* Módulo de comisiones */}
      <div style={{ marginBottom:14 }}>
        <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", fontSize:13, fontWeight:500, color:COLORS.text }}>
          <input type="checkbox" checked={commissionEligible} onChange={e => setCommissionEligible(e.target.checked)} style={{ width:16, height:16, accentColor:COLORS.green }} />
          Módulo de comisiones (esteticista)
        </label>
      </div>

      {error && <p style={{ fontSize:12, color:"#e07070", margin:"0 0 12px" }}>{error}</p>}
      {partialErr && (
        <div style={{ fontSize:12, color:"#e07070", background:"rgba(192,57,43,0.06)", borderRadius:7, padding:"10px 12px", margin:"0 0 12px", lineHeight:1.6 }}>
          ⚠️ {partialErr}
        </div>
      )}
      {successInfo && (
        <div style={{ fontSize:13, background:"rgba(44,99,86,0.08)", borderRadius:8, padding:"12px 16px", margin:"0 0 16px", lineHeight:1.8, border:`1px solid rgba(44,99,86,0.2)` }}>
          <div style={{ fontWeight:700, color:COLORS.green, marginBottom:6 }}>✓ Empleado creado correctamente</div>
          <div style={{ color:COLORS.text }}>Correo: <strong>{successInfo.email}</strong></div>
          <div style={{ color:COLORS.text }}>Contraseña temporal: <strong style={{ fontFamily:"monospace", letterSpacing:"0.05em" }}>{successInfo.password}</strong></div>
          <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:6 }}>Comparte estos datos con el empleado para que pueda ingresar al portal.</div>
        </div>
      )}

      <button onClick={handleCreate} disabled={loading} style={{
        ...btnSubmitStyle, width:"100%", opacity: loading ? 0.75 : 1, cursor: loading ? "not-allowed" : "pointer",
      }}>
        {loading ? "Creando..." : "Crear empleado"}
      </button>
    </Card>
  );
}

function EditEmployeeModal({ emp, departmentsList, onClose, onSave }) {
  const isMobile = useIsMobile();
  const [fullName,    setFullName]    = useState(emp.full_name ?? "");
  const [position,    setPosition]    = useState(emp.position ?? "");
  const [selectedDepts, setSelectedDepts] = useState(
    Array.isArray(emp.departments) ? emp.departments : (emp.department ? [emp.department] : [])
  );
  const [hireDate,    setHireDate]    = useState(emp.hire_date ?? "");
  const [birthDate,   setBirthDate]   = useState(emp.birth_date ?? "");
  const [role,        setRole]        = useState(emp.role ?? "empleado");
  const [vacBalance,  setVacBalance]  = useState(emp.vacation_balance !== undefined && emp.vacation_balance !== null ? String(emp.vacation_balance) : "");
  const [alias,       setAlias]       = useState(emp.alias ?? "");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [commissionEligible, setCommissionEligible] = useState(emp.commission_eligible ?? false);

  function toggleDept(name) {
    setSelectedDepts(prev => prev.includes(name) ? prev.filter(d => d !== name) : [...prev, name]);
  }

  async function handleSave() {
    setError(null);
    if (!fullName.trim() || selectedDepts.length === 0) {
      setError("Nombre completo y al menos un departamento son obligatorios.");
      return;
    }
    setLoading(true);
    const updates = {
      full_name:              fullName.trim(),
      alias:                  alias.trim() || null,
      position:               position.trim() || null,
      departments:            selectedDepts,
      hire_date:              hireDate  || null,
      birth_date:             birthDate || null,
      role,
      vacation_balance:       vacBalance  !== "" ? Number(vacBalance)  : VAC_TOTAL,
      commission_eligible:    commissionEligible,
    };
    const { error: updateError } = await supabase.from("profiles").update(updates).eq("id", emp.id);
    setLoading(false);
    if (updateError) { setError(translateError(updateError.message)); return; }
    onSave({ ...emp, ...updates });
  }

  const fl = (text, optional) => (
    <label style={{ fontSize:12, color:COLORS.textMuted, display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.02em" }}>
      {text}{optional && <span style={{ fontWeight:400 }}> (opcional)</span>}
    </label>
  );
  const inp = { ...inputStyle, fontSize:14, padding:"10px 14px" };
  const selStyle = { width:"100%", background:COLORS.inputBg, border:`1.5px solid ${COLORS.border}`, borderRadius:8, padding:"11px 14px", color:COLORS.text, fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"'Manrope', sans-serif", cursor:"pointer", appearance:"auto" };

  return (
    <ModalShell onClose={onClose} title={`Editar: ${emp.full_name ?? "empleado"}`}>
      <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr", gap:12, marginBottom:14, alignItems:"end" }}>
        <div>
          {fl("Nombre completo")}
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Alias / ¿Cómo llamarlo?")}
          <input type="text" value={alias} onChange={e => { if (e.target.value.length <= 30) setAlias(e.target.value); }} placeholder="Apodo o nombre corto" maxLength={30} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Puesto")}
          <input type="text" value={position} onChange={e => setPosition(e.target.value)} placeholder="Ej. Enfermera" style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Rol")}
          <select value={role} onChange={e => setRole(e.target.value)} style={selStyle}>
            <option value="empleado" style={{ color:"#1F4A40" }}>Empleado</option>

            <option value="admin"    style={{ color:"#1F4A40" }}>Admin</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom:14 }}>
        {fl("Departamentos")}
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {departmentsList.length === 0
            ? <span style={{ fontSize:13, color:COLORS.textMuted }}>No hay departamentos registrados.</span>
            : departmentsList.map(dept => {
                const sel = selectedDepts.includes(dept.name);
                return (
                  <button type="button" key={dept.id} onClick={() => toggleDept(dept.name)} style={{
                    display:"inline-flex", alignItems:"center", padding:"5px 12px", borderRadius:20,
                    cursor:"pointer", fontSize:12, fontWeight:sel?600:400,
                    border:`1.5px solid ${sel?COLORS.gold:COLORS.border}`,
                    background:sel?"rgba(201,162,78,0.12)":COLORS.panel,
                    color:sel?COLORS.green:COLORS.textMuted,
                    transition:"all 0.15s", fontFamily:"'Manrope', sans-serif",
                  }}>{dept.name}</button>
                );
              })
          }
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "1fr 1fr", gap:12, marginBottom:14, alignItems:"end" }}>
        <div>
          {fl("Fecha de ingreso")}
          <input type="date" value={hireDate} onChange={e => setHireDate(e.target.value)} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Fecha de nacimiento")}
          <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
        <div>
          {fl("Saldo vacaciones")}
          <input type="number" min="0" value={vacBalance} onChange={e => setVacBalance(e.target.value)} placeholder={String(VAC_TOTAL)} style={inp}
            onFocus={e => e.target.style.borderColor=COLORS.gold} onBlur={e => e.target.style.borderColor=COLORS.border}/>
        </div>
      </div>

      <div style={{ marginBottom:14 }}>
        <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", fontSize:13, fontWeight:500, color:COLORS.text }}>
          <input type="checkbox" checked={commissionEligible} onChange={e => setCommissionEligible(e.target.checked)} style={{ width:16, height:16, accentColor:COLORS.green }} />
          Módulo de comisiones (esteticista)
        </label>
      </div>
      {error && <p style={{ fontSize:12, color:"#e07070", margin:"0 0 12px" }}>{error}</p>}
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onClose} style={btnCancelStyle}>Cancelar</button>
        <button onClick={handleSave} disabled={loading} style={{ ...btnSubmitStyle, opacity:loading?0.75:1, cursor:loading?"not-allowed":"pointer" }}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </ModalShell>
  );
}

export function EmpleadosSection({ adminProfiles = [], adminRequests = [], departmentsList = [], onUpdateProfile }) {
  const [search,      setSearch]      = useState("");
  const [filterDept,  setFilterDept]  = useState("todos");
  const [editingEmp,  setEditingEmp]  = useState(null);
  const [savedEmpId,  setSavedEmpId]  = useState(null);
  const [resetModal,        setResetModal]        = useState(null); // { emp, password }
  const [resetLoading,      setResetLoading]      = useState(false);
  const [resetError,        setResetError]        = useState(null);
  const [resetSuccess,      setResetSuccess]      = useState(false);
  const [copied,            setCopied]            = useState(false);
  const [deactivateModal,   setDeactivateModal]   = useState(null); // emp
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [deactivateError,   setDeactivateError]   = useState(null);

  const activeProfiles = adminProfiles.filter(p => p.role !== "inactivo");

  const departments = [...new Set(activeProfiles.flatMap(p =>
    Array.isArray(p.departments) ? p.departments : (p.department ? [p.department] : [])
  ).filter(Boolean))].sort();

  const filtered = activeProfiles.filter(p => {
    const matchSearch = !search || (p.full_name ?? "").toLowerCase().includes(search.toLowerCase());
    const empDepts = Array.isArray(p.departments) ? p.departments : (p.department ? [p.department] : []);
    const matchDept   = filterDept === "todos" || empDepts.includes(filterDept);
    return matchSearch && matchDept;
  });

  function handleSaved(updatedEmp) {
    onUpdateProfile(updatedEmp);
    setEditingEmp(null);
    setSavedEmpId(updatedEmp.id);
    setTimeout(() => setSavedEmpId(null), 3000);
  }

  function getVacStats(userId) {
    const reqs = adminRequests.filter(r => r.user_id === userId && r.type === "vacaciones");
    const approved = reqs.filter(r => r.status === "aprobado").reduce((a, r) => a + getEffectiveDays(r), 0);
    const pending  = reqs.filter(r => r.status === "pendiente").reduce((a, r) => a + getEffectiveDays(r), 0);
    return { approved, pending };
  }

  function fmtHireDateShort(str) {
    if (!str) return "—";
    const [y, m, d] = str.split("-").map(Number);
    const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
    return `${d} ${months[m-1]} ${y}`;
  }

  function generatePassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }

  function openResetModal(emp) {
    setResetModal({ emp, password: generatePassword() });
    setResetError(null);
    setResetSuccess(false);
    setCopied(false);
  }

  async function handleResetPassword() {
    if (!resetModal) return;
    setResetLoading(true);
    setResetError(null);
    const { error } = await supabase.rpc("admin_reset_password", {
      target_user_id: resetModal.emp.id,
      new_password: resetModal.password,
    });
    setResetLoading(false);
    if (error) { setResetError(translateError(error.message)); return; }
    setResetSuccess(true);
  }

  async function handleDeactivate() {
    if (!deactivateModal) return;
    const emp = deactivateModal;
    setDeactivateLoading(true);
    setDeactivateError(null);
    const newName = "[BAJA] " + (emp.full_name ?? "");
    const { error } = await supabase.from("profiles").update({ role: "inactivo", full_name: newName }).eq("id", emp.id);
    setDeactivateLoading(false);
    if (error) { setDeactivateError(translateError(error.message)); return; }
    onUpdateProfile({ ...emp, role: "inactivo", full_name: newName });
    setDeactivateModal(null);
  }

  const pendingTotal = adminRequests.filter(r => r.type === "vacaciones" && r.status === "pendiente").length;

  const overlayStyle = { position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 };
  const modalBoxStyle = { background:COLORS.panel, borderRadius:16, padding:28, width:"100%", maxWidth:420, boxShadow:"0 8px 32px rgba(31,74,64,0.18)", fontFamily:"'Manrope', sans-serif" };
  const iconBtn = (extraStyle) => ({
    border:`1.5px solid ${COLORS.border}`, background:"transparent",
    cursor:"pointer", borderRadius:8,
    width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center",
    transition:"all 0.15s", ...extraStyle,
  });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {editingEmp && (
        <EditEmployeeModal
          emp={editingEmp}
          departmentsList={departmentsList}
          onClose={() => setEditingEmp(null)}
          onSave={handleSaved}
        />
      )}

      {/* Reset password modal */}
      {resetModal && (
        <div style={overlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, fontWeight:600, color:COLORS.green, margin:"0 0 14px" }}>Restablecer contraseña</h3>
            <p style={{ fontSize:13, color:COLORS.text, margin:"0 0 12px" }}>
              Nueva contraseña temporal para <strong>{resetModal.emp.full_name}</strong>:
            </p>
            {!resetSuccess ? (
              <>
                <div style={{ background:COLORS.panelAlt, borderRadius:8, padding:"10px 14px", marginBottom:14, display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, border:`1px solid ${COLORS.border}` }}>
                  <span style={{ fontSize:16, fontWeight:700, letterSpacing:"0.08em", color:COLORS.text, fontFamily:"monospace" }}>{resetModal.password}</span>
                  <button onClick={() => { navigator.clipboard.writeText(resetModal.password); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{
                    border:`1px solid ${COLORS.border}`, background:"none", borderRadius:6, padding:"4px 10px",
                    fontSize:11, fontWeight:600, cursor:"pointer", color: copied ? COLORS.greenSoft : COLORS.textMuted,
                    fontFamily:"'Manrope', sans-serif", whiteSpace:"nowrap", flexShrink:0,
                  }}>{copied ? "✓ Copiado" : "Copiar"}</button>
                </div>
                {resetError && <p style={{ fontSize:12, color:"#e07070", margin:"0 0 10px" }}>{resetError}</p>}
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={handleResetPassword} disabled={resetLoading} style={{
                    flex:2, padding:"9px 0", borderRadius:8, border:"none", cursor:resetLoading?"not-allowed":"pointer",
                    background:`linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
                    color:"#FFF", fontSize:13, fontWeight:700, fontFamily:"'Manrope', sans-serif", opacity:resetLoading?0.7:1,
                  }}>{resetLoading ? "Procesando..." : "Confirmar y restablecer"}</button>
                  <button onClick={() => setResetModal(null)} disabled={resetLoading} style={{
                    flex:1, padding:"9px 0", borderRadius:8, border:`1px solid ${COLORS.border}`,
                    background:"transparent", color:COLORS.textMuted, fontSize:13, fontWeight:600,
                    fontFamily:"'Manrope', sans-serif", cursor:"pointer",
                  }}>Cancelar</button>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontSize:13, color:COLORS.greenSoft, fontWeight:600, margin:"0 0 16px", lineHeight:1.5 }}>
                  ✓ Contraseña restablecida correctamente. Comparte la nueva contraseña con el empleado.
                </p>
                <button onClick={() => setResetModal(null)} style={{
                  width:"100%", padding:"9px 0", borderRadius:8, border:`1px solid ${COLORS.border}`,
                  background:"transparent", color:COLORS.textMuted, fontSize:13, fontWeight:600,
                  fontFamily:"'Manrope', sans-serif", cursor:"pointer",
                }}>Cerrar</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Deactivation modal */}
      {deactivateModal && (
        <div style={overlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, fontWeight:600, color:"#c0392b", margin:"0 0 14px" }}>Dar de baja</h3>
            <p style={{ fontSize:13, color:COLORS.text, margin:"0 0 8px" }}>
              ¿Estás seguro de que deseas dar de baja a <strong>{deactivateModal.full_name}</strong>?
            </p>
            <p style={{ fontSize:12, color:COLORS.textMuted, margin:"0 0 16px", lineHeight:1.5, background:"rgba(192,57,43,0.06)", borderRadius:7, padding:"10px 12px", border:"1px solid rgba(192,57,43,0.15)" }}>
              Esta acción eliminará su acceso al portal. Sus datos históricos (solicitudes, reportes) se conservarán.
            </p>
            {deactivateError && <p style={{ fontSize:12, color:"#e07070", margin:"0 0 10px" }}>{deactivateError}</p>}
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={handleDeactivate} disabled={deactivateLoading} style={{
                flex:2, padding:"9px 0", borderRadius:8, border:"none", cursor:deactivateLoading?"not-allowed":"pointer",
                background:"rgba(192,57,43,0.12)", color:"#c0392b",
                fontSize:13, fontWeight:700, fontFamily:"'Manrope', sans-serif", opacity:deactivateLoading?0.7:1,
              }}>{deactivateLoading ? "Procesando..." : "Confirmar baja"}</button>
              <button onClick={() => setDeactivateModal(null)} disabled={deactivateLoading} style={{
                flex:1, padding:"9px 0", borderRadius:8, border:`1px solid ${COLORS.border}`,
                background:"transparent", color:COLORS.textMuted, fontSize:13, fontWeight:600,
                fontFamily:"'Manrope', sans-serif", cursor:"pointer",
              }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Resumen rápido */}
      <Card>
        <div style={{ display:"flex", gap:0 }}>
          <div style={{ flex:1, textAlign:"center", padding:"12px 8px" }}>
            <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:36, fontWeight:700, color:COLORS.green, lineHeight:1 }}>{activeProfiles.length}</div>
            <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:4, fontWeight:600 }}>Colaboradores</div>
          </div>
          <div style={{ width:1, background:COLORS.border, margin:"8px 0" }}/>
          <div style={{ flex:1, textAlign:"center", padding:"12px 8px" }}>
            <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:36, fontWeight:700, color:COLORS.gold, lineHeight:1 }}>{pendingTotal}</div>
            <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:4, fontWeight:600 }}>Solicitudes de vacaciones pendientes</div>
          </div>
          <div style={{ width:1, background:COLORS.border, margin:"8px 0" }}/>
          <div style={{ flex:1, textAlign:"center", padding:"12px 8px" }}>
            <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:36, fontWeight:700, color:COLORS.greenSoft, lineHeight:1 }}>{departments.length}</div>
            <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:4, fontWeight:600 }}>Departamentos</div>
          </div>
        </div>
      </Card>

      {/* Filtros */}
      <div style={{ display:"flex", gap:10 }}>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre..."
          style={{ ...inputStyle, flex:1, fontSize:13, padding:"9px 12px" }}
          onFocus={e => e.target.style.borderColor=COLORS.gold}
          onBlur={e => e.target.style.borderColor=COLORS.border}
        />
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{
          background:COLORS.inputBg, border:`1.5px solid ${COLORS.border}`, borderRadius:8,
          padding:"9px 12px", color:COLORS.text, fontSize:13, outline:"none",
          fontFamily:"'Manrope', sans-serif", cursor:"pointer", appearance:"auto", flexShrink:0,
        }}>
          <option value="todos" style={{ color:"#1F4A40" }}>Todos los departamentos</option>
          {departmentsList.map(d => <option key={d.id} value={d.name} style={{ color:"#1F4A40" }}>{d.name}</option>)}
        </select>
      </div>

      {/* Lista de empleados */}
      {filtered.length === 0 ? (
        <Card><p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>No se encontraron colaboradores.</p></Card>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {filtered.map(emp => {
            const balance      = emp.vacation_balance ?? 0;
            const { approved, pending } = getVacStats(emp.id);
            const available    = balance;
            const entitlement  = balance + approved;
            const usedPct   = entitlement > 0 ? Math.min(100, Math.round((approved / entitlement) * 100)) : 0;
            const pendPct   = entitlement > 0 ? Math.min(100 - usedPct, Math.round((pending / entitlement) * 100)) : 0;
            const showRole  = emp.role === "admin";
            return (
              <Card key={emp.id}>
                {savedEmpId === emp.id && (
                  <div style={{ fontSize:12, color:COLORS.greenSoft, fontWeight:600, marginBottom:10 }}>✓ Cambios guardados correctamente.</div>
                )}
                <div style={{ display:"flex", alignItems:"flex-start", gap:14, flexWrap:"wrap" }}>
                  {/* Avatar iniciales */}
                  <div style={{
                    width:44, height:44, borderRadius:12, flexShrink:0,
                    background:`linear-gradient(135deg, ${COLORS.green}, ${COLORS.greenSoft})`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"'Manrope', sans-serif", fontSize:16, fontWeight:700, color:"#FFF",
                  }}>
                    {(emp.full_name ?? "?").split(/\s+/).slice(0,2).map(w => w[0]).join("").toUpperCase()}
                  </div>
                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:2 }}>
                      <span style={{ fontFamily:"'Manrope', sans-serif", fontSize:15, fontWeight:700, color:COLORS.green, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", minWidth:0, maxWidth:"100%" }}>{emp.full_name ?? "—"}</span>
                      {showRole && (
                        <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:COLORS.gold, background:"rgba(201,162,78,0.12)", borderRadius:5, padding:"2px 8px", display:"inline-block", width:"fit-content" }}>
                          {emp.role === "admin" ? "Admin" : "RRHH"}
                        </span>
                      )}
                    </div>
                    <div style={{ marginBottom:6 }}>
                      {emp.position && (
                        <div style={{ fontSize:12, color:COLORS.textMuted, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {emp.position}{emp.hire_date ? <span style={{ marginLeft:8 }}>· Ingreso: {fmtHireDateShort(emp.hire_date)}</span> : null}
                        </div>
                      )}
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                        {(Array.isArray(emp.departments) ? emp.departments : [emp.department].filter(Boolean)).map((dept, di) => (
                          <DeptTag key={di} dept={dept} />
                        ))}
                      </div>
                    </div>
                    {/* Barra de vacaciones */}
                    <div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:11, color:COLORS.textMuted, fontWeight:600 }}>Vacaciones</span>
                        <span style={{ fontSize:11, color:COLORS.textMuted }}>
                          <span style={{ color:COLORS.green, fontWeight:700 }}>{available}</span> disponibles ·{" "}
                          <span style={{ color:COLORS.gold, fontWeight:700 }}>{approved}</span> tomados{" "}
                          {pending > 0 && <><span style={{ color:COLORS.goldSoft, fontWeight:700 }}>· {pending}</span> en solicitud</>}
                          {" "}/ {entitlement}
                        </span>
                      </div>
                      <div style={{ height:6, borderRadius:4, background:COLORS.panelAlt, overflow:"hidden", display:"flex" }}>
                        <div style={{ width:`${usedPct}%`, background:COLORS.gold, transition:"width 0.3s" }}/>
                        <div style={{ width:`${pendPct}%`, background:COLORS.goldSoft, transition:"width 0.3s" }}/>
                      </div>
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6, flexShrink:0 }}>
                    <button onClick={() => setEditingEmp(emp)} title="Editar empleado" style={{
                      border:`1.5px solid ${COLORS.border}`, background:COLORS.inputBg,
                      color:COLORS.textMuted, cursor:"pointer", borderRadius:8,
                      width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center",
                      flexShrink:0, transition:"all 0.15s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor=COLORS.gold; e.currentTarget.style.color=COLORS.gold; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor=COLORS.border; e.currentTarget.style.color=COLORS.textMuted; }}
                    >
                      <Edit2 size={14}/>
                    </button>
                    <button onClick={() => openResetModal(emp)} title="Restablecer contraseña" style={{
                      border:`1.5px solid ${COLORS.primary}`, background:"transparent",
                      color:COLORS.primary, cursor:"pointer", borderRadius:8,
                      width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center",
                      flexShrink:0, transition:"all 0.15s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background="rgba(31,74,64,0.08)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background="transparent"; }}
                    >
                      <KeyRound size={14}/>
                    </button>
                    <button onClick={() => setDeactivateModal(emp)} title="Dar de baja" style={{
                      border:"1.5px solid #c0392b", background:"transparent",
                      color:"#c0392b", cursor:"pointer", borderRadius:8,
                      width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center",
                      flexShrink:0, transition:"all 0.15s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background="rgba(192,57,43,0.08)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background="transparent"; }}
                    >
                      <UserX size={14}/>
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
