import { showAuthStatus } from "./auth-status-profile.mjs";
import { verifyAuthStatus } from "./auth-status-verify.mjs";

export function handleAuthStatus(context) {
  const statusContext = {
    ...context,
    token: hasContextValue(context, "token", process.env.CLOUDFLARE_API_TOKEN),
    activeProfile: hasContextValue(context, "activeProfile", process.env.CLOUDFLARE_PROFILE),
    environmentAccountId: hasContextValue(
      context,
      "environmentAccountId",
      process.env.CLOUDFLARE_ACCOUNT_ID,
    ),
  };
  if (context.action === "status") return showAuthStatus(statusContext);
  if (context.action === "verify") return verifyAuthStatus(statusContext);
}

function hasContextValue(context, key, environmentValue) {
  return Object.hasOwn(context, key) ? context[key] : environmentValue;
}
