export function renderPickerModuleGroups(modules, moduleGroups) {
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
}
