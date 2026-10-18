import { jest } from "@jest/globals";
import { mutateExtension } from "../../../src/handlers/extension/mutate.mjs";

test("extension mutation requires force before removal", () => {
  const fsImpl = { rmSync: jest.fn() };
  const fail = jest.fn();
  mutateExtension({
    action: "remove",
    opts: { name: "hello" },
    printer: { log: jest.fn() },
    fail,
    fsImpl,
    homeDir: "/workspace",
  });
  expect(fail).toHaveBeenCalledWith("Refusing extension removal without --force");
  expect(fsImpl.rmSync).not.toHaveBeenCalled();
});
