export function permissionNames(details) {
  return [
    ...new Set(
      (details?.result?.policies || [])
        .filter((policy) => policy.effect !== "deny")
        .flatMap((policy) => policy.permission_groups || [])
        .map((group) => group.name)
        .filter(Boolean),
    ),
  ].sort();
}

export function summarizePermissions(permissions = []) {
  const summary = { total: permissions.length, read: 0, write: 0, other: 0 };
  for (const permission of permissions) {
    if (/\b(read|view|list)\b/i.test(permission)) summary.read++;
    else if (/\b(write|edit|create|delete|purge|manage)\b/i.test(permission)) summary.write++;
    else summary.other++;
  }
  return summary;
}
