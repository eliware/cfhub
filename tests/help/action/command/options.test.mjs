import { optionLines, requiredOptions } from "../../../../src/help/action/command/options.mjs";

test("formats scope and body requirements", () => {
  expect(requiredOptions("dns-records", "create")).toContain("--zone-id <zone_id>");
  expect(requiredOptions("dns-records", "create")).toContain("--data <json> | --file <path>");
  expect(requiredOptions("rulesets", "list")).toContain("--account-id <account_id>");
  expect(requiredOptions("list-items", "list")).toContain("--id <list_id>");
});

test("lists action options and defaults", () => {
  const items = optionLines("list-items", "list").join("\n");
  expect(items).toContain("--paginate");
  expect(items).toContain("default with --paginate: 100");
  expect(optionLines("ssl", "get").join("\n")).toContain("default: ssl");
});

test("adds safeguards to destructive operations", () => {
  expect(optionLines("cache", "purge").join("\n")).toContain("--force");
  expect(optionLines("extension", "remove").join("\n")).toContain("--force");
  expect(optionLines("config", "unset").join("\n")).not.toContain("--force");
});
