import path from "node:path";

export function extensionDestination(root, name) {
  if (
    typeof name !== "string" ||
    !name ||
    [".", ".."].includes(name) ||
    /[\\/:*?"<>|]/.test(name) ||
    name.includes("\0")
  )
    return null;
  const base = path.resolve(root);
  return path.join(base, name);
}
