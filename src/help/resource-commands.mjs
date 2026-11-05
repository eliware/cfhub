import { actionCommandHelp } from "./action/command/command.mjs";

export function resourceCommandHelp(key) {
  const [resource, action] = key.split(" ");
  return actionCommandHelp(resource, action);
}
