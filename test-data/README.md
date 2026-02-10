# CDviz Execution Table - Test Data

This directory contains **hardcoded test data** for testing the CDviz Execution Table plugin during development.

## Files

- **`sample-executions.json`** - Complete test dataset with realistic execution data
- **`server.js`** - Optional: Simple Node.js server to serve test data via HTTP (if needed)

## Test Data Structure

The data matches the **exact format** returned by CDviz SQL queries in production:

```json
{
  "pipelinerun": [
    {
      "Name": "build-main",
      "Run History (s)": [45.2, 43.1, 47.8, ...],
      "Outcome History": ["success", "success", "failure", ...],
      "Run IDs": ["run-1234", "run-1233", ...],
      "URLs": ["https://ci.example.com/build/1234", ...],
      "Queue History (s)": [2.3, 1.8, 2.1, ...],
      "Last Outcome": "success",
      "Last Duration (s)": 45.2,
      "Last Queue (s)": 2.3,
      "P80 Duration (s)": 47.1,
      "Total Runs": 234
    }
  ],
  "taskrun": [...],
  "testcasesuite": [...]
}
```

## Test Datasets Included

### Pipeline Runs (`pipelinerun`)

- **build-main** - 234 total runs, mostly successful (2 failures)
- **test-suite** - 189 total runs, moderate failure rate (4 failures)
- **deploy-prod** - 67 total runs, high reliability (1 cancel)

### Task Runs (`taskrun`)

- **lint-code** - 456 total runs, 100% pass rate
- **compile-app** - 312 total runs, occasional failures (2 failures)

### Test Suites (`testcasesuite`)

- **unit-tests** - 523 total runs with test breakdown (145 passed, 3 failed, 2 skipped)
- **integration-tests** - 187 total runs with test breakdown (78 passed, 5 failed, 1 skipped)

## Using Test Data in Plugin Development

### 🎯 Recommended: Use the Test Showcase Dashboard

A **comprehensive showcase dashboard** is automatically provisioned with inline test data:

1. **Start Grafana:**

   ```bash
   docker compose up
   ```

2. **Open Grafana:** http://localhost:3000

3. **Navigate to:** Dashboards → **CDviz Execution Table - Test Showcase**

This dashboard demonstrates:

- ✅ All plugin features in one place
- ✅ Pipeline executions with queue tracking (3 examples)
- ✅ Task executions without queue tracking (2 examples)
- ✅ Test suite executions with test breakdown (2 examples)
- ✅ Inline test data (no external datasource needed)
- ✅ Interactive bar charts with tooltips and click-through
- ✅ Color-coded outcomes and comprehensive metrics

**Location:** `provisioning/dashboards/test-showcase.json`

### Alternative: Manual Panel Creation

For custom testing scenarios:

1. **Start Grafana with plugin:**

   ```bash
   docker compose up
   ```

2. **Create new dashboard**

3. **Add panel** with `cdviz-executiontable-panel` type

4. **Configure datasource:**
   - Use **TestData** datasource (built-in)
   - Or use **Infinity** datasource (auto-installed via docker-compose)

5. **Load data:**

   **Option A: Using TestData with inline CSV (Recommended)**
   - Datasource: `TestData DB`
   - Scenario: `CSV Content`
   - CSV: Copy from showcase dashboard or format arrays as CSV with escaped JSON

   **Option B: Using Infinity datasource (JSON)**
   - Source: `URL`
   - URL: `file:///root/cdviz-executiontable-panel/test-data/sample-executions.json`
   - Format: `Table`
   - Root selector: `pipelinerun` (or `taskrun`, `testcasesuite`)

## Data Format Details

### Column Types

| Column            | Type     | Description                                 |
| ----------------- | -------- | ------------------------------------------- |
| Name              | string   | Pipeline/task/test name                     |
| Run History (s)   | number[] | Array of last 20 durations                  |
| Outcome History   | string[] | Array of last 20 outcomes                   |
| Run IDs           | string[] | Array of last 20 run IDs                    |
| URLs              | string[] | Array of last 20 execution URLs             |
| Queue History (s) | number[] | Array of last 20 queue durations (optional) |
| Last Outcome      | string   | Most recent outcome                         |
| Last Duration (s) | number   | Most recent duration                        |
| Last Queue (s)    | number   | Most recent queue duration (optional)       |
| P80 Duration (s)  | number   | 80th percentile duration                    |
| Total Runs        | number   | Total execution count                       |
| Passed            | number   | Test cases passed (test suites only)        |
| Failed            | number   | Test cases failed (test suites only)        |
| Skipped           | number   | Test cases skipped (test suites only)       |

