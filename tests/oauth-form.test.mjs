import { jest } from "@jest/globals";
import { EventEmitter } from "node:events";
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

test("rejects oversized request bodies and ignores later events", async () => {
  const request = new EventEmitter();
  const body = readRequestBody(request);
  request.emit("data", Buffer.alloc(16 * 1024 + 1, 97));
  request.emit("data", "ignored");
  request.emit("end");
  request.emit("error", new Error("late error"));
  await expect(body).rejects.toMatchObject({
    message: "OAuth request body is too large",
    statusCode: 413,
  });
});

test("rejects request stream errors", async () => {
  const request = new EventEmitter();
  const body = readRequestBody(request);
  const error = new Error("stream failed");
  request.emit("error", error);
  await expect(body).rejects.toBe(error);
});
