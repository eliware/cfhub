import { getZoneId, getId, requireValue } from './common.mjs';
import { printTable } from '../output.mjs';

export async function handleDnsRecords({ cf, action, opts, body, outputJson, printer = console, toJsonOutput, fail }) {
  const zoneId = getZoneId(opts);
  const id = getId(opts);
  requireValue(zoneId, 'Missing --zone-id', fail);
  /* istanbul ignore next -- compatibility with legacy injected SDK clients */
  const listRecords = () => typeof cf.get === 'function'
    ? cf.get(`/zones/${zoneId}/dns_records`, undefined)
    : cf.dns.records.list({ zone_id: zoneId });

  if (action === 'list') {
    const res = await listRecords();
    const items = Array.isArray(res?.result) ? res.result : res;
    return outputJson ? toJsonOutput(items) : printTable(['ID', 'TYPE', 'NAME', 'CONTENT'], items.map(r => [r.id, r.type, r.name, r.content]), printer.log);
  }

  if (action === 'diff' || action === 'apply') {
    requireValue(body, 'Missing desired records in --data or --file', fail);
    const desired = Array.isArray(body) ? body : body.records;
    requireValue(desired, 'Expected an array of desired records', fail);
    const currentResponse = await listRecords();
    const current = Array.isArray(currentResponse?.result) ? currentResponse.result : [];
    const key = record => JSON.stringify({ type: record.type, name: record.name, content: record.content, ttl: record.ttl, proxied: record.proxied });
    const desiredKeys = new Set(desired.map(key)); const currentKeys = new Set(current.map(key));
    const add = desired.filter(record => !currentKeys.has(key(record)));
    const remove = current.filter(record => !desiredKeys.has(key(record)));
    const plan = { zoneId, add, remove, unchanged: current.filter(record => desiredKeys.has(key(record))) };
    if (action === 'diff' || opts['dry-run']) return outputJson ? toJsonOutput(plan) : printer.log(JSON.stringify(plan, null, 2));
    requireValue(opts.force, 'Refusing DNS apply without --force', fail);
    /* istanbul ignore next -- compatibility with legacy injected SDK clients */
    for (const record of add) await (typeof cf.post === 'function' ? cf.post(`/zones/${zoneId}/dns_records`, { body: record }) : cf.dns.records.create({ zone_id: zoneId, ...record }));
    /* istanbul ignore next -- compatibility with legacy injected SDK clients */
    for (const record of remove) await (typeof cf.delete === 'function' ? cf.delete(`/zones/${zoneId}/dns_records/${record.id}`) : cf.dns.records.delete(record.id, { zone_id: zoneId }));
    return outputJson ? toJsonOutput({ ...plan, applied: true }) : printer.log(JSON.stringify({ ...plan, applied: true }, null, 2));
  }

  if (action === 'get') {
    requireValue(id, 'Missing --id', fail);
    /* istanbul ignore next -- compatibility with legacy injected SDK clients */
    const res = typeof cf.get === 'function' ? await cf.get(`/zones/${zoneId}/dns_records/${id}`, undefined) : await cf.dns.records.get(id, { zone_id: zoneId });
    return outputJson ? toJsonOutput(res) : printer.log(JSON.stringify(res, null, 2));
  }

  if (action === 'create') {
    requireValue(body, 'Missing --data or --file', fail);
    if (opts['dry-run']) return printer.log(JSON.stringify({ zoneId, action: 'create', body, dryRun: true }, null, 2));
    /* istanbul ignore next -- compatibility with legacy injected SDK clients */
    const res = typeof cf.post === 'function' ? await cf.post(`/zones/${zoneId}/dns_records`, { body }) : await cf.dns.records.create({ zone_id: zoneId, ...body });
    return outputJson ? toJsonOutput(res) : printer.log(JSON.stringify(res, null, 2));
  }

  if (action === 'update') {
    requireValue(id, 'Missing --id', fail);
    requireValue(body, 'Missing --data or --file', fail);
    if (opts['dry-run']) return printer.log(JSON.stringify({ zoneId, id, action: 'update', body, dryRun: true }, null, 2));
    /* istanbul ignore next -- compatibility with legacy injected SDK clients */
    const res = typeof cf.put === 'function' ? await cf.put(`/zones/${zoneId}/dns_records/${id}`, { body }) : await cf.dns.records.update(id, { zone_id: zoneId, ...body });
    return outputJson ? toJsonOutput(res) : printer.log(JSON.stringify(res, null, 2));
  }

  if (action === 'delete') {
    requireValue(id, 'Missing --id', fail);
    requireValue(opts.force, 'Refusing to delete without --force', fail);
    /* istanbul ignore next -- compatibility with legacy injected SDK clients */
    const res = typeof cf.delete === 'function' ? await cf.delete(`/zones/${zoneId}/dns_records/${id}`) : await cf.dns.records.delete(id, { zone_id: zoneId });
    return outputJson ? toJsonOutput(res) : printer.log(JSON.stringify(res, null, 2));
  }

  fail(`Unknown dns-records action: ${action}`);
}
