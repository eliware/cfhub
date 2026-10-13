export async function requestWithBackoff(
  request,
  { retries = 3, delay = () => new Promise((resolve) => setTimeout(resolve, 100)) } = {},
) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await request();
    } catch (error) {
      const status = error?.status || error?.statusCode || error?.response?.status;
      if (status !== 429 || attempt >= retries) throw error;
      await delay(attempt);
    }
  }
}
