const maxTokenBytes = 4096;

export async function readHiddenStreamInput(input, output) {
  const chunks = [];
  let length = 0;
  try {
    for await (const chunk of input) {
      const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      const newline = bytes.indexOf(10);
      const line = newline < 0 ? bytes : bytes.subarray(0, newline);
      length += line.length;
      if (length > maxTokenBytes) throw new Error(`API token input exceeds ${maxTokenBytes} bytes`);
      chunks.push(line);
      if (newline >= 0) break;
    }
    return Buffer.concat(chunks).toString("utf8").trim();
  } finally {
    output?.write("\n");
  }
}
