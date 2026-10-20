import { gzipSync } from "node:zlib";

export function encodeAsset(request, body) {
  const acceptsGzip = /(?:^|,\s*)gzip(?:\s*;|\s*,|\s*$)/i.test(
    request.headers["accept-encoding"] || "",
  );
  const payload = acceptsGzip ? gzipSync(body) : Buffer.from(body);
  return { payload, contentEncoding: acceptsGzip ? "gzip" : undefined };
}
