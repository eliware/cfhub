import { jest } from "@jest/globals";
import {
  liveEnabled,
  liveReady,
  wetEnabled,
  accountId,
  discoverContext,
  run,
  parseJson,
  skipUnavailable,
  canRun,
} from "./cli-live-support.mjs";

const liveDescribe = liveEnabled && liveReady ? describe : describe.skip;
liveDescribe("authenticated live CLI lists lifecycle tests", () => {
  jest.setTimeout(120_000);
  beforeAll(discoverContext);

  test("wet list CRUD follows list and item lifecycle", async () => {
    if (!wetEnabled || !canRun("lists", "create")) return;
    expect(accountId).toEqual(expect.any(String));
    const existingLists = await run(["lists", "list", "--account-id", accountId, "--json"]);
    expect(existingLists.code).toBe(0);
    // Cloudflare accounts have a finite list quota; do not turn a quota-full
    // account into a failing release test or delete an existing list.
    if (parseJson(existingLists).length >= 1) return;
    const listName = `cflive${Date.now()}`;
    const createList = await run([
      "lists",
      "create",
      "--account-id",
      accountId,
      "--data",
      JSON.stringify({ name: listName, description: "Temporary cfhub live test list", kind: "ip" }),
      "--json",
    ]);
    if (createList.code !== 0 && skipUnavailable("list CRUD", createList)) return;
    expect(createList.code).toBe(0);
    const createdList = parseJson(createList);
    const listId = createdList.id;
    expect(listId).toEqual(expect.any(String));
    try {
      const listed = await run(["lists", "list", "--account-id", accountId, "--json"]);
      expect(listed.code).toBe(0);
      expect(parseJson(listed).some((list) => list.id === listId)).toBe(true);

      const emptyItems = await run([
        "list-items",
        "list",
        "--account-id",
        accountId,
        "--id",
        listId,
        "--json",
      ]);
      expect(emptyItems.code).toBe(0);
      expect(parseJson(emptyItems)).toEqual([]);

      const createdItem = await run([
        "list-items",
        "create",
        "--account-id",
        accountId,
        "--id",
        listId,
        "--data",
        JSON.stringify({ ip: "192.0.2.1" }),
        "--json",
      ]);
      expect(createdItem.code).toBe(0);

      const itemsAfterCreate = await run([
        "list-items",
        "list",
        "--account-id",
        accountId,
        "--id",
        listId,
        "--json",
      ]);
      expect(itemsAfterCreate.code).toBe(0);
      const firstItem = parseJson(itemsAfterCreate)[0];
      expect(firstItem?.id).toEqual(expect.any(String));
      expect(firstItem.ip || firstItem.value).toBe("192.0.2.1");

      // Cloudflare list items have no in-place update endpoint; replace the item
      // and verify the new value through the list read.
      const removedForUpdate = await run([
        "list-items",
        "delete",
        "--account-id",
        accountId,
        "--id",
        listId,
        "--data",
        JSON.stringify({ ids: [firstItem.id] }),
        "--force",
        "--json",
      ]);
      expect(removedForUpdate.code).toBe(0);
      const replacedItem = await run([
        "list-items",
        "create",
        "--account-id",
        accountId,
        "--id",
        listId,
        "--data",
        JSON.stringify({ ip: "192.0.2.2" }),
        "--json",
      ]);
      expect(replacedItem.code).toBe(0);
      const itemsAfterUpdate = await run([
        "list-items",
        "list",
        "--account-id",
        accountId,
        "--id",
        listId,
        "--json",
      ]);
      expect(itemsAfterUpdate.code).toBe(0);
      const updatedItem = parseJson(itemsAfterUpdate)[0];
      expect(updatedItem.ip || updatedItem.value).toBe("192.0.2.2");

      const deletedItem = await run([
        "list-items",
        "delete",
        "--account-id",
        accountId,
        "--id",
        listId,
        "--data",
        JSON.stringify({ ids: [updatedItem.id] }),
        "--force",
        "--json",
      ]);
      expect(deletedItem.code).toBe(0);
      const emptyAgain = await run([
        "list-items",
        "list",
        "--account-id",
        accountId,
        "--id",
        listId,
        "--json",
      ]);
      expect(emptyAgain.code).toBe(0);
      expect(parseJson(emptyAgain)).toEqual([]);
    } finally {
      const deletedList = await run([
        "lists",
        "delete",
        "--account-id",
        accountId,
        "--id",
        listId,
        "--force",
        "--json",
      ]);
      expect(deletedList.code).toBe(0);
      const listsAfterDelete = await run(["lists", "list", "--account-id", accountId, "--json"]);
      expect(listsAfterDelete.code).toBe(0);
      expect(parseJson(listsAfterDelete).some((list) => list.id === listId)).toBe(false);
    }
  });
});
