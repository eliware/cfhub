import { rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const webpackCli = fileURLToPath(
  new URL("../node_modules/webpack-cli/bin/cli.js", import.meta.url),
);
const webpack = spawn(process.execPath, [
  webpackCli,
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
    rm(new URL("../src/oauth-web/bundled/oauth-picker.mjs", import.meta.url), { force: true }),
    rm(new URL("../src/oauth-web/bundled/oauth-result.mjs", import.meta.url), { force: true }),
    rm(new URL("../src/oauth-web/bundled/oauth-success.mjs", import.meta.url), { force: true }),
  ]);
}
