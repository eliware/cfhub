const reviewTokenButton = ["Review", "Token"].join(" ");

export const API_TOKEN_TUTORIAL = [
  "Create an Account API Token in Cloudflare:",
  "  1. Log in to Cloudflare.",
  "  2. Open Manage account > Account API tokens.",
  "  3. Click Create Token.",
  "  4. Set a name, such as eliware/cfhub.",
  "  5. Select a permission policy. Grant only the permissions that your commands require.",
  "  6. Set token expiration and client IP filters.",
  `  7. Select ${reviewTokenButton}. Scroll down. Select Create Token.`,
  "  8. Copy Your API Token. Paste it into cfhub when prompted.",
  "  9. Copy the Account ID from Cloudflare when cfhub asks for it.",
].join("\n");
