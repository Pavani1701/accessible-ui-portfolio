// Automated WCAG 2.1 A/AA checks with axe-core.
// Automated tools catch roughly a third of issues; see ACCESSIBILITY.md for
// the manual screen reader and keyboard test plan that complements these.
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const pages = [
  { name: 'Overview', path: '/index.html' },
  { name: 'Components', path: '/components.html' },
  { name: 'Application form', path: '/apply.html' },
];

async function expectNoViolations(page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const summary = results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`);
  expect(summary, summary.join('\n')).toEqual([]);
}

for (const { name, path } of pages) {
  for (const colorScheme of ['light', 'dark']) {
    test(`${name} has no WCAG 2.1 AA violations (${colorScheme} theme)`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(path);
      await expectNoViolations(page);
    });
  }

  test(`${name} reflows without horizontal scrolling`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('Form error state has no violations', async ({ page }) => {
  await page.goto('/apply.html');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'There is a problem' })).toBeVisible();
  await expectNoViolations(page);
});

test('Open modal dialog has no violations', async ({ page }) => {
  await page.goto('/components.html');
  await page.getByRole('button', { name: 'Withdraw application' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expectNoViolations(page);
});

test('Review step has no violations', async ({ page }) => {
  await page.goto('/apply.html');
  await page.getByLabel('First name').fill('Maria');
  await page.getByLabel('Last name').fill('Alvarez');
  await page.getByLabel('Month').fill('3');
  await page.getByLabel('Day').fill('27');
  await page.getByLabel('Year').fill('1990');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Email address').fill('maria@example.com');
  await page.getByLabel('Email', { exact: true }).check();
  await page.getByLabel('County of residence').selectOption('Madison');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('How many people live in your household?').fill('3');
  await page.getByLabel('Yes').check();
  await page.getByLabel(/I confirm/).check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: /Check your answers/ })).toBeFocused();
  await expectNoViolations(page);
});
