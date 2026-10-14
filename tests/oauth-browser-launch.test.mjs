import { jest } from "@jest/globals";
import { launchOAuthBrowser } from "../src/oauth-browser-launch.mjs";

test("reports browser launch failures", () => {
  const print = jest.fn();
  const browser = { once: jest.fn((_event, handler) => handler({ code: "ENOENT" })) };
  launchOAuthBrowser({ open: jest.fn(() => browser), browserUrl: "https://example.test", print });
  expect(print).toHaveBeenCalledWith(
    "Could not open a browser automatically (ENOENT). Copy the URL above into a browser.",
  );
});

test("contains synchronous browser launch errors", () => {
  const print = jest.fn();
  launchOAuthBrowser({
    open: () => {
      throw Error("blocked");
    },
    browserUrl: "https://example.test",
    print,
  });
  expect(print).toHaveBeenCalledWith(
    "Could not open a browser automatically (blocked). Copy the URL above into a browser.",
  );
});
