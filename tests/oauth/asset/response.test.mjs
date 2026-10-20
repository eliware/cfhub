import { jest } from "@jest/globals";
import { sendAsset } from "../../../src/oauth/asset/response.mjs";

test("sends plain assets with cache headers", () => {
  const plain = { writeHead: jest.fn(), end: jest.fn() };
  sendAsset({ headers: {} }, plain, "body", "text/plain", { cacheControl: "no-store" });
  expect(plain.writeHead).toHaveBeenCalledWith(
    200,
    expect.objectContaining({ "cache-control": "no-store", "content-length": 4 }),
  );
  expect(plain.end).toHaveBeenCalledWith(Buffer.from("body"));
});

test("sets gzip headers for encoded assets", () => {
  const zipped = { writeHead: jest.fn(), end: jest.fn() };
  sendAsset({ headers: { "accept-encoding": "br, gzip" } }, zipped, "body", "text/plain");
  expect(zipped.writeHead).toHaveBeenCalledWith(
    200,
    expect.objectContaining({ "content-encoding": "gzip", vary: "Accept-Encoding" }),
  );
  expect(zipped.end.mock.calls[0][0]).toBeInstanceOf(Buffer);
});
