import React, { useState } from "react";
import { Trash2, DollarSign, AlertTriangle, Plus, Edit2 } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { inputStyle, btnSubmitStyle, btnCancelStyle } from "../../styles/forms.js";
import { translateError } from "../../utils/errors.js";
import { useIsMobile } from "../../hooks/useIsMobile.js";

function fmtAmt(amount, currency) {
  const n = Number(amount);
  if (currency === "USD") return "$" + new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  return "₡" + new Intl.NumberFormat("es-CR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
function toUSD(amount, currency, rate) {
  if (currency === "USD") return Number(amount);
  return rate ? Number(amount) / rate : 0;
}
function toCRC(amount, currency, rate) {
  if (currency === "CRC") return Number(amount);
  return rate ? Number(amount) * rate : 0;
}

export function ComisionesSection({ profile, userId, exchangeRate, mySales = [], allSales = [], onExchangeRateUpdated, onSaleDeleted, showToast }) {
  const isAdmin = profile?.role === "admin";
  const isMobile = useIsMobile();
  const rate = exchangeRate?.rate ?? null;

  // ── employee state ──
  const [displayCurrency, setDisplayCurrency] = useState("USD");
  const [filterMonth,     setFilterMonth]     = useState("");
  const [showSaleForm,    setShowSaleForm]    = useState(false);
  const [editingSale,     setEditingSale]     = useState(null);

  // sale form
  const [svcName,    setSvcName]    = useState("");
  const [clientName, setClientName] = useState("");
  const [amount,     setAmount]     = useState("");
  const [saleCurrency, setSaleCurrency] = useState("USD");
  const getTodayCR = () => {
    const now = new Date();
    const cr = new Date(now.toLocaleString("en-US", { timeZone: "America/Costa_Rica" }));
    return cr.toISOString().slice(0, 10);
  };
  const [saleDate,   setSaleDate]   = useState(getTodayCR());
  const [formLoading, setFormLoading] = useState(false);
  const [formError,   setFormError]   = useState(null);

  // ── admin state ──
  const [newRate,        setNewRate]        = useState("");
  const [rateLoading,    setRateLoading]    = useState(false);
  const [rateError,      setRateError]      = useState(null);
  const [rateSaved,      setRateSaved]      = useState(false);
  const [lockMonth,      setLockMonth]      = useState("");
  const [lockLoading,    setLockLoading]    = useState(false);
  const [lockError,      setLockError]      = useState(null);
  const [lockConfirm,    setLockConfirm]    = useState(false);
  const [adminFilter,    setAdminFilter]    = useState("");
  const [adminCurrency,  setAdminCurrency]  = useState("USD");

  function openNew() {
    setSvcName(""); setClientName(""); setAmount(""); setSaleCurrency("USD");
    setSaleDate(getTodayCR());
    setFormError(null); setEditingSale(null); setShowSaleForm(true);
  }
  function openEdit(sale) {
    setSvcName(sale.service_name ?? ""); setClientName(sale.client_name ?? "");
    setAmount(String(sale.amount ?? "")); setSaleCurrency(sale.currency ?? "USD");
    setSaleDate(sale.sale_date ?? ""); setFormError(null);
    setEditingSale(sale); setShowSaleForm(true);
  }
  function closeForm() { setShowSaleForm(false); setEditingSale(null); setFormError(null); }

  async function handleSaleSubmit() {
    if (!svcName.trim() || !amount || !saleDate) { setFormError("Servicio, monto y fecha son obligatorios."); return; }
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) { setFormError("El monto debe ser un número positivo."); return; }
    setFormLoading(true); setFormError(null);
    const payload = { service_name: svcName.trim(), client_name: clientName.trim() || null, amount: numAmt, currency: saleCurrency, sale_date: saleDate };
    let err;
    if (editingSale) {
      const { error } = await supabase.from("commission_sales").update(payload).eq("id", editingSale.id);
      err = error;
    } else {
      const { error } = await supabase.from("commission_sales").insert({ ...payload, user_id: userId });
      err = error;
    }
    setFormLoading(false);
    if (err) { setFormError(translateError(err.message)); return; }
    closeForm();
  }

  async function handleDelete(sale) {
    if (!window.confirm(`¿Eliminar la venta "${sale.service_name}"?`)) return;
    const { error } = await supabase.from("commission_sales").delete().eq("id", sale.id);
    if (!error) {
      onSaleDeleted?.(sale.id);
      showToast?.({ message: "Venta eliminada correctamente", Icon: Trash2 });
    }
  }

  async function handleSaveRate() {
    const r = parseFloat(newRate);
    if (isNaN(r) || r <= 0) { setRateError("Ingresa un tipo de cambio válido."); return; }
    setRateLoading(true); setRateError(null);
    const { data: existing } = await supabase.from("exchange_rate").select("id").limit(1).single();
    let err;
    if (existing) {
      const { error } = await supabase.from("exchange_rate").update({ rate: r, updated_at: new Date().toISOString(), updated_by: userId }).eq("id", existing.id);
      err = error;
    } else {
      const { error } = await supabase.from("exchange_rate").insert({ rate: r, updated_at: new Date().toISOString(), updated_by: userId });
      err = error;
    }
    setRateLoading(false);
    if (err) { setRateError(translateError(err.message)); return; }
    setRateSaved(true); setNewRate("");
    setTimeout(() => setRateSaved(false), 3000);
  }

  async function handleLockSales() {
    if (!lockMonth) { setLockError("Selecciona un mes."); return; }
    setLockLoading(true); setLockError(null);
    const start = lockMonth + "-01";
    const d = new Date(start + "T12:00:00");
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const end = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
    const { error } = await supabase.from("commission_sales").update({ locked: true }).gte("sale_date", start).lte("sale_date", end);
    setLockLoading(false);
    if (error) { setLockError(translateError(error.message)); return; }
    setLockConfirm(false); setLockMonth("");
  }

  // ── derived ──
  const filteredMySales = mySales.filter(s => !filterMonth || (s.sale_date && s.sale_date.startsWith(filterMonth)));

  function convertAmt(sale) {
    if (displayCurrency === sale.currency) return sale.amount;
    if (displayCurrency === "USD") return toUSD(sale.amount, sale.currency, rate);
    return toCRC(sale.amount, sale.currency, rate);
  }

  const totalDisplay = filteredMySales.reduce((acc, s) => acc + convertAmt(s), 0);
  const commissionDisplay = totalDisplay * 0.05;

  // ── admin derived ──
  const adminFilteredSales = allSales.filter(s => !adminFilter || (s.sale_date && s.sale_date.startsWith(adminFilter)));
  const byUser = {};
  adminFilteredSales.forEach(s => {
    const name = s.profiles?.full_name ?? s.user_id;
    if (!byUser[name]) byUser[name] = { name, total: 0, comm: 0 };
    const converted = adminCurrency === "USD"
      ? toUSD(s.amount, s.currency, rate)
      : toCRC(s.amount, s.currency, rate);
    byUser[name].total += converted;
    byUser[name].comm  += converted * 0.05;
  });
  const userRows = Object.values(byUser);
  const grandTotal = userRows.reduce((a, r) => a + r.total, 0);
  const grandComm  = userRows.reduce((a, r) => a + r.comm, 0);

  const cardStyle = { background: COLORS.panel, border: `1.5px solid ${COLORS.border}`, borderRadius: 14, padding: "18px 20px", marginBottom: 18 };
  const inp = { ...inputStyle, fontSize: 14, padding: "10px 14px" };
  const selSt = { width: "100%", background: COLORS.inputBg, border: `1.5px solid ${COLORS.border}`, borderRadius: 8, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'Manrope', sans-serif", cursor: "pointer", appearance: "auto" };

  if (isAdmin) {
    return (
      <div style={{ padding: isMobile ? "0 4px" : "0 8px", maxWidth: 860, margin: "0 auto" }}>
        {/* Exchange rate editor */}
        <div style={{ ...cardStyle, borderColor: COLORS.gold }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <DollarSign size={17} color={COLORS.gold} />
            <span style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>Tipo de cambio USD/CRC</span>
          </div>
          <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 12 }}>
            {rate ? `Actual: ₡${rate.toLocaleString("es-CR")} por USD` : "No configurado aún."}
            {exchangeRate?.updated_at && <span style={{ marginLeft: 8, fontSize: 12 }}>· Actualizado {new Date(exchangeRate.updated_at).toLocaleDateString("es-CR")}</span>}
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 5, fontWeight: 600 }}>Nuevo tipo de cambio (₡ por $1)</label>
              <input type="number" min="1" step="1" value={newRate} onChange={e => setNewRate(e.target.value)} placeholder="Ej. 530" style={inp}
                onFocus={e => e.target.style.borderColor = COLORS.gold} onBlur={e => e.target.style.borderColor = COLORS.border} />
            </div>
            <button onClick={handleSaveRate} disabled={rateLoading} style={{ ...btnSubmitStyle, height: 42, padding: "0 20px", opacity: rateLoading ? 0.7 : 1, cursor: rateLoading ? "not-allowed" : "pointer" }}>
              {rateLoading ? "Guardando..." : "Actualizar"}
            </button>
          </div>
          {rateError && <p style={{ fontSize: 12, color: "#e07070", marginTop: 8 }}>{rateError}</p>}
          {rateSaved && <p style={{ fontSize: 12, color: COLORS.green, marginTop: 8, fontWeight: 600 }}>¡Tipo de cambio actualizado!</p>}
        </div>

        {/* Summary table */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>Resumen de ventas</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {["USD", "CRC"].map(cur => (
                  <button key={cur} onClick={() => setAdminCurrency(cur)} style={{
                    padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${adminCurrency === cur ? COLORS.gold : COLORS.border}`,
                    background: adminCurrency === cur ? "rgba(201,162,78,0.12)" : COLORS.panel,
                    color: adminCurrency === cur ? COLORS.green : COLORS.textMuted,
                    fontWeight: adminCurrency === cur ? 700 : 400, fontSize: 12, cursor: "pointer",
                    fontFamily: "'Manrope', sans-serif",
                  }}>{cur}</button>
                ))}
              </div>
              <input type="month" value={adminFilter} onChange={e => setAdminFilter(e.target.value)} style={{ ...inp, width: "auto", minWidth: 160 }}
                onFocus={e => e.target.style.borderColor = COLORS.gold} onBlur={e => e.target.style.borderColor = COLORS.border} />
            </div>
          </div>
          {!rate && adminCurrency === "CRC" && <p style={{ fontSize: 12, color: "#e07070", marginBottom: 10 }}>Configura el tipo de cambio para convertir ventas en USD a CRC.</p>}
          {!rate && adminCurrency === "USD" && allSales.some(s => s.currency === "CRC") && <p style={{ fontSize: 12, color: "#e07070", marginBottom: 10 }}>Configura el tipo de cambio para convertir ventas en CRC a USD.</p>}
          {userRows.length === 0
            ? <p style={{ fontSize: 13, color: COLORS.textMuted, textAlign: "center", padding: "20px 0" }}>No hay ventas{adminFilter ? " para este período" : ""}.</p>
            : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1.5px solid ${COLORS.border}` }}>
                      <th style={{ textAlign: "left", padding: "8px 10px", color: COLORS.textMuted, fontWeight: 600 }}>Esteticista</th>
                      <th style={{ textAlign: "right", padding: "8px 10px", color: COLORS.textMuted, fontWeight: 600 }}>Total vendido</th>
                      <th style={{ textAlign: "right", padding: "8px 10px", color: COLORS.textMuted, fontWeight: 600 }}>Comisión (5%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userRows.map(r => (
                      <tr key={r.name} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                        <td style={{ padding: "8px 10px", fontWeight: 600, color: COLORS.text }}>{r.name}</td>
                        <td style={{ padding: "8px 10px", textAlign: "right", color: COLORS.text }}>{fmtAmt(r.total, adminCurrency)}</td>
                        <td style={{ padding: "8px 10px", textAlign: "right", color: COLORS.green, fontWeight: 600 }}>{fmtAmt(r.comm, adminCurrency)}</td>
                      </tr>
                    ))}
                    {userRows.length > 1 && (
                      <tr style={{ borderTop: `2px solid ${COLORS.border}` }}>
                        <td style={{ padding: "8px 10px", fontWeight: 700, color: COLORS.text }}>Total general</td>
                        <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: COLORS.text }}>{fmtAmt(grandTotal, adminCurrency)}</td>
                        <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: COLORS.gold }}>{fmtAmt(grandComm, adminCurrency)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>

        {/* Lock sales card */}
        <div style={{ ...cardStyle, borderColor: "rgba(224,112,112,0.35)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <AlertTriangle size={16} color="#e07070" />
            <span style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>Cerrar período</span>
          </div>
          <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 12 }}>Bloquea las ventas de un mes para que los empleados no puedan editarlas.</p>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 5, fontWeight: 600 }}>Mes a cerrar</label>
              <input type="month" value={lockMonth} onChange={e => setLockMonth(e.target.value)} style={inp}
                onFocus={e => e.target.style.borderColor = COLORS.gold} onBlur={e => e.target.style.borderColor = COLORS.border} />
            </div>
            <button onClick={() => { setLockError(null); setLockConfirm(true); }} style={{ ...btnSubmitStyle, background: "#c0392b", height: 42, padding: "0 20px" }}>
              Cerrar
            </button>
          </div>
          {lockError && <p style={{ fontSize: 12, color: "#e07070", marginTop: 8 }}>{lockError}</p>}
          {lockConfirm && (
            <div style={{ marginTop: 14, background: "rgba(224,112,112,0.08)", border: "1.5px solid rgba(224,112,112,0.35)", borderRadius: 10, padding: "14px 16px" }}>
              <p style={{ fontSize: 13, color: COLORS.text, marginBottom: 12, fontWeight: 600 }}>¿Confirmas cerrar el mes {lockMonth}? Esta acción no se puede deshacer.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setLockConfirm(false)} style={btnCancelStyle}>Cancelar</button>
                <button onClick={handleLockSales} disabled={lockLoading} style={{ ...btnSubmitStyle, background: "#c0392b", opacity: lockLoading ? 0.7 : 1 }}>
                  {lockLoading ? "Cerrando..." : "Confirmar cierre"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Employee view ──
  return (
    <div style={{ padding: isMobile ? "0 4px" : "0 8px", maxWidth: 700, margin: "0 auto" }}>
      {/* Header controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["USD", "CRC"].map(cur => (
            <button key={cur} onClick={() => setDisplayCurrency(cur)} style={{
              padding: "6px 16px", borderRadius: 20, border: `1.5px solid ${displayCurrency === cur ? COLORS.gold : COLORS.border}`,
              background: displayCurrency === cur ? "rgba(201,162,78,0.12)" : COLORS.panel,
              color: displayCurrency === cur ? COLORS.green : COLORS.textMuted,
              fontWeight: displayCurrency === cur ? 700 : 400, fontSize: 13, cursor: "pointer",
              fontFamily: "'Manrope', sans-serif",
            }}>{cur}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ ...inp, width: "auto", minWidth: 150 }}
            onFocus={e => e.target.style.borderColor = COLORS.gold} onBlur={e => e.target.style.borderColor = COLORS.border} />
          <button onClick={openNew} style={{ ...btnSubmitStyle, display: "flex", alignItems: "center", gap: 6, padding: "8px 16px" }}>
            <Plus size={15} /> Registrar
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div style={{ ...cardStyle, marginBottom: 0, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6, fontWeight: 600 }}>Total ventas {filterMonth || "histórico"}</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: COLORS.text, margin: 0 }}>
            {rate || displayCurrency === "USD" ? fmtAmt(totalDisplay, displayCurrency) : "—"}
          </p>
          <p style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>{filteredMySales.length} venta{filteredMySales.length !== 1 ? "s" : ""}</p>
        </div>
        <div style={{ ...cardStyle, marginBottom: 0, textAlign: "center", borderColor: COLORS.gold }}>
          <p style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6, fontWeight: 600 }}>Mi comisión (5%)</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: COLORS.gold, margin: 0 }}>
            {rate || displayCurrency === "USD" ? fmtAmt(commissionDisplay, displayCurrency) : "—"}
          </p>
          {displayCurrency === "CRC" && !rate && <p style={{ fontSize: 11, color: "#e07070", marginTop: 4 }}>Configura el tipo de cambio</p>}
        </div>
      </div>

      {/* Sale form */}
      {showSaleForm && (
        <div style={{ ...cardStyle, borderColor: COLORS.gold }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 14 }}>
            {editingSale ? "Editar venta" : "Nueva venta"}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 5, fontWeight: 600 }}>Servicio *</label>
              <input type="text" value={svcName} onChange={e => setSvcName(e.target.value)} placeholder="Ej. Facial de hidratación" style={inp}
                onFocus={e => e.target.style.borderColor = COLORS.gold} onBlur={e => e.target.style.borderColor = COLORS.border} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 5, fontWeight: 600 }}>Cliente (opcional)</label>
              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nombre del cliente" style={inp}
                onFocus={e => e.target.style.borderColor = COLORS.gold} onBlur={e => e.target.style.borderColor = COLORS.border} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 5, fontWeight: 600 }}>Monto *</label>
              <input type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" style={inp}
                onFocus={e => e.target.style.borderColor = COLORS.gold} onBlur={e => e.target.style.borderColor = COLORS.border} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 5, fontWeight: 600 }}>Moneda *</label>
              <select value={saleCurrency} onChange={e => setSaleCurrency(e.target.value)} style={selSt}>
                <option value="USD">USD (dólares)</option>
                <option value="CRC">CRC (colones)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: COLORS.textMuted, display: "block", marginBottom: 5, fontWeight: 600 }}>Fecha *</label>
              <input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} style={{ ...inp, maxWidth: "100%", minWidth: 0 }}
                onFocus={e => e.target.style.borderColor = COLORS.gold} onBlur={e => e.target.style.borderColor = COLORS.border} />
            </div>
          </div>
          {formError && <p style={{ fontSize: 12, color: "#e07070", marginBottom: 10 }}>{formError}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={closeForm} style={btnCancelStyle}>Cancelar</button>
            <button onClick={handleSaleSubmit} disabled={formLoading} style={{ ...btnSubmitStyle, opacity: formLoading ? 0.7 : 1, cursor: formLoading ? "not-allowed" : "pointer" }}>
              {formLoading ? "Guardando..." : editingSale ? "Guardar cambios" : "Registrar venta"}
            </button>
          </div>
        </div>
      )}

      {/* Sales history */}
      <div style={cardStyle}>
        <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 14 }}>Historial de ventas</p>
        {filteredMySales.length === 0
          ? <p style={{ fontSize: 13, color: COLORS.textMuted, textAlign: "center", padding: "20px 0" }}>No hay ventas{filterMonth ? " para este período" : ""}.</p>
          : filteredMySales.map(sale => {
              const displayAmt = convertAmt(sale);
              const comm = displayAmt * 0.05;
              const locked = sale.locked === true;
              return (
                <div key={sale.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, margin: "0 0 2px" }}>{sale.service_name}</p>
                    {sale.client_name && <p style={{ fontSize: 12, color: COLORS.textMuted, margin: "0 0 2px" }}>{sale.client_name}</p>}
                    <p style={{ fontSize: 12, color: COLORS.textMuted, margin: 0 }}>
                      {sale.sale_date} · {sale.currency}
                      {locked && <span style={{ marginLeft: 8, fontSize: 11, color: "#e07070", fontWeight: 600 }}>Período cerrado</span>}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, margin: "0 0 2px" }}>
                      {(rate || displayCurrency === "USD") ? fmtAmt(displayAmt, displayCurrency) : fmtAmt(sale.amount, sale.currency)}
                    </p>
                    <p style={{ fontSize: 12, color: COLORS.gold, fontWeight: 600, margin: "0 0 6px" }}>
                      Comisión: {(rate || displayCurrency === "USD") ? fmtAmt(comm, displayCurrency) : fmtAmt(sale.amount * 0.05, sale.currency)}
                    </p>
                    {!locked && (
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button onClick={() => openEdit(sale)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textMuted, padding: 4 }} title="Editar">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(sale)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e07070", padding: 4 }} title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}
