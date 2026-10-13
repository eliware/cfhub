import { renderTemplate, selectJson } from "../output-selection.mjs";
import { getAllPages, requestWithBackoff, withPage } from "../request.mjs";
import { validateApiRequest } from "./api-request-validation.mjs";

export async function handleApi({ cf, action, opts, body, printer, fail }) {
  const requestOptions = validateApiRequest({ action, opts, body, fail });
  if (!requestOptions) return;
  const { path, method } = requestOptions;
  if (opts.dryRun) {
    printer.log(JSON.stringify({ dryRun: true, method, path, body }, null, 2));
    return;
  }
  const request = cf[method.toLowerCase()];
  if (typeof request !== "function") {
    fail(`Cloudflare client does not support ${method}`);
    return;
  }
  const requestPage = (page) =>
    requestWithBackoff(() => request.call(cf, withPage(path, page), undefined));
  const first = await requestWithBackoff(() =>
    request.call(cf, path, body === null ? undefined : { body }),
  );
  const result =
    method === "GET" ? await getAllPages(requestPage, first, { paginate: opts.paginate }) : first;
  const selected = selectJson(result, opts.jq);
  printer.log(
    opts.template ? renderTemplate(selected, opts.template) : JSON.stringify(selected, null, 2),
  );
}
