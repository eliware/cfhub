import http from "node:http";

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
