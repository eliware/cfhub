import { jest } from "@jest/globals";
import { switchAuthProfile } from "../../../../src/handlers/auth/profile/switch.mjs";

test("switches the active profile and saves profile data", () => {
  const data = { active: "old", profiles: { next: {} } };
  const write = jest.fn();
  const printer = { log: jest.fn() };
  switchAuthProfile({
    opts: { profile: "next" },
    data,
    write,
    profileHome: "home",
    profileFs: {},
    printer,
    fail: jest.fn(),
  });
  expect(data.active).toBe("next");
  expect(write).toHaveBeenCalledWith(data, "home", expect.any(Object));
  expect(printer.log).toHaveBeenCalledWith("Activated profile next");
});

test.each([
  [{}, "(missing --profile)"],
  [{ profile: "missing" }, "missing"],
])("rejects a missing profile %j", (opts, missingName) => {
  const fail = jest.fn();
  switchAuthProfile({ opts, data: { profiles: {} }, fail });
  expect(fail).toHaveBeenCalledWith(`Unknown profile: ${missingName}`);
});
