import { API_TOKEN_TUTORIAL } from "./auth-prompts.mjs";

export async function readLoginToken({ opts, readToken, promptToken, printer }) {
  const interactive = !opts?.["token-stdin"];
  const suppliedToken = opts?.["token-stdin"]
    ? readToken()
    : (printer.error?.(
        `${API_TOKEN_TUTORIAL}\n\nThe token is stored securely and is not displayed.`,
      ),
      await promptToken());
  return { interactive, suppliedToken };
}

export async function resolveTokenAccount({ opts, interactive, token, promptAccountId }) {
  const detectedAccountToken = token.startsWith("cfat_");
  const accountId =
    opts?.["account-id"] ||
    process.env.CLOUDFLARE_ACCOUNT_ID ||
    (interactive && detectedAccountToken ? await promptAccountId() : undefined);
  return { accountId, detectedAccountToken };
}
