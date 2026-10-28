import { StringDecoder } from "node:string_decoder";

const maxTokenBytes = 4096;

export function createHiddenInputEditor() {
  let value = "";
  let byteLength = 0;
  const decoder = new StringDecoder("utf8");
  return {
    write(chunk) {
      const text = decoder.write(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      for (const character of text) {
        if (character === "\u0003") return { done: true, interrupted: true };
        if (character === "\r" || character === "\n") return { done: true, value };
        if (character === "\u007f" || character === "\u0008") {
          const lastCharacter = [...value].at(-1);
          if (lastCharacter) byteLength -= Buffer.byteLength(lastCharacter);
          value = [...value].slice(0, -1).join("");
        } else {
          byteLength += Buffer.byteLength(character);
          if (byteLength > maxTokenBytes)
            return {
              done: true,
              error: new Error(`API token input exceeds ${maxTokenBytes} bytes`),
            };
          value += character;
        }
      }
      return { done: false };
    },
  };
}
