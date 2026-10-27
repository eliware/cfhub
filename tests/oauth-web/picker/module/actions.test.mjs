import { moduleTierActions } from "../../../../src/oauth-web/picker/module/actions.mjs";

test("builds enable and disable controls for a module tier", () => {
  expect(moduleTierActions("basic")).toBe(
    '<div class="module-actions"><button type="button" data-tier-enable="basic">Enable</button><button type="button" data-tier-disable="basic">Disable</button></div>',
  );
});
