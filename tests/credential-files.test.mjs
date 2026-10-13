import { credentialsPath, readCredentialFile } from "../src/credential-files.mjs";

test("credential file helpers locate a profile store", () => {
  expect(credentialsPath("/tmp/cfhub-test")).toContain("credentials.json");
  expect(readCredentialFile("missing", { existsSync: () => false }, "/tmp/cfhub-test")).toBeNull();
});
