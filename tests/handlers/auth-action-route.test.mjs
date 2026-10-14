import { authActionRoute } from "../../src/handlers/auth-action-route.mjs";

test.each([
  ["login", "login"],
  ["list", "profile"],
  ["switch", "profile"],
  ["logout", "profile"],
  ["status", "status"],
  ["verify", "status"],
  ["unknown", null],
])("routes auth action %s to %s", (action, route) => {
  expect(authActionRoute(action)).toBe(route);
});
