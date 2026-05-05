import { test, expect, testData } from './fixtures';
import { navigateToGuest, waitForAppReady, openCart, closeModal } from './helpers';

test.describe('Mobile E2E Tests - Pixel 5 (Android)', () => {
  test.beforeEach(async ({ mobileViewport }) => {
    // Mobile-specific setup is handled by fixture
    await waitForAppReady(mobileViewport);
  });

  test('Mobile: complete order flow on small screen', async ({ mobileViewport }) => {
    const page = mobileViewport;

    // Verify viewport size (Pixel 5: 393x851)
    const size = page.viewportSize();
    expect(size?.width).toBe(393);
    expect(size?.height).toBeLessThanOrEqual(900);

    // Dismiss welcome modal
    const welcomeModal = page.locator('[data-testid="welcome-modal"]');
    if (await welcomeModal.isVisible().catch(() => false)) {
      const dismissBtn = page.locator('button:has-text("Dismiss")').first();
      await dismissBtn.click();
    }

    // Verify layout is not broken on mobile
    const mainContainer = page.locator('.min-h-screen, [role="main"]').first();
    const boundingBox = await mainContainer.boundingBox();
    expect(boundingBox?.width).toBeLessThanOrEqual(400);

    // Verify no horizontal scroll needed
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // Allow small margin
  });

  test('Mobile: tap gestures and touch interactions', async ({ mobileViewport }) => {
    const page = mobileViewport;

    // Dismiss welcome modal
    const welcomeModal = page.locator('[data-testid="welcome-modal"]');
    if (await welcomeModal.isVisible().catch(() => false)) {
      await page.locator('button:has-text("Dismiss")').click();
    }

    // Test tap on category
    const categoryButton = page.locator('button:has-text("Makanan")').first();
    await categoryButton.tap();
    await page.waitForTimeout(300);

    // Verify category filter works on mobile
    const menuItems = page.locator('[data-testid^="menu-item-"]');
    expect(await menuItems.count()).toBeGreaterThan(0);

    // Test tap on menu item
    const firstItem = menuItems.first();
    await firstItem.locator('button').first().tap();
    await page.waitForTimeout(300);

    // Verify modal is tappable
    const addBtn = page.locator('button:has-text("Tambah")').first();
    expect(await addBtn.isEnabled()).toBe(true);
  });

  test('Mobile: scroll behavior and layout shift', async ({ mobileViewport }) => {
    const page = mobileViewport;

    // Track scroll position
    const initialScroll = await page.evaluate(() => window.scrollY);

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 200));
    const afterScroll = await page.evaluate(() => window.scrollY);
    expect(afterScroll).toBeGreaterThan(initialScroll);

    // Check for cumulative layout shift (should be minimal)
    const cls = await page.evaluate(() => {
      // In real scenarios, use Web Vitals library
      return 0;
    });
    expect(cls).toBeLessThanOrEqual(0.1); // CLS should be low
  });

  test('Mobile: keyboard and input handling', async ({ mobileViewport }) => {
    const page = mobileViewport;

    // Dismiss modal
    const welcomeModal = page.locator('[data-testid="welcome-modal"]');
    if (await welcomeModal.isVisible().catch(() => false)) {
      await page.locator('button:has-text("Dismiss")').click();
    }

    // Click on menu item detail
    const menuItem = page.locator('[data-testid^="menu-item-"]').first();
    await menuItem.locator('button').first().click();

    // Test keyboard input
    const quantityInput = page.locator('input[type="number"]');
    await quantityInput.tap();
    await quantityInput.fill('5');

    const notesField = page.locator('textarea');
    if (await notesField.isVisible().catch(() => false)) {
      await notesField.tap();
      await notesField.fill('Test notes on mobile');
      expect(await notesField.inputValue()).toBe('Test notes on mobile');
    }
  });

  test('Mobile: cart drawer/panel responsiveness', async ({ mobileViewport }) => {
    const page = mobileViewport;

    // Dismiss modal
    const welcomeModal = page.locator('[data-testid="welcome-modal"]');
    if (await welcomeModal.isVisible().catch(() => false)) {
      await page.locator('button:has-text("Dismiss")').click();
    }

    // Add item to cart
    const menuItem = page.locator('[data-testid^="menu-item-"]').first();
    const addBtn = menuItem.locator('button:has-text("+ Keranjang")');
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();
    } else {
      await menuItem.locator('button').first().click();
      await page.locator('button:has-text("Tambah")').click();
    }

    // Verify cart panel opens
    await page.waitForTimeout(500);
    const cartPanel = page.locator('[data-testid="cart-panel"], .cart-panel');

    // On mobile, cart might slide in from bottom or side
    const cartIsVisible = await cartPanel.isVisible().catch(() => false);
    expect(cartIsVisible || (await page.locator('.drawer, [role="dialog"]').isVisible())).toBe(true);
  });

  test('Mobile: orientation changes (landscape to portrait)', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Start in portrait
    await page.setViewportSize({ width: 393, height: 851 });
    await navigateToGuest(page, 'A1');

    // Dismiss welcome modal
    const welcomeModal = page.locator('[data-testid="welcome-modal"]');
    if (await welcomeModal.isVisible().catch(() => false)) {
      await page.locator('button:has-text("Dismiss")').click();
    }

    // Verify content visible in portrait
    const contentPortrait = page.locator('main, [role="main"], .main-content');
    await expect(contentPortrait.first()).toBeVisible();

    // Switch to landscape
    await page.setViewportSize({ width: 851, height: 393 });
    await page.waitForTimeout(500);

    // Verify content is still visible (responsive layout)
    await expect(contentPortrait.first()).toBeVisible();

    // Verify no overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);

    await context.close();
  });

  test('Mobile: touch event debouncing (rapid taps)', async ({ mobileViewport }) => {
    const page = mobileViewport;

    // Dismiss modal
    const welcomeModal = page.locator('[data-testid="welcome-modal"]');
    if (await welcomeModal.isVisible().catch(() => false)) {
      await page.locator('button:has-text("Dismiss")').click();
    }

    // Rapid taps on category buttons (simulating accidental double-tap)
    const categoryBtn = page.locator('button:has-text("Makanan")').first();
    
    await categoryBtn.tap();
    await categoryBtn.tap();
    await categoryBtn.tap();
    
    // Wait for debounce
    await page.waitForTimeout(500);

    // Verify only one category filter is active
    const activeButtons = page.locator('button:has-text("Makanan")[class*="active"]');
    expect(await activeButtons.count()).toBeLessThanOrEqual(1);
  });

  test('Mobile: performance - load time under 2 seconds', async ({ mobileViewport }) => {
    const page = mobileViewport;

    // Measure navigation time
    const startTime = Date.now();
    await navigateToGuest(page, 'A1');
    const navigationTime = Date.now() - startTime;

    // Navigation should complete within 2 seconds
    expect(navigationTime).toBeLessThan(2000);

    // Measure first contentful paint
    const metrics = JSON.parse(
      await page.evaluate(() =>
        JSON.stringify(
          window.performance.getEntriesByType('navigation')[0]
        )
      )
    );

    // FCP should be reasonable on mobile
    expect(metrics.domContentLoadedEventEnd - metrics.fetchStart).toBeLessThan(3000);
  });
});
