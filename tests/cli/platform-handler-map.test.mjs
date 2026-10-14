import { createPlatformHandlerMap } from "../../src/cli/platform-handler-map.mjs";

test("creates the platform resource map and applies handler overrides", () => {
  expect(createPlatformHandlerMap()).toHaveProperty("workers");
  const workers = () => {};
  const map = createPlatformHandlerMap({ workers });
  expect(map.workers).toBe(workers);
  expect(map).toHaveProperty("load-balancer");
  expect(map).toHaveProperty("access");
});
