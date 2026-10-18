import { jest } from "@jest/globals";
import { serveOAuthPickerVersionRoute } from "../../../src/oauth/picker/version-route.mjs";

test("serves the project version and rejects unknown projects", () => {
  const response = { writeHead: jest.fn(), end: jest.fn() };
  expect(
    serveOAuthPickerVersionRoute({
      request: { method: "GET" },
      response,
      url: new URL("http://localhost/api/version?project=cfhub"),
    }),
  ).toBe(true);
  expect(response.writeHead).toHaveBeenLastCalledWith(200, {
    "content-type": "application/json; charset=utf-8",
  });
  expect(JSON.parse(response.end.mock.calls.at(-1)[0])).toMatchObject({ name: "cfhub" });
  expect(
    serveOAuthPickerVersionRoute({
      request: { method: "GET" },
      response,
      url: new URL("http://localhost/api/version?project=other"),
    }),
  ).toBe(true);
  expect(response.writeHead).toHaveBeenLastCalledWith(404, expect.any(Object));
  serveOAuthPickerVersionRoute({
    request: { method: "GET" },
    response,
    url: new URL("http://localhost/api/version"),
  });
  expect(response.end.mock.calls.at(-1)[0]).toContain("Project not found: ");
  expect(
    serveOAuthPickerVersionRoute({
      request: { method: "POST" },
      response,
      url: new URL("http://localhost/api/version"),
    }),
  ).toBe(false);
});
