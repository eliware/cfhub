export async function showUserTokenStatus({
  resource,
  statusProfile,
  data,
  cf,
  outputJson,
  toJsonOutput,
  printer,
}) {
  const identity = await cf.get("/user");
  const status = {
    authenticated: true,
    profile: statusProfile,
    method:
      resource === "oauth" ? "oauth" : data.profiles[statusProfile]?.authMethod || "api-token",
    id: identity?.result?.id || null,
    email: identity?.result?.email || null,
  };
  return outputJson
    ? toJsonOutput(status)
    : printer.log(`${status.profile} authenticated${status.email ? ` as ${status.email}` : ""}`);
}
