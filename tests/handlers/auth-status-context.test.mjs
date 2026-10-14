import { resolveAuthStatusContext } from "../../src/handlers/auth-status-context.mjs";

test("uses environment values when context keys are absent", () => {
  const values = {
    CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
    CLOUDFLARE_PROFILE: process.env.CLOUDFLARE_PROFILE,
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
  };
  process.env.CLOUDFLARE_API_TOKEN = "environment-token";
  process.env.CLOUDFLARE_PROFILE = "environment-profile";
  process.env.CLOUDFLARE_ACCOUNT_ID = "environment-account";
  try {
    expect(resolveAuthStatusContext({ action: "status" })).toMatchObject({
      token: "environment-token",
      activeProfile: "environment-profile",
      environmentAccountId: "environment-account",
    });
  } finally {
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("keeps explicit context values, including undefined", () => {
  expect(
    resolveAuthStatusContext({
      token: undefined,
      activeProfile: null,
      environmentAccountId: "caller-account",
    }),
  ).toMatchObject({
    token: undefined,
    activeProfile: null,
    environmentAccountId: "caller-account",
  });
});
