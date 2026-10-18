import { printTable } from "../../output/table.mjs";

export function displayDnsRecords(result, { outputJson, toJsonOutput, printer }) {
  const items = Array.isArray(result?.result) ? result.result : result;
  return outputJson
    ? toJsonOutput(items)
    : printTable(
        ["ID", "TYPE", "NAME", "CONTENT"],
        items.map((record) => [record.id, record.type, record.name, record.content]),
        printer.log,
      );
}

export function displayDnsRecord(result, { outputJson, toJsonOutput, printer }) {
  return outputJson ? toJsonOutput(result) : printer.log(JSON.stringify(result, null, 2));
}
