export function projectAuthProfiles(data, resource) {
  const profiles = Object.entries(data.profiles).map(([name, value]) => ({
    name,
    active: name === data.active,
    authMethod: value.authMethod || (resource === "auth" ? "api-token" : "oauth"),
  }));
  return profiles.length
    ? profiles
    : [{ name: "environment", active: true, authMethod: "not configured" }];
}
