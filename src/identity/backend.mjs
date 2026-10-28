export async function readFromPreferredBackend(primary, fallback) {
  try {
    const value = await primary();
    if (value) return value;
  } catch {}
  return fallback();
}

export async function writeToPreferredBackend(primary, fallback) {
  try {
    if (await primary()) return true;
  } catch {}
  return fallback();
}

export async function deleteFromBackends(primary, fallback) {
  let primaryDeleted = false;
  let primaryFailed = false;
  try {
    primaryDeleted = await primary();
  } catch {
    primaryFailed = true;
  }
  const fallbackDeleted = await fallback();
  return !primaryFailed && (fallbackDeleted || primaryDeleted);
}
