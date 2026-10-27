import { showList } from "./item-view.mjs";
import { showLists } from "./list-view.mjs";

export function handleListsRead(input) {
  return input.action === "list" ? showLists(input) : showList(input);
}
