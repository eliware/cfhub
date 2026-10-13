export function securityResourceHelp(resource) {
  const map = {
    ssl: `ssl
  get                  Read a zone SSL/TLS setting
  set                  Update a zone SSL/TLS setting
  certificates         List certificate packs
  coverage             Summarize certificate host coverage`,
    cache: `cache
  purge                Purge zone cache (requires --force)`,
    health: `health
  list                 List zone health checks
  get                  Get a health check
  create               Create a health check
  delete               Delete a health check (requires --force)`,
    audit: `audit
  list                 List account audit logs`,
    inventory: `inventory
  export               Export zones, DNS records, and SSL settings`,
    "origin-ca": `origin-ca
  list                 List Origin CA certificates
  create               Create an Origin CA certificate
  revoke               Revoke a certificate (requires --force)`,
    "load-balancer": `load-balancer
  list/get/create/update/delete  Manage zone Load Balancers`,
    tunnel: `tunnel
  list/get/create/update/delete  Manage account tunnels`,
  };
  return map[resource] || null;
}
