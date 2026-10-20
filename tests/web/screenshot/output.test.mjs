import { jest } from "@jest/globals";
import { prepareScreenshotOutput } from "../../../src/web/screenshot/output.mjs";

test("creates the output directory and returns an absolute path", async () => {
  const makeDirectory = jest.fn();
  const target = await prepareScreenshotOutput("artifacts/page.png", makeDirectory);
  expect(target).toMatch(/[\\/]artifacts[\\/]page\.png$/);
  expect(makeDirectory).toHaveBeenCalledWith(expect.stringMatching(/[\\/]artifacts$/), {
    recursive: true,
  });
});

test("propagates output directory errors", async () => {
  const error = new Error("directory denied");
  await expect(
    prepareScreenshotOutput("page.png", jest.fn().mockRejectedValue(error)),
  ).rejects.toBe(error);
});
