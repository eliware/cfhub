export function runCliLifecycle(run, processImpl = process, consoleImpl = console) {
  processImpl.noDeprecation = true;
  const onError = (error) => {
    consoleImpl.error(error?.message || error);
    processImpl.exitCode = 1;
  };
  processImpl.on("uncaughtException", onError);
  processImpl.on("unhandledRejection", onError);
  const onSignal = () => {
    processImpl.removeListener("uncaughtException", onError);
    processImpl.removeListener("unhandledRejection", onError);
    processImpl.exitCode = 0;
  };
  processImpl.once("SIGINT", onSignal);
  processImpl.once("SIGTERM", onSignal);
  return run().catch(onError);
}
