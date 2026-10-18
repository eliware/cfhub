import { API_TOKEN_TUTORIAL } from "../../../help/auth/token-tutorial.mjs";

export async function readLoginToken({ opts, readToken, promptToken, printer }) {
  const interactive = !opts?.["token-stdin"];
  const suppliedToken = opts?.["token-stdin"]
    ? readToken()
    : (printer.error?.(
        `${API_TOKEN_TUTORIAL}\n\ncfhub stores the token safely. cfhub does not show it.`,
      ),
      await promptToken());
  return { interactive, suppliedToken };
}
