import { encodeAsset } from "./encoding.mjs";

export function sendAsset(
  request,
  response,
  body,
  contentType,
  { cacheControl = "public, max-age=31536000, immutable" } = {},
) {
  const { payload, contentEncoding } = encodeAsset(request, body);
  const headers = {
    "content-type": contentType,
    "cache-control": cacheControl,
    "content-length": payload.length,
    vary: "Accept-Encoding",
  };
  if (contentEncoding) headers["content-encoding"] = contentEncoding;
  response.writeHead(200, headers);
  response.end(payload);
}
