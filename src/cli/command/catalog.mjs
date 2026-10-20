export const COMMAND_GROUPS = [
  {
    title: "CORE COMMANDS",
    commands: [
      ["auth", "Save and manage API-token profiles."],
      ["oauth", "Manage OAuth browser authentication."],
      ["zones", "Manage zones."],
      ["dns-records", "Manage DNS records."],
      ["zone-settings", "Manage zone options."],
      ["rulesets", "Manage rulesets."],
      ["lists", "Manage account lists."],
      ["list-items", "Manage account list items."],
      ["ssl", "Inspect and configure SSL/TLS."],
      ["cache", "Manage cache settings."],
      ["api", "Make an authenticated Cloudflare API request."],
    ],
  },
  {
    title: "ACCOUNT COMMANDS",
    commands: [
      ["health", "Check Cloudflare API access."],
      ["audit", "View account audit logs."],
      ["inventory", "Export account inventory."],
      ["origin-ca", "Manage CA certificates."],
      ["load-balancer", "Manage zone load balancers."],
      ["tunnel", "Manage account tunnels."],
    ],
  },
  {
    title: "PLATFORM COMMANDS",
    commands: [
      ["workers", "Manage Workers."],
      ["pages", "Manage Pages projects."],
      ["r2", "Manage R2 buckets."],
      ["d1", "Manage D1 databases."],
      ["queues", "Manage Queues."],
      ["stream", "Manage Stream."],
      ["images", "Manage Images."],
      ["ai", "Manage AI and Vectorize."],
      ["access", "Manage Access and Zero Trust."],
      ["extension", "Manage local cfhub extensions."],
      ["alias", "Manage command aliases."],
      ["config", "Manage local cfhub options."],
    ],
  },
];

export const GLOBAL_FLAGS = [
  ["--help", "Show help for a command."],
  ["--version", "Show the version."],
  ["--json", "Print JSON output."],
  ["--output", "Select json or text output."],
  ["--jq", "Select fields from JSON output."],
  ["--template", "Format JSON values with {{.field}} placeholders."],
  ["--quiet", "Suppress standard output."],
  ["--pager", "Page readable output."],
  ["--no-pager", "Disable paging."],
  ["--color", "Set a color mode."],
  ["--width", "Set terminal width."],
  ["--verbose", "Include diagnostic details."],
  ["--paginate", "Fetch all supported pages."],
  ["--web", "Print a Cloudflare dashboard link."],
  ["--force", "Confirm destructive actions."],
  ["--dry-run", "Show changes without writing."],
  ["--account-id", "Cloudflare account ID."],
  ["--zone-id", "Cloudflare zone ID."],
  ["--file", "Read a JSON request body."],
  ["--data", "Use an inline JSON request body."],
];

export const COMMAND_NAMES = COMMAND_GROUPS.flatMap(({ commands }) =>
  commands.map(([name]) => name),
);
export const GLOBAL_FLAG_NAMES = GLOBAL_FLAGS.map(([name]) => name);
