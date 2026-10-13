import * as fs from "node:fs";

export function loadBody(opts, fsImpl = fs) {
  if (opts.data) return JSON.parse(opts.data);
  if (opts.file) return JSON.parse(fsImpl.readFileSync(opts.file, "utf8"));
  return null;
}
