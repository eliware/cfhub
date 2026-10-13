export function renderPickerGroups({ categories, modules, moduleGroups, scopeGroups, boxes }) {
  for (const [tier, title] of [
    ["basic", "Basic modules"],
    ["advanced", "Advanced modules"],
  ]) {
    const group = document.createElement("div");
    group.className = "module-tier";
    group.innerHTML = `<div class="module-tier-heading"><h3>${title}</h3><div class="module-actions"><button type="button" data-tier-enable="${tier}">Enable all</button><button type="button" data-tier-disable="${tier}">Disable all</button></div></div><div class="module-list">${modules
      .filter((module) => module.tier === tier)
      .map(
        (module) =>
          `<button type="button" class="module" data-module="${module.id}"><strong>${module.name}</strong><small>${module.description}</small></button>`,
      )
      .join("")}</div>`;
    moduleGroups.append(group);
  }
  Object.entries(categories).forEach(([name, features]) => {
    const category = document.createElement("details");
    category.className = "category";
    category.innerHTML = `<summary>${name}<b data-category-count="${name}">0/${features.reduce((sum, feature) => sum + feature.scopes.length, 0)}</b></summary><div class="category-actions"><button type="button" data-category-enable="${name}">Enable all</button><button type="button" data-category-disable="${name}">Disable all</button></div>${features.map((feature) => `<div class="feature"><span class="feature-name">${feature.name}</span><span class="variants">${feature.scopes.map((scope) => `<label><input type="checkbox" data-scope name="scope" value="${scope.scope}">${scope.label}</label>`).join("")}</span></div>`).join("")}`;
    scopeGroups.append(category);
    boxes.push(...category.querySelectorAll("[data-scope]"));
  });
}
