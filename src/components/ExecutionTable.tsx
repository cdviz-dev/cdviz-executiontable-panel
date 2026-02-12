import type { PanelProps } from "@grafana/data";
import { useTheme2 } from "@grafana/ui";
import React, { useMemo } from "react";
import { type ExecutionRow, type ExecutionTableOptions, getOutcomeColor } from "../types";
import { HistoryBarChart } from "./HistoryBarChart";

// Helper function to parse array fields that might come as strings
// Supports both JSON array syntax [...] and SQL array syntax {...}
const parseArray = (value: any): any[] => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string") {
    let stringValue = value.trim();

    // Handle empty string
    if (!stringValue) {
      return [];
    }

    // TestData CSV wraps the entire value in quotes, so strip outer quotes if present
    if ((stringValue.startsWith('"') && stringValue.endsWith('"')) ||
        (stringValue.startsWith("'") && stringValue.endsWith("'"))) {
      stringValue = stringValue.slice(1, -1);
    }

    // Convert SQL array syntax {a,b,c} to JSON array syntax [a,b,c]
    if (stringValue.startsWith("{") && stringValue.endsWith("}")) {
      // Handle SQL array format manually (more reliable than JSON.parse)
      const content = stringValue.slice(1, -1);
      if (!content) {
        return [];
      }
      return content.split(",").map((v: string) => {
        const val = v.trim();
        // Try to parse as number
        const num = parseFloat(val);
        return isNaN(num) ? val : num;
      });
    }

    // Try JSON array format [a,b,c]
    if (stringValue.startsWith("[") && stringValue.endsWith("]")) {
      try {
        const parsed = JSON.parse(stringValue);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  }
  return [];
};

// Helper function to sanitize numeric arrays by converting null/NULL to 0
const sanitizeNumericArray = (arr: any[]): number[] => {
  return arr.map((val) => {
    if (val === null || val === "NULL" || val === "null") {
      return 0;
    }
    return typeof val === "number" ? val : parseFloat(val) || 0;
  });
};

type SortColumn =
  | "Name"
  | "Last Duration (s)"
  | "Last Queue (s)"
  | "P80 Duration (s)"
  | "Total Runs"
  | "Passed"
  | "Failed"
  | "Skipped";
type SortDirection = "asc" | "desc";

