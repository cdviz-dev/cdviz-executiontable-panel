/**
 * Sort columns available for the execution table
 */
export type SortColumn =
  | "Name"
  | "Last Duration (s)"
  | "Last Queue (s)"
  | "P80 Duration (s)"
  | "Total Runs"
  | "Passed"
  | "Failed"
  | "Skipped"
  | "Completion Time"
  | "Started Time";

/**
 * Sort direction
 */
export type SortDirection = "asc" | "desc";

/**
 * Panel options for ExecutionTable panel
 */
export interface ExecutionTableOptions {
  /** Maximum number of history items to display in bar chart */
  maxHistoryItems: number;
  /** Show queue duration history */
  showQueueHistory: boolean;
  /** Bar height in pixels */
  barHeight: number;
  /** Bar width in pixels */
  barWidth: number;
  /** Gap between bars in pixels */
  barGap: number;
  /** Duration percentile to display (e.g., 50, 80, 90, 95) */
  durationPercentile: number;
  /** Default column to sort by */
  defaultSortColumn: SortColumn;
  /** Default sort direction (asc or desc) */
  defaultSortDirection: SortDirection;
}

/**
 * Execution row data from SQL query
 */
export interface ExecutionRow {
  Name: string;
  "Run History (s)": number[];
  "Outcome History": string[];
  "Run IDs": string[];
  URLs: string[];
  "Started Times": string[];
  "Completion Times": string[];
  "Queue History (s)"?: number[];
  // Last values are automatically extracted from arrays using timestamps
  "Last Outcome": string;
  "Last Duration (s)": number;
  "Last Queue (s)"?: number;
  "P80 Duration (s)": number;
  "Total Runs": number;
  // Test suite specific
  Passed?: number;
  Failed?: number;
  Skipped?: number;
}

/**
 * Color mapping for outcomes
 */
export const OUTCOME_COLORS: Record<string, string> = {
  success: "#73BF69", // green
  pass: "#73BF69",
  ok: "#73BF69",
  failure: "#F2495C", // red
  fail: "#F2495C",
  error: "#F2495C",
  cancel: "#B7B7B7", // gray
  cancelled: "#B7B7B7",
  skip: "#6E6E6E", // dark gray
  skipped: "#6E6E6E",
};

/**
 * Get color for outcome
 */
export function getOutcomeColor(outcome: string): string {
  return OUTCOME_COLORS[outcome.toLowerCase()] || "#B7B7B7";
}
