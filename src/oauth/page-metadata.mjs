export function copyrightYear(year = new Date().getUTCFullYear()) {
  return year > 2026 ? `2026-${year}` : "2026";
}
