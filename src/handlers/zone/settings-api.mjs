export async function getZoneSetting(cf, zoneId, setting) {
  if (typeof cf.get === "function")
    return cf.get(`/zones/${zoneId}/settings/${setting}`, undefined);
  return cf.zones.settings.get(setting, { zone_id: zoneId });
}

export async function setZoneSetting(cf, zoneId, setting, value) {
  if (typeof cf.patch === "function")
    return cf.patch(`/zones/${zoneId}/settings/${setting}`, { body: { value } });
  if (typeof cf.zones.settings.edit === "function")
    return cf.zones.settings.edit(setting, { zone_id: zoneId, value });
  throw new Error("Cloudflare SDK does not support zone setting updates");
}
