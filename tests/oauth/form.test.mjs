import { parseOAuthForm } from "../../src/oauth/form.mjs";

test("parses repeated form values", () => {
  expect(parseOAuthForm("scope=zone.read&scope=dns.read")).toEqual(
    new URLSearchParams("scope=zone.read&scope=dns.read"),
  );
});

test("parses an empty form body", () => {
  expect(parseOAuthForm()).toEqual(new URLSearchParams());
});

test("rejects oversized form bodies", () => {
  expect(() => parseOAuthForm("a".repeat(16 * 1024 + 1))).toThrow(
    "OAuth request body is too large",
  );
});
