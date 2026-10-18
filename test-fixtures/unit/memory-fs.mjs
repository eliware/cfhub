import path from "node:path";

export function createMemoryFs(initialFiles = {}) {
  const files = new Map(
    Object.entries(initialFiles).map(([name, value]) => [normalize(name), value]),
  );
  const directories = new Set();
  let temporaryIndex = 0;
  const ensureParents = (filePath) => {
    let parent = path.dirname(normalize(filePath));
    while (parent !== "." && parent !== path.dirname(parent)) {
      directories.add(parent);
      parent = path.dirname(parent);
    }
  };
  for (const filePath of files.keys()) ensureParents(filePath);

  return {
    files,
    directories,
    chmodCalls: [],
    existsSync(filePath) {
      const key = normalize(filePath);
      return files.has(key) || directories.has(key);
    },
    readFileSync(filePath) {
      const key = normalize(filePath);
      if (!files.has(key))
        throw Object.assign(new Error(`Missing file: ${key}`), { code: "ENOENT" });
      return files.get(key);
    },
    writeFileSync(filePath, value) {
      const key = normalize(filePath);
      ensureParents(key);
      files.set(key, String(value));
    },
    mkdirSync(directory) {
      directories.add(normalize(directory));
      ensureParents(directory);
    },
    chmodSync(...args) {
      this.chmodCalls.push(args);
    },
    renameSync(from, to) {
      const source = normalize(from);
      const target = normalize(to);
      const sourceIsDirectory = directories.has(source);
      if (!files.has(source) && !sourceIsDirectory)
        throw Object.assign(new Error(`Missing file: ${source}`), { code: "ENOENT" });
      if (files.has(source)) {
        ensureParents(target);
        files.set(target, files.get(source));
        files.delete(source);
      }
      for (const [name, value] of files) {
        if (name.startsWith(`${source}${path.sep}`)) {
          const targetName = `${target}${name.slice(source.length)}`;
          ensureParents(targetName);
          files.set(targetName, value);
          files.delete(name);
        }
      }
      if (sourceIsDirectory) {
        directories.delete(source);
        directories.add(target);
        for (const directory of directories) {
          if (directory.startsWith(`${source}${path.sep}`)) {
            const targetName = `${target}${directory.slice(source.length)}`;
            directories.add(targetName);
            directories.delete(directory);
          }
        }
      }
    },
    readdirSync(directory, options = {}) {
      const root = normalize(directory);
      const children = new Map();
      const prefix = `${root}${path.sep}`;
      for (const candidate of files.keys()) addChild(candidate);
      for (const candidate of directories) addChild(candidate);
      function addChild(candidate) {
        if (!candidate.startsWith(prefix)) return;
        const remainder = candidate.slice(prefix.length);
        const [name, ...rest] = remainder.split(path.sep);
        if (!name) return;
        const isDirectory = rest.length > 0 || directories.has(candidate);
        children.set(name, isDirectory);
      }
      const names = [...children].map(([name, isDirectory]) =>
        options.withFileTypes
          ? { name, isDirectory: () => isDirectory, isFile: () => !isDirectory }
          : name,
      );
      return names;
    },
    statSync(filePath) {
      const key = normalize(filePath);
      const exists = files.has(key) || directories.has(key);
      if (!exists) throw Object.assign(new Error(`Missing path: ${key}`), { code: "ENOENT" });
      return { isFile: () => files.has(key), isDirectory: () => directories.has(key) };
    },
    lstatSync(filePath) {
      return { ...this.statSync(filePath), isSymbolicLink: () => false };
    },
    cpSync(source, destination) {
      const sourceKey = normalize(source);
      const destinationKey = normalize(destination);
      for (const [name, value] of files) {
        if (name === sourceKey || name.startsWith(`${sourceKey}${path.sep}`)) {
          const target = `${destinationKey}${name.slice(sourceKey.length)}`;
          ensureParents(target);
          files.set(target, value);
        }
      }
      directories.add(destinationKey);
      ensureParents(destinationKey);
    },
    rmSync(target) {
      const key = normalize(target);
      files.delete(key);
      directories.delete(key);
      for (const name of files.keys()) if (name.startsWith(`${key}${path.sep}`)) files.delete(name);
      for (const name of directories)
        if (name.startsWith(`${key}${path.sep}`)) directories.delete(name);
    },
    mkdtempSync(prefix) {
      const directory = `${normalize(prefix)}${++temporaryIndex}`;
      directories.add(directory);
      ensureParents(directory);
      return directory;
    },
  };
}

function normalize(value) {
  return path.normalize(String(value));
}
