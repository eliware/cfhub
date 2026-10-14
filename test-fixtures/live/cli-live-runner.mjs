import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const cli = process.env.CFHUB_BIN || fileURLToPath(new URL("../../bin/cfhub.mjs", import.meta.url));

export async function run(args, options = {}, execCommand = execFileAsync) {
  try {
    const result = await execCommand(cli, args, {
      env: { ...process.env },
      maxBuffer: 2 * 1024 * 1024,
      ...options,
    });
    return { ...result, code: 0 };
  } catch (error) {
    return {
      stdout: error.stdout || "",
      stderr: error.stderr || "",
      code: error.code ?? 1,
    };
  }
}

export function parseJson(result) {
  return JSON.parse(result.stdout);
}
