import React from 'react';
import { render, screen } from '@testing-library/react';
import { ExecutionTable } from './ExecutionTable';
import { PanelProps, FieldType, LoadingState, toDataFrame } from '@grafana/data';
import { ExecutionTableOptions } from '../types';

describe('ExecutionTable', () => {
  const defaultOptions: ExecutionTableOptions = {
    maxHistoryItems: 20,
    showQueueHistory: true,
    barHeight: 20,
    barWidth: 8,
    barGap: 2,
    durationPercentile: 80,
  };

  const createMockPanelProps = (data: any): PanelProps<ExecutionTableOptions> => ({
    data: {
      series: [
        toDataFrame({
          fields: data,
        }),
      ],
      state: LoadingState.Done,
      timeRange: {} as any,
    },
    options: defaultOptions,
    width: 800,
    height: 600,
    timeRange: {} as any,
    timeZone: 'browser',
    transparent: false,
    id: 1,
    title: 'Test Panel',
    fieldConfig: {} as any,
    onOptionsChange: jest.fn(),
    onFieldConfigChange: jest.fn(),
    replaceVariables: jest.fn((str) => str),
    onChangeTimeRange: jest.fn(),
    renderCounter: 0,
    eventBus: {} as any,
  });

  it('should render "No execution data found" when there is no data', () => {
    const props = createMockPanelProps([]);
    render(<ExecutionTable {...props} />);
    expect(screen.getByText('No execution data found')).toBeInTheDocument();
  });

  it('should render table with execution data', () => {
    const props = createMockPanelProps([
      {
        name: 'Name',
        type: FieldType.string,
        values: ['build-main', 'test-suite'],
      },
      {
        name: 'Run History (s)',
        type: FieldType.other,
        values: [
          [45.2, 43.1, 47.8],
          [123.4, 118.7, 125.3],
        ],
      },
      {
        name: 'Outcome History',
        type: FieldType.other,
        values: [
          ['success', 'success', 'failure'],
          ['failure', 'success', 'success'],
        ],
      },
      {
        name: 'Run IDs',
        type: FieldType.other,
        values: [
          ['run-1', 'run-2', 'run-3'],
          ['test-1', 'test-2', 'test-3'],
        ],
      },
      {
        name: 'URLs',
        type: FieldType.other,
        values: [
          ['http://example.com/1', 'http://example.com/2', 'http://example.com/3'],
          ['http://example.com/t1', 'http://example.com/t2', 'http://example.com/t3'],
        ],
      },
      {
        name: 'Last Outcome',
        type: FieldType.string,
        values: ['success', 'failure'],
      },
      {
        name: 'Last Duration (s)',
        type: FieldType.number,
        values: [45.2, 123.4],
      },
      {
        name: 'P80 Duration (s)',
        type: FieldType.number,
        values: [47.1, 125.0],
      },
      {
        name: 'Total Runs',
        type: FieldType.number,
        values: [234, 189],
      },
    ]);

    render(<ExecutionTable {...props} />);

    // Check table headers
    expect(screen.getByText(/^Name/)).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Last Outcome')).toBeInTheDocument();
    expect(screen.getByText(/^Last Duration/)).toBeInTheDocument();
    expect(screen.getByText(/^P80 Duration/)).toBeInTheDocument();
    expect(screen.getByText(/^Total Runs/)).toBeInTheDocument();

    // Check data rows
    expect(screen.getByText('build-main')).toBeInTheDocument();
    expect(screen.getByText('test-suite')).toBeInTheDocument();
    expect(screen.getByText('234')).toBeInTheDocument();
    expect(screen.getByText('189')).toBeInTheDocument();
  });

  it('should show last queue column when showQueueHistory is true and queue data exists', () => {
    const props = createMockPanelProps([
      {
        name: 'Name',
        type: FieldType.string,
        values: ['build-main'],
      },
      {
        name: 'Run History (s)',
        type: FieldType.other,
        values: [[45.2, 43.1]],
      },
      {
        name: 'Outcome History',
        type: FieldType.other,
        values: [['success', 'success']],
      },
      {
        name: 'Run IDs',
        type: FieldType.other,
        values: [['run-1', 'run-2']],
      },
      {
        name: 'URLs',
        type: FieldType.other,
        values: [['http://example.com/1', 'http://example.com/2']],
      },
      {
        name: 'Queue History (s)',
        type: FieldType.other,
        values: [[2.3, 1.8]],
      },
      {
        name: 'Last Outcome',
        type: FieldType.string,
        values: ['success'],
      },
      {
        name: 'Last Duration (s)',
        type: FieldType.number,
        values: [45.2],
      },
      {
        name: 'Last Queue (s)',
        type: FieldType.number,
        values: [2.3],
      },
      {
        name: 'P80 Duration (s)',
        type: FieldType.number,
        values: [47.1],
      },
      {
        name: 'Total Runs',
        type: FieldType.number,
        values: [234],
      },
    ]);

    render(<ExecutionTable {...props} />);

    expect(screen.getByText(/^Last Queue/)).toBeInTheDocument();
  });

  it('should hide queue columns when showQueueHistory is false', () => {
    const propsData = createMockPanelProps([
      {
        name: 'Name',
        type: FieldType.string,
        values: ['build-main'],
      },
      {
        name: 'Run History (s)',
        type: FieldType.other,
        values: [[45.2]],
      },
      {
        name: 'Outcome History',
        type: FieldType.other,
        values: [['success']],
      },
      {
        name: 'Run IDs',
        type: FieldType.other,
        values: [['run-1']],
      },
      {
        name: 'URLs',
        type: FieldType.other,
        values: [['http://example.com/1']],
      },
      {
        name: 'Last Outcome',
        type: FieldType.string,
        values: ['success'],
      },
      {
        name: 'Last Duration (s)',
        type: FieldType.number,
        values: [45.2],
      },
      {
        name: 'P80 Duration (s)',
        type: FieldType.number,
        values: [47.1],
      },
      {
        name: 'Total Runs',
        type: FieldType.number,
        values: [234],
      },
    ]);

    propsData.options = { ...defaultOptions, showQueueHistory: false };

    render(<ExecutionTable {...propsData} />);

    expect(screen.queryByText(/^Last Queue/)).not.toBeInTheDocument();
  });

  it('should show test breakdown columns when test data is present', () => {
    const props = createMockPanelProps([
      {
        name: 'Name',
        type: FieldType.string,
        values: ['unit-tests'],
      },
      {
        name: 'Run History (s)',
        type: FieldType.other,
        values: [[89.3, 87.5]],
      },
      {
        name: 'Outcome History',
        type: FieldType.other,
        values: [['pass', 'pass']],
      },
      {
        name: 'Run IDs',
        type: FieldType.other,
        values: [['suite-1', 'suite-2']],
      },
      {
        name: 'URLs',
        type: FieldType.other,
        values: [['http://example.com/1', 'http://example.com/2']],
      },
      {
        name: 'Last Outcome',
        type: FieldType.string,
        values: ['pass'],
      },
      {
        name: 'Last Duration (s)',
        type: FieldType.number,
        values: [89.3],
      },
      {
        name: 'P80 Duration (s)',
        type: FieldType.number,
        values: [91.3],
      },
      {
        name: 'Total Runs',
        type: FieldType.number,
        values: [523],
      },
      {
        name: 'Passed',
        type: FieldType.number,
        values: [145],
      },
      {
        name: 'Failed',
        type: FieldType.number,
        values: [3],
      },
      {
        name: 'Skipped',
        type: FieldType.number,
        values: [2],
      },
    ]);

    render(<ExecutionTable {...props} />);

    expect(screen.getByText(/^Passed/)).toBeInTheDocument();
    expect(screen.getByText(/^Failed/)).toBeInTheDocument();
    expect(screen.getByText(/^Skipped/)).toBeInTheDocument();
    expect(screen.getByText('145')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should parse SQL array syntax with curly braces', () => {
    const props = createMockPanelProps([
      {
        name: 'Name',
        type: FieldType.string,
        values: ['build-main'],
      },
      {
        name: 'Run History (s)',
        type: FieldType.other,
        values: ['{45.2,43.1,47.8}'], // SQL array syntax
      },
      {
        name: 'Outcome History',
        type: FieldType.other,
        values: ['{success,success,failure}'], // SQL array syntax
      },
      {
        name: 'Run IDs',
        type: FieldType.other,
        values: ['{run-1,run-2,run-3}'], // SQL array syntax
      },
      {
        name: 'URLs',
        type: FieldType.other,
        values: ['{http://example.com/1,http://example.com/2,http://example.com/3}'], // SQL array syntax
      },
      {
        name: 'Last Outcome',
        type: FieldType.string,
        values: ['success'],
      },
      {
        name: 'Last Duration (s)',
        type: FieldType.number,
        values: [45.2],
      },
      {
        name: 'P80 Duration (s)',
        type: FieldType.number,
        values: [47.1],
      },
      {
        name: 'Total Runs',
        type: FieldType.number,
        values: [234],
      },
    ]);

    render(<ExecutionTable {...props} />);

    expect(screen.getByText('build-main')).toBeInTheDocument();
    expect(screen.getByText('234')).toBeInTheDocument();
  });

  it('should handle null values in numeric arrays by converting to zero', () => {
    const props = createMockPanelProps([
      {
        name: 'Name',
        type: FieldType.string,
        values: ['build-with-nulls'],
      },
      {
        name: 'Run History (s)',
        type: FieldType.other,
        values: ['[45.2,null,47.8]'], // JSON with null
      },
      {
        name: 'Outcome History',
        type: FieldType.other,
        values: [['success', 'success', 'failure']],
      },
      {
        name: 'Run IDs',
        type: FieldType.other,
        values: [['run-1', 'run-2', 'run-3']],
      },
      {
        name: 'URLs',
        type: FieldType.other,
        values: [['http://example.com/1', 'http://example.com/2', 'http://example.com/3']],
      },
      {
        name: 'Last Outcome',
        type: FieldType.string,
        values: ['success'],
      },
      {
        name: 'Last Duration (s)',
        type: FieldType.number,
        values: [45.2],
      },
      {
        name: 'P80 Duration (s)',
        type: FieldType.number,
        values: [47.1],
      },
      {
        name: 'Total Runs',
        type: FieldType.number,
        values: [234],
      },
    ]);

    render(<ExecutionTable {...props} />);

    expect(screen.getByText('build-with-nulls')).toBeInTheDocument();
  });

  it('should handle SQL array syntax with NULL values in numeric arrays', () => {
    const props = createMockPanelProps([
      {
        name: 'Name',
        type: FieldType.string,
        values: ['build-sql-nulls'],
      },
      {
        name: 'Run History (s)',
        type: FieldType.other,
        values: ['{45.2,NULL,47.8}'], // SQL array with NULL
      },
      {
        name: 'Outcome History',
        type: FieldType.other,
        values: ['{success,success,failure}'],
      },
      {
        name: 'Run IDs',
        type: FieldType.other,
        values: ['{run-1,run-2,run-3}'],
      },
      {
        name: 'URLs',
        type: FieldType.other,
        values: ['{http://example.com/1,http://example.com/2,http://example.com/3}'],
      },
      {
        name: 'Queue History (s)',
        type: FieldType.other,
        values: ['{2.3,null,1.8}'], // SQL array with null (lowercase)
      },
      {
        name: 'Last Outcome',
        type: FieldType.string,
        values: ['success'],
      },
      {
        name: 'Last Duration (s)',
        type: FieldType.number,
        values: [45.2],
      },
      {
        name: 'Last Queue (s)',
        type: FieldType.number,
        values: [2.3],
      },
      {
        name: 'P80 Duration (s)',
        type: FieldType.number,
        values: [47.1],
      },
      {
        name: 'Total Runs',
        type: FieldType.number,
        values: [234],
      },
    ]);

    render(<ExecutionTable {...props} />);

    expect(screen.getByText('build-sql-nulls')).toBeInTheDocument();
  });
});
