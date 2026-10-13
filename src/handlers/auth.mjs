import { handleAuthProfile } from "./auth-profile.mjs";
import { handleAuthStatus } from "./auth-status.mjs";
import { readProfiles, writeProfiles } from "../profiles.mjs";
import { deleteCredential, readCredential, writeCredential } from "../credentials.mjs";
import { fs } from "../fs.mjs";
import process from "node:process";
import readline from "node:readline/promises";
import { inspectApiToken } from "../token-permissions.mjs";

const API_TOKEN_TUTORIAL = `Create an Account API Token in Cloudflare:
  1. Log in to Cloudflare.
  2. Open Manage account > Account API tokens.
  3. Click Create Token.
  4. Set a name, such as eliware/cfhub.
  5. Choose a permission policy, such as Read all resources, Write all resources, Edit Cloudflare Workers, Edit zone DNS, or Start from scratch. Grant only what you need.
  6. Set token expiration and optional client IP filtering.
  7. Click Review Token, scroll down, and click Create Token.
  8. Copy Your API Token and paste it below.
  9. Copy the Account ID from Cloudflare when cfhub asks for it.`;

/* istanbul ignore next -- interactive terminal input is covered manually. */
async function promptHidden(input = process.stdin, output = process.stderr) {
  output.write("Cloudflare API token (input hidden): ");
  if (!input.isTTY || typeof input.setRawMode !== "function") {
    const chunks = [];
    for await (const chunk of input) chunks.push(chunk);
    output.write("\n");
    return Buffer.concat(chunks).toString("utf8").trim();
  }
  return new Promise((resolve) => {
    let value = "";
    const onData = (chunk) => {
      const text = String(chunk);
      if (text === "\u0003") {
        input.setRawMode(false);
        input.pause();
        output.write("\n");
        resolve("");
        return;
      }
      if (text === "\r" || text === "\n") {
        input.setRawMode(false);
        input.pause();
        output.write("\n");
        resolve(value);
        return;
      }
      if (text === "\u007f") value = value.slice(0, -1);
      else value += text;
    };
    input.setRawMode(true);
    input.resume();
    input.on("data", onData);
  });
}

/* istanbul ignore next -- interactive terminal input is covered manually. */
async function promptLine(message, input = process.stdin, output = process.stderr) {
  const rl = readline.createInterface({ input, output });
  try {
    return (await rl.question(message)).trim();
  } finally {
    rl.close();
  }
}
/* istanbul ignore next -- interactive terminal input is covered manually. */
const defaultPromptAccountId = () => promptLine("Cloudflare account ID: ");
import {
  DEFAULT_OAUTH_CLIENT_ID,
  DEFAULT_OAUTH_SCOPES,
  loginOAuth,
  revokeOAuth,
} from "../oauth.mjs";

