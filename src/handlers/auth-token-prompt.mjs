import process from "node:process";

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
