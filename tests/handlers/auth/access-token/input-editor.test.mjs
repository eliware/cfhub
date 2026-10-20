import { createHiddenInputEditor } from "../../../../src/handlers/auth/access-token/input-editor.mjs";

test("edits input and returns it when the user presses enter", () => {
  const editor = createHiddenInputEditor();
  expect(editor.write("secrex")).toEqual({ done: false });
  expect(editor.write("\u007ft\r")).toEqual({ done: true, value: "secret" });
});

test("decodes UTF-8 characters across chunks", () => {
  const editor = createHiddenInputEditor();
  const bytes = Buffer.from("café\n");
  expect(editor.write(bytes.subarray(0, 4))).toEqual({ done: false });
  expect(editor.write(bytes.subarray(4))).toEqual({ done: true, value: "café" });
});

test("returns an empty value when the user interrupts input", () => {
  const editor = createHiddenInputEditor();
  editor.write("secret");
  expect(editor.write("\u0003")).toEqual({ done: true, value: "" });
});
