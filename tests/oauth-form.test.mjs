import { jest } from "@jest/globals";
import { readRequestBody } from "../src/oauth-form.mjs";

test("reads multi-part form data into search params", async () => {
  const request = {
    on: jest.fn((event, callback) => {
      if (event === "data") callback("scope=zone.read&");
      if (event === "data") callback("scope=dns.read");
      if (event === "end") callback();
    }),
  };
  await expect(readRequestBody(request)).resolves.toEqual(
    new URLSearchParams("scope=zone.read&scope=dns.read"),
  );
});
