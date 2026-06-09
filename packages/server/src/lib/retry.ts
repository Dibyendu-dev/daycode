const INITIAL_DELAY = 2000;
const MAX_RETRIES = 3;

function isRetryable503(error: unknown): boolean {
  if (
    error &&
    typeof error === "object" &&
    "statusCode" in error &&
    (error as { statusCode: number }).statusCode === 503
  ) {
    return true;
  }
  return false;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (signal?.aborted) {
      throw lastError ?? new Error("Aborted");
    }

    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < MAX_RETRIES - 1 && isRetryable503(error)) {
        const delay = INITIAL_DELAY * Math.pow(2, attempt);
        await new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, delay);
          if (signal) {
            const onAbort = () => {
              clearTimeout(timer);
              resolve();
            };
            signal.addEventListener("abort", onAbort, { once: true });
          }
        });
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}
