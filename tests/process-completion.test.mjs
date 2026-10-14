import { EventEmitter } from "node:events";
import { waitForProcess } from "../src/process-completion.mjs";

test("returns the child exit code when it closes", async () => {
  const child = new EventEmitter();
  const result = waitForProcess(child);
  child.emit("close", 2);
  await expect(result).resolves.toEqual({ error: null, exitCode: 2 });
});

test("returns a failure when the child cannot start", async () => {
  const child = new EventEmitter();
  const result = waitForProcess(child);
  const error = new Error("spawn failed");
  child.emit("error", error);
  await expect(result).resolves.toEqual({ error, exitCode: 1 });
});
