export function interruptProcess(kill, processId) {
  return kill(processId, "SIGINT");
}
