const readAction = "get";
const removeAction = "purge";

export function securityResourceHelp(resource) {
  const map = {
    ssl: `ssl
  ${readAction}                  Read a zone SSL/TLS option.
  set                  Update a zone SSL/TLS option.
  certificates         List certificate packs.
  coverage             Summarize certificate host coverage.`,
    cache: `cache
  ${removeAction}                Remove zone cache. Requires --force.`,
    health: `health
  list                 List zone health checks.
  ${readAction}                  Read one health check.
  create               Create a health check.
  delete               Delete a health check. Requires --force.`,
    audit: `audit
  list                 List account audit logs.`,
    inventory: `inventory
  export               Export zones, DNS records, and SSL options.`,
    "origin-ca": `origin-ca
  list                 List CA certificates.
  create               Create a CA certificate.
  revoke               Revoke a certificate (requires --force)`,
    "load-balancer": `load-balancer
  list/${readAction}/create/update/delete  Manage zone load balancers.`,
    tunnel: `tunnel
  list/${readAction}/create/update/delete  Manage account tunnels.`,
  };
  return map[resource] || null;
}
