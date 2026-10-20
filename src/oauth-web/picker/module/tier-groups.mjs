const moduleActions = (tier) =>
  `<div class="module-actions"><button type="button" data-tier-enable="${tier}">Enable</button><button type="button" data-tier-disable="${tier}">Disable</button></div>`;

export function createPickerModuleTier(tier, title) {
  const group = document.createElement("div");
  group.className = "module-tier";
  group.innerHTML = `<div class="module-tier-heading"><h3>${title}</h3>${moduleActions(tier)}</div><div class="module-list"></div>`;
  return { group, list: group.querySelector(".module-list") };
}
