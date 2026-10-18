import { jest } from "@jest/globals";
import { EventEmitter } from "node:events";
import { startOAuthServer } from "../../src/oauth/server.mjs";

function makeServer({ error, port } = {}) {
  const server = new EventEmitter();
  server.listen = jest.fn(() => {
    process.nextTick(() => (error ? server.emit("error", error) : server.emit("listening")));
  });
  server.address = () => (port ? { port } : null);
  server.close = jest.fn();
  return server;
}

test("server binds the first available port and returns its assigned port", async () => {
  const server = makeServer({ port: 9000 });
  await expect(
    startOAuthServer({ ports: [8765, 8766], bindHost: "127.0.0.1", serverFactory: () => server }),
  ).resolves.toEqual({ server, port: 9000 });
  expect(server.listen).toHaveBeenCalledWith(8765, "127.0.0.1");
});

test("server retries ports that are in use and falls back to the candidate port", async () => {
  const busy = Object.assign(new Error("busy"), { code: "EADDRINUSE" });
  const first = makeServer({ error: busy });
  const second = makeServer();
  const servers = [first, second];
  const serverFactory = jest.fn(() => servers.shift());
  const result = await startOAuthServer({
    ports: [8765, 8766],
    bindHost: "localhost",
    serverFactory,
  });
  expect(result).toEqual({ server: second, port: 8766 });
  expect(first.close).toHaveBeenCalled();
  expect(serverFactory).toHaveBeenCalledTimes(2);
});

test("server rethrows errors other than address conflicts", async () => {
  const error = new Error("permission denied");
  const server = makeServer({ error });
  await expect(
    startOAuthServer({ ports: [8765], bindHost: "localhost", serverFactory: () => server }),
  ).rejects.toBe(error);
  expect(server.close).toHaveBeenCalled();
});

test("server rejects when all ports are in use", async () => {
  const error = Object.assign(new Error("busy"), { code: "EADDRINUSE" });
  const servers = [makeServer({ error }), makeServer({ error })];
  await expect(
    startOAuthServer({
      ports: [8765, 8766],
      bindHost: "localhost",
      serverFactory: () => servers.shift(),
    }),
  ).rejects.toThrow("No OAuth callback ports are available (tried 8765-8769)");
});

test("server rejects an empty port list", async () => {
  await expect(startOAuthServer({ ports: [], serverFactory: jest.fn() })).rejects.toThrow(
    "No OAuth callback ports are available (tried 8765-8769)",
  );
});

test("server handles a factory error before it creates a server", async () => {
  const error = new Error("factory failed");
  await expect(
    startOAuthServer({
      ports: [8765],
      serverFactory: () => {
        throw error;
      },
    }),
  ).rejects.toBe(error);
});
