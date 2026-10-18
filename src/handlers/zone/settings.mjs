import { getZoneId } from "../identifiers.mjs";
import { requireValue } from "../argument-validation.mjs";
import { getZoneSetting, setZoneSetting } from "./settings-api.mjs";

export async function handleZoneSettings({
  cf,
  action,
  opts,
  env,
  body,
  outputJson,
  printer = console,
  toJsonOutput,
  fail,
}) {
  const zoneId = getZoneId(opts, env);
  const setting = opts.setting;
  requireValue(zoneId, "Missing --zone-id", fail);
  requireValue(setting, "Missing the `--setting` option", fail);

  if (action === "get") {
    const res = await getZoneSetting(cf, zoneId, setting);
    return outputJson ? toJsonOutput(res) : printer.log(JSON.stringify(res, null, 2));
  }

  if (action === "set") {
    if (!body || body.value === undefined) {
      fail("Missing JSON body with value");
      return;
    }
    if (opts["dry-run"])
      return printer.log(
        JSON.stringify({ zoneId, setting, value: body.value, dryRun: true }, null, 2),
      );

    const res = await setZoneSetting(cf, zoneId, setting, body.value);
    return outputJson ? toJsonOutput(res) : printer.log(JSON.stringify(res, null, 2));
  }

  fail(`Unknown zone-settings action: ${action}`);
}
