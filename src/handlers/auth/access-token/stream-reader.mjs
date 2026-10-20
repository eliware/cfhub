export async function readHiddenStreamInput(input, output) {
  const chunks = [];
  for await (const chunk of input) chunks.push(chunk);
  output.write("\n");
  return Buffer.concat(chunks).toString("utf8").trim();
}