export async function handleAuth({
  resource = "oauth",
  cf,
  action,
  opts,
  outputJson,
  printer = console,
  toJsonOutput,
  fail = () => {},
  profileHome,
  profileFs,
  read = readProfiles,
  write = writeProfiles,
  readToken = () => fs.readFileSync(0, "utf8").trim(),
  promptToken = promptHidden,
  promptAccountId = defaultPromptAccountId,
  oauthLogin = loginOAuth,
  writeCredentialImpl = writeCredential,
  readCredentialImpl = readCredential,
  deleteCredentialImpl = deleteCredential,
  revokeOAuthImpl = revokeOAuth,
  inspectApiTokenImpl = inspectApiToken,
} = /* istanbul ignore next */ {}) {
  const data = read(profileHome, profileFs);
  if (action === "login") {
    const name = opts?.profile || "default";
    if (resource === "oauth") {
      const configuredScopes = (process.env.CFHUB_OAUTH_SCOPES || "")
        .split(",")
        .map((scope) => scope.trim())
        .filter(Boolean);
      const requestedScopes = []
        .concat(opts?.scopes || [], opts?.scope || [])
        .flatMap((value) => String(value).split(","))
        .map((scope) => scope.trim())
        .filter(Boolean);
      const scopes = [
        ...new Set([...DEFAULT_OAUTH_SCOPES, ...configuredScopes, ...requestedScopes]),
      ];
      const oauth = await oauthLogin({
        clientId: process.env.CFHUB_OAUTH_CLIENT_ID || DEFAULT_OAUTH_CLIENT_ID,
        scopes,
        scopePicker: !opts?.["no-scope-picker"],
        bindHost: process.env.CFHUB_OAUTH_BIND_HOST || "0.0.0.0",
        redirectHost: process.env.CFHUB_OAUTH_REDIRECT_HOST || "127.0.0.1",
      });
      await writeCredentialImpl(name, {
        oauthAccessToken: oauth.accessToken,
        oauthRefreshToken: oauth.refreshToken,
        expiresIn: oauth.expiresIn,
        expiresAt: oauth.expiresAt,
      });
      data.profiles[name] = {
        authMethod: "oauth",
        scopes: oauth.scopes || scopes,
        accountId: opts?.["account-id"] || process.env.CLOUDFLARE_ACCOUNT_ID,
        zoneId: opts?.["zone-id"] || process.env.CLOUDFLARE_ZONE_ID,
      };
      data.active = name;
      write(data, profileHome, profileFs);
      return printer.log(`Saved and activated profile ${name}`);
    }
    /* istanbul ignore next -- interactive and environment branches are terminal-dependent. */
    const interactive = !opts?.["token-stdin"];
    const suppliedToken = opts?.["token-stdin"]
      ? readToken()
      : (printer.error?.(
          `${API_TOKEN_TUTORIAL}\n\nThe token is stored securely and is not displayed.`,
        ),
        await promptToken());
    if (!suppliedToken?.trim()) {
      fail("No API token supplied. Run cfhub auth login again.");
      return;
    }
    const credential = {
      apiToken: suppliedToken.trim(),
    };
    const detectedAccountToken = credential.apiToken.startsWith("cfat_");
    /* istanbul ignore next -- account context may come from a prompt, flag, or environment. */
    const accountId =
      opts?.["account-id"] ||
      process.env.CLOUDFLARE_ACCOUNT_ID ||
      (interactive && detectedAccountToken ? await promptAccountId() : undefined);
    let tokenInfo;
    try {
      tokenInfo = await inspectApiTokenImpl({ token: credential.apiToken, accountId });
    } catch (error) {
      fail(`Could not verify API token: ${error.message}`);
      return;
    }
    const storedInKeychain = await writeCredentialImpl(name, credential);
    /* istanbul ignore next -- storage adapters are covered separately. */
    if (!storedInKeychain) {
      fail("Could not save the API token to the OS keychain or private credential file");
      return;
    }
    data.profiles[name] = {
      authMethod: detectedAccountToken ? "account-api-token" : "api-token",
      accountId,
      zoneId: opts?.["zone-id"] || process.env.CLOUDFLARE_ZONE_ID,
      apiPermissions: tokenInfo.permissions,
      apiPermissionsKnown: tokenInfo.permissionsKnown,
      apiPermissionSummary: tokenInfo.permissionSummary,
    };
    data.active = name;
    write(data, profileHome, profileFs);
    const summary = tokenInfo.permissionSummary;
    const discovered = tokenInfo.permissionsKnown
      ? `\nPermissions discovered: ${summary.total} (Read: ${summary.read}, Write/Edit: ${summary.write}, Other: ${summary.other})`
      : "";
    return printer.log(`Saved and activated profile ${name}${discovered}`);
  }
  if (["list", "switch", "logout"].includes(action))
    return handleAuthProfile({
      action,
      resource,
      opts,
      data,
      outputJson,
      toJsonOutput,
      printer,
      fail,
      write,
      profileHome,
      profileFs,
      readCredentialImpl,
      revokeOAuthImpl,
      deleteCredentialImpl,
    });
  if (action === "status" || action === "verify")
    return handleAuthStatus({
      action,
      resource,
      opts,
      cf,
      data,
      outputJson,
      toJsonOutput,
      printer,
      fail,
    });
  fail(`Unknown auth action: ${action}`);
}
