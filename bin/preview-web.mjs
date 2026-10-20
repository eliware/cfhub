#!/usr/bin/env node
import { createOAuthServer } from "../src/oauth/server.mjs";
import { registerOAuthPickerPreview } from "../src/oauth/preview-server.mjs";
import { DEFAULT_WEB_PORT } from "../src/web/port.mjs";

const host = process.env.WEB_HOST ?? "127.0.0.1";
const port = Number(process.env.WEB_PORT ?? DEFAULT_WEB_PORT);
const server = createOAuthServer();
registerOAuthPickerPreview(server, { host, port });
await server.listen({ host, port });
console.log(`OAuth picker preview is available at http://${host}:${port}/`);

for (const signal of ["SIGINT", "SIGTERM"])
  process.once(signal, async () => {
    await server.close();
    process.exitCode = 0;
  });
