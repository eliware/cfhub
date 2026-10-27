export async function selectOAuthServerPort({ ports, serverFactory, bindHost }) {
  let server;
  let port;
  for (const candidate of ports) {
    try {
      server = serverFactory();
      await server.listen({ port: candidate, host: bindHost });
      port = server.server.address()?.port || candidate;
      break;
    } catch (error) {
      if (server) await server.close();
      if (error.code !== "EADDRINUSE") throw error;
    }
  }
  if (!server || !port) {
    const details = ports.length ? `tried ${ports[0]}-${ports.at(-1)}` : "no ports were provided";
    throw new Error(`No OAuth callback ports are available (${details})`);
  }
  return { server, port };
}
