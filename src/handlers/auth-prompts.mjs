import process from "node:process";
import readline from "node:readline/promises";

export async function promptLine(message, input = process.stdin, output = process.stderr) {
  const rl = readline.createInterface({ input, output });
  try {
    return (await rl.question(message)).trim();
  } finally {
    rl.close();
  }
}

export const defaultPromptAccountId = () => promptLine("Cloudflare account ID: ");
