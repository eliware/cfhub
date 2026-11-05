import { commandNamesFor, resourceNames } from "../../../../src/suggestions.mjs";
import { actionCommandHelp } from "../../../../src/help/action/command/command.mjs";

const commandActions = resourceNames.flatMap((resource) =>
  commandNamesFor(resource).map((action) => [resource, action]),
);

test.each(commandActions)("%s %s help describes usage and defaults", (resource, action) => {
  const help = actionCommandHelp(resource, action);
  expect(help).toContain("USAGE");
  expect(help).toContain("ARGUMENTS");
  expect(help).toContain("OPTIONS");
  expect(help).toContain("DEFAULTS");
  expect(help).toContain(`cfhub ${resource}`);
});

test("list item help states required identifiers and pagination defaults", () => {
  const help = actionCommandHelp("list-items", "list");
  expect(help).toContain("--account-id <account_id>");
  expect(help).toContain("--id <list_id>");
  expect(help).toContain("--per-page <count>");
  expect(help).toContain("default with --paginate: 100");
});

test("write and destructive help explains JSON input and confirmation", () => {
  const create = actionCommandHelp("dns-records", "create");
  expect(create).toContain("--data <json> | --file <path>");
  expect(create).toContain("--dry-run");
  const remove = actionCommandHelp("list-items", "delete");
  expect(remove).toContain('--data {"ids":[<id>]}');
  expect(remove).toContain("--force");
});

test("API help documents the relative path and method default", () => {
  const help = actionCommandHelp("api", "/zones");
  expect(help).toContain("cfhub api <path>");
  expect(help).toContain("Relative Cloudflare API path");
  expect(help).toContain("default: GET");
});

test("zone list help uses its optional account filter instead of a zone ID", () => {
  const help = actionCommandHelp("zones", "list");
  expect(help).toContain("[--account-id <account_id>]");
  expect(help).toContain("CLOUDFLARE_ACCOUNT_ID");
  expect(help).not.toContain("--zone-id");
});

test("unknown action help is not generated", () => {
  expect(actionCommandHelp("zones", "unknown")).toBeNull();
});
