import { jest } from "@jest/globals";
import { selectOAuthServerPort } from "../../../src/oauth/server/port-selection.mjs";

test("returns the server and assigned port after the first candidate binds", async () => {
  const server = {
    listen: jest.fn().mockResolvedValue(undefined),
    server: { address: () => ({ port: 9000 }) },
    close: jest.fn(),
  };
  await expect(
    selectOAuthServerPort({
      ports: [1120, 1121],
      serverFactory: () => server,
      bindHost: "127.0.0.1",
    }),
  ).resolves.toEqual({ server, port: 9000 });
  expect(server.listen).toHaveBeenCalledWith({ port: 1120, host: "127.0.0.1" });
});
