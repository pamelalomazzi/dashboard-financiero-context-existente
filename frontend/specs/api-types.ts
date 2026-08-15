/**
 * Response body returned by GET /api/metrics/facets.
 *
 * This endpoint returns the available values that can be used as filters in the dashboard,
 * plus the full date range covered by the dataset.
 */
export interface FacetsResponse {
  /**
   * Distinct operation types available in the dataset.
   *
   * Expected format: ordered array of string literals.
   * Allowed values per item:
   * - "income": incoming money (revenue)
   * - "outcome": outgoing money (expense)
   */
  operation_types: Array<"income" | "outcome">;

  /**
   * Distinct business segments available in the dataset.
   *
   * Expected format: ordered array of string literals.
   * Allowed values per item:
   * - "B2B": business-to-business operations
   * - "B2C": business-to-consumer operations
   */
  business_types: Array<"B2B" | "B2C">;

  /**
   * Distinct categories available in the dataset.
   *
   * Expected format: ordered array of string literals.
   * Allowed values per item:
   * - "suppliers": supplier-related transactions
   * - "sales": sales-related transactions
   * - "operational": operating costs
   * - "administrative": administrative costs
   * - "others": uncategorized or miscellaneous transactions
   */
  categories: Array<
    "suppliers" | "sales" | "operational" | "administrative" | "others"
  >;

  /**
   * Earliest date available in the dataset.
   *
   * Expected format: ISO 8601 calendar date string in YYYY-MM-DD format.
   * Example: "2026-01-03".
   */
  min_date: string;

  /**
   * Latest date available in the dataset.
   *
   * Expected format: ISO 8601 calendar date string in YYYY-MM-DD format.
   * Example: "2026-12-28".
   */
  max_date: string;
}

/**
 * Single anomaly record returned by GET /api/metrics/alerts.
 */
export interface AlertEntry {
  /**
   * Time bucket where the anomaly was detected.
   *
   * Expected format depends on the `group_by` query parameter:
   * - day: "YYYY-MM-DD"
   * - week: "YYYY-Www" (ISO week, e.g. "2026-W08")
   * - month: "YYYY-MM"
   */
  period: string;

  /**
   * Total outcome amount observed in `period`.
   *
   * Expected format: finite decimal number (serialized as JSON number),
   * usually rounded to 2 decimal places by the backend.
   * Value range: greater than or equal to 0.
   */
  outcome_total: number;

  /**
   * Historical average outcome used as baseline before `period`.
   *
   * Expected format: finite decimal number (serialized as JSON number),
   * usually rounded to 2 decimal places by the backend.
   * Value range: strictly greater than 0 when an alert is emitted.
   */
  baseline_average: number;

  /**
   * Relative increase ratio versus `baseline_average`.
   *
   * Formula: (outcome_total - baseline_average) / baseline_average.
   * Expected format: finite decimal number (serialized as JSON number),
   * usually rounded to 4 decimal places by the backend.
   * Example: 0.35 means a +35% increase.
   */
  increase_ratio: number;
}

/**
 * Full response returned by GET /api/metrics/alerts.
 *
 * The endpoint returns a JSON array where each element is an `AlertEntry`.
 */
export interface AlertsResponse extends ReadonlyArray<AlertEntry> {}

/**
 * Single aggregated category row returned by GET /api/metrics/categories/top.
 */
export interface CategoryEntry {
  /**
   * Financial category being ranked.
   *
   * Expected format: string literal.
   * Allowed values:
   * - "suppliers"
   * - "sales"
   * - "operational"
   * - "administrative"
   * - "others"
   */
  category: "suppliers" | "sales" | "operational" | "administrative" | "others";

  /**
   * Operation type used to compute this ranking row.
   *
   * Expected format: string literal.
   * Allowed values:
   * - "income"
   * - "outcome"
   */
  operation_type: "income" | "outcome";

  /**
   * Aggregated amount for the category under the selected `operation_type`.
   *
   * Expected format: finite decimal number (serialized as JSON number),
   * usually rounded to 2 decimal places by the backend.
   * Value range: greater than or equal to 0.
   */
  total_amount: number;
}

/**
 * Full response returned by GET /api/metrics/categories/top.
 *
 * The endpoint returns a JSON array where each element is a `CategoryEntry`.
 */
export interface TopCategoriesResponse extends ReadonlyArray<CategoryEntry> {}
