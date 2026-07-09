const MONTHS_ES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const CR_TZ = "America/Costa_Rica";

function crDateParts(input) {
  const d = input instanceof Date ? input : new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CR_TZ, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(d);
  const get = t => parts.find(p => p.type === t)?.value;
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute") };
}

export function fmtMinutes(mins) {
  if (mins === null || mins === undefined) return "—";
  const m = Math.max(0, Math.round(mins));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem} min`;
  if (rem === 0) return `${h} h`;
  return `${h} h ${rem} min`;
}

export function fmtClockTime(iso) {
  if (!iso) return "—";
  const { hour, minute } = crDateParts(new Date(iso));
  return `${hour}:${minute}`;
}

export function fmtTimestampDateCR(iso) {
  if (!iso) return "—";
  const { year, month, day } = crDateParts(new Date(iso));
  return `${Number(day)} ${MONTHS_ES[Number(month) - 1]} ${year}`;
}

export function getTodayCR() {
  const { year, month, day } = crDateParts(new Date());
  return `${year}-${month}-${day}`;
}

export function dateCR(iso) {
  if (!iso) return "";
  const { year, month, day } = crDateParts(new Date(iso));
  return `${year}-${month}-${day}`;
}

// "2026-07-09T07:15" (wall-clock hora CR) -> ISO string en UTC.
// Costa Rica usa UTC-6 fijo, sin horario de verano.
export function fromDatetimeLocalCR(value) {
  if (!value) return null;
  return new Date(`${value}:00-06:00`).toISOString();
}

// ISO string -> "2026-07-09T07:15" (wall-clock hora CR), para prellenar <input type="datetime-local">
export function toDatetimeLocalCR(iso) {
  if (!iso) return "";
  const { year, month, day, hour, minute } = crDateParts(new Date(iso));
  return `${year}-${month}-${day}T${hour}:${minute}`;
}
