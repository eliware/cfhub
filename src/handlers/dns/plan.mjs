const recordKey = (record) =>
  JSON.stringify({
    type: record.type,
    name: record.name,
    content: record.content,
    ttl: record.ttl,
    proxied: record.proxied,
  });

export function buildDnsPlan(zoneId, desired, current) {
  const desiredCounts = new Map();
  for (const record of desired) {
    const key = recordKey(record);
    desiredCounts.set(key, (desiredCounts.get(key) || 0) + 1);
  }
  const currentCounts = new Map();
  const unchanged = [];
  const remove = [];
  const add = [];
  for (const record of current) {
    const key = recordKey(record);
    const matched = currentCounts.get(key) || 0;
    currentCounts.set(key, matched + 1);
    if (matched < (desiredCounts.get(key) || 0)) unchanged.push(record);
    else remove.push(record);
  }
  const seenDesired = new Map();
  for (const record of desired) {
    const key = recordKey(record);
    const seen = seenDesired.get(key) || 0;
    seenDesired.set(key, seen + 1);
    if (seen >= (currentCounts.get(key) || 0)) add.push(record);
  }
  return {
    zoneId,
    add,
    remove,
    unchanged,
  };
}
