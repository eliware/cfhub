export function renderPickerScopeGroups(categories, scopeGroups, boxes) {
  Object.entries(categories).forEach(([name, features]) => {
    const category = document.createElement("details");
    category.className = "category";
    category.innerHTML = `<summary>${name}<b data-category-count="${name}">0/${features.reduce((sum, feature) => sum + feature.scopes.length, 0)}</b></summary><div class="category-actions"><button type="button" data-category-enable="${name}">Enable all</button><button type="button" data-category-disable="${name}">Disable all</button></div>${features.map((feature) => `<div class="feature"><span class="feature-name">${feature.name}</span><span class="variants">${feature.scopes.map((scope) => `<label><input type="checkbox" data-scope name="scope" value="${scope.scope}">${scope.label}</label>`).join("")}</span></div>`).join("")}`;
    scopeGroups.append(category);
    boxes.push(...category.querySelectorAll("[data-scope]"));
  });
}
