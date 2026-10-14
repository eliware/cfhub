import http from "node:http";
import { loginOAuth } from "../../src/oauth.mjs";

export async function startOAuthTestLogin({ fetchImpl, open, setTimeoutImpl }) {
  const printed = [];
  let closeServer = () => {};
  const promise = loginOAuth({
    clientId: "client",
    ports: [0],
    open,
    print: (value) => printed.push(value),
    fetchImpl,
    setTimeoutImpl: setTimeoutImpl ?? ((callback) => (closeServer = callback)),
  });
  await new Promise((resolve) => setTimeout(resolve, 10));
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
  return new Promise((resolve, reject) =>
    http
      .get(url, (response) => {
        let body = "";
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => resolve({ statusCode: response.statusCode, body }));
      })
      .on("error", reject),
  );
}
