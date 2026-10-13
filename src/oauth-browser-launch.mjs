export function launchOAuthBrowser({ open, browserUrl, print }) {
  const reportFailure = (error) => {
    print(
      `Could not open a browser automatically (${error.code || error.message}). Copy the URL above into a browser.`,
    );
  };
  try {
    const browser = open(browserUrl);
    browser?.once?.("error", reportFailure);
  } catch (error) {
    reportFailure(error);
  }
}
