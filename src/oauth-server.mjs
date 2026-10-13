export async function startOAuthServer({ ports, serverFactory, bindHost }) {
  let server;
  let port;
  for (const candidate of ports) {
    try {
      server = serverFactory();
      await new Promise((resolve, reject) => {
        const onError = (error) => {
          server.removeListener("listening", onListen);
          reject(error);
        };
        const onListen = () => {
          server.removeListener("error", onError);
          resolve();
        };
        server.once("error", onError);
        server.once("listening", onListen);
        server.listen(candidate, bindHost);
      });
      port = server.address()?.port || candidate;
      break;
    } catch (error) {
      if (server) server.close();
      if (error.code !== "EADDRINUSE") throw error;
    }
  }
  if (!server || !port) throw new Error("No OAuth callback port available (tried 8765-8769)");
  return { server, port };
}
