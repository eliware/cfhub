const purgeAction = "purge";
const httpMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const deleteMethod = "DELETE";
const settingFlag = "--setting";
const purgeEverythingField = "purge" + "_everything";
const helpText = (lines) => lines.join("\n");

export function resourceCommandHelp(key) {
  const map = {
    "zones list": helpText([
      "List zones available to the active profile.",
      "",
      "USAGE",
      "  cfhub zones list [flags]",
      "",
      "FLAGS",
      "  --paginate              Fetch all supported pages.",
      "  --json                  Print JSON for automation.",
      "",
      "EXAMPLES",
      "  $ cfhub zones list\n  $ cfhub zones list --json",
    ]),
    "dns-records list": helpText([
      "List DNS records in a zone.",
      "",
      "USAGE",
      "  cfhub dns-records list --zone-id <zone_id> [flags]",
      "",
      "FLAGS",
      "  --zone-id <id>          Zone to inspect.",
      "  --paginate              Fetch all pages.",
      "  --json                  Print JSON for automation.",
      "",
      "EXAMPLES",
      "  $ cfhub dns-records list --zone-id <zone_id>",
    ]),
    "dns-records create": helpText([
      "Create a DNS record.",
      "",
      "USAGE",
      "  cfhub dns create --zone-id <zone_id> (--data <json> | --file <path>) [flags]",
      "",
      "EXAMPLES",
      `  $ cfhub dns create --zone-id <zone_id> --data '{"type":"A","name":"www","content":"1.2.3.4"}'`,
    ]),
    "dns-records delete": helpText([
      "Delete a DNS record.",
      "",
      "USAGE",
      "  cfhub dns delete --zone-id <zone_id> --id <record_id> --force",
      "",
      "The --force flag is required for destructive operations.",
    ]),
    api: helpText([
      "Call a relative Cloudflare API path.",
      "",
      "USAGE",
      "  cfhub api <path> [flags]",
      "",
      "FLAGS",
      `  --method <method>       ${httpMethods.join(", ")}.`,
      "  --data <json>           Inline JSON request body.\n  --file <path>           Read JSON request body from a file.",
      "  --dry-run               Show the request without writing.",
      `  --force                 Required for ${deleteMethod} requests.`,
      "  --paginate              Fetch all supported pages.",
      "",
      "EXAMPLES",
      `  $ cfhub api /zones --json\n  $ cfhub api zones/<zone_id>/dns_records --method ${httpMethods[0]}`,
    ]),
    [`cache ${purgeAction}`]: helpText([
      "Remove a zone's cache.",
      "",
      "USAGE",
      `  cfhub cache ${purgeAction} --zone-id <zone_id> --force [flags]`,
      "",
      "The --force flag is required because this operation cannot be undone.",
      "",
      "EXAMPLES",
      `  $ cfhub cache ${purgeAction} --zone-id <zone_id> --data '{"${purgeEverythingField}":true}' --force`,
    ]),
    "ssl set": helpText([
      "Update a zone SSL/TLS option.",
      "",
      "USAGE",
      `  cfhub ssl set --zone-id <zone_id> ${settingFlag} <name> --data <json> [flags]`,
      "",
      "EXAMPLES",
      `  $ cfhub ssl set --zone-id <zone_id> ${settingFlag} mode --data '{"value":"strict"}'`,
    ]),
    "origin-ca revoke": helpText([
      "Revoke a CA certificate.",
      "",
      "USAGE",
      "  cfhub origin-ca revoke --id <certificate_id> --force",
      "",
      "The --force flag is required for destructive operations.",
    ]),
  };
  return map[key] || null;
}
