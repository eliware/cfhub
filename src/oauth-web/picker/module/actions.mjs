export function moduleTierActions(tier) {
  return `<div class="module-actions"><button type="button" data-tier-enable="${tier}">Enable</button><button type="button" data-tier-disable="${tier}">Disable</button></div>`;
}
