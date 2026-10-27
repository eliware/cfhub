import { PassThrough } from "node:stream";
import { createAuthDependencies } from "../../../src/handlers/auth/dependencies.mjs";

test("auth dependencies provide the default workflow functions", () => {
  const dependencies = createAuthDependencies();
  expect(Object.values(dependencies).every((dependency) => typeof dependency === "function")).toBe(
    true,
  );
});

test("auth dependencies use supplied workflow functions", () => {
  const read = () => ({ active: null, profiles: {} });
  const write = () => {};
  const dependencies = createAuthDependencies({ read, write });
  expect(dependencies.read).toBe(read);
  expect(dependencies.write).toBe(write);
});

test("auth dependencies read one token line from standard input by default", async () => {
  const stdin = Object.getOwnPropertyDescriptor(process, "stdin");
  const input = new PassThrough();
  Object.defineProperty(process, "stdin", { configurable: true, value: input });
  try {
    const token = createAuthDependencies().readToken();
    input.end(" token \nextra data");
    await expect(token).resolves.toBe("token");
  } finally {
    Object.defineProperty(process, "stdin", stdin);
  }
});
