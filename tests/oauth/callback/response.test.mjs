import { jest } from "@jest/globals";
import {
  callbackProviderError,
  callbackStateError,
} from "../../../src/oauth/callback/response.mjs";

const response = () => ({ writeHead: jest.fn(), end: jest.fn() });

test("callback state errors return the expired page and login error", () => {
  const output = response();
  expect(callbackStateError(output).message).toContain("login expired");
  expect(output.end.mock.calls[0][0]).toContain("Authorization request expired");
});

test("provider errors show the right title and supplied detail", () => {
  const output = response();
  expect(callbackProviderError(output, "access_denied", "Stopped").message).toContain(
    "authorization failed",
  );
  expect(output.end.mock.calls[0][0]).toContain("Authorization cancelled");
  expect(output.end.mock.calls[0][0]).toContain("Stopped");
});

test("other provider errors use the failure title and default detail", () => {
  const output = response();
  callbackProviderError(output, "server_error");
  expect(output.end.mock.calls[0][0]).toContain("Authorization failed");
  expect(output.end.mock.calls[0][0]).toContain("request was not completed");
});
