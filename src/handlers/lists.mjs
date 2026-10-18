import { getAccountId, getId } from "./identifiers.mjs";
import { requireValue } from "./argument-validation.mjs";
import { handleListsRead } from "./lists/read.mjs";
import { handleListsWrite } from "./lists/write.mjs";
import { handleListsDelete } from "./lists/delete.mjs";

export async function handleLists(context) {
  const { cf, action, opts, body, outputJson, printer = console, toJsonOutput, fail } = context;
  const accountId = getAccountId(opts);
  const id = getId(opts);
  requireValue(accountId, "Missing --account-id or CLOUDFLARE_ACCOUNT_ID", fail);
  const shared = { cf, accountId, id, body, opts, outputJson, toJsonOutput, printer, fail };
  if (action === "list" || action === "get") return handleListsRead({ ...shared, action });
  if (action === "create" || action === "update") return handleListsWrite({ ...shared, action });
  if (action === "delete") return handleListsDelete(shared);
  fail(`Unknown lists action: ${action}`);
}
