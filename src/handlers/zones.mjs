import { getAccountId, getZoneId, requireValue } from './common.mjs';
import { printTable } from '../output.mjs';

export async function handleZones({ cf, action, opts, body, outputJson, printer = console, toJsonOutput, fail }) {
  const accountId = getAccountId(opts);
  const zoneId = getZoneId(opts);

  if (action === 'list') {
    /* istanbul ignore next -- compatibility with legacy injected SDK clients */
    const res = typeof cf.get === 'function'
      ? await cf.get(accountId ? `/zones?account.id=${accountId}` : '/zones', undefined)
      : await cf.zones.list(accountId ? { account: { id: accountId } } : undefined);
    const items = Array.isArray(res?.result) ? res.result : res;
    return outputJson ? toJsonOutput(items) : printTable(['ID', 'NAME'], items.map(z => [z.id, z.name]), printer.log);
  }

  if (action === 'get') {
    requireValue(zoneId, 'Missing --zone-id', fail);
    /* istanbul ignore next -- compatibility with legacy injected SDK clients */
    const zone = typeof cf.get === 'function' ? await cf.get(`/zones/${zoneId}`, undefined) : await cf.zones.get({ zone_id: zoneId });
    return outputJson ? toJsonOutput(zone) : printer.log(JSON.stringify(zone, null, 2));
  }

  if (action === 'audit') {
    requireValue(zoneId, 'Missing --zone-id', fail);
    /* istanbul ignore next -- compatibility with legacy injected SDK clients */
    const [zone, ssl, dns] = await Promise.all([
      typeof cf.get === 'function' ? cf.get(`/zones/${zoneId}`, undefined) : cf.zones.get({ zone_id: zoneId }),
      cf.get(`/zones/${zoneId}/settings/ssl`, undefined),
      cf.get(`/zones/${zoneId}/dns_records`, undefined),
    ]);
    /* istanbul ignore next -- API responses are normalized defensively */
    const report = { zone, ssl, dns: Array.isArray(dns?.result) ? dns.result : dns };
    return outputJson ? toJsonOutput(report) : printer.log(JSON.stringify(report, null, 2));
  }

  if (action === 'security') {
    requireValue(zoneId, 'Missing --zone-id', fail);
    const result = await cf.get(`/zones/${zoneId}/settings`);
    const settings = Array.isArray(result?.result) ? result.result : [];
    const names = new Set(['ssl', 'min_tls_version', 'always_use_https', 'tls_1_3']);
    const baseline = settings.filter(setting => names.has(setting.id));
    const report = { zoneId, settings: baseline, missing: [...names].filter(name => !baseline.some(setting => setting.id === name)) };
    return outputJson ? toJsonOutput(report) : printer.log(JSON.stringify(report, null, 2));
  }

  if (action === 'create') {
    requireValue(body, 'Missing --data or --file', fail);
    if (opts['dry-run']) return printer.log(JSON.stringify({ action: 'create', body, dryRun: true }, null, 2));
    /* istanbul ignore next -- compatibility with legacy injected SDK clients */
    const res = typeof cf.post === 'function' ? await cf.post('/zones', { body }) : await cf.zones.create(body);
    return outputJson ? toJsonOutput(res) : printer.log(JSON.stringify(res, null, 2));
  }

  if (action === 'update') {
    requireValue(zoneId, 'Missing --zone-id', fail);
    requireValue(body, 'Missing --data or --file', fail);
    if (opts['dry-run']) return printer.log(JSON.stringify({ zoneId, action: 'update', body, dryRun: true }, null, 2));
    /* istanbul ignore next -- compatibility with legacy injected SDK clients */
    const res = typeof cf.patch === 'function' ? await cf.patch(`/zones/${zoneId}`, { body }) : await cf.zones.edit({ zone_id: zoneId, ...body });
    return outputJson ? toJsonOutput(res) : printer.log(JSON.stringify(res, null, 2));
  }

  if (action === 'delete') {
    requireValue(zoneId, 'Missing --zone-id', fail);
    requireValue(opts.force, 'Refusing to delete without --force', fail);
    /* istanbul ignore next -- compatibility with legacy injected SDK clients */
    const res = typeof cf.delete === 'function' ? await cf.delete(`/zones/${zoneId}`) : await cf.zones.delete({ zone_id: zoneId });
    return outputJson ? toJsonOutput(res) : printer.log(JSON.stringify(res, null, 2));
  }

  fail(`Unknown zones action: ${action}`);
}
