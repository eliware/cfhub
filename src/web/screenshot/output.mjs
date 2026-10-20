import { dirname, resolve } from "node:path";

export async function prepareScreenshotOutput(output, makeDirectory) {
  const target = resolve(output);
  await makeDirectory(dirname(target), { recursive: true });
  return target;
}
