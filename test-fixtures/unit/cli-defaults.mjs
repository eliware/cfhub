import { jest } from "@jest/globals";
import { run } from "../../src/cli.mjs";

export async function fixtureCase1() {
  const oldArgv = process.argv;
  const log = jest.spyOn(console, "log").mockImplementation(() => {});
  process.argv = [oldArgv[0], oldArgv[1], "--version"];
  try {
    await run();
  } finally {
    process.argv = oldArgv;
    log.mockRestore();
  }

  const exit = jest.spyOn(process, "exit").mockImplementation(() => {});
  await run({
    argv: ["unknown-resource", "list"],
    printer: { log: jest.fn(), error: jest.fn() },
    fsImpl: { existsSync: () => false },
    cfFactory: jest.fn(() => ({})),
  });
  expect(exit).toHaveBeenCalledWith(1);
  exit.mockRestore();

  const printer = { log: jest.fn(), error: jest.fn() };
  await run({
    argv: ["zones", "list", "--web", "--zone-id", "zone"],
    env: { CLOUDFLARE_API_TOKEN: "token", CFHUB_OAUTH_SCOPES: "zone.read" },
    loadEnv: jest.fn(),
    cfFactory: jest.fn(() => ({})),
    printer,
    fsImpl: { existsSync: () => false },
    homeDir: "home",
    updateCheck: jest.fn().mockResolvedValue(null),
  });
  expect(printer.log).toHaveBeenCalledWith("https://dash.cloudflare.com/zones/zone");
}
