export function platformResourceHelp(resource) {
  const map = {
    workers: `workers
  list                  List Workers scripts
  get --id <name>       Get a Workers script
  create/update         Write a Workers resource (--data or --file)
  delete --id <name>    Delete a Workers resource (requires --force)`,
    pages: `pages
  list/get/create/update/delete  Manage Pages projects`,
    r2: `r2
  list/get/create/update/delete  Manage R2 buckets`,
    d1: `d1
  list/get/create/update/delete  Manage D1 databases`,
    queues: `queues
  list/get/create/update/delete  Manage Queues`,
    stream: `stream
  list/get/create/update/delete  Manage Stream resources`,
    images: `images
  list/get/create/update/delete  Manage Images resources`,
    ai: `ai
  list/get/create/update/delete  Manage AI resources`,
    access: `access
  list/get/create/update/delete  Manage Access applications`,
    extension: `extension
  list                 List installed extensions
  info                 Show installed extension metadata
  install              Install from a local extension directory
  upgrade              Replace an installed extension from a local directory
  remove               Remove an extension (requires --force)`,
    alias: `alias
  list                 List saved command aliases
  set <name> <command> Save a command alias
  delete <name>        Delete a command alias`,
    config: `config
  list                 List saved configuration
  get <name>           Read a configuration value
  set <name> <value>   Save a configuration value
  unset <name>        Remove a configuration value`,
  };
  return map[resource] || null;
}
