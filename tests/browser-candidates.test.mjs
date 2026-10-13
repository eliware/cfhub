import { browserCandidates } from "../src/browser-candidates.mjs";

test("builds platform and PATH browser candidates", () => {
  const windows = browserCandidates(
    { PROGRAMFILES: "C:\\Program Files", PATH: "C:\\Tools" },
    "win32",
  );
  expect(windows.standard[0]).toBe("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe");
  expect(windows.path).toEqual(["C:\\Tools\\chrome.exe", "C:\\Tools\\msedge.exe"]);

  const linux = browserCandidates({ PATH: "/bin:/usr/local/bin" }, "linux");
  expect(linux.standard).toContain("/usr/bin/chromium");
  expect(linux.path[0]).toBe("/bin/google-chrome");
  expect(linux.path).toContain("/usr/local/bin/microsoft-edge");
});
