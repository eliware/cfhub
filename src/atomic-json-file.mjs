import path from "node:path";

export function replaceJsonFile(filePath, value, fsImpl, mode = 0o600) {
  const temporary = `${filePath}.${process.pid}.tmp`;
  fsImpl.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode });
  if (typeof fsImpl.chmodSync === "function") fsImpl.chmodSync(temporary, mode);
  fsImpl.renameSync(temporary, filePath);
  if (typeof fsImpl.chmodSync === "function") fsImpl.chmodSync(filePath, mode);
}

export function ensurePrivateDirectory(directory, fsImpl) {
  fsImpl.mkdirSync(directory, { recursive: true, mode: 0o700 });
}

export function parentDirectory(filePath) {
  return path.dirname(filePath);
}
