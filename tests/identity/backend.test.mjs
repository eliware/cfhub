import { jest } from "@jest/globals";
import {
  deleteFromBackends,
  readFromPreferredBackend,
  writeToPreferredBackend,
} from "../../src/identity/backend.mjs";

test("reads from the preferred backend when it returns a value", async () => {
  const primary = jest.fn().mockResolvedValue({ token: "secure" });
  const fallback = jest.fn();
  await expect(readFromPreferredBackend(primary, fallback)).resolves.toEqual({ token: "secure" });
  expect(fallback).not.toHaveBeenCalled();
});

test.each([
  ["an empty value", jest.fn().mockResolvedValue(null)],
  ["an error", jest.fn().mockRejectedValue(new Error("backend unavailable"))],
])("reads from the fallback after the preferred backend returns %s", async (_case, primary) => {
  const fallback = jest.fn().mockResolvedValue({ token: "file" });
  await expect(readFromPreferredBackend(primary, fallback)).resolves.toEqual({ token: "file" });
  expect(fallback).toHaveBeenCalledTimes(1);
});

test("writes to the fallback when the preferred backend declines", async () => {
  const fallback = jest.fn().mockResolvedValue(true);
  await expect(writeToPreferredBackend(jest.fn().mockResolvedValue(false), fallback)).resolves.toBe(
    true,
  );
  expect(fallback).toHaveBeenCalledTimes(1);
});

test("reports a preferred backend write as successful without fallback", async () => {
  const fallback = jest.fn();
  await expect(writeToPreferredBackend(jest.fn().mockResolvedValue(true), fallback)).resolves.toBe(
    true,
  );
  expect(fallback).not.toHaveBeenCalled();
});

test("deletes from both backends and reports either successful deletion", async () => {
  const fallback = jest.fn().mockResolvedValue(false);
  await expect(deleteFromBackends(jest.fn().mockResolvedValue(true), fallback)).resolves.toBe(true);
  expect(fallback).toHaveBeenCalledTimes(1);
  await expect(
    deleteFromBackends(jest.fn().mockResolvedValue(false), jest.fn().mockResolvedValue(true)),
  ).resolves.toBe(true);
});

test("continues deletion when the preferred backend throws", async () => {
  const fallback = jest.fn().mockResolvedValue(false);
  await expect(
    deleteFromBackends(jest.fn().mockRejectedValue(new Error("backend unavailable")), fallback),
  ).resolves.toBe(false);
  expect(fallback).toHaveBeenCalledTimes(1);
});
