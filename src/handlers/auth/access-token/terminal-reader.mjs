import { createHiddenInputEditor } from "./input-editor.mjs";

export function readHiddenTerminalInput(input, output) {
  return new Promise((resolve) => {
    const editor = createHiddenInputEditor();
    const finish = (result) => {
      input.setRawMode(false);
      input.pause();
      output.write("\n");
      resolve(result);
    };
    input.on("data", (chunk) => {
      const result = editor.write(chunk);
      if (result.done) finish(result.value);
    });
    input.setRawMode(true);
    input.resume();
  });
}
