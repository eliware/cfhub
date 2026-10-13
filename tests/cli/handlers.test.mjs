import { createHandlerMap } from "../../src/cli/handlers.mjs";

test("handler map creates the CLI resource map", () => {
  expect(createHandlerMap()).toHaveProperty("zones");
});
