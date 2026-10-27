export function resolveAuthStatusContext(context) {
  const env = context.env || process.env;
  return {
    ...context,
    token: resolveValue(context, "token", env.CLOUDFLARE_API_TOKEN),
    activeProfile: resolveValue(context, "activeProfile", env.CLOUDFLARE_PROFILE),
    environmentAccountId: resolveValue(context, "environmentAccountId", env.CLOUDFLARE_ACCOUNT_ID),
  };
}

function resolveValue(context, key, environmentValue) {
  return Object.hasOwn(context, key) ? context[key] : environmentValue;
}
