import { log } from "./output-printers.mjs";

export function renderTable(headers, rows) {
  const values = [headers, ...rows].map((row) => row.map((value) => String(value ?? "")));
  const widths = headers.map((_, index) => Math.max(...values.map((row) => row[index].length)));
  const format = (row) =>
    row
      .map((value, index) => String(value ?? "").padEnd(widths[index]))
      .join("  ")
      .trimEnd();
  return [
    format(headers),
    format(headers.map((header) => "-".repeat(header.length))),
    ...rows.map(format),
  ].join("\n");
}

export function printTable(headers, rows, printer = log.info.bind(log)) {
  printer(renderTable(headers, rows));
}
