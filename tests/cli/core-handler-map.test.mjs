import { createCoreHandlerMap } from "../../src/cli/core-handler-map.mjs";

test("creates the core resource map and applies handler overrides", () => {
  expect(createCoreHandlerMap()).toHaveProperty("zones");
  const zones = () => {};
  const map = createCoreHandlerMap({ zones });
  expect(map.zones).toBe(zones);
  expect(map.oauth).toBe(map.auth);
  expect(map).toHaveProperty("extension");
});
