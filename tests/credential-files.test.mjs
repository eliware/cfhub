import {
  credentialsPath,
  readCredentialFile,
  writeCredentialFile,
  deleteCredentialFile,
} from "../src/credential-files.mjs";

const fsStub = (overrides = {}) => ({
  existsSync: () => false,
  readFileSync: () => "{}",
  mkdirSync: () => {},
  writeFileSync: () => {},
  renameSync: () => {},
  chmodSync: () => {},
  ...overrides,
});

test("builds credential paths with explicit and default home directories", () => {
  expect(credentialsPath("/tmp/cfhub-test")).toContain("credentials.json");
  expect(credentialsPath()).toContain("credentials.json");
});

test("reads stored credentials and handles absent or invalid files", () => {
  const path = credentialsPath("/tmp/home");
  expect(readCredentialFile("missing", fsStub(), "/tmp/home")).toBeNull();
  expect(
    readCredentialFile(
      "work",
      fsStub({ existsSync: () => true, readFileSync: () => '{"work":{"token":"x"}}' }),
      "/tmp/home",
    ),
  ).toEqual({ token: "x" });
  expect(readCredentialFile("absent", fsStub({ existsSync: () => true }), "/tmp/home")).toBeNull();
  expect(
    readCredentialFile(
      "work",
      fsStub({ existsSync: () => true, readFileSync: () => "invalid" }),
      "/tmp/home",
    ),
  ).toBeNull();
  expect(
    readCredentialFile(
      "work",
      fsStub({
        existsSync: () => {
          throw Error("disk");
        },
      }),
      "/tmp/home",
    ),
  ).toBeNull();
  expect(path).toContain("/tmp/home");
});

test("writes credentials atomically and preserves existing profiles", () => {
  const writes = [];
  const renames = [];
  let current = '{"other":{"token":"y"}}';
  const fsImpl = fsStub({
    existsSync: () => true,
    readFileSync: () => current,
    writeFileSync: (path, text, options) => writes.push({ path, text, options }),
    renameSync: (from, to) => renames.push([from, to]),
  });
  expect(writeCredentialFile("work", { token: "x" }, fsImpl, "/tmp/home")).toBe(true);
  expect(fsImpl.mkdirSync).toBeDefined();
  expect(writes[0].text).toContain('"other"');
  expect(writes[0].text).toContain('"work"');
  expect(writes[0].options).toEqual({ mode: 0o600 });
  expect(renames[0][1]).toBe(credentialsPath("/tmp/home"));
  const noChmod = fsStub({ chmodSync: undefined });
  expect(writeCredentialFile("work", {}, noChmod, "/tmp/home")).toBe(true);
  expect(
    writeCredentialFile(
      "work",
      {},
      fsStub({
        mkdirSync: () => {
          throw Error("read only");
        },
      }),
      "/tmp/home",
    ),
  ).toBe(false);
});

test("deletes credentials and preserves files without the profile", () => {
  const path = credentialsPath("/tmp/home");
  let stored = '{"work":{"token":"x"},"other":{"token":"y"}}';
  const writes = [];
  const renames = [];
  const fsImpl = fsStub({
    existsSync: () => true,
    readFileSync: () => stored,
    writeFileSync: (file, text) => {
      writes.push(file);
      stored = text;
    },
    renameSync: (from, to) => renames.push([from, to]),
  });
  expect(deleteCredentialFile("work", fsImpl, "/tmp/home")).toBe(true);
  expect(JSON.parse(stored)).toEqual({ other: { token: "y" } });
  expect(renames[0][1]).toBe(path);
  expect(deleteCredentialFile("missing", fsImpl, "/tmp/home")).toBe(false);
  expect(deleteCredentialFile("work", fsStub(), "/tmp/home")).toBe(false);
  expect(
    deleteCredentialFile(
      "work",
      fsStub({ existsSync: () => true, readFileSync: () => "bad" }),
      "/tmp/home",
    ),
  ).toBe(false);
  expect(
    deleteCredentialFile(
      "work",
      fsStub({
        existsSync: () => true,
        readFileSync: () => '{"work":{}}',
        writeFileSync: () => {
          throw Error("disk");
        },
      }),
      "/tmp/home",
    ),
  ).toBe(false);
  expect(writes).toHaveLength(1);
});

test("deletes credentials without chmod support", () => {
  const fsImpl = fsStub({
    existsSync: () => true,
    readFileSync: () => '{"work":{}}',
    chmodSync: undefined,
  });
  expect(deleteCredentialFile("work", fsImpl, "/tmp/home")).toBe(true);
});
