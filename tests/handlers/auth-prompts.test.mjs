import {
  API_TOKEN_TUTORIAL,
  defaultPromptAccountId,
  promptHidden,
} from "../../src/handlers/auth-prompts.mjs";

test("auth prompts expose setup guidance and prompt helpers", () => {
  expect(API_TOKEN_TUTORIAL).toContain("Account API Token");
  expect(defaultPromptAccountId).toEqual(expect.any(Function));
  expect(promptHidden).toEqual(expect.any(Function));
});
