import { collectZoneInventory } from "../inventory-zone.mjs";

const ZONE_BATCH_SIZE = 5;

export async function collectZonesInBatches(cf, zones) {
  const inventory = [];
  for (let index = 0; index < zones.length; index += ZONE_BATCH_SIZE) {
    const batch = zones.slice(index, index + ZONE_BATCH_SIZE);
    inventory.push(...(await Promise.all(batch.map((zone) => collectZoneInventory(cf, zone)))));
  }
  return inventory;
}
