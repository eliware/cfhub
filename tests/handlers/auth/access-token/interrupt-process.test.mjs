import { jest } from "@jest/globals";
import { interruptProcess } from "../../../../src/handlers/auth/access-token/interrupt-process.mjs";

test("sends the process interrupt signal through the supplied process adapter", () => {
  const kill = jest.fn();
  expect(interruptProcess(kill, 54321)).toBeUndefined();
  expect(kill).toHaveBeenCalledWith(54321, "SIGINT");
});
