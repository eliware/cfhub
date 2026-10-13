export function resourceCommandHelp(key) {
  const map = {
    "zones list": `List zones available to the active profile.

USAGE
  cfhub zones list [flags]

FLAGS
  --paginate              Fetch all supported pages
  --json                  Emit machine-readable JSON

EXAMPLES
  $ cfhub zones list
  $ cfhub zones list --json`,
    "dns-records list": `List DNS records in a zone.

USAGE
  cfhub dns-records list --zone-id <zone_id> [flags]

FLAGS
  --zone-id <id>          Zone to inspect
  --paginate              Fetch all pages
  --json                  Emit machine-readable JSON

EXAMPLES
  $ cfhub dns-records list --zone-id <zone_id>`,
    "dns-records create": `Create a DNS record.

USAGE
  cfhub dns create --zone-id <zone_id> (--data <json> | --file <path>) [flags]

EXAMPLES
  $ cfhub dns create --zone-id <zone_id> --data '{"type":"A","name":"www","content":"1.2.3.4"}'`,
    "dns-records delete": `Delete a DNS record.

USAGE
  cfhub dns delete --zone-id <zone_id> --id <record_id> --force

The --force flag is required for destructive operations.`,
    api: `Call any relative Cloudflare API path.

USAGE
  cfhub api <path> [flags]

FLAGS
  --method <method>       GET, POST, PUT, PATCH, or DELETE
  --data <json>           Inline JSON request body
  --file <path>           Read JSON request body from a file
  --dry-run               Show the request without writing
  --force                 Required for DELETE requests
  --paginate              Fetch all supported pages

EXAMPLES
  $ cfhub api /zones --json
  $ cfhub api zones/<zone_id>/dns_records --method GET`,
    "cache purge": `Purge a zone's cache.

USAGE
  cfhub cache purge --zone-id <zone_id> --force [flags]

The --force flag is required because this operation cannot be undone.

EXAMPLES
  $ cfhub cache purge --zone-id <zone_id> --data '{"purge_everything":true}' --force`,
    "ssl set": `Update a zone SSL/TLS setting.

USAGE
  cfhub ssl set --zone-id <zone_id> --setting <name> --data <json> [flags]

EXAMPLES
  $ cfhub ssl set --zone-id <zone_id> --setting mode --data '{"value":"strict"}'`,
    "origin-ca revoke": `Revoke an Origin CA certificate.

USAGE
  cfhub origin-ca revoke --id <certificate_id> --force

The --force flag is required for destructive operations.`,
  };
  return map[key] || null;
}
