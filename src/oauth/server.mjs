import Fastify from "fastify";

export function createOAuthServer() {
  const server = Fastify({ logger: false, bodyLimit: 16 * 1024 });
  let handleRequest = () => {};
  server.addContentTypeParser(
    "application/x-www-form-urlencoded",
    { parseAs: "string" },
    (_request, body, done) => done(null, body),
  );
  const dispatch = async (request, reply) => {
    reply.hijack();
    const handled = await handleRequest(request, reply.raw);
    if (!handled && !reply.raw.writableEnded) reply.raw.writeHead(404).end();
  };
  server.all("/", dispatch);
  server.all("/*", dispatch);
  server.setOAuthRequestHandler = (handler) => {
    handleRequest = handler;
  };
  return server;
}

export async function startOAuthServer({ ports, serverFactory = createOAuthServer, bindHost }) {
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
  if (!server || !port) throw new Error("No OAuth callback ports are available (tried 8765-8769)");
  return { server, port };
}
