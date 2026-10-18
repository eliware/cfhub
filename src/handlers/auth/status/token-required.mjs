export function requireAuthStatusToken(token, fail) {
  if (token) return true;
  fail("You are not logged into Cloudflare. Run: cfhub auth login");
  return false;
}
