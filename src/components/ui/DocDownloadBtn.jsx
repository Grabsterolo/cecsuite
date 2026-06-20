import React, { useState } from "react";
import { Download } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";

export function DocDownloadBtn({ fileUrl, label, iconOnly = false }) {
  const [loading, setLoading] = useState(false);
  async function open() {
    if (!fileUrl) return;
    setLoading(true);
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(fileUrl, 3600);
    setLoading(false);
    if (error || !data?.signedUrl) { alert("No se pudo abrir el documento. Intenta de nuevo."); return; }
    window.open(data.signedUrl, "_blank", "noreferrer");
  }
  if (iconOnly) return (
    <button onClick={open} disabled={loading} title={loading ? "Abriendo..." : "Descargar"} style={{ background:"none", border:"none", cursor:loading?"wait":"pointer", padding:0, lineHeight:0 }}>
      <Download size={14} color={loading ? COLORS.textMuted : COLORS.gold} />
    </button>
  );
  return (
    <button onClick={open} disabled={loading} style={{ display:"flex", alignItems:"center", gap:5, color:loading?COLORS.textMuted:COLORS.gold, fontSize:12, fontWeight:600, background:"none", border:"none", cursor:loading?"wait":"pointer", fontFamily:"'Manrope', sans-serif", padding:0, flexShrink:0, marginLeft:12 }}>
      <Download size={14} />{loading ? "Abriendo..." : (label ?? "Descargar")}
    </button>
  );
}
