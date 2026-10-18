export function reportTokenLogin({ name, tokenInfo, printer }) {
  const summary = tokenInfo.permissionSummary;
  const discovered = tokenInfo.permissionsKnown
    ? `\nPermissions discovered: ${summary.total} (Read: ${summary.read}, Write/Edit: ${summary.write}, Other: ${summary.other})`
    : "";
  return printer.log(`Saved and activated profile ${name}${discovered}`);
}
