import { jest } from "@jest/globals";
import { parseJson, run } from "./cli-live-runner.mjs";

test("runs the CLI command with process options", async () => {
  const execCommand = jest.fn().mockResolvedValue({ stdout: "ok", stderr: "" });
  const result = await run(["zones", "list"], { cwd: "workspace" }, execCommand);
  expect(result).toEqual({ stdout: "ok", stderr: "", code: 0 });
  expect(execCommand).toHaveBeenCalledWith(
    expect.any(String),
    ["zones", "list"],
    expect.objectContaining({ cwd: "workspace", maxBuffer: 2 * 1024 * 1024 }),
  );
});

test("returns failed CLI output and parses JSON", async () => {
  const error = Object.assign(new Error("failed"), { stdout: "{}", stderr: "bad", code: 2 });
  await expect(run([], {}, jest.fn().mockRejectedValue(error))).resolves.toEqual({
    stdout: "{}",
    stderr: "bad",
    code: 2,
  });
  expect(parseJson({ stdout: '{"ok":true}' })).toEqual({ ok: true });
});
