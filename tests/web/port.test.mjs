import { DEFAULT_WEB_PORT } from "../../src/web/port.mjs";

test("uses E-1120 as the default web port", () => {
  expect(DEFAULT_WEB_PORT).toBe(1120);
});
