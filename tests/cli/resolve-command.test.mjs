import { jest } from "@jest/globals";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { resolveCommand } from "../../src/cli/resolve-command.mjs";

const setup = () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "cf-resolve-"));
  const printer = { log: jest.fn(), error: jest.fn() };
  const exit = jest.fn((code) => code);
  return { homeDir, printer, exit, fsImpl: fs };
};

test("resolver returns the selected command", async () => {
  const ctx = setup();
  await expect(
    resolveCommand({ ...ctx, args: ["zones", "list"], opts: {} }),
  ).resolves.toMatchObject({
    done: false,
    resource: "zones",
    action: "list",
  });
});

test("resolver suggests unknown resource names", async () => {
  const ctx = setup();
  const result = await resolveCommand({ ...ctx, args: ["zone"], opts: {} });
  expect(result).toMatchObject({ done: true, value: 1 });
  expect(ctx.printer.error).toHaveBeenCalledWith(
    expect.stringContaining("Did you mean this?\n\tzones"),
  );
  expect(ctx.exit).toHaveBeenCalledWith(1);
});

test("resolver returns help for resources and commands", async () => {
  const ctx = setup();
  expect((await resolveCommand({ ...ctx, args: ["zones"], opts: { help: true } })).done).toBe(true);
  expect(
    (await resolveCommand({ ...ctx, args: ["zones", "list"], opts: { help: true } })).done,
  ).toBe(true);
  expect((await resolveCommand({ ...ctx, args: ["zones"], opts: {} })).done).toBe(true);
});

test("resolver reports invalid actions and skips action checks for api", async () => {
  const ctx = setup();
  const invalid = await resolveCommand({ ...ctx, args: ["zones", "lis"], opts: {} });
  expect(invalid).toMatchObject({ done: true, value: 1 });
  expect(ctx.printer.error).toHaveBeenCalledWith(
    expect.stringContaining("Did you mean this?\n\tlist"),
  );
  await expect(
    resolveCommand({ ...ctx, args: ["api", "anything"], opts: {} }),
  ).resolves.toMatchObject({
    done: false,
    resource: "api",
    action: "anything",
  });
  await expect(resolveCommand({ ...ctx, args: ["zzzzzzzz"], opts: {} })).resolves.toMatchObject({
    done: true,
  });
  expect(await resolveCommand({ ...ctx, args: ["zones", "zzzzzzzz"], opts: {} })).toMatchObject({
    done: true,
    value: 1,
  });
});

test("resolver runs installed extension commands", async () => {
  const ctx = setup();
  const root = path.join(ctx.homeDir, ".config", "cfhub", "extensions", "sample");
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(
    path.join(root, "cf-extension.json"),
    JSON.stringify({
      name: "sample",
      version: "1",
      commands: { sample: "run.mjs" },
    }),
  );
  fs.writeFileSync(path.join(root, "run.mjs"), "export default (ctx) => ctx");
  const value = await resolveCommand({
    ...ctx,
    args: ["sample", "run"],
    opts: { json: true },
    loadBody: () => "body",
  });
  expect(value).toMatchObject({ done: true, value: { action: "run", body: "body" } });
});
