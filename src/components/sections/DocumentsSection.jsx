import React, { useState } from "react";
import { FileText } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { COLORS } from "../../constants/colors.js";
import { Card } from "../ui/Card.jsx";
import { DocDownloadBtn } from "../ui/DocDownloadBtn.jsx";

export function DocumentsSection({ documents: allDocs, myConfirmations = {}, userId, onConfirmRead }) {
  const documents = allDocs.filter(d => !d.archived);
  const [confirming, setConfirming] = useState({});

  async function handleConfirm(doc) {
    if (confirming[doc.id]) return;
    setConfirming(prev => ({ ...prev, [doc.id]: true }));
    const confirmedAt = new Date().toISOString();
    const { error } = await supabase.from("document_confirmations").insert({ document_id: doc.id, user_id: userId, confirmed_at: confirmedAt });
    setConfirming(prev => ({ ...prev, [doc.id]: false }));
    if (!error) onConfirmRead?.(doc.id, confirmedAt);
  }

  function fmtConfirmedAt(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  if (documents.length === 0) {
    return <Card><p style={{ color:COLORS.textMuted, fontSize:14, margin:0 }}>No hay documentos disponibles.</p></Card>;
  }
  return (
    <Card>
      <div style={{ display:"flex", flexDirection:"column" }}>
        {documents.map((doc, i) => (
          <div key={doc.id ?? i} style={{ padding:"10px 0", borderBottom:`1px solid ${COLORS.border}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ display:"flex", alignItems:"center", gap:8, minWidth:0, flex:1 }}>
                <FileText size={14} color={COLORS.textMuted} style={{ flexShrink:0 }} />
                <span style={{ minWidth:0 }}>
                  <span style={{ fontSize:13, color:COLORS.text, fontWeight:500, wordBreak:"break-word" }}>{doc.title}</span>
                  {doc.category && (
                    <span style={{ marginLeft:8, fontSize:10, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:COLORS.gold, background:"rgba(201,162,78,0.1)", borderRadius:4, padding:"1px 6px" }}>{doc.category}</span>
                  )}
                </span>
              </span>
              {doc.file_url && <DocDownloadBtn fileUrl={doc.file_url} />}
            </div>
            {doc.requires_confirmation && (
              myConfirmations[doc.id]
                ? <p style={{ margin:"6px 0 0 22px", fontSize:11, color:COLORS.greenSoft, fontWeight:600 }}>✓ Leído el {fmtConfirmedAt(myConfirmations[doc.id])}</p>
                : <button onClick={() => handleConfirm(doc)} disabled={!!confirming[doc.id]} style={{ marginTop:6, marginLeft:22, background:COLORS.green, color:"#FFF", border:"none", borderRadius:6, padding:"4px 12px", fontSize:11, fontWeight:700, cursor:confirming[doc.id]?"not-allowed":"pointer", fontFamily:"'Manrope', sans-serif", opacity:confirming[doc.id]?0.65:1 }}>
                    {confirming[doc.id] ? "Guardando..." : "Confirmar lectura"}
                  </button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
