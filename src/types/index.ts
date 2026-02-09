/**
 * Standardized Result type for Server Actions
 *
 * Every Server Action should return Result<T> for consistent
 * error handling on the client.
 *
 * @example
 * // Success
 * return { success: true, data: transaction };
 *
 * // Failure
 * return { success: false, error: "Unauthorized" };
 */
export type Result<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Helper to create a successful result
 */
export function ok<T>(data: T): Result<T> {
  return { success: true, data };
}

/**
 * Helper to create a successful result with no data
 */
export function okVoid(): Result<void> {
  return { success: true, data: undefined };
}

/**
 * Helper to create a failure result
 */
export function err<T = never>(error: string): Result<T> {
  return { success: false, error };
}
