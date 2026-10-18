import { updateNotice } from "../update/check.mjs";

export async function showUpdateNotice({
  updateCheck,
  currentVersion,
  homeDir,
  env,
  fsImpl,
  printer,
}) {
  try {
    const latestVersion = await updateCheck({ currentVersion, homeDir, env, fsImpl });
    const notice = updateNotice(latestVersion, currentVersion);
    if (notice) printer.error(notice);
  } catch {}
}
