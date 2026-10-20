import { resolveAccountTokenId } from "./id.mjs";
import { createAccountTokenStatus } from "./view.mjs";

export async function showAccountTokenStatus({
  statusProfile,
  opts,
  data,
  environmentAccountId,
  cf,
  outputJson,
  toJsonOutput,
  printer,
}) {
  const accountId = resolveAccountTokenId({
    opts,
    profiles: data.profiles,
    profile: statusProfile,
    environmentAccountId,
  });
  const accounts = await cf.get(accountId ? `/accounts/${accountId}` : "/accounts");
  const status = createAccountTokenStatus({ statusProfile, accountId, accounts });
  return outputJson
    ? toJsonOutput(
        Object.fromEntries(Object.entries(status).filter(([, value]) => value !== undefined)),
      )
    : printer.log(`${status.profile} authenticated with account API token`);
}
