const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 500;

function resolvePageSize(value, paginate, fail) {
  if (value === undefined) return paginate ? DEFAULT_PAGE_SIZE : undefined;
  const pageSize = Number(value);
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    fail("--per-page must be an integer from 1 to 500");
    return null;
  }
  return pageSize;
}

function createItemsPath(accountId, listId, pageSize, cursor) {
  const path = `/accounts/${accountId}/rules/lists/${listId}/items`;
  const params = new URLSearchParams();
  if (pageSize !== undefined) params.set("per_page", String(pageSize));
  if (cursor) params.set("cursor", cursor);
  return params.size ? `${path}?${params}` : path;
}

export async function readListItems({ cf, accountId, listId, opts, fail }) {
  const pageSize = resolvePageSize(opts["per-page"], opts.paginate, fail);
  if (pageSize === null) return [];
  if (typeof cf.get !== "function") {
    const params = { account_id: accountId };
    if (pageSize !== undefined) params.per_page = pageSize;
    const items = [];
    for await (const item of cf.rules.lists.items.list(listId, params)) items.push(item);
    return items;
  }

  const items = [];
  const cursors = new Set();
  let cursor;
  do {
    const response = await cf.get(createItemsPath(accountId, listId, pageSize, cursor), undefined);
    if (!response) return items;
    const pageItems = Array.isArray(response.result) ? response.result : response;
    if (!Array.isArray(pageItems)) return pageItems;
    items.push(...pageItems);
    cursor = opts.paginate ? response.result_info?.cursors?.after : undefined;
    if (cursor && cursors.has(cursor)) {
      fail("Cloudflare returned a repeated list-items pagination cursor");
      return items;
    }
    if (cursor) cursors.add(cursor);
  } while (cursor);
  return items;
}
