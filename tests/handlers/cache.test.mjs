import { jest } from "@jest/globals";
import { handleCache } from "../../src/handlers/cache.mjs";

const base = () => ({
  cf: {
    get: jest.fn().mockResolvedValue({ ok: true }),
    patch: jest.fn().mockResolvedValue({ ok: true }),
    post: jest.fn().mockResolvedValue({ ok: true }),
  },
  opts: { "zone-id": "z1" },
  body: { purge_everything: true },
  outputJson: true,
  printer: { log: jest.fn() },
  toJsonOutput: jest.fn(),
  fail: jest.fn(),
});

test("cache purge requires force and supports dry-run", async () => {
  const denied = base();
  await handleCache({ ...denied, action: "purge", opts: { "zone-id": "z1" } });
  expect(denied.fail).toHaveBeenCalledWith(expect.stringContaining("force"));
  const ctx = base();
  await handleCache({ ...ctx, action: "purge", opts: { "zone-id": "z1", "dry-run": true } });
  expect(ctx.cf.post).not.toHaveBeenCalled();
  const live = base();
  await handleCache({ ...live, action: "purge", opts: { "zone-id": "z1", force: true } });
  expect(live.cf.post).toHaveBeenCalledWith("/zones/z1/purge_cache", {
    body: { purge_everything: true },
  });
});

test("cache handles unknown action and text output", async () => {
  const unknown = base();
  await handleCache({ ...unknown, action: "get" });
  expect(unknown.fail).toHaveBeenCalledWith("Unknown cache action: get");
  const text = base();
  text.outputJson = false;
  await handleCache({ ...text, action: "purge", opts: { "zone-id": "z1", force: true } });
  expect(text.printer.log).toHaveBeenCalledWith(JSON.stringify({ ok: true }, null, 2));
});

test("treats false dry-run values as a live purge when force is set", async () => {
  const ctx = base();
  await handleCache({
    ...ctx,
    action: "purge",
    opts: { "zone-id": "z1", force: true, "dry-run": false },
  });
  expect(ctx.cf.post).toHaveBeenCalledWith("/zones/z1/purge_cache", {
    body: { purge_everything: true },
  });
});

test.each([null, {}, { files: [] }, { purge_everything: false }])(
  "rejects a purge body without a selector: %s",
  async (body) => {
    const ctx = base();
    await handleCache({ ...ctx, action: "purge", body, opts: { "zone-id": "z1", force: true } });
    expect(ctx.fail).toHaveBeenCalledWith("Missing cache purge selector in --data or --file");
    expect(ctx.cf.post).not.toHaveBeenCalled();
  },
);
