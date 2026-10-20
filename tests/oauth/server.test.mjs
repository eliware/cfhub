import { jest } from "@jest/globals";
import { startOAuthServer } from "../../src/oauth/server.mjs";

function makeServer({ error, port } = {}) {
  return {
    listen: jest.fn(() => (error ? Promise.reject(error) : Promise.resolve())),
    server: { address: () => (port ? { port } : null) },
    close: jest.fn(),
  };
}

test("creates a Fastify callback server", async () => {
  const { server } = await startOAuthServer({ ports: [0], bindHost: "127.0.0.1" });
  expect(server).toHaveProperty("setOAuthRequestHandler", expect.any(Function));
  const response = await server.inject({ method: "GET", url: "/unhandled" });
  expect(response.statusCode).toBe(404);
  server.setOAuthRequestHandler((_request, reply) => {
    reply.writeHead(201).end("handled");
    return false;
  });
  const handled = await server.inject({
    method: "POST",
    url: "/oauth/start",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    payload: "scope=zone.read",
  });
  expect(handled.statusCode).toBe(201);
  expect(handled.body).toBe("handled");
  await server.close();
});

test("server binds the first available port and returns its assigned port", async () => {
  const server = makeServer({ port: 9000 });
  await expect(
    startOAuthServer({ ports: [1120, 1121], bindHost: "127.0.0.1", serverFactory: () => server }),
  ).resolves.toEqual({ server, port: 9000 });
  expect(server.listen).toHaveBeenCalledWith({ port: 1120, host: "127.0.0.1" });
});

test("server retries ports that are in use and falls back to the candidate port", async () => {
  const busy = Object.assign(new Error("busy"), { code: "EADDRINUSE" });
  const first = makeServer({ error: busy });
  const second = makeServer();
  const servers = [first, second];
  const serverFactory = jest.fn(() => servers.shift());
  const result = await startOAuthServer({
    ports: [1120, 1121],
    bindHost: "localhost",
    serverFactory,
  });
  expect(result).toEqual({ server: second, port: 1121 });
  expect(first.close).toHaveBeenCalled();
  expect(serverFactory).toHaveBeenCalledTimes(2);
});

test("server rethrows errors other than address conflicts", async () => {
  const error = new Error("permission denied");
  const server = makeServer({ error });
  await expect(
    startOAuthServer({ ports: [1120], bindHost: "localhost", serverFactory: () => server }),
  ).rejects.toBe(error);
  expect(server.close).toHaveBeenCalled();
});

test("server rejects when all ports are in use", async () => {
  const error = Object.assign(new Error("busy"), { code: "EADDRINUSE" });
  const servers = [makeServer({ error }), makeServer({ error })];
  await expect(
    startOAuthServer({
      ports: [1120, 1121],
      bindHost: "localhost",
      serverFactory: () => servers.shift(),
    }),
  ).rejects.toThrow("No OAuth callback ports are available (tried 1120-1121)");
});

test("server rejects an empty port list", async () => {
  await expect(startOAuthServer({ ports: [], serverFactory: jest.fn() })).rejects.toThrow(
    "No OAuth callback ports are available (no ports were provided)",
  );
});

test("server handles a factory error before it creates a server", async () => {
  const error = new Error("factory failed");
  await expect(
    startOAuthServer({
      ports: [1120],
      serverFactory: () => {
        throw error;
      },
    }),
  ).rejects.toBe(error);
});
