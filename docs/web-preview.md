# Web preview

Use the preview server to inspect the OAuth scope picker in a browser. The server listens on `127.0.0.1:1020` by default.

## Start the preview

Run these commands from the repository root:

```sh
npm ci
npm run puppeteer
npm run build
npm run start:web
```

Keep the preview server open while you run browser checks. Stop it with `Ctrl+C`.

## Capture a screenshot

Run `npm run screenshots` in a second terminal. The command saves a full-page image to `artifacts/cfhub-oauth-picker.png`.

Set `WEB_URL` to select a different preview address. Set `SCREENSHOT_PATH` to select a new image path.

## Run Lighthouse

Run `npm run lighthouse` in a second terminal. The command writes a JSON report to `artifacts/lighthouse.json`.

Set `WEB_HOST` or `WEB_PORT` before you start the preview server. These variables select its listening address.

## Run the OAuth browser checks

Run `npm run test:e2e:web` to test the complete OAuth picker and callback flow. The checks use temporary local servers and a mock token response.

Set `CHROME_PATH` if Puppeteer cannot find Chrome. Keep ports `8765` through `8769` available for these checks.
