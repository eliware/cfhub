import { createHandlerMap } from "../../src/cli/handlers.mjs";

test("handler map creates the CLI resource map", () => {
  expect(createHandlerMap()).toHaveProperty("zones");
  const zones = () => {};
  const workers = () => {};
  const map = createHandlerMap({ zones, workers });
  expect(map.zones).toBe(zones);
  expect(map.workers).toBe(workers);
  expect(map).toHaveProperty("oauth");
  expect(map).toHaveProperty("load-balancer");
});
