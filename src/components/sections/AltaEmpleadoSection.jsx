import React, { useState } from "react";
import { createClient as _createSupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { VAC_TOTAL } from "../../constants/nav.js";
import { inputStyle, btnSubmitStyle, btnCancelStyle } from "../../styles/forms.js";
import { translateError } from "../../utils/errors.js";
import { useIsMobile } from "../../hooks/useIsMobile.js";
import { Card, CardHeader } from "../ui/Card.jsx";
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

export function EditEmployeeModal({ emp, departmentsList, onClose, onSave }) {
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
