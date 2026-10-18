export function renderOAuthTemplate(template, replacements) {
  return Object.entries(replacements).reduce(
    (html, [token, value]) => html.replaceAll(token, value),
    template,
  );
}
