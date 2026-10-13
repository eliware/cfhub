export function localCommandHelp(key) {
  const map = {
    "extension remove": `Remove an installed extension.

USAGE
  cfhub extension remove <name> --force

The --force flag is required for destructive operations.`,
    "alias set": `Save a command alias.

USAGE
  cfhub alias set <name> <command...>

EXAMPLES
  $ cfhub alias set work 'zones list'`,
    "alias delete": `Delete a saved command alias.

USAGE
  cfhub alias delete <name>

EXAMPLES
  $ cfhub alias delete zones`,
    "config set": `Save a local cfhub configuration value.

USAGE
  cfhub config set <name> <value>`,
    "config unset": `Remove a local cfhub configuration value.

USAGE
  cfhub config unset <name>`,
  };
  return map[key] || null;
}
