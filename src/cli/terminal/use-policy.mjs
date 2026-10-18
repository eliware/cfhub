export function requiresTerminalOutput({ pager, opts, settings }) {
  return Boolean(
    pager ||
    opts.color !== undefined ||
    opts.width !== undefined ||
    settings.color ||
    settings.width,
  );
}
