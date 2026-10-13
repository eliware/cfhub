import { jest } from "@jest/globals";
import { requestWithBackoff } from "../src/request-backoff.mjs";

test("retries rate limits and propagates other errors", async () => {
  expect(await requestWithBackoff(async () => "default")).toBe("default");
  const defaultDelay = jest.fn().mockRejectedValueOnce({ status: 429 }).mockResolvedValue("ok");
  expect(await requestWithBackoff(defaultDelay)).toBe("ok");
  const request = jest.fn().mockRejectedValueOnce({ status: 429 }).mockResolvedValue("ok");
  expect(await requestWithBackoff(request, { delay: async () => {} })).toBe("ok");
  const error = new Error("bad");
  error.status = 500;
  await expect(
    requestWithBackoff(jest.fn().mockRejectedValue(error), { delay: async () => {} }),
  ).rejects.toBe(error);
  const statusCode = jest.fn().mockRejectedValueOnce({ statusCode: 429 }).mockResolvedValue("ok");
  expect(await requestWithBackoff(statusCode, { delay: async () => {} })).toBe("ok");
  const responseStatus = jest
    .fn()
    .mockRejectedValueOnce({ response: { status: 429 } })
    .mockResolvedValue("ok");
  expect(await requestWithBackoff(responseStatus, { delay: async () => {} })).toBe("ok");
});
