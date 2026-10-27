import * as fs from "node:fs";
import os from "node:os";
import { createCloudflareClient } from "../cloudflare.mjs";
import { loadProjectEnv } from "../env.mjs";
import { checkForUpdate } from "../update/check.mjs";

export function createCliDependencies(overrides = {}) {
  return {
    argv: overrides.argv === undefined ? process.argv.slice(2) : overrides.argv,
    env: overrides.env === undefined ? process.env : overrides.env,
    cfFactory: overrides.cfFactory === undefined ? createCloudflareClient : overrides.cfFactory,
    loadEnv: overrides.loadEnv === undefined ? loadProjectEnv : overrides.loadEnv,
    printer: overrides.printer === undefined ? console : overrides.printer,
    fsImpl: overrides.fsImpl === undefined ? fs : overrides.fsImpl,
    handlers: overrides.handlers === undefined ? {} : overrides.handlers,
    projectRoot: overrides.projectRoot === undefined ? process.cwd() : overrides.projectRoot,
    homeDir: overrides.homeDir === undefined ? os.homedir() : overrides.homeDir,
    exit: overrides.exit === undefined ? (code) => process.exit(code) : overrides.exit,
    updateCheck: overrides.updateCheck === undefined ? checkForUpdate : overrides.updateCheck,
    loadCommand: overrides.loadCommand,
  };
}
