import { discoverContext, withContext } from "./cli-live-context.mjs";

test("adds zone and account IDs to commands that need them", () => {
  expect(withContext(["dns-records", "list"], { zone: "zone-id" })).toEqual([
    "dns-records",
    "list",
    "--zone-id",
    "zone-id",
  ]);
  expect(withContext(["lists", "list"], { account: "account-id" })).toEqual([
    "lists",
    "list",
    "--account-id",
    "account-id",
  ]);
  expect(withContext(["rulesets", "list"], { zone: "zone-id", account: "account-id" })).toEqual([
    "rulesets",
    "list",
    "--zone-id",
    "zone-id",
    "--account-id",
    "account-id",
  ]);
});

test("discovers zone and account IDs from the first zone", async () => {
  const context = { zoneId: null, accountId: null };
  const runCommand = async () => ({
    code: 0,
    stdout: JSON.stringify({ result: [{ id: "zone-id", account: { id: "account-id" } }] }),
  });
  await discoverContext(runCommand, context);
  expect(context).toEqual({ zoneId: "zone-id", accountId: "account-id" });
});
