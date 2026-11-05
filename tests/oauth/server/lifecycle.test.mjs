import { jest } from "@jest/globals";
import { startOAuthServerLifecycle } from "../../../src/oauth/server/lifecycle.mjs";

test("starts the callback server and delays shutdown until the browser receives its response", async () => {
  let closeServer;
  const close = jest.fn();
  const server = {
    listen: jest.fn().mockResolvedValue(undefined),
    server: { address: () => ({ port: 43210 }) },
    close,
  };
  const lifecycle = await startOAuthServerLifecycle({
    ports: [0],
    bindHost: "127.0.0.1",
    serverFactory: () => server,
    setTimeoutImpl: (callback, delay) => {
      expect(delay).toBe(250);
      closeServer = callback;
    },
  });
  expect(lifecycle.server).toBe(server);
  expect(lifecycle.port).toBe(43210);
  lifecycle.closeAfterResponse();
  expect(close).not.toHaveBeenCalled();
  closeServer();
  expect(close).toHaveBeenCalledTimes(1);
});

test("uses the standard delay for callback server shutdown", async () => {
  jest.useFakeTimers();
  const close = jest.fn();
  try {
    const lifecycle = await startOAuthServerLifecycle({
      ports: [0],
      bindHost: "127.0.0.1",
      serverFactory: () => ({
        listen: jest.fn().mockResolvedValue(undefined),
        server: { address: () => ({ port: 43210 }) },
        close,
      }),
    });
    lifecycle.closeAfterResponse();
    expect(close).not.toHaveBeenCalled();
    jest.advanceTimersByTime(250);
    expect(close).toHaveBeenCalledTimes(1);
  } finally {
    jest.useRealTimers();
  }
});
