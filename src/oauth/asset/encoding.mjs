import { gzipSync } from "node:zlib";

export function encodeAsset(request, body) {
  const acceptsGzip = (request.headers["accept-encoding"] || "").split(",").some((part) => {
    const [encoding, ...parameters] = part.trim().split(";");
    if (encoding.toLowerCase() !== "gzip") return false;
    const quality = parameters.find((parameter) => /^\s*q=/i.test(parameter));
    if (!quality) return true;
    const value = Number(quality.trim().slice(2));
    return Number.isFinite(value) && value > 0;
  });
  const payload = acceptsGzip ? gzipSync(body) : Buffer.from(body);
  return { payload, contentEncoding: acceptsGzip ? "gzip" : undefined };
}
