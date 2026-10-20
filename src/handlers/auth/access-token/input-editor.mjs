import { StringDecoder } from "node:string_decoder";

export function createHiddenInputEditor() {
  let value = "";
  const decoder = new StringDecoder("utf8");
  return {
    write(chunk) {
      const text = decoder.write(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      for (const character of text) {
        if (character === "\u0003") return { done: true, value: "" };
        if (character === "\r" || character === "\n") return { done: true, value };
        if (character === "\u007f") value = value.slice(0, -1);
        else value += character;
      }
      return { done: false };
    },
  };
}
