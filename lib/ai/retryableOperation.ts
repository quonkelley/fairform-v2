/**
 * Retryable Operation Utility
 *
 * Provides retry logic with exponential backoff for operations that may fail transiently.
 * Used by session lifecycle management and other batch operations.
 *
 * @see docs/stories/13.12.session-lifecycle-management.md
 */

/**
 * Retryable operation class with exponential backoff
 */
export class RetryableOperation {
  private maxAttempts: number;
  private baseDelay: number;

  constructor(maxAttempts: number = 3, baseDelay: number = 1000) {
    this.maxAttempts = maxAttempts;
    this.baseDelay = baseDelay;
  }

  /**
   * Execute an operation with retry logic
   *
   * @param operation - The operation to execute
   * @param operationName - Name for logging purposes
   * @returns Result of the operation
   * @throws Last error if all retry attempts fail
   */
  async execute<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === this.maxAttempts) {
          console.error(
            `${operationName} failed after ${this.maxAttempts} attempts:`,
            error
          );
          throw error;
        }

        const delay = this.baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.warn(
          `${operationName} attempt ${attempt} failed, retrying in ${delay}ms:`,
          error
        );

        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Sleep for specified milliseconds
   *
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
