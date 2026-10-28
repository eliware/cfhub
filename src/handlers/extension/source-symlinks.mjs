import path from "node:path";

export function hasNoExtensionSymlinks(source, fsImpl) {
  if (typeof fsImpl.lstatSync !== "function" || typeof fsImpl.readdirSync !== "function")
    return true;
  const inspect = (entryPath) => {
    try {
      const entry = fsImpl.lstatSync(entryPath);
      if (entry.isSymbolicLink()) return false;
      if (!entry.isDirectory()) return true;
      return fsImpl.readdirSync(entryPath).every((name) => inspect(path.join(entryPath, name)));
    } catch {
      return false;
    }
  };
  return inspect(source);
}
