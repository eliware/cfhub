import { startOAuthServer } from "../server.mjs";

export async function startOAuthServerLifecycle({
  ports,
  serverFactory,
  bindHost,
  setTimeoutImpl = setTimeout,
}) {
  const started = await startOAuthServer({ ports, serverFactory, bindHost });
  return {
    ...started,
    closeAfterResponse: () => setTimeoutImpl(() => started.server.close(), 250),
  };
}
