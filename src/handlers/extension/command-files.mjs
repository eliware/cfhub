import path from "node:path";

export function hasExtensionCommandFiles(source, commands, fsImpl) {
  return Object.values(commands).every((commandPath) => {
    try {
      const segments = commandPath.replaceAll("\\", "/").split("/");
      let currentPath = source;
      for (const [index, segment] of segments.entries()) {
        currentPath = path.join(currentPath, segment);
        const entry = fsImpl.lstatSync(currentPath);
        if (entry.isSymbolicLink()) return false;
        if (index === segments.length - 1 && !entry.isFile()) return false;
      }
      return true;
    } catch {
      return false;
    }
  });
}
