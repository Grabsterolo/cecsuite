export function buildAudienceFilter(column, userDepartments) {
  const depts = userDepartments || [];
  const escaped = depts.map(d => `"${d}"`).join(",");
  if (escaped) return `${column}.cs.{todos},${column}.ov.{${escaped}}`;
  return `${column}.cs.{todos}`;
}
