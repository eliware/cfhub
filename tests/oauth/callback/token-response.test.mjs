import { jest } from "@jest/globals";
import {
  writeOAuthTokenFailure,
  writeOAuthTokenSuccess,
} from "../../../src/oauth/callback/token-response.mjs";

test("writes the OAuth success page with an HTML content type", () => {
  const response = { writeHead: jest.fn(), end: jest.fn() };
  writeOAuthTokenSuccess(response, "success page");
  expect(response.writeHead).toHaveBeenCalledWith(200, {
    "content-type": "text/html; charset=utf-8",
  });
  expect(response.end).toHaveBeenCalledWith("success page");
});

test("writes a safe OAuth failure page with an HTML content type", () => {
  const response = { writeHead: jest.fn(), end: jest.fn() };
  writeOAuthTokenFailure(response);
  expect(response.writeHead).toHaveBeenCalledWith(400, {
    "content-type": "text/html; charset=utf-8",
  });
  expect(response.end).toHaveBeenCalledWith(expect.stringContaining("authorization failed"));
});
