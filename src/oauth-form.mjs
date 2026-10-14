const MAX_OAUTH_FORM_BYTES = 16 * 1024;

export function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    let size = 0;
    let settled = false;
    request.on("data", (chunk) => {
      if (settled) return;
      const value = Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk);
      size += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(value);
      if (size > MAX_OAUTH_FORM_BYTES) {
        settled = true;
        reject(Object.assign(new Error("OAuth request body is too large"), { statusCode: 413 }));
        return;
      }
      body += value;
    });
    request.on("end", () => {
      if (settled) return;
      settled = true;
      resolve(new URLSearchParams(body));
    });
    request.on("error", (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    });
  });
}
