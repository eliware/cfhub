export function resolveVerifyAccountId({ opts, data, profile, environmentAccountId }) {
  return opts?.["account-id"] || data.profiles[profile]?.accountId || environmentAccountId;
}
