import { jest } from "@jest/globals";
import { handleDnsMutation } from "../../../src/handlers/dns/mutations.mjs";

const context = (overrides = {}) => ({
  action: "create",
  zoneId: "zone-1",
  id: "record-1",
  body: { type: "A", name: "www" },
  opts: {},
  cf: { post: jest.fn().mockResolvedValue({ id: "created" }) },
  outputJson: true,
  toJsonOutput: jest.fn(),
  printer: { log: jest.fn() },
  fail: (message) => {
    throw new Error(message);
  },
  ...overrides,
});

test("routes write and delete actions to their focused handlers", async () => {
  const create = context();
  await handleDnsMutation(create);
  expect(create.cf.post).toHaveBeenCalledWith("/zones/zone-1/dns_records", { body: create.body });
  expect(create.toJsonOutput).toHaveBeenCalledWith({ id: "created" });

  const remove = jest.fn().mockResolvedValue({ deleted: true });
  const deletion = context({ action: "delete", opts: { force: true }, cf: { delete: remove } });
  await handleDnsMutation(deletion);
  expect(remove).toHaveBeenCalledWith("/zones/zone-1/dns_records/record-1");
  expect(deletion.toJsonOutput).toHaveBeenCalledWith({ deleted: true });
});
