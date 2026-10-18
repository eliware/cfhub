import { jest } from "@jest/globals";
import { createAuthDependencies } from "../../../src/handlers/auth/dependencies.mjs";
import { fs } from "../../../src/fs.mjs";

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

test("auth dependencies read a token from standard input by default", () => {
  const read = jest.spyOn(fs, "readFileSync").mockReturnValue(" token ");
  try {
    expect(createAuthDependencies().readToken()).toBe("token");
    expect(read).toHaveBeenCalledWith(0, "utf8");
  } finally {
    read.mockRestore();
  }
});
