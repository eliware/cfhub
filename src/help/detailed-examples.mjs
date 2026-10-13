export const detailedExamples = () => `Examples:
  cfhub zones list
  cfhub zones get --zone-id <zone_id>
  cfhub zones create --data '{"account":{"id":"..."},"name":"example.com","type":"full"}'
  cfhub zone-settings get --zone-id <zone_id> --setting development_mode
  cfhub zone-settings set --zone-id <zone_id> --setting development_mode --data '{"value":"on"}'
  cfhub dns-records list --zone-id <zone_id>
  cfhub dns-records create --zone-id <zone_id> --data '{"type":"A","name":"www","content":"1.2.3.4"}'
  cfhub rulesets list --zone-id <zone_id>
  cfhub rulesets update --zone-id <zone_id> --id <ruleset_id> --file ruleset.json
  cfhub lists list --account-id <account_id>
  cfhub list-items list --account-id <account_id> --id <list_id>
  cfhub zones list
  cfhub api /zones --json
  cfhub api zones/<zone_id>/dns_records --json
  cfhub auth login
  cfhub oauth status
  cfhub oauth login --profile work                # OAuth browser flow
  printf '%s' "$CLOUDFLARE_API_TOKEN" | cfhub auth login --profile ci --token-stdin
  cfhub oauth switch --profile work
  cfhub oauth logout --profile work
  cfhub ssl get --zone-id <zone_id>
  cfhub cache purge --zone-id <zone_id> --data '{"purge_everything":true}' --force
  cfhub health list --zone-id <zone_id>
  cfhub audit list --account-id <account_id>
  cfhub inventory export --account-id <account_id> --json
  cfhub origin-ca list --json
`;
