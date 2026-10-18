import { tokenizeCommand } from "../src/alias-tokenizer.mjs";

test("tokenizes quoted, escaped, and spaced alias arguments", () => {
  expect(tokenizeCommand("dns list --name \"example.com\" --comment 'hello world'")).toEqual([
    "dns",
    "list",
    "--name",
    "example.com",
    "--comment",
    "hello world",
  ]);
  expect(tokenizeCommand('api --data "hello\\ world" --name a\\ b')).toEqual([
    "api",
    "--data",
    "hello world",
    "--name",
    "a b",
  ]);
  expect(tokenizeCommand("value\\")).toEqual(["value\\"]);
  expect(tokenizeCommand("  one\t two  ")).toEqual(["one", "two"]);
});

test("rejects an incomplete quoted argument", () => {
  expect(() => tokenizeCommand('dns list --name "example.com')).toThrow("unclosed quotation mark");
});
