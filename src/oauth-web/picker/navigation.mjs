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
    const term = event.target.value.toLowerCase();
    document.querySelectorAll(".category").forEach((category) => {
      const visible = category.textContent.toLowerCase().includes(term);
      category.hidden = !visible;
      if (term && visible) category.open = true;
    });
  });
}
