import { readProfiles, writeProfiles } from "../profiles.mjs";
import { printTable } from "../output.mjs";
import {
  deleteCredential,
  readCredential,
  writeCredential,
} from "../credentials.mjs";
import { fs } from '../fs.mjs';
import process from 'node:process';

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
        input.setRawMode(false); input.pause(); output.write("\n"); resolve(""); return;
      }
      if (text === "\r" || text === "\n") {
        input.setRawMode(false); input.pause(); output.write("\n"); resolve(value); return;
      }
      if (text === "\u007f") value = value.slice(0, -1);
      else value += text;
    };
    input.setRawMode(true); input.resume(); input.on("data", onData);
  });
}
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
  oauthLogin = loginOAuth,
  writeCredentialImpl = writeCredential,
  readCredentialImpl = readCredential,
  deleteCredentialImpl = deleteCredential,
  revokeOAuthImpl = revokeOAuth,
} = /* istanbul ignore next */ {}) {
  const data = read(profileHome, profileFs);
  if (action === "list") {
    const profiles = Object.entries(data.profiles).map(([name, value]) => ({
      name,
      active: name === data.active,
      authMethod: value.authMethod || (resource === "auth" ? "api-token" : "oauth"),
    }));
    if (!profiles.length)
      profiles.push({
        name: "environment",
        active: true,
        authMethod: "not configured",
      });
    return outputJson
      ? toJsonOutput(profiles)
      : printTable(
          ["ACTIVE", "NAME", "AUTH METHOD"],
          profiles.map((profile) => [
            profile.active ? "*" : "",
            profile.name,
            profile.authMethod,
          ]),
          printer.log,
        );
  }
  if (action === "login") {
    const name = opts?.profile || "default";
    const hasEnvironmentCredentials = process.env.CLOUDFLARE_API_TOKEN;
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
        ...new Set([
          ...DEFAULT_OAUTH_SCOPES,
          ...configuredScopes,
          ...requestedScopes,
        ]),
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
    const suppliedToken = opts?.["token-stdin"]
      ? readToken()
      : hasEnvironmentCredentials
        ? process.env.CLOUDFLARE_API_TOKEN
        : (printer.error?.("Create a Cloudflare API token at https://dash.cloudflare.com/profile/api-tokens\nGrant only the permissions needed by your cfhub commands, such as Zone Read, DNS Read, DNS Write, Zone Settings Read/Write, Account Rulesets Read/Write, and Account Lists Read/Write. The token is stored securely and is not displayed.") , await promptToken());
    if (!suppliedToken?.trim()) {
      fail("No API token supplied. Run cfhub auth login again.");
      return;
    }
    const credential = {
      apiToken: suppliedToken.trim(),
    };
    const storedInKeychain = await writeCredentialImpl(name, credential);
    /* istanbul ignore next -- storage adapters are covered separately. */
    if (!storedInKeychain) {
      fail("Could not save the API token to the OS keychain or private credential file");
      return;
    }
    data.profiles[name] = {
      authMethod: "api-token",
      accountId: opts?.["account-id"] || process.env.CLOUDFLARE_ACCOUNT_ID,
      zoneId: opts?.["zone-id"] || process.env.CLOUDFLARE_ZONE_ID,
    };
    data.active = name;
    write(data, profileHome, profileFs);
    return printer.log(`Saved and activated profile ${name}`);
  }
  if (action === "switch") {
    const name = opts?.profile;
    if (!name || !data.profiles[name]) {
      fail(`Unknown profile: ${name || "(missing --profile)"}`);
      return;
    }
    data.active = name;
    write(data, profileHome, profileFs);
    return printer.log(`Activated profile ${name}`);
  }
  if (action === "logout") {
    const name = opts?.profile || data.active;
    if (!name || !data.profiles[name]) {
      fail(`Unknown profile: ${name || "(none)"}`);
      return;
    }
    const credential = await readCredentialImpl(name);
    try {
      if (credential?.oauthRefreshToken)
        await revokeOAuthImpl({ token: credential.oauthRefreshToken });
      else if (credential?.oauthAccessToken)
        await revokeOAuthImpl({ token: credential.oauthAccessToken });
    } catch {
      // Local cleanup must still happen when the remote token is expired.
    }
    try { await deleteCredentialImpl(name); } catch { /* local cleanup is best effort */ }
    delete data.profiles[name];
    if (data.active === name) data.active = Object.keys(data.profiles)[0] || null;
    write(data, profileHome, profileFs);
    return printer.log(`Removed profile ${name}`);
  }
  if (action === "status") {
    if (!process.env.CLOUDFLARE_API_TOKEN) {
      fail("You are not logged into Cloudflare. Run: cfhub auth login");
      return;
    }
    const identity = await cf.get("/user");
    const statusProfile = process.env.CLOUDFLARE_PROFILE || data.active || "environment";
    const status = {
      authenticated: true,
      profile: statusProfile,
      /* istanbul ignore next -- both resources share this handler in production. */
      method: resource === "oauth"
        ? "oauth"
        : data.profiles[statusProfile]?.authMethod || "api-token",
      id: identity?.result?.id || null,
      email: identity?.result?.email || null,
    };
    return outputJson
      ? toJsonOutput(status)
      : printer.log(
          `${status.profile} authenticated${status.email ? ` as ${status.email}` : ""}`,
        );
  }
  if (action === "verify") {
    if (!process.env.CLOUDFLARE_API_TOKEN) {
      fail("cfhub auth verify requires CLOUDFLARE_API_TOKEN");
      return;
    }
    const result = await cf.get("/user/tokens/verify");
    const verified = {
      verified: result?.result?.status === "active",
      status: result?.result?.status || "unknown",
    };
    return outputJson
      ? toJsonOutput(verified)
      : printer.log(`${verified.status}`);
  }
  fail(`Unknown auth action: ${action}`);
}
