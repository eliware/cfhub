export const log = console;

export function toJsonOutput(value, printer = log.info.bind(log)) {
  printer(JSON.stringify(value, null, 2));
}

export function printTextList(items, formatter, printer = log.info.bind(log)) {
  for (const item of items) printer(formatter(item));
}
