import { test, expect } from '@playwright/test';

/**
 * Phase-5 TASK-07 — PanelLanding renders on /fa between TrustModel
 * and Services, communicating the co-managed-panel value prop.
 *
 * Asserts:
 *  - section is present and visible
 *  - both mock views (مشاور / شما) render
 *  - CTA links to /login?callbackUrl=/dashboard
 */
test.describe('Phase-5 — PanelLanding', () => {
  test('renders on /fa with both views + CTA', async ({ page }) => {
    await page.goto('/fa', { waitUntil: 'domcontentloaded' });

    const section = page.getByTestId('panel-landing');
    await expect(section).toBeVisible();

    await expect(section).toContainText('پنل مشترک شما و مشاورتان');
    await expect(section).toContainText('نمای مشاور');
    await expect(section).toContainText('نمای شما');

    const cta = section.getByRole('link', { name: /ورود به پنل کاربری/ });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/login?callbackUrl=/dashboard');
  });
});
