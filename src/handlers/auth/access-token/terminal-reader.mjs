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
    const onData = (chunk) => {
      const result = editor.write(chunk);
      if (result.done) {
        input.removeListener("data", onData);
        finish(result.value);
      }
    };
    input.on("data", onData);
    input.setRawMode(true);
    input.resume();
  });
}
