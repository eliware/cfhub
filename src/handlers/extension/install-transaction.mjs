import { cleanupExtension } from "./cleanup.mjs";
import { copyExtensionToStage, createExtensionStagingRoot } from "./staging.mjs";

export function installExtensionTransaction({ source, destination, root, name, fsImpl }) {
  let stagingRoot;
  let installedSuccessfully = false;
  let cleanupErrors;
  try {
    stagingRoot = createExtensionStagingRoot(root, fsImpl);
    const stagedDestination = copyExtensionToStage({ source, stagingRoot, name, fsImpl });
    fsImpl.renameSync(stagedDestination, destination);
    installedSuccessfully = true;
  } finally {
    cleanupErrors = cleanupExtension({ stagingRoot, installedSuccessfully, fsImpl });
  }
  return cleanupErrors;
}
