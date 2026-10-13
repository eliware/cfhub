import { showUserTokenStatus } from "../../src/handlers/auth-status-user.mjs";

test("user status returns identity or a text message", async () => {
  const cf = { get: jest.fn().mockResolvedValue({ result: { id: "id", email: "a@b.test" } }) };
  const toJsonOutput = jest.fn();
  await showUserTokenStatus({
    resource: "auth",
    statusProfile: "work",
    data: { profiles: { work: { authMethod: "api-token" } } },
    cf,
    outputJson: true,
    toJsonOutput,
  });
  expect(toJsonOutput).toHaveBeenCalledWith(
    expect.objectContaining({ id: "id", method: "api-token" }),
  );
  const printer = { log: jest.fn() };
  await showUserTokenStatus({
    resource: "oauth",
    statusProfile: "work",
    data: { profiles: {} },
    cf,
    outputJson: false,
    printer,
  });
  expect(printer.log).toHaveBeenCalledWith("work authenticated as a@b.test");
});
