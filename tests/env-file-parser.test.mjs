import { parseEnvFile } from "../src/env-file-parser.mjs";

test("parses dotenv values and preserves existing environment values", () => {
  const env = { EXISTING: "from-env" };
  parseEnvFile("# comment\n\nMALFORMED\nGOOD = value \nEXISTING=from-file\n", env);
  expect(env).toEqual({ GOOD: "value", EXISTING: "from-env" });
});
