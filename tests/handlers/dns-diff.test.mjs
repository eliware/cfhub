import { jest } from "@jest/globals";
import { handleDnsDiff } from "../../src/handlers/dns-diff.mjs";

test("DNS diff reports records to add and remove", async () => {
  const current = [{ id: "old", type: "A", name: "old", content: "1.1.1.1" }];
  const toJsonOutput = jest.fn();
  await handleDnsDiff({
    action: "diff",
    zoneId: "zone",
    opts: {},
    body: [{ type: "A", name: "new", content: "2.2.2.2" }],
    outputJson: true,
    printer: { log: jest.fn() },
    toJsonOutput,
    fail: (message) => {
      throw new Error(message);
    },
    cf: {},
    listRecords: async () => ({ result: current }),
  });
  expect(toJsonOutput.mock.calls[0][0].add).toHaveLength(1);
  expect(toJsonOutput.mock.calls[0][0].remove).toEqual(current);
});
