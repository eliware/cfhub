import path from "node:path";

export function ensurePrivateDirectory(directory, fsImpl) {
  fsImpl.mkdirSync(directory, { recursive: true, mode: 0o700 });
}

export function parentDirectory(filePath) {
  return path.dirname(filePath);
}
