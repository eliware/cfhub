import { jest } from "@jest/globals";

const defaultCloudflare = jest.fn().mockImplementation((options) => ({ options }));
jest.unstable_mockModule("cloudflare", () => ({ Cloudflare: defaultCloudflare }));
const { createCloudflareClient } = await import("../src/cloudflare.mjs");

test("createCloudflareClient supports API-token dependency injection", () => {
  const ctor = jest.fn().mockImplementation((cfg) => ({ cfg }));
  const client = createCloudflareClient({
    CloudflareClass: ctor,
    env: { CLOUDFLARE_API_TOKEN: "token" },
  });
  expect(ctor).toHaveBeenCalledWith({ apiToken: "token" });
  expect(client.cfg.apiToken).toBe("token");
});

test("createCloudflareClient uses the default class when a token exists", () => {
  const client = createCloudflareClient({ env: { CLOUDFLARE_API_TOKEN: " token " } });
  expect(defaultCloudflare).toHaveBeenCalledWith({ apiToken: " token " });
  expect(client.options.apiToken).toBe(" token ");
});

test("createCloudflareClient throws without credentials", () => {
  expect(() => createCloudflareClient({ env: {} })).toThrow(
    "You are not logged into Cloudflare. Run: cfhub auth login",
  );
});

test("createCloudflareClient handles omitted options safely", () => {
  expect(() => createCloudflareClient()).toThrow(
    "You are not logged into Cloudflare. Run: cfhub auth login",
  );
});
