import { jest } from "@jest/globals";
import { log, printTextList, toJsonOutput } from "../src/output-printers.mjs";

test("prints JSON and formatted list items through the injected printer", () => {
  const printer = jest.fn();
  toJsonOutput({ a: 1 }, printer);
  printTextList([{ id: 1 }], (item) => `id:${item.id}`, printer);
  expect(printer).toHaveBeenNthCalledWith(1, JSON.stringify({ a: 1 }, null, 2));
  expect(printer).toHaveBeenNthCalledWith(2, "id:1");
});

test("uses the default console printer", () => {
  const spy = jest.spyOn(log, "info").mockImplementation(() => {});
  toJsonOutput({ ok: true });
  printTextList([{ id: 2 }], (item) => `id:${item.id}`);
  expect(spy).toHaveBeenCalledTimes(2);
  spy.mockRestore();
});
