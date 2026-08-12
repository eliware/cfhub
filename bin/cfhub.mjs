#!/usr/bin/env node
process.noDeprecation = true;
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { run } from '../src/cli.mjs';

export { run } from '../src/cli.mjs';

const invokedPath = process.argv[1] ? realpathSync(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const onError = (err) => {
    console.error(err?.message || err);
    process.exitCode = 1;
  };
  process.on('uncaughtException', onError);
  process.on('unhandledRejection', onError);
  const onSignal = () => {
    process.removeListener('uncaughtException', onError);
    process.removeListener('unhandledRejection', onError);
    process.exitCode = 0;
  };
  process.once('SIGINT', onSignal);
  process.once('SIGTERM', onSignal);

  run().catch(err => {
    onError(err);
  });
}
