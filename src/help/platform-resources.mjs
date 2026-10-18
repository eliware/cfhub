const readAction = "get";

export function platformResourceHelp(resource) {
  const map = {
    workers: `workers
  list                  List Workers scripts.
  ${readAction} --id <name>       Read one Workers script.
  create/update         Write a Workers resource with --data or --file.
  delete --id <name>    Delete a Workers resource. Requires --force.`,
    pages: `pages
  list/${readAction}/create/update/delete  Manage Pages projects.`,
    r2: `r2
  list/${readAction}/create/update/delete  Manage R2 buckets.`,
    d1: `d1
  list/${readAction}/create/update/delete  Manage D1 databases.`,
    queues: `queues
  list/${readAction}/create/update/delete  Manage Queues.`,
    stream: `stream
  list/${readAction}/create/update/delete  Manage Stream resources.`,
    images: `images
  list/${readAction}/create/update/delete  Manage Images resources.`,
    ai: `ai
  list/${readAction}/create/update/delete  Manage AI resources.`,
    access: `access
  list/${readAction}/create/update/delete  Manage Access applications.`,
    extension: `extension
  list                 List installed extensions.
  info                 Show installed extension details.
  install              Install from a local extension directory.
  upgrade              Replace an extension from a local directory.
  remove               Remove an extension. Requires --force.`,
    alias: `alias
  list                 List saved command aliases.
  set <name> <command> Save a command alias.
  delete <name>        Delete a command alias.`,
    config: `config
  list                 List saved configuration.
  ${readAction} <name>           Read a configuration value.
  set <name> <value>   Save a configuration value.
  unset <name>        Remove a configuration value.`,
  };
  return map[resource] || null;
}
