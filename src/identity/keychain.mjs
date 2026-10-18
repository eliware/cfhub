const SERVICE = "cfhub";

export async function loadKeychain(importImpl = (name) => import(name)) {
  try {
    return (await importImpl("keytar")).default;
  } catch {
    return null;
  }
}

export async function readKeychainCredential(profile, loadKeychainImpl) {
  const store = await loadKeychainImpl();
  if (!store) return null;
  const value = await store.getPassword(SERVICE, profile);
  return value ? JSON.parse(value) : null;
}

export async function writeKeychainCredential(profile, value, loadKeychainImpl) {
  const store = await loadKeychainImpl();
  if (!store) return false;
  await store.setPassword(SERVICE, profile, JSON.stringify(value));
  return true;
}

export async function deleteKeychainCredential(profile, loadKeychainImpl) {
  const store = await loadKeychainImpl();
  return store ? store.deletePassword(SERVICE, profile) : false;
}
