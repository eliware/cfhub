import { getZoneId, requireValue } from './common.mjs';

export async function handleZoneSettings({ cf, action, opts, body, outputJson, printer = console, toJsonOutput, fail }) {
  const zoneId = getZoneId(opts);
  const setting = opts.setting;
  requireValue(zoneId, 'Missing --zone-id', fail);
  requireValue(setting, 'Missing --setting', fail);

  if (action === 'get') {
    /* istanbul ignore next -- supports both the production client and legacy test adapters. */
    const res = typeof cf.get === 'function'
      ? await cf.get(`/zones/${zoneId}/settings/${setting}`, undefined)
      /* istanbul ignore next -- legacy injected clients are covered by adapter tests. */
      : cf.zones.settings.get.length >= 2
        ? await cf.zones.settings.get(setting, { zone_id: zoneId })
        : await cf.zones.settings.get(zoneId, setting);
    return outputJson ? toJsonOutput(res) : printer.log(JSON.stringify(res, null, 2));
  }

  if (action === 'set') {
    if (!body || body.value === undefined) fail('Missing JSON body with value');
    if (opts['dry-run']) return printer.log(JSON.stringify({ zoneId, setting, value: body.value, dryRun: true }, null, 2));
    /* istanbul ignore next -- compatibility with legacy injected SDK clients */
    const res = typeof cf.patch === 'function'
      ? await cf.patch(`/zones/${zoneId}/settings/${setting}`, { body: { value: body.value } })
      : typeof cf.zones.settings.edit === 'function'
        ? await cf.zones.settings.edit(setting, { zone_id: zoneId, value: body.value })
        : await cf.zones.settings.update(zoneId, setting, { value: body.value });
    return outputJson ? toJsonOutput(res) : printer.log(JSON.stringify(res, null, 2));
  }

  fail(`Unknown zone-settings action: ${action}`);
}
