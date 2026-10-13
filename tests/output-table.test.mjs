import { jest } from "@jest/globals";
import { log } from "../src/output-printers.mjs";
import { printTable, renderTable } from "../src/output-table.mjs";

test("aligns table columns and prints the result", () => {
  const printer = jest.fn();
  expect(
    renderTable(
      ["ID", "NAME"],
      [
        ["1", "alpha"],
        ["22", null],
      ],
    ),
  ).toBe("ID  NAME\n--  ----\n1   alpha\n22");
  printTable(["ID"], [["1"]], printer);
  expect(printer).toHaveBeenCalledWith("ID\n--\n1");
});

test("uses the default console printer", () => {
  const spy = jest.spyOn(log, "info").mockImplementation(() => {});
  printTable(["ID"], [["2"]]);
  expect(spy).toHaveBeenCalledWith("ID\n--\n2");
  spy.mockRestore();
});
