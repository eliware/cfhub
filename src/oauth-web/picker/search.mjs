export function filterPickerCategories(categories, term) {
  const searchTerm = term.toLowerCase();
  categories.forEach((category) => {
    const visible = category.textContent.toLowerCase().includes(searchTerm);
    category.hidden = !visible;
    if (searchTerm && visible) category.open = true;
  });
}
