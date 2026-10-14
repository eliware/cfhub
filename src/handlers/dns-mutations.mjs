import { writeDnsRecord } from "./dns-mutation-write.mjs";
import { deleteDnsRecord } from "./dns-mutation-delete.mjs";

export async function handleDnsMutation({
  action,
  zoneId,
  id,
  body,
  opts,
  cf,
  outputJson,
  toJsonOutput,
  printer,
  fail,
}) {
  const shared = {
    action,
    zoneId,
    id,
    body,
    opts,
    cf,
    outputJson,
    toJsonOutput,
    printer,
    fail,
  };
  if (action === "create" || action === "update") return writeDnsRecord(shared);
  return deleteDnsRecord(shared);
}
