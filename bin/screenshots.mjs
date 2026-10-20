#!/usr/bin/env node
import puppeteer from "puppeteer";
import { mkdir } from "node:fs/promises";
import { resolveScreenshotConfig } from "../src/web/screenshot/config.mjs";
import { captureScreenshot } from "../src/web/screenshot/capture.mjs";
import { prepareScreenshotOutput } from "../src/web/screenshot/output.mjs";

const { url, output } = resolveScreenshotConfig({});
const path = await captureScreenshot({
  puppeteer,
  url,
  prepareTarget: () => prepareScreenshotOutput(output, mkdir),
});
console.log(`Saved browser screenshot to ${path}`);
