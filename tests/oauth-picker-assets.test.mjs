import { jest } from "@jest/globals";
import {
  ALLOWED_OAUTH_SCOPES,
  pickerAsset,
  pickerHtml,
  readRequestBody,
  sendAsset,
} from "../src/oauth-picker-assets.mjs";

test("picker asset helpers load browser data and respond with content", async () => {
  expect(ALLOWED_OAUTH_SCOPES.has("zone.read")).toBe(true);
  expect(pickerAsset("oauth-web/cf-logo.svg")).toContain("svg");
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
});
