import { showAuthStatus } from "./status/profile.mjs";
import { verifyAuthStatus } from "./status/verify.mjs";
import { resolveAuthStatusContext } from "./status/context.mjs";

export function handleAuthStatus(context) {
  const statusContext = resolveAuthStatusContext(context);
  if (context.action === "status") return showAuthStatus(statusContext);
  if (context.action === "verify") return verifyAuthStatus(statusContext);
}
