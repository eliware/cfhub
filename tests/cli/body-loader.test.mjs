import { jest } from "@jest/globals";
import { loadBody } from "../../src/cli/body-loader.mjs";

test("loads inline JSON, file JSON, and an empty body", () => {
  expect(loadBody({ data: JSON.stringify({ inline: true }) })).toEqual({ inline: true });
  const readFileSync = jest.fn().mockReturnValue(JSON.stringify({ file: true }));
  expect(loadBody({ file: "body.json" }, { readFileSync })).toEqual({ file: true });
  expect(readFileSync).toHaveBeenCalledWith("body.json", "utf8");
  expect(loadBody({})).toBeNull();
});
