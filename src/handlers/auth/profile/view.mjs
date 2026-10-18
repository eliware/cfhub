import { printTable } from "../../../output/table.mjs";

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

export function outputAuthProfiles({ data, resource, outputJson, toJsonOutput, printer }) {
  const profiles = projectAuthProfiles(data, resource);
  return outputJson
    ? toJsonOutput(profiles)
    : printTable(
        ["ACTIVE", "NAME", "AUTH METHOD"],
        profiles.map((profile) => [profile.active ? "*" : "", profile.name, profile.authMethod]),
        printer.log,
      );
}
