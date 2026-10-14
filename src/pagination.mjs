export function withPage(path, page) {
  const url = new URL(path, "https://cfhub.invalid");
  url.searchParams.set("page", String(page));
  if (!url.searchParams.has("per_page")) url.searchParams.set("per_page", "100");
  return `${url.pathname}${url.search}${url.hash}`;
}

export async function getAllPages(fetchPage, first, { paginate = false } = {}) {
  if (!paginate) return first;
  const totalPages = first?.result_info?.total_pages;
  if (!Array.isArray(first?.result) || !Number.isInteger(totalPages) || totalPages < 1)
    throw new Error("The API response does not support pagination");
  if (totalPages === 1) return first;
  const pages = [...first.result];
  for (let page = 2; page <= totalPages; page++) {
    const next = await fetchPage(page);
    if (!Array.isArray(next?.result))
      throw new Error("The API response does not support pagination");
    pages.push(...next.result);
  }
  return {
    ...first,
    result: pages,
    result_info: {
      ...first.result_info,
      page: 1,
      total_count: pages.length,
    },
  };
}
