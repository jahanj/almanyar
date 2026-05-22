import { expect, test } from '@playwright/test';

// FAQ accordion is rendered on these pages today. The test will probe whichever
// is reachable on the current server (some pages live at the old root URL until
// BUG-01 lands; some have already moved to /fa). We pass if at least one page
// has an accordion AND every accordion on every probed page is clean.
const CANDIDATES = [
  '/fa/germany-visa-from-turkey',
  '/fa/germany-visa/visametric',
  '/fa/germany-visa/requirements',
];

test.describe('BUG-04 — FAQ accordion', () => {
  test('no "+" or "-" text artifacts; ChevronDown SVG present; keyboard works; aria-expanded flips', async ({ page }) => {
    let probed = 0;

    for (const path of CANDIDATES) {
      const resp = await page.goto(path, { waitUntil: 'domcontentloaded' });
      if (!resp || resp.status() !== 200) continue;

      // Radix Accordion triggers carry `data-state` on the <button>. Header
      // hamburger does not — this is how we scope to FAQ-only.
      const triggers = page.locator('button[data-state][aria-expanded]');
      const count = await triggers.count();
      if (count === 0) continue;
      probed++;

      // No literal "+" or "-" visible as the toggle icon.
      for (let i = 0; i < count; i++) {
        const t = triggers.nth(i);
        const text = (await t.innerText()).trim();
        expect(text, `trigger #${i} on ${path} contains "+"`).not.toMatch(/\+\s*$/);
        expect(text, `trigger #${i} on ${path} contains "-"`).not.toMatch(/-\s*$/);
        // ChevronDown from lucide-react carries class "lucide-chevron-down".
        await expect(t.locator('svg.lucide-chevron-down').first()).toBeAttached();
      }

      // Keyboard activation flips aria-expanded.
      const first = triggers.first();
      await first.focus();
      const expandedBefore = await first.getAttribute('aria-expanded');
      await page.keyboard.press('Enter');
      await expect(first).toHaveAttribute(
        'aria-expanded',
        expandedBefore === 'true' ? 'false' : 'true',
      );

      // Space toggles too.
      await page.keyboard.press(' ');
      await expect(first).toHaveAttribute('aria-expanded', expandedBefore ?? 'false');
    }

    expect(probed, 'no candidate page rendered a FAQ accordion').toBeGreaterThan(0);
  });
});
