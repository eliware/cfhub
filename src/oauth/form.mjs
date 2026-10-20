const MAX_OAUTH_FORM_BYTES = 16 * 1024;

export function parseOAuthForm(body = "") {
  if (Buffer.byteLength(body) > MAX_OAUTH_FORM_BYTES)
    throw Object.assign(new Error("OAuth request body is too large"), { statusCode: 413 });
  return new URLSearchParams(body);
}
