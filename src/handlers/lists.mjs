import { getAccountId, getId, requireValue } from './common.mjs';
import { printTable } from '../output.mjs';

export async function handleLists({ cf, action, opts, body, outputJson, printer = console, toJsonOutput, fail }) {
  const accountId = getAccountId(opts);
  const id = getId(opts);
  requireValue(accountId, 'Missing --account-id or CLOUDFLARE_ACCOUNT_ID', fail);

  if (action === 'list') {
    /* istanbul ignore next -- compatibility with legacy injected SDK clients */
    const response = typeof cf.get === 'function' ? await cf.get(`/accounts/${accountId}/rules/lists`, undefined) : null;
    /* istanbul ignore next -- compatibility with legacy injected SDK clients */
    const items = response ? (Array.isArray(response.result) ? response.result : response) : [];
    /* istanbul ignore next -- compatibility with legacy injected SDK clients */
    if (!response) for await (const list of cf.rules.lists.list({ account_id: accountId })) items.push(list);
    return outputJson ? toJsonOutput(items) : printTable(['ID', 'NAME'], items.map(l => [l.id, l.name]), printer.log);
  }

  if (action === 'get') {
    requireValue(id, 'Missing --id', fail);
    /* istanbul ignore next -- compatibility with legacy injected SDK clients */
    const res = typeof cf.get === 'function' ? await cf.get(`/accounts/${accountId}/rules/lists/${id}`, undefined) : await cf.rules.lists.get(id, { account_id: accountId });
    return outputJson ? toJsonOutput(res) : printer.log(JSON.stringify(res, null, 2));
  }

  const base = `/accounts/${accountId}/rules/lists`;
  if (action === 'create') {
    requireValue(body, 'Missing --data or --file', fail);
    if (opts['dry-run']) return printer.log(JSON.stringify({ action, accountId, body, dryRun: true }, null, 2));
    const res = await cf.post(base, { body });
    return outputJson ? toJsonOutput(res) : printer.log(JSON.stringify(res, null, 2));
  }
  if (action === 'update') {
    requireValue(id, 'Missing --id', fail);
    requireValue(body, 'Missing --data or --file', fail);
    if (opts['dry-run']) return printer.log(JSON.stringify({ action, accountId, id, body, dryRun: true }, null, 2));
    const res = await cf.put(`${base}/${id}`, { body });
    return outputJson ? toJsonOutput(res) : printer.log(JSON.stringify(res, null, 2));
  }
  if (action === 'delete') {
    requireValue(id, 'Missing --id', fail);
    requireValue(opts.force, 'Refusing lists delete without --force', fail);
    const res = await cf.delete(`${base}/${id}`);
    return outputJson ? toJsonOutput(res) : printer.log(JSON.stringify(res, null, 2));
  }

  fail(`Unknown lists action: ${action}`);
}
