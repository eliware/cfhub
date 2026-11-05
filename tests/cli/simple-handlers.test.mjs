import { jest } from "@jest/globals";
import { simpleHandlers } from "../../src/cli/simple-handlers.mjs";

test("simple handler map reads each configured resource", async () => {
  expect(simpleHandlers).toHaveProperty("loadBalancer");
  for (const resource of [
    "tunnel",
    "workers",
    "pages",
    "r2",
    "d1",
    "queues",
    "stream",
    "images",
    "ai",
    "access",
  ])
    expect(simpleHandlers).toHaveProperty(resource);

  await Promise.all(
    Object.entries(simpleHandlers).map(async ([name, handler]) => {
      const get = jest.fn().mockResolvedValue({ result: [] });
      await handler({
        cf: { get },
        action: "list",
        opts: name === "loadBalancer" ? { "zone-id": "zone" } : { "account-id": "account" },
        outputJson: true,
        toJsonOutput: jest.fn(),
        printer: { log: jest.fn() },
        fail: (message) => {
          throw new Error(message);
        },
      });
      expect(get).toHaveBeenCalledTimes(1);
    }),
  );
});
