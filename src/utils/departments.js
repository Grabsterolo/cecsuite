import { DEPT_COLORS } from "../constants/colors.js";

export function getDepartmentColor(name) { return DEPT_COLORS[name] || "#C9A24E"; }

export function getDepartmentTextColor(name) {
  const hex = getDepartmentColor(name).replace("#", "");
  const r = parseInt(hex.slice(0,2),16)/255, g = parseInt(hex.slice(2,4),16)/255, b = parseInt(hex.slice(4,6),16)/255;
  const lin = ch => ch <= 0.03928 ? ch/12.92 : ((ch+0.055)/1.055)**2.4;
  const lum = 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b);
  return lum > 0.35 ? "#1F4A40" : "#FFFFFF";
}
