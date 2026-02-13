# CDviz Execution Table Panel

[![Grafana Version](https://img.shields.io/badge/Grafana-%3E%3D9.0.0-orange?logo=grafana)](https://grafana.com)
[![License](https://img.shields.io/github/license/cdviz-dev/cdviz-executiontable-panel)](https://github.com/cdviz-dev/cdviz-executiontable-panel/blob/main/LICENSE)
[![Latest Release](https://img.shields.io/github/v/release/cdviz-dev/cdviz-executiontable-panel)](https://github.com/cdviz-dev/cdviz-executiontable-panel/releases)
[![CI](https://github.com/cdviz-dev/cdviz-executiontable-panel/actions/workflows/ci.yml/badge.svg)](https://github.com/cdviz-dev/cdviz-executiontable-panel/actions/workflows/ci.yml)

A Grafana panel plugin that displays execution data (pipelines, tasks, tests, etc.) in an interactive table with built-in bar chart history visualization. Perfect for monitoring CI/CD pipelines, test executions, and other time-series execution data using [CDEvents](https://cdevents.dev/).

![CDviz Execution Table Panel](src/img/screenshot-1.png)

## Features

- **Interactive execution table**: Display execution summaries with key metrics like success rate, duration, and last run status
- **Visual history bars**: Built-in sparkline-style bar charts showing execution history (success/failure/other states) over time
- **Customizable visualization**: Configure bar height, width, gap, and number of history items displayed
- **Duration percentiles**: Show configurable percentile values (P50, P80, P95) for duration analysis
- **Queue history**: Optional column to display queue duration patterns
- **CDEvents compatibility**: Designed to work seamlessly with CDEvents data from CI/CD pipelines
- **Responsive design**: Adapts to different panel sizes and dashboard layouts

## Requirements

- **Grafana**: Version 9.0.0 or higher
- **Data source**: Any Grafana data source that returns execution/pipeline data with the following fields:
  - Name/identifier
  - Status/result (success, failure, etc.)
  - Duration
  - Timestamp
  - Optional: Queue duration

## Getting started

### Installation

All methods listed at [Install a plugin | Grafana documentation](https://grafana.com/docs/grafana/latest/administration/plugin-management/plugin-install/)

#### From GitHub Releases

1. Download the latest release from the [releases page](https://github.com/cdviz-dev/cdviz-executiontable-panel/releases)
2. Extract the archive into your Grafana plugins directory:
   - Default path: `/var/lib/grafana/plugins`
   - Or custom path specified in `grafana.ini` under `[paths] plugins`
3. Restart Grafana
4. Verify the plugin is installed by checking Grafana's plugin list

#### From Source

```bash
# Clone the repository
git clone https://github.com/cdviz-dev/cdviz-executiontable-panel.git
cd cdviz-executiontable-panel

# Install dependencies
yarn install

# Build the plugin
yarn build

# Create a symbolic link to your Grafana plugins directory
ln -s $(pwd) /var/lib/grafana/plugins/cdviz-executiontable-panel

# Restart Grafana
sudo systemctl restart grafana-server
```

### Configuration

1. **Add the panel**: In your Grafana dashboard, add a new panel and select "CDviz Execution Table" as the visualization type

2. **Configure your data source**: Query your execution data ensuring you have the necessary fields:
   - Execution name/identifier
   - Status (success, failure, etc.)
   - Duration values
   - Timestamps

3. **Customize the visualization**: Use the panel options to adjust:
   - **Max history items**: Number of execution bars to display (5-50, default: 20)
   - **Show queue history**: Toggle queue duration history column (default: true)
   - **Bar height**: Height of each history bar in pixels (10-40px, default: 20px)
   - **Bar width**: Width of each history bar in pixels (2-30px, default: 8px)
   - **Bar gap**: Spacing between bars in pixels (0-10px, default: 2px)
   - **Duration percentile**: Percentile value for duration display (1-99, default: 80 for P80)

## Input Data Format

The plugin expects tabular data with the following columns. Arrays use PostgreSQL notation: `{value1,value2,value3}`.

### Required Fields

| Field Name         | Type        | Description                                                                                |
| ------------------ | ----------- | ------------------------------------------------------------------------------------------ |
| `Name`             | string      | Unique identifier for the execution (pipeline name, test suite name, etc.)                 |
| `Run History (s)`  | number[]    | Array of execution durations in seconds, oldest to newest                                  |
| `Outcome History`  | string[]    | Array of execution outcomes (e.g., `success`, `failure`, `pass`, `fail`, `cancel`, `skip`) |
| `Run IDs`          | string[]    | Array of unique execution run identifiers                                                  |
| `URLs`             | string[]    | Array of URLs linking to detailed execution views                                          |
| `Started Times`    | timestamp[] | Array of ISO 8601 timestamps when executions started                                       |
| `Completion Times` | timestamp[] | Array of ISO 8601 timestamps when executions completed                                     |
| `P80 Duration (s)` | number      | 80th percentile duration in seconds (or your configured percentile)                        |
| `Total Runs`       | number      | Total count of historical executions                                                       |

### Optional Fields

| Field Name          | Type                   | Description                                                                         |
| ------------------- | ---------------------- | ----------------------------------------------------------------------------------- |
| `Queue History (s)` | number[]               | Array of queue durations in seconds (for pipelines and test suites)                 |
| `Passed`            | number                 | Count of passed tests (for test suites only)                                        |
| `Failed`            | number                 | Count of failed tests (for test suites only)                                        |
| `Skipped`           | number                 | Count of skipped tests (for test suites only)                                       |
| `Tags`              | Record<string, string> | Key-value pairs for complementary information (artifactId, environment, team, etc.) |

### Auto-Computed Fields

The following fields are **automatically computed** by the plugin and should **NOT** be included in your input data:

| Field Name          | Computed From                    | Description                                                                                                 |
| ------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `Last Outcome`      | `Outcome History` + timestamps   | Extracted from `Outcome History` at the index of the most recent timestamp                                  |
| `Last Duration (s)` | `Run History (s)` + timestamps   | Extracted from `Run History (s)` at the index of the most recent timestamp                                  |
| `Last Queue (s)`    | `Queue History (s)` + timestamps | Extracted from `Queue History (s)` at the index of the most recent timestamp (if queue history is provided) |

**Note**: The plugin identifies the most recent execution by finding the latest timestamp in `Completion Times` (or `Started Times` if completion times aren't available), then extracts the corresponding values from the array fields at that index.

### Array Notation

Array fields accept both **SQL (PostgreSQL)** and **JSON** formats:

**SQL Format** (PostgreSQL-style with curly braces):

- Numbers: `{43.1,44.5,45.9}`
- Strings: `{success,failure,success}`
- URLs/IDs: `{run-1,run-2,run-3}`
- Timestamps: `{2025-01-01T08:00:00Z,2025-01-02T08:00:00Z}`

**JSON Format** (standard JSON arrays):

- Numbers: `[43.1,44.5,45.9]`
- Strings: `["success","failure","success"]`
- URLs/IDs: `["run-1","run-2","run-3"]`
- Timestamps: `["2025-01-01T08:00:00Z","2025-01-02T08:00:00Z"]`

**Important**: Array fields must have the same length (represent the same execution history window).

### Tags Format

The optional `Tags` field accepts key-value pairs in multiple formats:

**JSON Format**:

```json
{ "artifactId": "my-service", "environment": "production", "team": "platform" }
```

**PostgreSQL HSTORE Format**:

```
artifactId=>my-service, environment=>production, team=>platform
```

**Key-Value Format**:

```
artifactId=my-service,environment=production,team=platform
```

Tags are displayed as badges in the table, providing quick access to complementary information about each execution. Common use cases include:

- **artifactId**: Identifier for the artifact being built/tested
- **environment**: Target environment (dev, staging, production)
- **team**: Owning team or department
- **version**: Software version or build number
- **region**: Deployment region or data center

### Sample CSV

```csv
Name,Run History (s),Outcome History,Run IDs,URLs,Queue History (s),Started Times,Completion Times,P80 Duration (s),Total Runs,Tags
build-main,"{43.1,44.5,45.9,42.9,47.8}","{success,success,success,success,failure}","{run-1230,run-1231,run-1232,run-1233,run-1234}","{https://ci.example.com/build/1230,https://ci.example.com/build/1231,https://ci.example.com/build/1232,https://ci.example.com/build/1233,https://ci.example.com/build/1234}","{1.8,1.9,2.1,2.0,1.8}","{2025-01-16T08:00:00Z,2025-01-17T08:00:00Z,2025-01-18T08:00:00Z,2025-01-19T08:00:00Z,2025-01-20T08:00:00Z}","{2025-01-16T08:00:46Z,2025-01-17T08:00:44Z,2025-01-18T08:00:47Z,2025-01-19T08:00:45Z,2025-01-20T08:00:45Z}",47.1,234,"{""artifactId"":""my-service"",""environment"":""production"",""team"":""platform""}"
```

The plugin will automatically extract:

- `Last Outcome` = `"failure"` (from `Outcome History[4]` - the value at the latest timestamp)
- `Last Duration (s)` = `47.8` (from `Run History (s)[4]`)
- `Last Queue (s)` = `1.8` (from `Queue History (s)[4]`)

For a complete example with multiple execution types (pipelines, tasks, test suites), see the [test-showcase.json](provisioning/dashboards/test-showcase.json) dashboard.

## Usage

### Understanding the table columns

- **Name**: Execution identifier (pipeline, test, task name)
- **Summary**: Visual success/failure counts for recent executions
- **Last Duration**: Duration of the most recent execution
- **Last Result**: Status of the most recent execution (success/failure/etc.)
- **Last Run**: Timestamp of the most recent execution
- **P80 Duration** (or your configured percentile): Duration at the specified percentile
- **Total Runs**: Total number of recorded executions
- **History Bar**: Visual representation of execution history with color-coded status bars

### Color coding

- **Green**: Successful execution
- **Red**: Failed execution
- **Yellow/Orange**: Other states (queued, running, etc.)

## Development

### Prerequisites

- Node.js 22 or higher
- Yarn package manager
- [mise](https://mise.jdx.dev/) (optional, for task automation)

### Building the plugin

```bash
# Install dependencies
yarn install

# Build in development mode with watch
yarn dev

# Build for production
yarn build

# Run tests
yarn test:ci

# Run linter
yarn lint

# Fix linting issues
yarn lint:fix
```

### Using mise tasks

This project includes mise tasks for common operations:

```bash
# Install dependencies
mise run install:deps

# Run type checking
mise run typecheck

# Run linter
mise run lint

# Run tests
mise run test

# Build for production
mise run build

# Full CI pipeline (install, check, test, build)
mise run ci

# Package plugin as zip
mise run package
```

### Running the plugin locally

```bash
# Start Grafana dev server with Docker
yarn server

# The plugin will be available at http://localhost:3000
# Default credentials: admin/admin
```

### Running E2E tests

```bash
# Start Grafana server
yarn server

# In another terminal, run E2E tests
yarn e2e

# Test against a specific Grafana version
GRAFANA_VERSION=11.3.0 yarn server
```

## Contributing

We welcome contributions! Here's how you can help:

### Reporting bugs

If you find a bug, please [open an issue](https://github.com/cdviz-dev/cdviz-executiontable-panel/issues/new) with:

- A clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Grafana version and plugin version
- Screenshots if applicable

### Feature requests

Have an idea for a new feature? [Open an issue](https://github.com/cdviz-dev/cdviz-executiontable-panel/issues/new) with:

- A clear description of the feature
- Use cases and benefits
- Any relevant examples or mockups

### Pull requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`mise run ci`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a pull request

Please ensure your code:

- Passes all tests and linting checks
- Follows the existing code style
- Includes tests for new functionality
- Updates documentation as needed

## License

This plugin is licensed under the [Apache License 2.0](https://github.com/cdviz-dev/cdviz-executiontable-panel/blob/main/LICENSE).

## Learn more

- [CDviz Project](https://cdviz.dev) - Learn more about CDviz and CDEvents
- [CDEvents Specification](https://cdevents.dev) - Open specification for CI/CD events
- [Grafana Panel Plugin Documentation](https://grafana.com/developers/plugin-tools/introduction/panel-plugins) - Official guide to building panel plugins
- [Grafana Plugin Development](https://grafana.com/developers/plugin-tools) - Tools and resources for plugin development
- [Plugin Signing](https://grafana.com/developers/plugin-tools/publish-a-plugin/sign-a-plugin) - How to sign and distribute your plugin

---

**Built with ❤️ by the [CDviz Team](https://cdviz.dev)**
