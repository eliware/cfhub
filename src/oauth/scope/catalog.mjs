import developer from "../../../data/oauth-scopes/developer-platform.json" with { type: "json" };
import ai from "../../../data/oauth-scopes/ai-machine-learning.json" with { type: "json" };
import dns from "../../../data/oauth-scopes/dns-zones.json" with { type: "json" };
import security from "../../../data/oauth-scopes/app-security.json" with { type: "json" };
import rules from "../../../data/oauth-scopes/rules-configuration.json" with { type: "json" };
import zeroTrust from "../../../data/oauth-scopes/zero-trust.json" with { type: "json" };
import analytics from "../../../data/oauth-scopes/analytics-logs.json" with { type: "json" };
import network from "../../../data/oauth-scopes/network-services.json" with { type: "json" };
import media from "../../../data/oauth-scopes/media.json" with { type: "json" };
import email from "../../../data/oauth-scopes/email-messaging.json" with { type: "json" };
import cache from "../../../data/oauth-scopes/cache-performance.json" with { type: "json" };
import billing from "../../../data/oauth-scopes/account-billing.json" with { type: "json" };
import other from "../../../data/oauth-scopes/other.json" with { type: "json" };

export const scopeCategories = Object.assign(
  {},
  developer,
  ai,
  dns,
  security,
  rules,
  zeroTrust,
  analytics,
  network,
  media,
  email,
  cache,
  billing,
  other,
);
