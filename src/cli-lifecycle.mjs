export function runCliLifecycle(run, processImpl = process, consoleImpl = console) {
  processImpl.noDeprecation = true;
  const onError = (error) => {
    consoleImpl.error(error?.message || error);
    processImpl.exitCode = 1;
  };
  processImpl.on("uncaughtException", onError);
  processImpl.on("unhandledRejection", onError);
  const onSignal = (signal) => {
    processImpl.removeListener("uncaughtException", onError);
    processImpl.removeListener("unhandledRejection", onError);
    processImpl.exit(signal === "SIGINT" ? 130 : 143);
  };
  processImpl.once("SIGINT", () => onSignal("SIGINT"));
  processImpl.once("SIGTERM", () => onSignal("SIGTERM"));
  return run().catch(onError);
}
