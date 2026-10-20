import { COMMAND_GROUPS, GLOBAL_FLAGS } from "../../../src/cli/command/catalog.mjs";
import { renderCommandReference } from "../../../src/cli/reference/markdown.mjs";

test("command reference renders every catalog command and description", () => {
  const reference = renderCommandReference();
  for (const { title, commands } of COMMAND_GROUPS) {
    for (const [name, description] of commands) {
      expect(reference).toContain(
        `| ${title.replace(" COMMANDS", "")} | \`${name}\` | ${description} |`,
      );
    }
  }
});

test("command reference renders every global flag and API usage", () => {
  const reference = renderCommandReference();
  for (const [flag, description] of GLOBAL_FLAGS)
    expect(reference).toContain(`| \`${flag}\` | ${description} |`);
  expect(reference).toContain("cfhub api /zones --json");
  expect(reference).toContain("[Command actions](command-actions.md)");
  expect(reference).toContain("The method defaults to GET.");
});
