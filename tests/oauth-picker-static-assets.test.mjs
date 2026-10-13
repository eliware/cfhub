import { jest } from "@jest/globals";
import { serveOAuthPickerStaticAsset } from "../src/oauth-picker-static-assets.mjs";

test("serves text and image assets only for enabled GET requests", () => {
  const response = { writeHead: jest.fn(), end: jest.fn() };
  const request = { method: "GET", headers: {} };
  expect(
    serveOAuthPickerStaticAsset({
      request,
      response,
      url: new URL("http://localhost/oauth-picker.css"),
      scopePicker: true,
    }),
  ).toBe(true);
  expect(response.writeHead).toHaveBeenLastCalledWith(200, expect.any(Object));
  expect(
    serveOAuthPickerStaticAsset({
      request,
      response,
      url: new URL("http://localhost/oauth-web/cloudflare-115x53.png"),
      scopePicker: true,
    }),
  ).toBe(true);
  expect(response.end.mock.calls.at(-1)[0]).toBeInstanceOf(Buffer);
  expect(
    serveOAuthPickerStaticAsset({
      request: { method: "POST", headers: {} },
      response,
      url: new URL("http://localhost/oauth-picker.css"),
      scopePicker: true,
    }),
  ).toBe(false);
});
