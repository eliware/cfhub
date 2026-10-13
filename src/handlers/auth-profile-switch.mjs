export function switchAuthProfile({ opts, data, write, profileHome, profileFs, printer, fail }) {
  const name = opts?.profile;
  if (!name || !data.profiles[name]) {
    fail(`Unknown profile: ${name || "(missing --profile)"}`);
    return;
  }
  data.active = name;
  write(data, profileHome, profileFs);
  return printer.log(`Activated profile ${name}`);
}
