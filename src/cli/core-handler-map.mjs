import { handleZones } from "../handlers/zones.mjs";
import { handleZoneSettings } from "../handlers/zone/settings.mjs";
import { handleDnsRecords } from "../handlers/dns/records.mjs";
import { handleRulesets } from "../handlers/rulesets.mjs";
import { handleLists } from "../handlers/lists.mjs";
import { handleListItems } from "../handlers/list/items.mjs";
import { handleApi } from "../handlers/api.mjs";
import { handleAuth } from "../handlers/auth.mjs";
import { handleSsl } from "../handlers/ssl.mjs";
import { handleCache } from "../handlers/cache.mjs";
import { handleHealth } from "../handlers/health.mjs";
import { handleAudit } from "../handlers/audit.mjs";
import { handleInventory } from "../handlers/inventory.mjs";
import { handleOriginCa } from "../handlers/origin-ca.mjs";
import { handleExtension } from "../handlers/extension.mjs";

export function createCoreHandlerMap(handlers = {}) {
  return {
    zones: handlers.zones || handleZones,
    "zone-settings": handlers.zoneSettings || handleZoneSettings,
    "dns-records": handlers.dnsRecords || handleDnsRecords,
    rulesets: handlers.rulesets || handleRulesets,
    lists: handlers.lists || handleLists,
    "list-items": handlers.listItems || handleListItems,
    api: handlers.api || handleApi,
    auth: handlers.auth || handleAuth,
    oauth: handlers.oauth || handleAuth,
    ssl: handlers.ssl || handleSsl,
    cache: handlers.cache || handleCache,
    health: handlers.health || handleHealth,
    audit: handlers.audit || handleAudit,
    inventory: handlers.inventory || handleInventory,
    "origin-ca": handlers.originCa || handleOriginCa,
    extension: handlers.extension || handleExtension,
  };
}
