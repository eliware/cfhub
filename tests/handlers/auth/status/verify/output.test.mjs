import { jest } from "@jest/globals";
import { outputTokenVerification } from "../../../../../src/handlers/auth/status/verify/output.mjs";

test("outputs verification results as JSON or status text", () => {
  const result = { verified: true, status: "active" };
  const toJsonOutput = jest.fn();
  const printer = { log: jest.fn() };
  outputTokenVerification(result, { outputJson: true, toJsonOutput, printer });
  expect(toJsonOutput).toHaveBeenCalledWith(result);
  outputTokenVerification(result, { outputJson: false, toJsonOutput, printer });
  expect(printer.log).toHaveBeenCalledWith("active");
});
