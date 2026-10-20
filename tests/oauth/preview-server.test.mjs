import { registerOAuthPickerPreview } from "../../src/oauth/preview-server.mjs";

function createServer() {
  return {
    setOAuthRequestHandler(handler) {
      this.handleRequest = handler;
    },
  };
}

function createResponse() {
  return {
    writeHead(status, headers) {
      this.status = status;
      this.headers = headers;
    },
    end(body = "") {
      this.body = body;
    },
  };
}

test("registers a preview route and starts with required default scopes", async () => {
  const server = createServer();
  const preview = registerOAuthPickerPreview(server);
  const response = createResponse();
  await server.handleRequest(
    { method: "GET", url: "/api/version?project=cfhub", headers: {} },
    response,
  );
  expect(response.status).toBe(200);
  expect(JSON.parse(response.body)).toMatchObject({ name: "cfhub" });
  expect(preview.getSelectedScopes()).toContain("user-details.read");
});

test("updates preview scopes and redirects to the OAuth authorization page", async () => {
  const server = createServer();
  const preview = registerOAuthPickerPreview(server, { scopes: ["zone.read"] });
  const response = createResponse();
  await server.handleRequest(
    {
      method: "POST",
      url: "/oauth/start",
      headers: {},
      body: "scope=dns.read",
    },
    response,
  );
  expect(response.status).toBe(302);
  expect(new URL(response.headers.location).searchParams.get("scope")).toContain("dns.read");
  expect(preview.getSelectedScopes()).toContain("dns.read");
});
