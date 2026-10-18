const recordKey = (record) =>
  JSON.stringify({
    type: record.type,
    name: record.name,
    content: record.content,
    ttl: record.ttl,
    proxied: record.proxied,
  });

export function buildDnsPlan(zoneId, desired, current) {
  const desiredKeys = new Set(desired.map(recordKey));
  const currentKeys = new Set(current.map(recordKey));
  return {
    zoneId,
    add: desired.filter((record) => !currentKeys.has(recordKey(record))),
    remove: current.filter((record) => !desiredKeys.has(recordKey(record))),
    unchanged: current.filter((record) => desiredKeys.has(recordKey(record))),
  };
}
