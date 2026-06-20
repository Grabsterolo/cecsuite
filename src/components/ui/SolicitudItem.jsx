import React, { useState, useEffect } from "react";
import { FileText, Clock } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { fmtSupaDate } from "../../utils/format.js";
import { StatusBadge, SolicitudIcon } from "./StatusBadge.jsx";

export function ReportPhoto({ path, size = 44, radius = 6 }) {
  const [src, setSrc] = useState(null);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!path) return;
    supabase.storage.from("reports").createSignedUrl(path, 3600)
      .then(({ data }) => { if (data?.signedUrl) setSrc(data.signedUrl); });
  }, [path]);

  if (!path) return null;

  return (
    <>
      <div onClick={() => src && setLightbox(true)} style={{
        width: size, height: size, borderRadius: radius, flexShrink: 0,
        border: `1px solid ${COLORS.border}`, overflow: "hidden",
        background: COLORS.panelAlt, cursor: src ? "zoom-in" : "default",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {src
          ? <img src={src} alt="foto" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : <FileText size={size * 0.4} color={COLORS.border} />
        }
      </div>
      {lightbox && (
        <div onClick={() => setLightbox(false)} style={{
          position: "fixed", inset: 0, zIndex: 9000,
          background: "rgba(0,0,0,0.82)", display: "flex",
          alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <button onClick={() => setLightbox(false)} style={{
            position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.12)",
            border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer",
            color: "#FFF", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
          <img
            src={src} alt="foto"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: 10, objectFit: "contain", boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}
          />
        </div>
      )}
    </>
  );
}

export function SolicitudItem({ s, style, hideStatus = false }) {
  const dateStr = s.created_at ? fmtSupaDate(s.created_at.slice(0, 10)) : "";
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 12px", borderRadius: 8, background: "rgba(31,74,64,0.04)", border: `1px solid ${COLORS.border}`, ...style }}>
      <div style={{ marginTop: 2, flexShrink: 0 }}><SolicitudIcon kind={s.kind} type={s.type} size={16} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: COLORS.text, fontWeight: 600, fontSize: 13, wordBreak: "break-word", marginBottom: 1 }}>{s.label}</div>
        {s.subtitle && <div style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 2, lineHeight: 1.5, wordBreak: "break-word" }}>{s.subtitle}</div>}
        {s.timeRange && <div style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} color={COLORS.textMuted} />{s.timeRange}</div>}
        {s.location && <div style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 2 }}>📍 {s.location}</div>}
        {dateStr && <div style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 3 }}>{dateStr}</div>}
        {s.reviewerName && s.status !== "pendiente" && (
          <div style={{ fontSize: 11, marginTop: 3, color: s.status === "aprobado" ? COLORS.green : s.status === "atendido" ? COLORS.green : s.status === "rechazado" ? "#c0392b" : COLORS.textMuted, fontWeight: 500 }}>
            {{ aprobado: "Aprobado", rechazado: "Rechazado", atendido: "Atendido", descartado: "Descartado" }[s.status] ?? s.status} por {s.reviewerName}
          </div>
        )}
        {s.resolution_note && (s.status === "atendido" || s.status === "descartado") && (
          <div style={{ fontSize: 11, marginTop: 3, color: COLORS.textMuted, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 600 }}>Nota:</span> {s.resolution_note}
          </div>
        )}
      </div>
      {s.photo_url && <ReportPhoto path={s.photo_url} size={44} radius={6} />}
      {!hideStatus && <div style={{ flexShrink: 0, marginTop: 1 }}><StatusBadge status={s.status} /></div>}
    </div>
  );
}
