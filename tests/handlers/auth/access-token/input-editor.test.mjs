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

test("backspace removes one supplementary Unicode character", () => {
  const editor = createHiddenInputEditor();
  expect(editor.write("secret-😀\u007f\r")).toEqual({ done: true, value: "secret-" });
});

test("Ctrl-H removes the last character from hidden input", () => {
  const editor = createHiddenInputEditor();
  editor.write("token");
  expect(editor.write("\u0008")).toEqual({ done: false });
  expect(editor.write("\n")).toEqual({ done: true, value: "toke" });
});

test("ignores backspace when the value is empty", () => {
  const editor = createHiddenInputEditor();
  expect(editor.write("\u007f\n")).toEqual({ done: true, value: "" });
});

test("marks input as interrupted when the user presses Ctrl-C", () => {
  const editor = createHiddenInputEditor();
  editor.write("secret");
  expect(editor.write("\u0003")).toEqual({ done: true, interrupted: true });
});

test("rejects hidden input above the 4096-byte limit", () => {
  const editor = createHiddenInputEditor();
  expect(editor.write("a".repeat(4097))).toMatchObject({
    done: true,
    error: expect.objectContaining({ message: "API token input exceeds 4096 bytes" }),
  });
});

test("counts UTF-8 bytes and reduces the count after backspace", () => {
  const editor = createHiddenInputEditor();
  expect(editor.write("é".repeat(2047))).toEqual({ done: false });
  expect(editor.write("é\u007fé\n")).toEqual({ done: true, value: "é".repeat(2048) });
});
