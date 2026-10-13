export function dashboardUrl(opts) {
  const target = opts["zone-id"]
    ? `zones/${opts["zone-id"]}`
    : opts["account-id"]
      ? `accounts/${opts["account-id"]}`
      : "";
  return `https://dash.cloudflare.com/${target}`;
}
