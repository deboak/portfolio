import { expect, test } from '@playwright/test';

test('home page presents the portfolio and primary navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Thoughtful products/i })).toBeVisible();
  await expect(page.getByRole('img', { name: /Akinode in a black suit/i })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects');
  await expect(page.getByRole('link', { name: 'Resume' })).toHaveAttribute('href', '/resume');
  await expect(page.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
});
test('public navigation reaches about and contact pages', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('heading', { name: /Engineering with clarity/i })).toBeVisible();
  await page.getByRole('link', { name: 'Contact' }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.getByRole('heading', { name: /make something/i })).toBeVisible();
});
test('contact form submits and shows confirmation', async ({ page }) => {
  await page.route('**/api/v1/contact', (route) =>
    route.fulfill({
      status: 202,
      contentType: 'application/json',
      body: JSON.stringify({ data: { id: 'contact_e2e', status: 'PENDING' } }),
    }),
  );
  await page.goto('/contact');
  await page.getByLabel('Name').fill('Ada Lovelace');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Subject').fill('Portfolio project');
  await page
    .getByLabel('Message')
    .fill('I would like to discuss a reliable full-stack application with you.');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText(/Message queued successfully/i)).toBeVisible();
});
test('admin login is present without exposing the dashboard', async ({ page }) => {
  await page.goto('/admin/login');
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByText('Admin dashboard')).toHaveCount(0);
});
