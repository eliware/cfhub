import { jest } from "@jest/globals";

const parseArgs = jest.fn();
const loadBody = jest.fn();
const resolveCommand = jest.fn();
const createCommandContext = jest.fn();
const runExtensionCommand = jest.fn();
const handleLocalCommand = jest.fn();
const authorizeCommand = jest.fn();
const createOutputContext = jest.fn();
const createCliDependencies = jest.fn();
const dispatchCommand = jest.fn();

jest.unstable_mockModule("../src/args.mjs", () => ({ parseArgs }));
jest.unstable_mockModule("../src/cli/body-loader.mjs", () => ({ loadBody }));
jest.unstable_mockModule("../src/cli/resolve/command.mjs", () => ({ resolveCommand }));
jest.unstable_mockModule("../src/cli/command/context.mjs", () => ({ createCommandContext }));
jest.unstable_mockModule("../src/cli/extension-command.mjs", () => ({ runExtensionCommand }));
jest.unstable_mockModule("../src/cli/local-commands.mjs", () => ({ handleLocalCommand }));
jest.unstable_mockModule("../src/cli/authorization.mjs", () => ({ authorizeCommand }));
jest.unstable_mockModule("../src/cli/output-context.mjs", () => ({ createOutputContext }));
jest.unstable_mockModule("../src/cli/dependencies.mjs", () => ({ createCliDependencies }));
jest.unstable_mockModule("../src/cli/dispatch.mjs", () => ({ dispatchCommand }));

const { run } = await import("../src/cli.mjs");

function configure({ argv = ["zones", "list"], local = false, resolution, authorization, output }) {
  const printer = { log: jest.fn(), error: jest.fn() };
  const dependencies = {
    argv,
    env: {},
    cfFactory: jest.fn(),
    loadEnv: jest.fn(),
    printer,
    fsImpl: { readFileSync: jest.fn(), existsSync: jest.fn() },
    handlers: {},
    projectRoot: "/project",
    homeDir: "/home",
    exit: jest.fn(),
    updateCheck: jest.fn(),
  };
  createCliDependencies.mockReturnValue(dependencies);
  parseArgs.mockReturnValue({ args: argv, opts: {} });
  handleLocalCommand.mockReturnValue({ handled: local, result: "local" });
  resolveCommand.mockResolvedValue(
    resolution || { done: false, args: argv, opts: {}, resource: "zones", action: "list" },
  );
  authorizeCommand.mockResolvedValue(authorization || { allowed: true, cf: {} });
  createOutputContext.mockReturnValue(
    output || { handled: false, outputJson: false, terminal: {}, commandPrinter: printer },
  );
  createCommandContext.mockReturnValue({});
  dispatchCommand.mockResolvedValue("dispatched");
  return dependencies;
}

test("routes coordinator results with mocked services", async () => {
  configure({ argv: ["--version"], local: true });
  await expect(run()).resolves.toBe("local");

  configure({ resolution: { done: true, value: "help" } });
  await expect(run({})).resolves.toBe("help");

  configure({
    argv: ["extension", "list"],
    resolution: { done: false, resource: "extension", action: "list", opts: {} },
  });
  runExtensionCommand.mockResolvedValue("extension");
  await expect(run({})).resolves.toBe("extension");

  configure({ authorization: { allowed: false, result: "denied" } });
  await expect(run({})).resolves.toBe("denied");

  configure({ output: { handled: true } });
  await expect(run({})).resolves.toBeUndefined();

  configure({});
  await expect(run({})).resolves.toBe("dispatched");
  expect(loadBody).toHaveBeenCalled();
  expect(createCommandContext).toHaveBeenCalled();
  expect(dispatchCommand).toHaveBeenCalled();
});
