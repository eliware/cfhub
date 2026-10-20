const htmlContentType = `text/html${String.fromCharCode(59)} charset=utf-8`;
const failurePage =
  "<!doctype html><title>cfhub authorization failed</title><p>Cloudflare authorization could not be completed. You may close this window and try again.</p>";

export function writeOAuthTokenSuccess(response, page) {
  response.writeHead(200, { "content-type": htmlContentType });
  response.end(page);
}

export function writeOAuthTokenFailure(response) {
  response.writeHead(400, { "content-type": htmlContentType });
  response.end(failurePage);
}
