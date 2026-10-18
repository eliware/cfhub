import { jest } from "@jest/globals";
import { resolveCommand } from "../../../src/cli/resolve/command.mjs";
import { createMemoryFs } from "../../../test-fixtures/unit/memory-fs.mjs";

const setup = () => {
  const homeDir = "/tmp/cfhub-home/resolve";
  const printer = { log: jest.fn(), error: jest.fn() };
  const exit = jest.fn((code) => code);
  return { homeDir, printer, exit, fsImpl: createMemoryFs() };
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
  ctx.fsImpl.writeFileSync(
    `${ctx.homeDir}/.config/cfhub/extensions/sample/cf-extension.json`,
    JSON.stringify({
      name: "sample",
      version: "1",
      commands: { sample: "run.mjs" },
    }),
  );
  ctx.fsImpl.writeFileSync(`${ctx.homeDir}/.config/cfhub/extensions/sample/run.mjs`, "source");
  const value = await resolveCommand({
    ...ctx,
    args: ["sample", "run"],
    opts: { json: true },
    loadBody: () => "body",
    loadCommand: jest.fn(async () => (context) => context),
  });
  expect(value).toMatchObject({ done: true, value: { action: "run", body: "body" } });
});
