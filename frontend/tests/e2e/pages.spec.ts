import { expect, test } from '@playwright/test';

test('Pages app loads and exposes project links', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Polyglot NLP Toolkit' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/baditaflorin/polyglot-nlp-toolkit'
  );
  await expect(page.getByRole('link', { name: 'PayPal' })).toHaveAttribute(
    'href',
    'https://www.paypal.com/paypalme/florinbadita'
  );
  await expect(page.getByText(/version /)).toBeVisible();
  await expect(page.getByText(/commit /)).toBeVisible();
});
