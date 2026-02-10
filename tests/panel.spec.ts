import { test, expect } from '@grafana/plugin-e2e';

test('should display table with pipeline execution data', async ({ gotoPanelEditPage, readProvisionedDashboard }) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'test-showcase.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '3' });

  // Check that the table is rendered
  await expect(panelEditPage.panel.locator.getByRole('table')).toBeVisible();

  // Check for expected column headers
  await expect(panelEditPage.panel.locator.getByRole('columnheader', { name: /Name/i })).toBeVisible();
  await expect(panelEditPage.panel.locator.getByRole('columnheader', { name: /History/i })).toBeVisible();
  await expect(panelEditPage.panel.locator.getByRole('columnheader', { name: /Last Outcome/i })).toBeVisible();
  await expect(panelEditPage.panel.locator.getByRole('columnheader', { name: /Last Duration/i })).toBeVisible();
  await expect(panelEditPage.panel.locator.getByRole('columnheader', { name: /Total Runs/i })).toBeVisible();

  // Check for pipeline names in the data
  await expect(panelEditPage.panel.locator.getByText('build-main')).toBeVisible();
  await expect(panelEditPage.panel.locator.getByText('test-suite')).toBeVisible();
  await expect(panelEditPage.panel.locator.getByText('deploy-prod')).toBeVisible();
});

test('should display task execution data without queue column', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'test-showcase.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '5' });

  // Check that the table is rendered with task data
  await expect(panelEditPage.panel.locator.getByRole('table')).toBeVisible();

  // Check for task names
  await expect(panelEditPage.panel.locator.getByText('lint-code')).toBeVisible();
  await expect(panelEditPage.panel.locator.getByText('compile-app')).toBeVisible();

  // Queue column should not be visible (showQueueHistory is false for this panel)
  await expect(panelEditPage.panel.locator.getByRole('columnheader', { name: /Last Queue/i })).not.toBeVisible();
});

test('should display test suite data with test breakdown columns', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'test-showcase.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '7' });

  // Check that test breakdown columns are visible
  await expect(panelEditPage.panel.locator.getByRole('columnheader', { name: /Passed/i })).toBeVisible();
  await expect(panelEditPage.panel.locator.getByRole('columnheader', { name: /Failed/i })).toBeVisible();
  await expect(panelEditPage.panel.locator.getByRole('columnheader', { name: /Skipped/i })).toBeVisible();

  // Check for test suite names
  await expect(panelEditPage.panel.locator.getByText('unit-tests')).toBeVisible();
  await expect(panelEditPage.panel.locator.getByText('integration-tests')).toBeVisible();
});
