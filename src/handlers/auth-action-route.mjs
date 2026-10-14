export function authActionRoute(action) {
  if (action === "login") return "login";
  if (["list", "switch", "logout"].includes(action)) return "profile";
  if (["status", "verify"].includes(action)) return "status";
  return null;
}
