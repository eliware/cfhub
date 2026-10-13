import { jest } from "@jest/globals";
import { getAllPages, withPage } from "../src/pagination.mjs";

test("adds page parameters while preserving query strings", () => {
  expect(withPage("/zones", 2)).toBe("/zones?page=2&per_page=100");
  expect(withPage("/zones?name=x", 2)).toBe("/zones?name=x&page=2&per_page=100");
});

test("combines requested pages and preserves non-array responses", async () => {
  const fetchPage = jest.fn(async (page) => ({
    result: [{ page }],
    result_info: { total_pages: 2 },
  }));
  const first = { result: [{ page: 1 }], result_info: { total_pages: 2, total_count: 2 } };
  expect(await getAllPages(fetchPage, first, { paginate: true })).toEqual({
    result: [{ page: 1 }, { page: 2 }],
    result_info: { total_pages: 2, total_count: 2, page: 1 },
  });
  expect(fetchPage).toHaveBeenCalledWith(2);
  expect(await getAllPages(fetchPage, first)).toBe(first);
  expect(
    await getAllPages(
      fetchPage,
      { result: [], result_info: { total_pages: 1 } },
      { paginate: true },
    ),
  ).toEqual({ result: [], result_info: { total_pages: 1 } });
  const scalar = { result: "value", result_info: { total_pages: 2, total_count: 5 } };
  const scalarPage = await getAllPages(async () => ({ result: "next" }), scalar, {
    paginate: true,
  });
  expect(scalarPage.result).toBe("value");
});
