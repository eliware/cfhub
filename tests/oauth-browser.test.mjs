import { jest } from "@jest/globals";
import { openBrowser } from "../src/oauth-browser.mjs";

test("browser launcher selects the native command for each platform", () => {
  for (const platform of ["darwin", "win32", "linux"]) {
    const unref = jest.fn();
    const spawnImpl = jest.fn(() => ({ unref }));
    openBrowser("https://example.test", { platform, spawnImpl });
    expect(spawnImpl).toHaveBeenCalledWith(
      platform === "darwin" ? "open" : platform === "win32" ? "start" : "xdg-open",
      ["https://example.test"],
      expect.objectContaining({ shell: platform === "win32" }),
    );
    expect(unref).toHaveBeenCalled();
  }
  const unref = jest.fn();
  openBrowser("https://example.test", {
    spawnImpl: jest.fn(() => ({ unref })),
  });
  expect(unref).toHaveBeenCalled();
  const defaultUnref = jest.fn();
  openBrowser(
    "about:blank",
    undefined,
    jest.fn(() => ({ unref: defaultUnref })),
  );
  expect(defaultUnref).toHaveBeenCalled();
});
