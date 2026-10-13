import { jest } from "@jest/globals";
import {
  pickerAsset,
  pickerHtml,
  readRequestBody,
  sendAsset,
} from "../src/oauth-picker-assets.mjs";

test("picker asset helpers load browser data and respond with content", async () => {
  expect(pickerAsset("oauth-web/cf-logo.svg")).toContain("svg");
  expect(pickerAsset("oauth-web/oauth-picker.html")).toContain("<!doctype html>");
  expect(pickerHtml()).toContain("zone.read");
  const request = {
    headers: {},
    on: jest.fn((event, callback) => {
      if (event === "end") callback();
    }),
  };
  expect(await readRequestBody(request)).toBeInstanceOf(URLSearchParams);
  const response = { writeHead: jest.fn(), end: jest.fn() };
  sendAsset(request, response, "body", "text/plain");
  expect(response.writeHead).toHaveBeenCalledWith(200, expect.any(Object));
  const gzipResponse = { writeHead: jest.fn(), end: jest.fn() };
  sendAsset({ headers: { "accept-encoding": "gzip" } }, gzipResponse, "body", "text/plain");
  expect(gzipResponse.writeHead.mock.calls[0][1]).toMatchObject({ "content-encoding": "gzip" });
  expect(gzipResponse.end.mock.calls[0][0]).toBeInstanceOf(Buffer);
  const bodyRequest = {
    on: jest.fn((event, callback) => {
      if (event === "data") callback("a=1&");
      if (event === "end") callback();
    }),
  };
  expect((await readRequestBody(bodyRequest)).get("a")).toBe("1");
});
