import { jest } from "@jest/globals";
import { captureScreenshot } from "../../../src/web/screenshot/capture.mjs";

test("captures the configured page and closes the browser", async () => {
  const page = { goto: jest.fn(), screenshot: jest.fn() };
  const browser = { newPage: jest.fn().mockResolvedValue(page), close: jest.fn() };
  const puppeteer = { launch: jest.fn().mockResolvedValue(browser) };
  const prepareTarget = jest.fn().mockResolvedValue("artifacts/page.png");

  await expect(
    captureScreenshot({ puppeteer, url: "http://localhost/", prepareTarget }),
  ).resolves.toBe("artifacts/page.png");
  expect(page.goto).toHaveBeenCalledWith("http://localhost/", { waitUntil: "networkidle0" });
  expect(page.screenshot).toHaveBeenCalledWith({ path: "artifacts/page.png", fullPage: true });
  expect(browser.close).toHaveBeenCalled();
});

test("closes the browser when screenshot capture fails", async () => {
  const error = new Error("capture failed");
  const browser = {
    newPage: jest
      .fn()
      .mockResolvedValue({ goto: jest.fn(), screenshot: jest.fn().mockRejectedValue(error) }),
    close: jest.fn(),
  };
  await expect(
    captureScreenshot({
      puppeteer: { launch: jest.fn().mockResolvedValue(browser) },
      url: "http://localhost/",
      prepareTarget: jest.fn().mockResolvedValue("page.png"),
    }),
  ).rejects.toBe(error);
  expect(browser.close).toHaveBeenCalled();
});
