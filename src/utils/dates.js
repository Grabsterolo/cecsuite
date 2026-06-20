import { MONTH_NAMES, MOTIVATIONAL_MESSAGES } from "../constants/nav.js";

export function calcWorkDays(start, end) {
  if (!start || !end) return 0;
  let n = 0; const d = new Date(start);
  while (d <= end) { if (d.getDay() !== 0 && d.getDay() !== 6) n++; d.setDate(d.getDate()+1); }
  return n;
}

export function getEffectiveDays(r) {
  if (r.days_requested) return r.days_requested;
  if (!r.start_date) return 0;
  return calcWorkDays(
    new Date(r.start_date + 'T12:00:00'),
    new Date((r.end_date || r.start_date) + 'T12:00:00')
  );
}

export function fmtDate(d) {
  return d ? `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0,3)} ${d.getFullYear()}` : "—";
}

export function isBirthdayToday(birthDate) {
  if (!birthDate) return false;
  const today = new Date();
  const bd = new Date(birthDate + "T12:00:00");
  return bd.getMonth() === today.getMonth() && bd.getDate() === today.getDate();
}

export function getDailyMessage() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return MOTIVATIONAL_MESSAGES[dayOfYear % MOTIVATIONAL_MESSAGES.length];
}
