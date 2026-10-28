import path from "node:path";

export function hasNoExtensionSymlinks(source, fsImpl) {
  if (typeof fsImpl.lstatSync !== "function") return false;
  const inspect = (entryPath) => {
    try {
      const entry = fsImpl.lstatSync(entryPath);
      if (entry.isSymbolicLink()) return false;
      if (!entry.isDirectory()) return true;
      if (typeof fsImpl.readdirSync !== "function") return false;
      return fsImpl.readdirSync(entryPath).every((name) => inspect(path.join(entryPath, name)));
    } catch {
      return false;
    }
  };
  return inspect(source);
}
