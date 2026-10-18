export async function getZoneSetting(cf, zoneId, setting) {
  if (typeof cf.get === "function")
    return cf.get(`/zones/${zoneId}/settings/${setting}`, undefined);
  if (cf.zones.settings.get.length >= 2) return cf.zones.settings.get(setting, { zone_id: zoneId });
  return cf.zones.settings.get(zoneId, setting);
}

export async function setZoneSetting(cf, zoneId, setting, value) {
  if (typeof cf.patch === "function")
    return cf.patch(`/zones/${zoneId}/settings/${setting}`, { body: { value } });
  if (typeof cf.zones.settings.edit === "function")
    return cf.zones.settings.edit(setting, { zone_id: zoneId, value });
  return cf.zones.settings.update(zoneId, setting, { value });
}
