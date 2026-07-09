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
  return `${h} h ${rem} min`;
}

export function fmtClockTime(iso) {
  if (!iso) return "—";
  const { hour, minute } = crDateParts(new Date(iso));
  return `${hour}:${minute}`;
}

// Minutos de atraso al marcar entrada, comparado contra la hora de entrada
// esperada de ese empleado (profiles.expected_shift_start, "HH:MM:SS") más
// la tolerancia global (minutos). Ambos lados se comparan en hora de Costa
// Rica. Si el empleado no tiene hora esperada configurada, no hay atraso.
export function computeLateMinutes(clockInISO, expectedShiftStart, toleranceMinutes = 0) {
  if (!clockInISO || !expectedShiftStart) return 0;
  const { hour, minute } = crDateParts(new Date(clockInISO));
  const clockInMin = Number(hour) * 60 + Number(minute);
  const [eh, em] = expectedShiftStart.split(":").map(Number);
  const expectedMin = eh * 60 + (em || 0);
  const diff = clockInMin - (expectedMin + (toleranceMinutes || 0));
  return diff > 0 ? diff : 0;
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

// ── semana (lunes a domingo), para el resumen de horas extra semanales ──

// "YYYY-MM-DD" (cualquier día) -> "YYYY-MM-DD" del lunes de esa semana
export function mondayOfWeek(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const dow = d.getUTCDay(); // 0=domingo..6=sábado
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function addDaysToDateStr(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function getThisWeekStartCR() {
  return mondayOfWeek(getTodayCR());
}

// "YYYY-MM-DD" del lunes -> "9 – 15 jul 2026"
export function fmtWeekRangeCR(mondayStr) {
  const sundayStr = addDaysToDateStr(mondayStr, 6);
  const [my, mm, md] = mondayStr.split("-").map(Number);
  const [, sm, sd] = sundayStr.split("-").map(Number);
  const left = `${md} ${MONTHS_ES[mm - 1]}`;
  const right = `${sd} ${MONTHS_ES[sm - 1]} ${my}`;
  return `${left} – ${right}`;
}

// Suma worked_minutes de los registros cuya fecha (hora CR) cae dentro de la
// semana [mondayStr, mondayStr+6]. Los registros sin worked_minutes (ej. aún
// abiertos) no suman.
export function sumWorkedMinutesInWeek(records, mondayStr) {
  const sundayStr = addDaysToDateStr(mondayStr, 6);
  return records.reduce((acc, r) => {
    if (!r.worked_minutes) return acc;
    const d = dateCR(r.clock_in);
    if (d >= mondayStr && d <= sundayStr) return acc + r.worked_minutes;
    return acc;
  }, 0);
}
