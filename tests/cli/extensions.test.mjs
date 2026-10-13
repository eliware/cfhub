import { jest } from "@jest/globals";

test("CLI loads an installed extension without Cloudflare credentials", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 15}`);
  const fs = await import("node:fs");
  const os = await import("node:os");
  const path = await import("node:path");
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "cf-cli-ext-"));
  const root = path.join(home, ".config/cfhub/extensions/hello");
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(
    path.join(root, "cf-extension.json"),
    JSON.stringify({
      name: "hello",
      version: "1.0.0",
      commands: { hello: "hello.mjs" },
    }),
  );
  fs.writeFileSync(
    path.join(root, "hello.mjs"),
    "export default ({ printer, opts }) => printer.log(`Hello ${opts.name}`)",
  );
  const printer = { log: jest.fn(), error: jest.fn() };
  await mod.run({
    argv: ["hello", "--name", "Eli"],
    printer,
    fsImpl: fs,
    homeDir: home,
  });
  expect(printer.log).toHaveBeenCalledWith("Hello Eli");
});

test("CLI reports an installed extension with no runnable handler", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 16}`);
  const fs = await import("node:fs");
  const os = await import("node:os");
  const path = await import("node:path");
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "cf-cli-empty-ext-"));
  const root = path.join(home, ".config/cfhub/extensions/empty");
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(
    path.join(root, "cf-extension.json"),
    JSON.stringify({
      name: "empty",
      version: "1.0.0",
      commands: { empty: "empty.mjs" },
    }),
  );
  fs.writeFileSync(path.join(root, "empty.mjs"), "export const value = 1");
  const printer = { log: jest.fn(), error: jest.fn() };
  await mod.run({ argv: ["empty", "run"], printer, fsImpl: fs, homeDir: home });
  expect(printer.error).toHaveBeenCalledWith("Extension command is not loadable: empty");
});

test("CLI passes output and failure helpers to extensions", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 17}`);
  const fs = await import("node:fs");
  const os = await import("node:os");
  const path = await import("node:path");
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "cf-cli-helper-ext-"));
  const root = path.join(home, ".config/cfhub/extensions/helper");
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(
    path.join(root, "cf-extension.json"),
    JSON.stringify({
      name: "helper",
      version: "1.0.0",
      commands: { helper: "helper.mjs" },
    }),
  );
  fs.writeFileSync(
    path.join(root, "helper.mjs"),
    'export default ({ toJsonOutput, fail, opts }) => opts.fail ? fail("extension failure") : toJsonOutput({ ok: true })',
  );
  const printer = { log: jest.fn(), error: jest.fn() };
  await mod.run({
    argv: ["helper", "--output", "json"],
    printer,
    fsImpl: fs,
    homeDir: home,
  });
  await mod.run({
    argv: ["helper", "--fail"],
    printer,
    fsImpl: fs,
    homeDir: home,
  });
  expect(printer.log).toHaveBeenCalledWith('{\n  "ok": true\n}');
  expect(printer.error).toHaveBeenCalledWith("extension failure");
});

test("CLI manages extensions without Cloudflare credentials", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 18}`);
  const fs = await import("node:fs");
  const os = await import("node:os");
  const path = await import("node:path");
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "cf-cli-extension-command-"));
  const printer = { log: jest.fn(), error: jest.fn() };
  await mod.run({
    argv: ["extension", "list"],
    printer,
    fsImpl: fs,
    homeDir: home,
  });
  expect(printer.log).toHaveBeenCalledWith(expect.stringContaining("NAME"));
});

test("CLI routes the extension resource through its built-in handler", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 19}`);
  const fs = await import("node:fs");
  const os = await import("node:os");
  const path = await import("node:path");
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "cf-cli-extension-dispatch-"));
  const printer = { log: jest.fn(), error: jest.fn() };
  await mod.run({
    argv: ["extension", "list", "--json"],
    printer,
    fsImpl: fs,
    homeDir: home,
  });
  await mod.run({
    argv: ["extension", "install"],
    printer,
    fsImpl: fs,
    homeDir: home,
  });
  expect(printer.log).toHaveBeenCalledWith("[]");
  expect(printer.error).toHaveBeenCalledWith("Missing --path to an extension directory");
});
