export function resolveAuthStatusContext(context) {
  return {
    ...context,
    token: resolveValue(context, "token", process.env.CLOUDFLARE_API_TOKEN),
    activeProfile: resolveValue(context, "activeProfile", process.env.CLOUDFLARE_PROFILE),
    environmentAccountId: resolveValue(
      context,
      "environmentAccountId",
      process.env.CLOUDFLARE_ACCOUNT_ID,
    ),
  };
}

function resolveValue(context, key, environmentValue) {
  return Object.hasOwn(context, key) ? context[key] : environmentValue;
}
