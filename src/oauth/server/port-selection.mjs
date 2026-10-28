export async function selectOAuthServerPort({ ports, serverFactory, bindHost }) {
  let server;
  let port;
  for (const candidate of ports) {
    let candidateServer;
    try {
      candidateServer = serverFactory();
      await candidateServer.listen({ port: candidate, host: bindHost });
      server = candidateServer;
      port = candidateServer.server.address()?.port || candidate;
      break;
    } catch (error) {
      if (candidateServer) await candidateServer.close();
      if (!candidateServer || error.code !== "EADDRINUSE") throw error;
    }
  }
  if (!server || !port) {
    const details = ports.length ? `tried ${ports[0]}-${ports.at(-1)}` : "no ports were provided";
    throw new Error(`No OAuth callback ports are available (${details})`);
  }
  return { server, port };
}
