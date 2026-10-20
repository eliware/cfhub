export function resolveAccountTokenId({ opts, profiles, profile, environmentAccountId }) {
  return opts?.["account-id"] || profiles[profile]?.accountId || environmentAccountId;
}
