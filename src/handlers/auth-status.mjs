import { showAuthStatus } from "./auth-status-profile.mjs";
import { verifyAuthStatus } from "./auth-status-verify.mjs";

export function handleAuthStatus(context) {
  if (context.action === "status") return showAuthStatus(context);
  if (context.action === "verify") return verifyAuthStatus(context);
}
