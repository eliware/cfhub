import process from "node:process";
import { readHiddenTerminalInput } from "./auth-token-terminal-reader.mjs";

export async function promptHidden(input = process.stdin, output = process.stderr) {
  output.write("Cloudflare API token (input hidden): ");
  if (!input.isTTY || typeof input.setRawMode !== "function") {
    const chunks = [];
    for await (const chunk of input) chunks.push(chunk);
    output.write("\n");
    return Buffer.concat(chunks).toString("utf8").trim();
  }
  return readHiddenTerminalInput(input, output);
}
