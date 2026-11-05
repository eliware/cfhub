const positionalArgs = {
  alias: { set: "<name> <command>", delete: "<name>" },
  config: { get: "<name>", set: "<name> <value>", unset: "<name>" },
  extension: {
    info: "--name <name>",
    remove: "--name <name>",
    install: "--path <directory>",
    upgrade: "--path <directory>",
  },
};

export function positional(resource, action) {
  return positionalArgs[resource]?.[action] || "";
}
