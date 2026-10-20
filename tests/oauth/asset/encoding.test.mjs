import { gunzipSync } from "node:zlib";
import { encodeAsset } from "../../../src/oauth/asset/encoding.mjs";

test("keeps the payload plain when the request does not accept gzip", () => {
  const encoded = encodeAsset({ headers: {} }, "body");
  expect(encoded).toEqual({ payload: Buffer.from("body"), contentEncoding: undefined });
});

test("compresses the payload when the request accepts gzip", () => {
  const encoded = encodeAsset({ headers: { "accept-encoding": "br, gzip" } }, "body");
  expect(encoded.contentEncoding).toBe("gzip");
  expect(gunzipSync(encoded.payload).toString()).toBe("body");
});
