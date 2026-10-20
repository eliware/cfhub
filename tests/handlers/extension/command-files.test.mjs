import path from "node:path";
import { hasExtensionCommandFiles } from "../../../src/handlers/extension/command-files.mjs";

const entry = ({ symbolicLink = false, file = false } = {}) => ({
  isSymbolicLink: () => symbolicLink,
  isFile: () => file,
});

test("checks each path segment and requires the command target to be a file", () => {
  const paths = [];
  const fsImpl = {
    lstatSync: (value) => {
      paths.push(value);
      return entry({ file: value.endsWith("index.mjs") });
    },
  };
  expect(hasExtensionCommandFiles("/source", { command: "commands\\index.mjs" }, fsImpl)).toBe(
    true,
  );
  expect(paths).toEqual([
    path.join("/source", "commands"),
    path.join("/source", "commands", "index.mjs"),
  ]);
});

test.each(["intermediate", "target"])("rejects a symbolic link at the %s path", (part) => {
  let index = 0;
  const fsImpl = {
    lstatSync: () => {
      index += 1;
      return entry({ symbolicLink: part === "intermediate" || index === 2 });
    },
  };
  expect(hasExtensionCommandFiles("/source", { command: "commands/index.mjs" }, fsImpl)).toBe(
    false,
  );
});

test("rejects missing paths and non-file command targets", () => {
  expect(
    hasExtensionCommandFiles(
      "/source",
      { command: "index.mjs" },
      {
        lstatSync: () => {
          throw Error();
        },
      },
    ),
  ).toBe(false);
  expect(
    hasExtensionCommandFiles("/source", { command: "folder" }, { lstatSync: () => entry() }),
  ).toBe(false);
});

test("accepts manifests without command files", () => {
  expect(hasExtensionCommandFiles("/source", {}, {})).toBe(true);
});
