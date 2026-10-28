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
  let decodedAction;
  try {
    decodedAction = decodeURIComponent(action);
  } catch {
    fail("cfhub api path contains invalid percent encoding");
    return null;
  }
  while (true) {
    if (decodedAction.split(/[\\/]/).includes("..")) {
      fail("cfhub api path cannot traverse parent directories");
      return null;
    }
    if (!/%[a-f\d]{2}/i.test(decodedAction)) break;
    try {
      decodedAction = decodeURIComponent(decodedAction);
    } catch {
      fail("cfhub api path contains invalid percent encoding");
      return null;
    }
  }
  const path = action.startsWith("/") ? action : `/${action}`;
  const method = String(opts.method || "GET").toUpperCase();
  const dryRun = opts["dry-run"] === true;
  if (!METHODS.has(method)) fail(`Unsupported API method: ${method}`);
  else if (method === "GET" && body !== null) fail("Read requests cannot include --data or --file");
  else if (method === "DELETE" && !opts.force && !dryRun)
    fail("Refusing DELETE without --force (or use --dry-run)");
  else return { method, path };
  return null;
}
