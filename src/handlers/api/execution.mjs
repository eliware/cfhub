import { getAllPages, withPage } from "../../pagination.mjs";
import { requestWithBackoff } from "../../request-backoff.mjs";

export async function executeApiRequest({ cf, requestOptions, body, opts, printer, fail }) {
  const { path, method } = requestOptions;
  if ((opts["dry-run"] === true || opts["dry-run"] === "true") && method !== "GET") {
    printer.log(JSON.stringify({ dryRun: true, method, path, body }, null, 2));
    return { done: true };
  }
  const request = cf[method.toLowerCase()];
  if (typeof request !== "function") {
    fail(`Cloudflare client does not support ${method}`);
    return { done: true };
  }
  const requestPage = (page) =>
    requestWithBackoff(() => request.call(cf, withPage(path, page), undefined));
  const firstPath = method === "GET" && opts.paginate ? withPage(path, 1) : path;
  const first = await requestWithBackoff(() =>
    request.call(cf, firstPath, body === null ? undefined : { body }),
  );
  const result =
    method === "GET" ? await getAllPages(requestPage, first, { paginate: opts.paginate }) : first;
  return { done: false, result };
}
