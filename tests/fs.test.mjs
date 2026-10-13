import { fs } from "../src/fs.mjs";
test("filesystem facade exposes native file operations", () => {
  expect(fs.readFileSync).toEqual(expect.any(Function));
});
