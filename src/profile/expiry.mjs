import { readProfiles, writeProfiles } from "./store.mjs";

export async function removeExpiredProfile(name, homeDir, fsImpl, deleteCredential) {
  await deleteCredential(name);
  const data = readProfiles(homeDir, fsImpl);
  delete data.profiles[name];
  data.active = data.active === name ? Object.keys(data.profiles)[0] || null : data.active;
  writeProfiles(data, homeDir, fsImpl);
}
