import os from 'node:os';

export function configRoot(homeDir = os.homedir(), env = process.env) {
  if (homeDir === os.homedir() && env.CF_CONFIG_DIR) return env.CF_CONFIG_DIR;
  if (homeDir === os.homedir() && env.XDG_CONFIG_HOME) return `${env.XDG_CONFIG_HOME}/cfhub`;
  return `${homeDir}/.config/cfhub`;
}
