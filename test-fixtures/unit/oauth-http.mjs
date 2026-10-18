import http from "node:http";
import { loginOAuth } from "../../src/oauth.mjs";

export async function startOAuthTestLogin({ fetchImpl, open, setTimeoutImpl, options = {} }) {
  const printed = [];
  let closeServer = () => {};
  let resolveStarted;
  const started = new Promise((resolve) => {
    resolveStarted = resolve;
  });
  const promise = loginOAuth({
    ...options,
    clientId: "client",
    ports: options.ports || [0],
    open: (...args) => {
      try {
        return open(...args);
      } finally {
        resolveStarted();
      }
    },
    print: (value) => printed.push(value),
    fetchImpl,
    setTimeoutImpl: setTimeoutImpl ?? ((callback) => (closeServer = callback)),
  });
  await started;
  const authorization = new URL(printed[0].match(/https?:\/\/\S+/)[0]);
  return { printed, promise, authorization, closeServer: () => closeServer() };
}

export function makeOAuthCallbackUrl(authorization, values = {}) {
  const callback = new URL(authorization.searchParams.get("redirect_uri"));
  callback.searchParams.set("state", authorization.searchParams.get("state"));
  for (const [key, value] of Object.entries(values)) callback.searchParams.set(key, value);
  return callback;
}

export function getOAuthResponse(url) {
  return requestOAuthResponse(url);
}

export function requestOAuthResponse(url, { method = "GET", headers, body: payload } = {}) {
  return new Promise((resolve, reject) =>
    http
      .request(url, { method, headers }, (response) => {
        let responseBody = "";
        response.on("data", (chunk) => {
          responseBody += chunk;
        });
        response.on("end", () =>
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            body: responseBody,
          }),
        );
      })
      .on("error", reject)
      .end(payload),
  );
}
