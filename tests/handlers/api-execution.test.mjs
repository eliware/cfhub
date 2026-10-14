import { jest } from "@jest/globals";
import { executeApiRequest } from "../../src/handlers/api-execution.mjs";

const requestOptions = { path: "/zones", method: "GET" };

test("executes a request and collects paginated GET results", async () => {
  const get = jest
    .fn()
    .mockResolvedValueOnce({ result: [{ page: 1 }], result_info: { total_pages: 2 } })
    .mockResolvedValue({ result: [{ page: 2 }], result_info: { total_pages: 2 } });
  const result = await executeApiRequest({
    cf: { get },
    requestOptions,
    body: null,
    opts: { paginate: true },
    printer: { log: jest.fn() },
    fail: jest.fn(),
  });
  expect(get).toHaveBeenCalledWith("/zones?page=2&per_page=100", undefined);
  expect(result.result.result).toEqual([{ page: 1 }, { page: 2 }]);
});

test("passes mutation bodies and propagates request errors", async () => {
  const post = jest.fn().mockResolvedValue({ id: "created" });
  await expect(
    executeApiRequest({
      cf: { post },
      requestOptions: { path: "/zones", method: "POST" },
      body: { name: "x" },
      opts: {},
      printer: { log: jest.fn() },
      fail: jest.fn(),
    }),
  ).resolves.toEqual({ done: false, result: { id: "created" } });
  expect(post).toHaveBeenCalledWith("/zones", { body: { name: "x" } });

  const error = new Error("rate limited");
  await expect(
    executeApiRequest({
      cf: { get: jest.fn().mockRejectedValue(error) },
      requestOptions,
      body: null,
      opts: {},
      printer: { log: jest.fn() },
      fail: jest.fn(),
    }),
  ).rejects.toBe(error);
});

test("handles dry runs and unsupported client methods", async () => {
  const printer = { log: jest.fn() };
  const dryRun = await executeApiRequest({
    cf: { get: jest.fn() },
    requestOptions: { path: "/zones/1", method: "DELETE" },
    body: null,
    opts: { "dry-run": true },
    printer,
    fail: jest.fn(),
  });
  expect(dryRun).toEqual({ done: true });
  expect(printer.log).toHaveBeenCalledWith(expect.stringContaining("dryRun"));

  const fail = jest.fn();
  await expect(
    executeApiRequest({
      cf: {},
      requestOptions: { path: "/zones", method: "PUT" },
      body: null,
      opts: {},
      printer,
      fail,
    }),
  ).resolves.toEqual({ done: true });
  expect(fail).toHaveBeenCalledWith("Cloudflare client does not support PUT");
});
