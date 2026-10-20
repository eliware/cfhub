import { filterPickerCategories } from "./search.mjs";

export function bindPickerNavigation() {
  document.querySelector("[data-expand]").addEventListener("click", () => {
    document.querySelectorAll(".category").forEach((category) => {
      category.open = true;
    });
  });
  document.querySelector("[data-collapse]").addEventListener("click", () => {
    document.querySelectorAll(".category").forEach((category) => {
      category.open = false;
    });
  });
  document.querySelector("#scope-search").addEventListener("input", (event) => {
    filterPickerCategories(document.querySelectorAll(".category"), event.target.value);
  });
}
