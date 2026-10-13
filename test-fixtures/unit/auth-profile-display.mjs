import { jest } from "@jest/globals";
import { handleAuthProfile } from "../../src/handlers/auth-profile.mjs";
import { profileOptions } from "../auth-profile-options.mjs";

test("profile listing prints active and inactive methods", async () => {
  const printer = { log: jest.fn() };
  await handleAuthProfile(
    profileOptions({
      resource: "auth",
      outputJson: false,
      printer,
      data: { active: "work", profiles: { work: {}, other: { authMethod: "oauth" } } },
    }),
  );
  expect(printer.log).toHaveBeenCalledWith(expect.stringContaining("work   api-token"));
  expect(printer.log).toHaveBeenCalledWith(expect.stringContaining("other  oauth"));
  const oauthPrinter = { log: jest.fn() };
  await handleAuthProfile(
    profileOptions({
      resource: "oauth",
      outputJson: false,
      printer: oauthPrinter,
      data: { active: "work", profiles: { work: {} } },
    }),
  );
  expect(oauthPrinter.log).toHaveBeenCalledWith(expect.stringContaining("work  oauth"));
});

test("profile cleanup handles unknown and inactive profiles", async () => {
  const fail = jest.fn();
  await handleAuthProfile(profileOptions({ action: "unknown" }));
  await handleAuthProfile(profileOptions({ action: "switch", fail }));
  await handleAuthProfile(profileOptions({ action: "logout", fail }));
  await handleAuthProfile(profileOptions({ action: "logout", opts: { profile: "missing" }, fail }));
  const data = { active: "other", profiles: { work: {}, other: {} } };
  const write = jest.fn();
  const printer = { log: jest.fn() };
  await handleAuthProfile(
    profileOptions({
      action: "logout",
      opts: { profile: "work" },
      data,
      deleteCredentialImpl: jest.fn().mockRejectedValue(new Error("local failure")),
      printer,
      write,
    }),
  );
  expect(data).toEqual({ active: "other", profiles: { other: {} } });
  expect(write).toHaveBeenCalled();
  expect(printer.log).toHaveBeenCalledWith("Removed profile work");
});
