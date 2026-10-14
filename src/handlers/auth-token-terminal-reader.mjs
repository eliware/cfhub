export function readHiddenTerminalInput(input, output) {
  return new Promise((resolve) => {
    let value = "";
    const finish = (result) => {
      input.setRawMode(false);
      input.pause();
      output.write("\n");
      resolve(result);
    };
    input.on("data", (chunk) => {
      const text = String(chunk);
      if (text === "\u0003") return finish("");
      if (text === "\r" || text === "\n") return finish(value);
      if (text === "\u007f") value = value.slice(0, -1);
      else value += text;
    });
    input.setRawMode(true);
    input.resume();
  });
}
