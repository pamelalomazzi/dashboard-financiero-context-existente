/**
 * Single decimal digit.
 */
type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

/**
 * Non-zero decimal digit.
 */
type NonZeroDigit = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

/**
 * Year segment with 4 digits.
 */
type Year = `${Digit}${Digit}${Digit}${Digit}`;

/**
 * Month segment with 2 digits from 01 to 12.
 */
type Month = `0${NonZeroDigit}` | `1${"0" | "1" | "2"}`;

/**
 * Day segment with 2 digits from 01 to 31.
 *
 * Note: this validates only the generic calendar day shape, not month-specific day limits.
 */
type Day = `0${NonZeroDigit}` | `${"1" | "2"}${Digit}` | `3${"0" | "1"}`;

/**
 * ISO date string in YYYY-MM-DD format.
 *
 * Example: "2026-08-15".
 */
type ISODateYYYYMMDD = `${Year}-${Month}-${Day}`;

/**
 * Number expected to be validated in runtime as a threshold between 0.01 and 1.0.
 */
type AlertThreshold = number & { readonly __brand: "AlertThreshold_0_01_to_1_0" };

/**
 * Number expected to be validated in runtime as a top-categories limit.
 * Backend currently accepts values in the range [1, 20].
 */
type TopCategoriesLimit = number & { readonly __brand: "TopCategoriesLimit_1_to_20" };

/**
 * Shared date range filter used by dashboard query params.
 */
export interface DateRangeFilter {
  /**
   * Inclusive start date for filtering records.
   *
   * Expected format: ISO calendar date in YYYY-MM-DD.
   * Optional: if omitted, the backend does not apply a lower date bound.
   */
  start_date?: ISODateYYYYMMDD;

  /**
   * Inclusive end date for filtering records.
   *
   * Expected format: ISO calendar date in YYYY-MM-DD.
   * Optional: if omitted, the backend does not apply an upper date bound.
   */
  end_date?: ISODateYYYYMMDD;
}

/**
 * Query params used by the anomalies endpoint.
 */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Sensitivity threshold for anomaly detection.
   *
   * Expected type: decimal number.
   * Allowed values: from 0.01 to 1.0 (inclusive).
   * Meaning: a larger value makes alerts less frequent.
   */
  threshold: AlertThreshold;
}

/**
 * Query params used by the top income categories endpoint.
 */
export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Operation type to aggregate in the ranking.
   *
   * Allowed values:
   * - "income": rank top income categories
   * - "outcome": rank top expense categories
   */
  operation_type: "income" | "outcome";

  /**
   * Maximum number of categories to return.
   *
   * Expected type: positive integer.
   * Backend allowed range: 1 to 20 (inclusive).
   */
  limit: TopCategoriesLimit;
}
