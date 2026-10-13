import { posix, win32 } from "node:path";

const windowsCandidates = [
  ["PROGRAMFILES", "Google", "Chrome", "Application", "chrome.exe"],
  ["PROGRAMFILES(X86)", "Google", "Chrome", "Application", "chrome.exe"],
  ["LOCALAPPDATA", "Google", "Chrome", "Application", "chrome.exe"],
  ["PROGRAMFILES", "Microsoft", "Edge", "Application", "msedge.exe"],
  ["PROGRAMFILES(X86)", "Microsoft", "Edge", "Application", "msedge.exe"],
  ["LOCALAPPDATA", "Microsoft", "Edge", "Application", "msedge.exe"],
];

const unixCandidates = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/microsoft-edge",
  "/usr/bin/microsoft-edge-stable",
];

export function browserCandidates(env, platform) {
  const standard =
    platform === "win32"
      ? windowsCandidates
          .map(([variable, ...parts]) => env[variable] && win32.join(env[variable], ...parts))
          .filter(Boolean)
      : unixCandidates;
  const delimiter = platform === "win32" ? ";" : ":";
  const pathEntries = (env.PATH ?? "").split(delimiter).filter(Boolean);
  const names =
    platform === "win32"
      ? ["chrome.exe", "msedge.exe"]
      : ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "microsoft-edge"];
  const path = pathEntries.flatMap((directory) =>
    names.map((name) =>
      platform === "win32" ? win32.join(directory, name) : posix.join(directory, name),
    ),
  );
  return { standard, path };
}
