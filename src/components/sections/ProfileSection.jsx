import React, { useState } from "react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { btnSubmitStyle } from "../../styles/forms.js";
import { translateError } from "../../utils/errors.js";
import { getFirstNames } from "../../utils/format.js";
import { Card, CardHeader } from "../ui/Card.jsx";
import { DeptTag } from "../ui/DeptTag.jsx";
import { PasswordInput } from "../ui/PasswordInput.jsx";

export function ProfileSection({ profile, onAliasUpdated }) {
  const [currentPwd,   setCurrentPwd]   = useState("");
  const [newPwd,       setNewPwd]       = useState("");
  const [confirmPwd,   setConfirmPwd]   = useState("");
  const [pwdLoading,   setPwdLoading]   = useState(false);
  const [pwdError,     setPwdError]     = useState(null);
  const [pwdSuccess,   setPwdSuccess]   = useState(false);
  const [alias,        setAlias]        = useState(profile?.alias ?? "");
  const [aliasLoading, setAliasLoading] = useState(false);
  const [aliasSaved,   setAliasSaved]   = useState(false);
  const [aliasError,   setAliasError]   = useState(null);

  async function handleSaveAlias() {
    setAliasError(null);
    setAliasSaved(false);
    setAliasLoading(true);
    const trimmed = alias.trim();
    const { error } = await supabase.from("profiles").update({ alias: trimmed || null }).eq("id", profile.id);
    setAliasLoading(false);
    if (error) { setAliasError(translateError(error.message)); return; }
    onAliasUpdated?.(trimmed || null);
    setAliasSaved(true);
    setTimeout(() => setAliasSaved(false), 3000);
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(false);
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdError("Por favor completa todos los campos.");
      return;
    }
    if (newPwd.length < 8) {
      setPwdError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError("Las contraseñas no coinciden.");
      return;
    }
    setPwdLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setPwdLoading(false);
    if (error) {
      setPwdError(translateError(error.message));
    } else {
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setPwdSuccess(true);
    }
  }

  if (!profile) {
    return (
      <Card>
        <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0 }}>Cargando perfil...</p>
      </Card>
    );
  }

  function fmtHireDate(str) {
    if (!str) return "—";
    const [y, m, d] = str.split("-").map(Number);
    const months = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    return `${d} de ${months[m - 1]} de ${y}`;
  }

  const showRole = profile.role === "admin";
  const row = (label, value) => value ? (
    <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0", borderBottom:`1px solid ${COLORS.border}` }}>
      <span style={{ fontSize:13, color:COLORS.textMuted, fontWeight:600 }}>{label}</span>
      <span style={{ fontSize:13, color:COLORS.text }}>{value}</span>
    </div>
  ) : null;

  const inputStyle = {
    width:"100%", padding:"9px 12px", borderRadius:8,
    border:`1px solid ${COLORS.border}`, background:COLORS.inputBg,
    color:COLORS.text, fontSize:13, fontFamily:"'Manrope', sans-serif",
    outline:"none", boxSizing:"border-box",
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <Card>
        <CardHeader title="Mi perfil" />
        {row("Nombre completo", profile.full_name)}
        {row("Puesto", profile.position)}
        {((Array.isArray(profile.departments) && profile.departments.length > 0) || profile.department) && (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, padding:"11px 0", borderBottom:`1px solid ${COLORS.border}`, flexWrap:"wrap" }}>
            <span style={{ fontSize:13, color:COLORS.textMuted, fontWeight:600 }}>
              {Array.isArray(profile.departments) && profile.departments.length > 1 ? "Departamentos" : "Departamento"}
            </span>
            <div style={{ display:"flex", flexWrap:"wrap", gap:4, justifyContent:"flex-end" }}>
              {Array.isArray(profile.departments) && profile.departments.length > 0
                ? profile.departments.map(d => <DeptTag key={d} dept={d} />)
                : <DeptTag dept={profile.department} />
              }
            </div>
          </div>
        )}
        {row("Fecha de ingreso", fmtHireDate(profile.hire_date))}
        {showRole && (
          <div style={{ marginTop:14 }}>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:COLORS.gold, background:"rgba(201,162,78,0.12)", borderRadius:6, padding:"4px 10px", display:"inline-block", width:"fit-content" }}>
              {profile.role === "admin" ? "Administrador" : "RRHH"}
            </span>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="¿Cómo quieres que te llamemos?" />
        <p style={{ fontSize:12, color:COLORS.textMuted, margin:"0 0 12px", lineHeight:1.6 }}>
          Si prefieres un apodo o nombre corto, escríbelo aquí. Se usará en tu saludo del portal.
        </p>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <input
            type="text"
            value={alias}
            onChange={e => { if (e.target.value.length <= 30) setAlias(e.target.value); }}
            placeholder={getFirstNames(profile.full_name) || "Tu apodo o nombre corto"}
            maxLength={30}
            style={{ ...inputStyle, flex:1 }}
            onFocus={e => e.target.style.borderColor=COLORS.gold}
            onBlur={e => e.target.style.borderColor=COLORS.border}
          />
          <button
            onClick={handleSaveAlias}
            disabled={aliasLoading}
            style={{ ...btnSubmitStyle, padding:"9px 18px", fontSize:13, whiteSpace:"nowrap", opacity:aliasLoading?0.7:1, cursor:aliasLoading?"not-allowed":"pointer" }}
          >
            {aliasLoading ? "Guardando..." : "Guardar"}
          </button>
        </div>
        {aliasSaved && <p style={{ fontSize:12, color:COLORS.greenSoft, fontWeight:600, margin:"8px 0 0" }}>✓ ¡Listo! Tu nombre preferido fue actualizado.</p>}
        {aliasError && <p style={{ fontSize:12, color:"#e07070", margin:"8px 0 0" }}>{aliasError}</p>}
      </Card>

      <Card>
        <CardHeader title="Cambiar contraseña" />
        <p style={{ fontSize:12, color:COLORS.textMuted, fontFamily:"'Manrope', sans-serif", marginTop:0, marginBottom:16, lineHeight:1.6 }}>
          Por seguridad, te recomendamos usar una contraseña de al menos 8 caracteres que combine letras, números y símbolos.
        </p>
        <form onSubmit={handleChangePassword} style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:COLORS.textMuted, fontFamily:"'Manrope', sans-serif", marginBottom:5 }}>Contraseña actual</label>
            <PasswordInput
              value={currentPwd}
              onChange={e => setCurrentPwd(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:COLORS.textMuted, fontFamily:"'Manrope', sans-serif", marginBottom:5 }}>Nueva contraseña</label>
            <PasswordInput
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:COLORS.textMuted, fontFamily:"'Manrope', sans-serif", marginBottom:5 }}>Confirmar nueva contraseña</label>
            <PasswordInput
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>
          {pwdError && (
            <p style={{ margin:0, fontSize:12, color:"#c0392b", fontFamily:"'Manrope', sans-serif" }}>{pwdError}</p>
          )}
          {pwdSuccess && (
            <p style={{ margin:0, fontSize:12, color:"#27ae60", fontWeight:600, fontFamily:"'Manrope', sans-serif" }}>Contraseña actualizada correctamente.</p>
          )}
          <div style={{ display:"flex", justifyContent:"flex-end", marginTop:4 }}>
            <button
              type="submit"
              disabled={pwdLoading}
              style={{
                background: pwdLoading ? COLORS.border : `linear-gradient(135deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
                border:"none", borderRadius:8, padding:"9px 20px",
                color:"#FFF", fontSize:13, fontWeight:700, cursor: pwdLoading ? "not-allowed" : "pointer",
                fontFamily:"'Manrope', sans-serif", boxShadow: pwdLoading ? "none" : "0 4px 14px rgba(201,162,78,0.3)",
                transition:"all 0.15s",
              }}
            >
              {pwdLoading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
