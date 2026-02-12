#!/usr/bin/env node

/**
 * Simple JSON data server for testing CDviz Execution Table plugin
 * Serves hardcoded test data in the format expected by the panel
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3001;
const DATA_FILE = path.join(__dirname, "sample-executions.json");

// Load sample data
let sampleData;
try {
  sampleData = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  console.log("✓ Loaded sample data from", DATA_FILE);
} catch (err) {
  console.error("✗ Failed to load sample data:", err.message);
  process.exit(1);
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`${req.method} ${req.url}`);

  // Route: /api/query - Grafana JSON datasource format
  if (req.url.startsWith("/api/query") || req.url === "/query") {
    handleQuery(req, res);
    return;
  }

  // Route: /api/search - List available targets
  if (req.url === "/api/search" || req.url === "/search") {
    handleSearch(req, res);
    return;
  }

  // Route: /health - Health check
  if (req.url === "/health" || req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", message: "CDviz test data server" }));
    return;
  }

  // 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

/**
 * Handle /api/search - Return list of available targets
 */
function handleSearch(req, res) {
  const targets = Object.keys(sampleData);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(targets));
}

/**
 * Handle /api/query - Return data for specified target
 */
function handleQuery(req, res) {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const query = JSON.parse(body || "{}");
      const target = query.targets?.[0]?.target || "pipelinerun";

      console.log("  Query target:", target);

      // Get data for the requested target
      const data = sampleData[target] || [];

      // Convert to Grafana table format
      const response = convertToGrafanaTable(data, target);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(response));
    } catch (err) {
      console.error("  Error:", err.message);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
}

/**
 * Convert sample data to Grafana table format
 */
function convertToGrafanaTable(data, targetName) {
  if (!data || data.length === 0) {
    return [];
  }

  // Get all column names from first row
  const firstRow = data[0];
  const columnNames = Object.keys(firstRow);

  // Create columns array
  const columns = columnNames.map((name) => ({
    text: name,
    type: inferType(firstRow[name]),
  }));

  // Create rows array
  const rows = data.map((row) => columnNames.map((col) => row[col]));

  return [
    {
      columns: columns,
      rows: rows,
      type: "table",
      refId: "A",
    },
  ];
}

/**
 * Infer Grafana data type from value
 */
function inferType(value) {
  if (Array.isArray(value)) {
    return "string"; // Grafana will receive JSON string
  }
  if (typeof value === "number") {
    return "number";
  }
  if (typeof value === "string") {
    return "string";
  }
  return "string";
}

// Start server
server.listen(PORT, () => {
  console.log("");
  console.log("═══════════════════════════════════════════════════════");
  console.log("  CDviz Test Data Server");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
  console.log("  Status: Running");
  console.log(`  URL: http://localhost:${PORT}`);
  console.log("");
  console.log("  Available targets:");
  Object.keys(sampleData).forEach((target) => {
    console.log(`    - ${target} (${sampleData[target].length} rows)`);
  });
  console.log("");
  console.log("  Endpoints:");
  console.log("    GET  /health          - Health check");
  console.log("    POST /api/query       - Query data (Grafana format)");
  console.log("    GET  /api/search      - List available targets");
  console.log("");
  console.log("  Configure in Grafana:");
  console.log("    1. Add JSON datasource");
  console.log(`    2. URL: http://host.docker.internal:${PORT}`);
  console.log("    3. Target: pipelinerun, taskrun, or testcasesuite");
  console.log("");
  console.log("  Press Ctrl+C to stop");
  console.log("");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\nShutting down...");
  server.close(() => {
    console.log("Server stopped");
    process.exit(0);
  });
});