### Outcome Values

- `success` / `pass` - Successful execution (green)
- `failure` / `fail` - Failed execution (red)
- `cancel` / `cancelled` - Cancelled execution (gray)
- `skip` / `skipped` - Skipped execution (dark gray)
- `error` - Error execution (red)

## Modifying Test Data

To customize test data for your testing needs:

1. **Edit `sample-executions.json`**
2. **Maintain the exact structure** (column names and types)
3. **Ensure arrays have matching lengths** (Run IDs, URLs, Outcomes, etc.)
4. **Use realistic values** for durations and counts
5. **Restart Grafana** to reload data

### Example: Adding a New Pipeline

```json
{
  "Name": "security-scan",
  "Run History (s)": [23.4, 22.1, 24.8, 23.0, 22.5, ...],
  "Outcome History": ["success", "success", "failure", ...],
  "Run IDs": ["scan-5001", "scan-5000", ...],
  "URLs": ["https://ci.example.com/scan/5001", ...],
  "Queue History (s)": [1.5, 1.2, 1.8, ...],
  "Last Outcome": "success",
  "Last Duration (s)": 23.4,
  "Last Queue (s)": 1.5,
  "P80 Duration (s)": 24.5,
  "Total Runs": 156
}
```

## Verifying Plugin Behavior

Use this test data to verify:

1. **Bar chart rendering**
   - Each bar represents one execution
   - Bar height scales with duration
   - Colors match outcomes

2. **Interactivity**
   - Hover shows tooltip with details
   - Click opens URL in new tab

3. **Data accuracy**
   - Last Outcome displays correctly
   - P80 calculation matches expected
   - Total Runs count is accurate

4. **Edge cases**
   - All success (lint-code)
   - Mixed success/failure (test-suite)
   - With queue history (pipelinerun)
   - Without queue history (taskrun)
   - With test breakdown (testcasesuite)

## Production Data Compatibility

This test data is **100% compatible** with production CDviz deployments:

- Same SQL query structure used in `cdviz-grafana/dashboards_generator`
- Same column names and types
- Same PostgreSQL array format
- Same CDEvents outcome values

You can test the plugin with this data and confidently deploy it with real CDviz data.

## Troubleshooting

### Data not loading

1. **Check Infinity plugin installed:**

   ```bash
   docker compose logs grafana | grep infinity
   ```

2. **Verify JSON file mounted:**

   ```bash
   docker compose exec grafana ls -la /root/cdviz-executiontable-panel/test-data/
   ```

3. **Check Grafana logs:**
   ```bash
   docker compose logs grafana
   ```

### Arrays not rendering as bar charts

The plugin expects arrays in these columns:

- `Run History (s)` - number[]
- `Outcome History` - string[]
- `Run IDs` - string[]
- `URLs` - string[]
- `Queue History (s)` - number[] (optional)

Make sure your datasource returns these as proper JSON arrays, not strings.

### Colors not showing

Verify `Outcome History` array contains valid values:

- `success`, `pass`, `ok` → green
- `failure`, `fail`, `error` → red
- `cancel`, `cancelled` → gray
- `skip`, `skipped` → dark gray

## Resources

- **Plugin Source:** `../src/`
- **Test Showcase Dashboard:** `../provisioning/dashboards/test-showcase.json` ⭐ **Recommended**
- **Sample Dashboards:** `../provisioning/dashboards/` (multiple examples)
- **Production SQL:** `../../../cdviz-grafana/dashboards_generator/src/dashboards/execution_dashboards.ts`
- **CDviz Documentation:** https://cdviz.dev
- **Grafana TestData Datasource:** https://grafana.com/docs/grafana/latest/datasources/testdata/
