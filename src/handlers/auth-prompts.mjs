import process from "node:process";
import readline from "node:readline/promises";

export const API_TOKEN_TUTORIAL = `Create an Account API Token in Cloudflare:
  1. Log in to Cloudflare.
  2. Open Manage account > Account API tokens.
  3. Click Create Token.
  4. Set a name, such as eliware/cfhub.
  5. Choose a permission policy, such as Read all resources, Write all resources, Edit Cloudflare Workers, Edit zone DNS, or Start from scratch. Grant only what you need.
  6. Set token expiration and optional client IP filtering.
  7. Click Review Token, scroll down, and click Create Token.
  8. Copy Your API Token and paste it below.
  9. Copy the Account ID from Cloudflare when cfhub asks for it.`;

/* istanbul ignore next -- interactive terminal input is covered manually. */
export async function promptHidden(input = process.stdin, output = process.stderr) {
  output.write("Cloudflare API token (input hidden): ");
  if (!input.isTTY || typeof input.setRawMode !== "function") {
    const chunks = [];
    for await (const chunk of input) chunks.push(chunk);
    output.write("\n");
    return Buffer.concat(chunks).toString("utf8").trim();
  }
  return new Promise((resolve) => {
    let value = "";
    const onData = (chunk) => {
      const text = String(chunk);
      if (text === "\u0003") {
        input.setRawMode(false);
        input.pause();
        output.write("\n");
        resolve("");
        return;
      }
      if (text === "\r" || text === "\n") {
        input.setRawMode(false);
        input.pause();
        output.write("\n");
        resolve(value);
        return;
      }
      if (text === "\u007f") value = value.slice(0, -1);
      else value += text;
    };
    input.setRawMode(true);
    input.resume();
    input.on("data", onData);
  });
}

/* istanbul ignore next -- interactive terminal input is covered manually. */
export async function promptLine(message, input = process.stdin, output = process.stderr) {
  const rl = readline.createInterface({ input, output });
  try {
    return (await rl.question(message)).trim();
  } finally {
    rl.close();
  }
}

export const defaultPromptAccountId = () => promptLine("Cloudflare account ID: ");
