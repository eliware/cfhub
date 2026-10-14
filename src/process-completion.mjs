export function waitForProcess(child) {
  return new Promise((resolve) => {
    const onError = (error) => {
      child.off("close", onClose);
      resolve({ error, exitCode: 1 });
    };
    const onClose = (exitCode) => {
      child.off("error", onError);
      resolve({ error: null, exitCode });
    };
    child.once("error", onError);
    child.once("close", onClose);
  });
}
