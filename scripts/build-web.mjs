import { rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const webpack = spawn(process.platform === "win32" ? "webpack.cmd" : "webpack", [
  "--config",
  "webpack.config.mjs",
  "--mode",
  "production",
], { cwd: root, stdio: "inherit" });

const exitCode = await new Promise((resolve) => {
  webpack.on("close", resolve);
});
if (exitCode !== 0) process.exitCode = exitCode;
else {
  await Promise.all([
    rm(new URL("../src/oauth-web/bundled/oauth-picker.js", import.meta.url), { force: true }),
    rm(new URL("../src/oauth-web/bundled/oauth-result.js", import.meta.url), { force: true }),
    rm(new URL("../src/oauth-web/bundled/oauth-success.js", import.meta.url), { force: true }),
  ]);
}
