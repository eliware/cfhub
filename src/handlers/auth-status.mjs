import { showAuthStatus } from "./auth-status-profile.mjs";
import { verifyAuthStatus } from "./auth-status-verify.mjs";
import { resolveAuthStatusContext } from "./auth-status-context.mjs";

export function handleAuthStatus(context) {
  const statusContext = resolveAuthStatusContext(context);
  if (context.action === "status") return showAuthStatus(statusContext);
  if (context.action === "verify") return verifyAuthStatus(statusContext);
}
