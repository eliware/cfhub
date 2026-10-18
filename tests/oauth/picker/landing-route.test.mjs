import { jest } from "@jest/globals";
import { serveOAuthPickerLandingRoute } from "../../../src/oauth/picker/landing-route.mjs";

test("serves the picker landing page without cache", () => {
  const response = { writeHead: jest.fn(), end: jest.fn() };
  expect(
    serveOAuthPickerLandingRoute({
      request: { method: "GET", headers: {} },
      response,
      url: new URL("http://localhost/"),
      scopePicker: true,
    }),
  ).toBe(true);
  expect(response.writeHead).toHaveBeenCalledWith(
    200,
    expect.objectContaining({ "cache-control": "no-store" }),
  );
  expect(response.end).toHaveBeenCalled();
});

test("ignores non-picker and non-landing requests", () => {
  const response = { writeHead: jest.fn(), end: jest.fn() };
  const base = {
    request: { method: "GET", headers: {} },
    response,
    url: new URL("http://localhost/"),
  };
  expect(serveOAuthPickerLandingRoute({ ...base, scopePicker: false })).toBe(false);
  expect(
    serveOAuthPickerLandingRoute({
      ...base,
      scopePicker: true,
      url: new URL("http://localhost/other"),
    }),
  ).toBe(false);
  expect(
    serveOAuthPickerLandingRoute({
      ...base,
      scopePicker: true,
      request: { method: "POST", headers: {} },
    }),
  ).toBe(false);
  expect(response.writeHead).not.toHaveBeenCalled();
});
