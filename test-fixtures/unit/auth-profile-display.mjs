import { jest } from "@jest/globals";
import { handleAuthProfile } from "../../src/handlers/auth/profile.mjs";
import { profileOptions } from "../auth-profile-options.mjs";

export async function fixtureCase1() {
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
}
