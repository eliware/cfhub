export function renderPickerModuleGroups(modules, moduleGroups) {
  for (const [tier, title] of [
    ["basic", "Basic modules"],
    ["advanced", "Advanced modules"],
  ]) {
    const group = document.createElement("div");
    group.className = "module-tier";
    group.innerHTML = `<div class="module-tier-heading"><h3>${title}</h3><div class="module-actions"><button type="button" data-tier-enable="${tier}">Enable all</button><button type="button" data-tier-disable="${tier}">Disable all</button></div></div><div class="module-list"></div>`;
    const list = group.querySelector(".module-list");
    modules
      .filter((module) => module.tier === tier)
      .forEach((module) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "module";
        button.dataset.module = module.id;
        const name = document.createElement("strong");
        name.textContent = module.name;
        const description = document.createElement("small");
        description.textContent = module.description;
        button.append(name, description);
        list.append(button);
      });
    moduleGroups.append(group);
  }
}
