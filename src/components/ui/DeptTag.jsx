import React from "react";
import { getDepartmentColor, getDepartmentTextColor } from "../../utils/departments.js";

export function DeptTag({ dept }) {
  const bg = getDepartmentColor(dept), color = getDepartmentTextColor(dept);
  return (
    <span style={{ background:bg, color, borderRadius:4, fontSize:10, fontWeight:700,
      letterSpacing:"0.04em", textTransform:"uppercase", padding:"2px 7px",
      display:"inline-block", whiteSpace:"nowrap", width:"fit-content", alignSelf:"flex-start" }}>{dept}</span>
  );
}
