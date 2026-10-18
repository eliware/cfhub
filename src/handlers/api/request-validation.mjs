const METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);

export function validateApiRequest({ action, opts, body, fail }) {
  if (!action) {
    fail("cfhub api requires a path");
    return null;
  }
  if (/^[a-z][a-z\d+.-]*:/i.test(action) || action.startsWith("//")) {
    fail("cfhub api accepts only relative API paths");
    return null;
  }
  const path = action.startsWith("/") ? action : `/${action}`;
  const method = String(opts.method || "GET").toUpperCase();
  if (!METHODS.has(method)) fail(`Unsupported API method: ${method}`);
  else if (method === "GET" && body !== null) fail("Read requests cannot include --data or --file");
  else if (method === "DELETE" && !opts.force && !opts["dry-run"])
    fail("Refusing DELETE without --force (or use --dry-run)");
  else return { method, path };
  return null;
}
