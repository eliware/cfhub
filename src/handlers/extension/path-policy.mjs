import path from "node:path";

export function extensionPathsOverlap(source, destination, fsImpl) {
  const sourcePath = resolveExtensionPath(source, fsImpl);
  const destinationPath = resolveExtensionPath(destination, fsImpl);
  return isWithin(sourcePath, destinationPath) || isWithin(destinationPath, sourcePath);
}

function resolveExtensionPath(value, fsImpl) {
  const absolute = path.resolve(value);
  if (typeof fsImpl?.realpathSync !== "function") return absolute;
  try {
    return fsImpl.realpathSync(absolute);
  } catch {
    return absolute;
  }
}

function isWithin(parent, child) {
  const relative = path.relative(parent, child);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))
  );
}
