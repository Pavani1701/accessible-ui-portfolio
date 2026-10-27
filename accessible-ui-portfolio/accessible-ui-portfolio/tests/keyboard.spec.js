// Keyboard interaction and focus management tests.
// These encode the WAI-ARIA Authoring Practices behaviors so regressions fail CI.
const { test, expect } = require('@playwright/test');

test.describe('Skip link', () => {
  test('is the first focusable element and moves focus to main', async ({ page }) => {
    await page.goto('/index.html');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });
});

test.describe('Tabs', () => {
  test('arrow keys move selection with roving tabindex', async ({ page }) => {
    await page.goto('/components.html');
    const first = page.getByRole('tab', { name: 'Eligibility' });
    const second = page.getByRole('tab', { name: 'Documents' });
    const last = page.getByRole('tab', { name: 'Timeline' });

    await first.focus();
    await page.keyboard.press('ArrowRight');
    await expect(second).toBeFocused();
    await expect(second).toHaveAttribute('aria-selected', 'true');
    await expect(first).toHaveAttribute('tabindex', '-1');
    await expect(page.getByRole('tabpanel', { name: 'Documents' })).toBeVisible();

    await page.keyboard.press('End');
    await expect(last).toBeFocused();
    await page.keyboard.press('ArrowRight'); // wraps around
    await expect(first).toBeFocused();
  });
});

test.describe('Accordion', () => {
  test('toggles aria-expanded and supports arrow navigation', async ({ page }) => {
    await page.goto('/components.html');
    const q1 = page.getByRole('button', { name: 'How long does an application take?' });
    const q2 = page.getByRole('button', { name: 'Can someone apply on my behalf?' });

    await q1.focus();
    await page.keyboard.press('Enter');
    await expect(q1).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText('About 15 minutes')).toBeVisible();

    await page.keyboard.press('ArrowDown');
    await expect(q2).toBeFocused();
  });
});

test.describe('Modal dialog', () => {
  test('moves focus in, closes on Escape, and returns focus to the trigger', async ({ page }) => {
    await page.goto('/components.html');
    const opener = page.getByRole('button', { name: 'Withdraw application' });
    await opener.click();

    const dialog = page.getByRole('dialog', { name: 'Withdraw your application?' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Keep my application' })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('confirm action announces the result in a status region', async ({ page }) => {
    await page.goto('/components.html');
    await page.getByRole('button', { name: 'Withdraw application' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Withdraw application' }).click();
    await expect(page.locator('#demo-status')).toHaveText(/has been withdrawn/);
  });
});

test.describe('Sortable table', () => {
  test('sets aria-sort on the sorted column only and announces the change', async ({ page }) => {
    await page.goto('/components.html');
    const applicantHeader = page.getByRole('columnheader', { name: /Applicant/ });
    await applicantHeader.getByRole('button').click();
    await expect(applicantHeader).toHaveAttribute('aria-sort', 'ascending');
    await expect(page.locator('tbody tr').first()).toContainText('Alvarez');

    await applicantHeader.getByRole('button').click();
    await expect(applicantHeader).toHaveAttribute('aria-sort', 'descending');
    await expect(page.locator('#case-status')).toHaveText(/Applicant, descending/);

    const submittedHeader = page.getByRole('columnheader', { name: /Submitted/ });
    await submittedHeader.getByRole('button').click();
    await expect(applicantHeader).not.toHaveAttribute('aria-sort', /.*/);
    await expect(page.locator('tbody tr').first()).toContainText('Aug 30, 2026');
  });

  test('filter announces the number of results', async ({ page }) => {
    await page.goto('/components.html');
    await page.getByLabel('Filter cases').fill('food');
    await expect(page.locator('#case-status')).toHaveText('Showing 2 of 8 cases.');
    await page.getByLabel('Filter cases').fill('zzz');
    await expect(page.getByText('No cases match your filter.').first()).toBeVisible();
  });
});

test.describe('Application form', () => {
  test('focuses the error summary and links to the invalid field', async ({ page }) => {
    await page.goto('/apply.html');
    await page.getByRole('button', { name: 'Continue' }).click();

    const summary = page.locator('#error-summary');
    await expect(summary).toBeFocused();
    await expect(page).toHaveTitle(/^Error:/);

    const firstName = page.getByLabel('First name');
    await expect(firstName).toHaveAttribute('aria-invalid', 'true');
    await expect(firstName).toHaveAttribute('aria-describedby', /first-name-error/);

    await summary.getByRole('link', { name: 'Enter your first name' }).click();
    await expect(firstName).toBeFocused();
  });

  test('rejects impossible dates with a specific message', async ({ page }) => {
    await page.goto('/apply.html');
    await page.getByLabel('First name').fill('Maria');
    await page.getByLabel('Last name').fill('Alvarez');
    await page.getByLabel('Month').fill('2');
    await page.getByLabel('Day').fill('31');
    await page.getByLabel('Year').fill('1990');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.locator('#dob-error')).toContainText('must be a real date');
  });

  test('moves focus to the next step heading and updates the page title', async ({ page }) => {
    await page.goto('/apply.html');
    await page.getByLabel('First name').fill('Maria');
    await page.getByLabel('Last name').fill('Alvarez');
    await page.getByLabel('Month').fill('3');
    await page.getByLabel('Day').fill('27');
    await page.getByLabel('Year').fill('1990');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByRole('heading', { name: /Contact details/ })).toBeFocused();
    await expect(page).toHaveTitle(/^Step 2 of 4: Contact details/);
    await expect(page.locator('.step-indicator li').first()).toContainText('(completed)');
  });
});
