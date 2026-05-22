import { test, expect } from '@playwright/test';

const REQUIRED_PHRASES = [
  'آلمانیار توسط یک مشاور شخصی اداره می‌شود، نه یک شرکت ثبت‌شده',
  'اطلاعات ارائه‌شده در این سایت عمومی است',
  'شهریه دانشگاه را خودتان مستقیماً به حساب دانشگاه واریز می‌کنید',
  'هیچ مشاور صادقی نمی‌تواند نتیجه این مراحل را تضمین کند',
  'وابستگی به آن‌ها ندارد',
];

test.describe('LEGAL-01 — /fa/disclaimer', () => {
  test('page renders with all required honest disclosures', async ({ page, request }) => {
    expect((await request.get('/fa/disclaimer')).status()).toBe(200);
    await page.goto('/fa/disclaimer', { waitUntil: 'domcontentloaded' });
    for (const phrase of REQUIRED_PHRASES) {
      await expect(page.locator('body')).toContainText(phrase);
    }
  });
});
