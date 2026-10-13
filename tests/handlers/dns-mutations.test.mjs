import { jest } from "@jest/globals";
import { handleDnsMutation } from "../../src/handlers/dns-mutations.mjs";

test("DNS mutation writes a record", async () => {
  const cf = { post: jest.fn().mockResolvedValue({ id: "r1" }) };
  const toJsonOutput = jest.fn();
  await handleDnsMutation({
    action: "create",
    zoneId: "z",
    body: { type: "A" },
    opts: {},
    cf,
    outputJson: true,
    toJsonOutput,
    printer: { log: jest.fn() },
    fail: (message) => {
      throw Error(message);
    },
  });
  expect(cf.post).toHaveBeenCalledWith("/zones/z/dns_records", { body: { type: "A" } });
  expect(toJsonOutput).toHaveBeenCalledWith({ id: "r1" });
});
