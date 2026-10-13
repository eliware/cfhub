import { validateApiRequest } from "./api-request-validation.mjs";
import { renderApiOutput } from "./api-output.mjs";
import { executeApiRequest } from "./api-execution.mjs";

export async function handleApi({ cf, action, opts, body, printer, fail }) {
  const requestOptions = validateApiRequest({ action, opts, body, fail });
  if (!requestOptions) return;
  const execution = await executeApiRequest({ cf, requestOptions, body, opts, printer, fail });
  if (execution.done) return;
  printer.log(renderApiOutput(execution.result, opts));
}
