export function getAccountId(opts, env = process.env) {
  return opts["account-id"] || env.CLOUDFLARE_ACCOUNT_ID;
}

export function getZoneId(opts, env = process.env) {
  return opts["zone-id"] || env.CLOUDFLARE_ZONE_ID;
}

export function getId(opts) {
  return opts.id;
}