export const ExecutionTable: React.FC<PanelProps<ExecutionTableOptions>> = ({
  data,
  options,
  width,
  height,
}) => {
  const theme = useTheme2();
  const [sortBy, setSortBy] = React.useState<SortColumn>("Name");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");

  // Construct the percentile column name dynamically
  const percentileColumnName = `P${options.durationPercentile || 80} Duration (s)`;

  const handleSort = (column: SortColumn) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const rows: ExecutionRow[] = useMemo(() => {
    const series = data.series[0];
    if (!series || !series.fields) {
      return [];
    }

    const nameField = series.fields.find((f) => f.name === "Name");
    const runHistoryField = series.fields.find((f) => f.name === "Run History (s)");
    const outcomeHistoryField = series.fields.find((f) => f.name === "Outcome History");
    const runIdsField = series.fields.find((f) => f.name === "Run IDs");
    const urlsField = series.fields.find((f) => f.name === "URLs");
    const startedTimesField = series.fields.find((f) => f.name === "Started Times");
    const completionTimesField = series.fields.find((f) => f.name === "Completion Times");
    const queueHistoryField = series.fields.find((f) => f.name === "Queue History (s)");
    const lastOutcomeField = series.fields.find((f) => f.name === "Last Outcome");
    const lastDurationField = series.fields.find((f) => f.name === "Last Duration (s)");
    const lastQueueField = series.fields.find((f) => f.name === "Last Queue (s)");
    // Look for the configured percentile column, fallback to P80 for backward compatibility
    const percentileDurationField =
      series.fields.find((f) => f.name === percentileColumnName) ||
      series.fields.find((f) => f.name === "P80 Duration (s)");
    const totalRunsField = series.fields.find((f) => f.name === "Total Runs");
    const passedField = series.fields.find((f) => f.name === "Passed");
    const failedField = series.fields.find((f) => f.name === "Failed");
    const skippedField = series.fields.find((f) => f.name === "Skipped");

    if (!nameField || !runHistoryField) {
      return [];
    }

    const rowCount = nameField.values.length;
    const result: ExecutionRow[] = [];

    for (let i = 0; i < rowCount; i++) {
      result.push({
        Name: nameField.values[i],
        "Run History (s)": sanitizeNumericArray(parseArray(runHistoryField.values[i])),
        "Outcome History": parseArray(outcomeHistoryField?.values[i]),
        "Run IDs": parseArray(runIdsField?.values[i]),
        URLs: parseArray(urlsField?.values[i]),
        "Started Times": parseArray(startedTimesField?.values[i]),
        "Completion Times": parseArray(completionTimesField?.values[i]),
        "Queue History (s)": queueHistoryField?.values[i]
          ? sanitizeNumericArray(parseArray(queueHistoryField.values[i]))
          : undefined,
        "Last Outcome": lastOutcomeField?.values[i] || "unknown",
        "Last Duration (s)": lastDurationField?.values[i] || 0,
        "Last Queue (s)": lastQueueField?.values[i],
        "P80 Duration (s)": percentileDurationField?.values[i] || 0,
        "Total Runs": totalRunsField?.values[i] || 0,
        Passed: passedField?.values[i],
        Failed: failedField?.values[i],
        Skipped: skippedField?.values[i],
      });
    }

    return result;
  }, [data, percentileColumnName]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortBy) {
        case "Name":
          aVal = a.Name;
          bVal = b.Name;
          break;
        case "Last Duration (s)":
          aVal = a["Last Duration (s)"];
          bVal = b["Last Duration (s)"];
          break;
        case "Last Queue (s)":
          aVal = a["Last Queue (s)"] ?? -1;
          bVal = b["Last Queue (s)"] ?? -1;
          break;
        case "P80 Duration (s)":
          aVal = a["P80 Duration (s)"];
          bVal = b["P80 Duration (s)"];
          break;
        case "Total Runs":
          aVal = a["Total Runs"];
          bVal = b["Total Runs"];
          break;
        case "Passed":
          aVal = a.Passed ?? -1;
          bVal = b.Passed ?? -1;
          break;
        case "Failed":
          aVal = a.Failed ?? -1;
          bVal = b.Failed ?? -1;
          break;
        case "Skipped":
          aVal = a.Skipped ?? -1;
          bVal = b.Skipped ?? -1;
          break;
        default:
          return 0;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [rows, sortBy, sortDirection]);

  const maxDuration = useMemo(() => {
    let max = 0;
    sortedRows.forEach((row) => {
      row["Run History (s)"].forEach((d) => {
        if (d > max) {
          max = d;
        }
      });
      // Include queue durations in the max calculation for unified scale
      if (row["Queue History (s)"]) {
        row["Queue History (s)"].forEach((d) => {
          if (d > max) {
            max = d;
          }
        });
      }
    });
    return max;
  }, [sortedRows]);

  const hasTestBreakdown = sortedRows.some((r) => r.Passed !== undefined);

  const renderSortIcon = (column: SortColumn) => {
    if (sortBy !== column) {
      return <span style={{ opacity: 0.3, marginLeft: "4px" }}>&#x21D5;</span>;
    }
    return (
      <span style={{ marginLeft: "4px" }}>{sortDirection === "asc" ? "\u2191" : "\u2193"}</span>
    );
  };

  // Handle no data case
  if (sortedRows.length === 0) {
    return (
      <div
        style={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme.colors.background.primary,
          color: theme.colors.text.secondary,
        }}
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ fontSize: "1.2em", marginBottom: "8px" }}>No execution data found</div>
          <div style={{ fontSize: "0.9em" }}>
            Check your query returns data with required columns: Name, Run History (s), Outcome
            History, Run IDs, URLs
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width,
        height,
        overflow: "auto",
        background: theme.colors.background.primary,
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: theme.typography.fontSize,
          color: theme.colors.text.primary,
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: `2px solid ${theme.colors.border.strong}`,
              background: theme.colors.background.secondary,
            }}
          >
            <th
              style={{
                padding: "12px 8px",
                textAlign: "left",
                fontWeight: 600,
                cursor: "pointer",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
              onClick={() => handleSort("Name")}
            >
              Name{renderSortIcon("Name")}
            </th>
            <th
              style={{
                padding: "12px 8px",
                textAlign: "left",
                fontWeight: 600,
              }}
            >
              History
            </th>
            <th
              style={{
                padding: "12px 8px",
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              Last Outcome
            </th>
            <th
              style={{
                padding: "12px 8px",
                textAlign: "right",
                fontWeight: 600,
                cursor: "pointer",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
              onClick={() => handleSort("Last Duration (s)")}
            >
              Last Duration{renderSortIcon("Last Duration (s)")}
            </th>
            {options.showQueueHistory && (
              <th
                style={{
                  padding: "12px 8px",
                  textAlign: "right",
                  fontWeight: 600,
                  cursor: "pointer",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                }}
                onClick={() => handleSort("Last Queue (s)")}
              >
                Last Queue{renderSortIcon("Last Queue (s)")}
              </th>
            )}
            <th
              style={{
                padding: "12px 8px",
                textAlign: "right",
                fontWeight: 600,
                cursor: "pointer",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
              onClick={() => handleSort("P80 Duration (s)")}
            >
              P{options.durationPercentile || 80} Duration
              {renderSortIcon("P80 Duration (s)")}
            </th>
            <th
              style={{
                padding: "12px 8px",
                textAlign: "center",
                fontWeight: 600,
                cursor: "pointer",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
              onClick={() => handleSort("Total Runs")}
            >
              Total Runs{renderSortIcon("Total Runs")}
            </th>
            {hasTestBreakdown && (
              <>
                <th
                  style={{
                    padding: "12px 8px",
                    textAlign: "center",
                    fontWeight: 600,
                    background: "#73BF69",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                  onClick={() => handleSort("Passed")}
                >
                  Passed{renderSortIcon("Passed")}
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    textAlign: "center",
                    fontWeight: 600,
                    background: "#F2495C",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                  onClick={() => handleSort("Failed")}
                >
                  Failed{renderSortIcon("Failed")}
                </th>
                <th
                  style={{
                    padding: "12px 8px",
                    textAlign: "center",
                    fontWeight: 600,
                    background: "#B7B7B7",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                  onClick={() => handleSort("Skipped")}
                >
                  Skipped{renderSortIcon("Skipped")}
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, index) => (
            <tr
              key={index}
              style={{
                borderBottom: `1px solid ${theme.colors.border.weak}`,
              }}
            >
              <td
                style={{
                  padding: "8px",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                {row.Name}
              </td>
              <td style={{ padding: "8px" }}>
                <HistoryBarChart
                  durations={row["Run History (s)"].slice(0, options.maxHistoryItems)}
                  outcomes={row["Outcome History"].slice(0, options.maxHistoryItems)}
                  runIds={row["Run IDs"].slice(0, options.maxHistoryItems)}
                  urls={row.URLs.slice(0, options.maxHistoryItems)}
                  startedTimes={row["Started Times"].slice(0, options.maxHistoryItems)}
                  completionTimes={row["Completion Times"].slice(0, options.maxHistoryItems)}
                  maxValue={maxDuration}
                  barWidth={options.barWidth}
                  barHeight={options.barHeight}
                  barGap={options.barGap}
                  queueDurations={
                    options.showQueueHistory && row["Queue History (s)"]
                      ? row["Queue History (s)"].slice(0, options.maxHistoryItems)
                      : undefined
                  }
                />
              </td>
              <td style={{ padding: "8px", textAlign: "center" }}>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: "12px",
                    background: getOutcomeColor(row["Last Outcome"]),
                    color: "#fff",
                    fontWeight: 500,
                    fontSize: "0.9em",
                  }}
                >
                  {row["Last Outcome"]}
                </span>
              </td>
              <td
                style={{
                  padding: "8px",
                  textAlign: "right",
                  whiteSpace: "nowrap",
                }}
              >
                {row["Last Duration (s)"].toFixed(1)}s
              </td>
              {options.showQueueHistory && (
                <td
                  style={{
                    padding: "8px",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  {row["Last Queue (s)"] !== undefined
                    ? `${row["Last Queue (s)"].toFixed(1)}s`
                    : "-"}
                </td>
              )}
              <td
                style={{
                  padding: "8px",
                  textAlign: "right",
                  whiteSpace: "nowrap",
                }}
              >
                {row["P80 Duration (s)"].toFixed(1)}s
              </td>
              <td style={{ padding: "8px", textAlign: "center" }}>{row["Total Runs"]}</td>
              {hasTestBreakdown && (
                <>
                  <td style={{ padding: "8px", textAlign: "center" }}>{row.Passed || 0}</td>
                  <td style={{ padding: "8px", textAlign: "center" }}>{row.Failed || 0}</td>
                  <td style={{ padding: "8px", textAlign: "center" }}>{row.Skipped || 0}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
