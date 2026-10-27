import { successModuleCards } from "./modules.mjs";
import { successExamples } from "./examples.mjs";
import { successPageCounts } from "./counts.mjs";
import { renderSuccessPage } from "./render.mjs";

export function successPage({ account, scopes, summary }) {
  const enabled = summary.enabled;
  const moduleCards = successModuleCards(enabled);
  const examples = successExamples(enabled, summary.zones);
  const counts = successPageCounts({
    scopes,
    enabled,
    zones: summary.zones,
    dns: summary.dns,
  });
  return renderSuccessPage({
    account: account?.name || account?.email || "your Cloudflare account",
    counts,
    moduleCards,
    examples: examples || "<p>Select a module to see command examples.</p>",
  });
}
