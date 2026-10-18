import { StringDecoder } from "node:string_decoder";

export function readHiddenTerminalInput(input, output) {
  return new Promise((resolve) => {
    let value = "";
    const decoder = new StringDecoder("utf8");
    const finish = (result) => {
      input.setRawMode(false);
      input.pause();
      output.write("\n");
      resolve(result);
    };
    input.on("data", (chunk) => {
      const text = decoder.write(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      for (const character of text) {
        if (character === "\u0003") return finish("");
        if (character === "\r" || character === "\n") return finish(value);
        if (character === "\u007f") value = value.slice(0, -1);
        else value += character;
      }
    });
    input.setRawMode(true);
    input.resume();
  });
}
