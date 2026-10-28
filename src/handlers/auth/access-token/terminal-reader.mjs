import { createHiddenInputEditor } from "./input-editor.mjs";
export function readHiddenTerminalInput(input, output, interrupt) {
  return new Promise((resolve, reject) => {
    const editor = createHiddenInputEditor();
    const finish = () => {
      input.setRawMode(false);
      input.pause();
      output.write("\n");
    };
    const onData = (chunk) => {
      const result = editor.write(chunk);
      if (result.done) {
        input.removeListener("data", onData);
        finish();
        if (result.error) reject(result.error);
        else if (result.interrupted) {
          interrupt();
          const error = new Error("Token input interrupted");
          error.code = "SIGINT";
          reject(error);
        } else resolve(result.value);
      }
    };
    input.on("data", onData);
    input.setRawMode(true);
    input.resume();
  });
}
