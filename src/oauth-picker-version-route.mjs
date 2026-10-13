import { VERSION } from "./version.mjs";

export function serveOAuthPickerVersionRoute({ request, response, url }) {
  if (url.pathname !== "/api/version" || request.method !== "GET") return false;
  const project = url.searchParams.get("project");
  if (project !== "cfhub") {
    response.writeHead(404, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ error: `Project not found: ${project || ""}` }) + "\n");
    return true;
  }
  response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify({ name: "cfhub", version: VERSION }) + "\n");
  return true;
}
