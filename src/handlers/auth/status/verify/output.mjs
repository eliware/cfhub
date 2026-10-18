export function outputTokenVerification(verified, { outputJson, toJsonOutput, printer }) {
  return outputJson ? toJsonOutput(verified) : printer.log(`${verified.status}`);
}
