import Fastify from "fastify";
import { selectOAuthServerPort } from "./server/port-selection.mjs";

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

export function startOAuthServer({ ports, serverFactory = createOAuthServer, bindHost }) {
  return selectOAuthServerPort({ ports, serverFactory, bindHost });
}
