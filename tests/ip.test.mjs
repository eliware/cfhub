import { validateIp } from "../src/ip.mjs";
test("IP validator accepts IPv4 and rejects invalid input", () => {
  expect(() => validateIp("1.1.1.1")).not.toThrow();
  expect(() => validateIp("999.1.1.1")).toThrow();
});
