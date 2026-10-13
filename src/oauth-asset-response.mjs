import { gzipSync } from "node:zlib";

export function sendAsset(
  request,
  response,
  body,
  contentType,
  { cacheControl = "public, max-age=31536000, immutable" } = {},
) {
  const acceptsGzip = /(?:^|,\s*)gzip(?:\s*;|\s*,|\s*$)/i.test(
    request.headers["accept-encoding"] || "",
  );
  const payload = acceptsGzip ? gzipSync(body) : Buffer.from(body);
  const headers = {
    "content-type": contentType,
    "cache-control": cacheControl,
    "content-length": payload.length,
    vary: "Accept-Encoding",
  };
  if (acceptsGzip) headers["content-encoding"] = "gzip";
  response.writeHead(200, headers);
  response.end(payload);
}
