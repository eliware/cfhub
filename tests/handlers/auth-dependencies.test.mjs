import { createAuthDependencies } from "../../src/handlers/auth-dependencies.mjs";

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
