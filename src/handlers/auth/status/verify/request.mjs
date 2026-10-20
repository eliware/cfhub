import { interpretTokenVerification, tokenVerificationEndpoint } from "./response.mjs";

export async function requestTokenVerification({ token, accountId, cf }) {
  const result = await cf.get(tokenVerificationEndpoint(token, accountId));
  return interpretTokenVerification(result);
}
