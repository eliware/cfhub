import { gzipSync } from "node:zlib";

export function encodeAsset(request, body) {
  const header = request.headers["accept-encoding"];
  const entries = (Array.isArray(header) ? header : [header])
    .filter(Boolean)
    .flatMap((value) => value.split(","));
  const gzipEntries = entries.filter(
    (part) => part.trim().split(";", 1)[0].trim().toLowerCase() === "gzip",
  );
  const acceptsGzip =
    gzipEntries.length > 0 &&
    gzipEntries.every((part) => {
      const [, ...parameters] = part.trim().split(";");
      const qualities = parameters.filter((parameter) => /^\s*q\s*=/i.test(parameter));
      if (qualities.length > 1) return false;
      if (!qualities.length) return true;
      const value = qualities[0].trim().replace(/^q\s*=\s*/i, "");
      if (!/^(?:0(?:\.\d+)?|1(?:\.0+)?)$/.test(value)) return false;
      return Number(value) > 0;
    });
  const payload = acceptsGzip ? gzipSync(body) : Buffer.from(body);
  return { payload, contentEncoding: acceptsGzip ? "gzip" : undefined };
}
