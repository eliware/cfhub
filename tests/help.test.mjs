import { jest } from "@jest/globals";
import { printHelp } from "../src/help.mjs";

describe("help output", () => {
  test("prints general help", () => {
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});

    printHelp();

    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0]).toContain("Manage Cloudflare from the command line.");
    spy.mockRestore();
  });
});
