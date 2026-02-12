import { PanelPlugin } from "@grafana/data";
import { ExecutionTableOptions } from "./types";
import { ExecutionTable } from "./components/ExecutionTable";

export const plugin = new PanelPlugin<ExecutionTableOptions>(ExecutionTable).setPanelOptions(
  (builder) => {
    return builder
      .addNumberInput({
        path: "maxHistoryItems",
        name: "Max history items",
        description: "Maximum number of executions to display in history bar chart",
        defaultValue: 20,
        settings: {
          min: 5,
          max: 50,
        },
      })
      .addBooleanSwitch({
        path: "showQueueHistory",
        name: "Show queue history",
        description: "Display queue duration history column",
        defaultValue: true,
      })
      .addNumberInput({
        path: "barHeight",
        name: "Bar height",
        description: "Height of each bar in pixels",
        defaultValue: 20,
        settings: {
          min: 10,
          max: 40,
        },
      })
      .addNumberInput({
        path: "barWidth",
        name: "Bar width",
        description: "Width of each bar in pixels",
        defaultValue: 8,
        settings: {
          min: 2,
          max: 30,
        },
      })
      .addNumberInput({
        path: "barGap",
        name: "Bar gap",
        description: "Gap between bars in pixels",
        defaultValue: 2,
        settings: {
          min: 0,
          max: 10,
        },
      })
      .addNumberInput({
        path: "durationPercentile",
        name: "Duration percentile",
        description:
          "Percentile to display for duration (e.g., 50 for P50, 80 for P80, 95 for P95)",
        defaultValue: 80,
        settings: {
          min: 1,
          max: 99,
          integer: true,
        },
      });
  },
);
