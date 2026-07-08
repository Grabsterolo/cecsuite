import { MONTH_NAMES } from "../constants/nav.js";

export function fmtFull(str, fallback = "—") {
  if (!str) return fallback;
  const d = new Date(str);
  const months = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}

export function fmtSupaDate(str) {
  if (!str) return "—";
  const d = new Date(str + "T12:00:00");
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0,3)} ${d.getFullYear()}`;
}

export function fmtTimestampShort(str) {
  if (!str) return "—";
  const d = new Date(str);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0,3)} ${d.getFullYear()}`;
}

export function fmtSupaShort(str) {
  if (!str) return "—";
  const d = new Date(str + "T12:00:00");
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0,3).toLowerCase()}`;
}

export function fmtDate(d) {
  return d ? `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0,3)} ${d.getFullYear()}` : "—";
}

export function getFirstNames(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).join(" ");
}
