import { expect, test } from '@playwright/test';
import { Buffer } from 'node:buffer';

test('Pages app loads and exposes project links', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Polyglot NLP Toolkit' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/baditaflorin/polyglot-nlp-toolkit',
  );
  await expect(page.getByRole('link', { name: 'PayPal' })).toHaveAttribute(
    'href',
    'https://www.paypal.com/paypalme/florinbadita',
  );
  await expect(page.getByText(/version /)).toBeVisible();
  await expect(page.getByText(/commit /)).toBeVisible();
});

test('stranger workflow controls are present and file input loads real data', async ({ page }) => {
  await page.goto('./');

  await expect(page.getByRole('button', { name: 'Sample' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Files' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Clipboard' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start fresh' })).toBeVisible();
  await expect(page.getByText('Settings')).toBeVisible();
  await expect(page.getByText('Take it out')).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles({
    name: 'people.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('name,city\nAna,Bucuresti\nMihai,Cluj'),
  });

  await expect(page.getByText('Loaded 2 documents from people.csv (csv).')).toBeVisible();
  await expect(page.getByText('2 documents')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy curl' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'State file' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Copy JSON' })).toBeDisabled();
});
