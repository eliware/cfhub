import { renderFailurePage } from "./failure/render.mjs";

export function failurePage({ title, detail }) {
  return renderFailurePage({ title, detail });
}
