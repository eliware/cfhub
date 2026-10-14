export function createPickerSetup(documentRef, windowRef) {
  const { categories, modules, requiredScopes = [] } = windowRef.CFHUB_SCOPE_MODEL;
  const quickSetup = documentRef.querySelector(".quick-setup");
  if (windowRef.matchMedia("(max-width: 600px)").matches) quickSetup.open = false;
  return {
    categories,
    modules,
    requiredScopes,
    quickSetup,
    boxes: [],
    sessionOptions: documentRef.querySelectorAll('input[name="keep-signed-in"]'),
    moduleGroups: documentRef.querySelector("#module-groups"),
    scopeGroups: documentRef.querySelector("#scope-groups"),
    moduleCount: documentRef.querySelector("#module-count"),
  };
}
