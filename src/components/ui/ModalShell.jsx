import React from "react";
import { X } from "lucide-react";
import { COLORS } from "../../constants/colors.js";

export function ModalShell({ onClose, title, children, maxWidth = 420 }) {
  return (
    <div
      style={{ position:"fixed", top:0, right:0, bottom:0, left:0, zIndex:200, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={onClose}
    >
      <div
        style={{ background:"#FFF", borderRadius:16, padding:"28px 24px", width:"100%", maxWidth, maxHeight:"92vh", overflowY:"auto", boxShadow:"0 24px 64px rgba(0,0,0,0.25)", fontFamily:"'Manrope', sans-serif" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:24, fontWeight:600, color:COLORS.green, margin:0 }}>{title}</h2>
          <button onClick={onClose} style={{ border:"none", background:"transparent", cursor:"pointer", color:COLORS.textMuted, display:"flex", padding:4 }}><X size={20}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}
