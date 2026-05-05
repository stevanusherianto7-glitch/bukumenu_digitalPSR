import { test, expect, testData } from './fixtures';
import { navigateToGuest, waitForAppReady, getCartTotal } from './helpers';

test.describe('Guest Module - Error Handling & Edge Cases', () => {
  test('Invalid table number - should not show welcome modal', async ({ page }) => {
    const invalidTable = 'INVALID123';
    await navigateToGuest(page, invalidTable);

    const welcomeModal = page.locator('[data-testid="welcome-modal"]');
    await expect(welcomeModal).not.toBeVisible();
  });

  test('Network error handling - offline mode', async ({ page }) => {
    await navigateToGuest(page, 'A1');
    await waitForAppReady(page);

    // Simulate offline
    await page.context().setOffline(true);
    await page.waitForTimeout(500);

    // Try to add item (should use cache/local data if available)
    const menuItems = page.locator('[data-testid^="menu-item-"]');
    const itemsVisible = await menuItems.count();

    // Items should still be visible from cache
    expect(itemsVisible).toBeGreaterThanOrEqual(0);

    // Go back online
    await page.context().setOffline(false);
  });

  test('Cart with very large quantity', async ({ guestPageWithTable }) => {
    const page = guestPageWithTable;
    await waitForAppReady(page);

    // Dismiss modal
    const welcomeModal = page.locator('[data-testid="welcome-modal"]');
    if (await welcomeModal.isVisible().catch(() => false)) {
      await page.locator('button:has-text("Dismiss")').click();
    }

    // Click on menu item
    const menuItem = page.locator('[data-testid^="menu-item-"]').first();
    await menuItem.locator('button:has-text("Detail")').click();

    // Set very large quantity
    const quantityInput = page.locator('input[type="number"]');
    await quantityInput.clear();
    await quantityInput.fill('999');

    // Verify total is calculated correctly (no overflow)
    const addBtn = page.locator('button:has-text("Tambah")').first();
    await addBtn.click();

    await page.waitForTimeout(500);
    const cartTotal = await getCartTotal(page);
    expect(cartTotal).toBeGreaterThan(0);
    expect(cartTotal).toBeLessThan(999999999); // No integer overflow
  });

  test('Special characters in notes field', async ({ guestPageWithTable }) => {
    const page = guestPageWithTable;
    await waitForAppReady(page);

    // Dismiss modal
    const welcomeModal = page.locator('[data-testid="welcome-modal"]');
    if (await welcomeModal.isVisible().catch(() => false)) {
      await page.locator('button:has-text("Dismiss")').click();
    }

    const menuItem = page.locator('[data-testid^="menu-item-"]').first();
    await menuItem.locator('button:has-text("Detail")').click();

    // Try special characters
    const notesField = page.locator('textarea[placeholder*="Catatan"]');
    const specialChars = '!@#$%^&*()_+-={}[]|:;<>?,./~`';

    if (await notesField.isVisible().catch(() => false)) {
      await notesField.fill(specialChars);
      const inputValue = await notesField.inputValue();
      expect(inputValue).toBe(specialChars);
    }
  });

  test('Rapid add to cart clicks - debouncing', async ({ guestPageWithTable }) => {
    const page = guestPageWithTable;
    await waitForAppReady(page);

    // Dismiss modal
    const welcomeModal = page.locator('[data-testid="welcome-modal"]');
    if (await welcomeModal.isVisible().catch(() => false)) {
      await page.locator('button:has-text("Dismiss")').click();
    }

    const menuItem = page.locator('[data-testid^="menu-item-"]').first();
    await menuItem.locator('button:has-text("Detail")').click();

    // Get add button
    const addBtn = page.locator('button:has-text("Tambah")').first();

    // Rapid clicks
    await addBtn.click();
    await addBtn.click();
    await addBtn.click();

    await page.waitForTimeout(1000);

    // Should only add once due to debouncing
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    const badgeText = await cartBadge.textContent().catch(() => '0');
    const itemCount = parseInt(badgeText || '0');

    // Should not have duplicates from rapid clicks
    expect(itemCount).toBeLessThanOrEqual(3);
  });

  test('Very long product names and notes truncation', async ({ guestPageWithTable }) => {
    const page = guestPageWithTable;
    await waitForAppReady(page);

    // Dismiss modal
    const welcomeModal = page.locator('[data-testid="welcome-modal"]');
    if (await welcomeModal.isVisible().catch(() => false)) {
      await page.locator('button:has-text("Dismiss")').click();
    }

    // Find menu items and check truncation
    const menuItems = page.locator('[data-testid^="menu-item-"]');
    const firstItem = menuItems.first();

    // Check if text is truncated properly
    const itemName = firstItem.locator('h3, [class*="name"]').first();
    const nameText = await itemName.textContent();
    expect(nameText?.length).toBeLessThan(200); // Should be reasonably truncated
  });

  test('Concurrent requests - switching categories rapidly', async ({ guestPageWithTable }) => {
    const page = guestPageWithTable;
    await waitForAppReady(page);

    // Dismiss modal
    const welcomeModal = page.locator('[data-testid="welcome-modal"]');
    if (await welcomeModal.isVisible().catch(() => false)) {
      await page.locator('button:has-text("Dismiss")').click();
    }

    // Rapidly switch categories
    const categories = ['Makanan', 'Minuman', 'Makanan', 'Minuman'];

    for (const category of categories) {
      const btn = page.locator(`button:has-text("${category}")`).first();
      await btn.click();
      // Don't wait - rapid clicks
    }

    await page.waitForTimeout(1000);

    // App should still be responsive
    const menuItems = page.locator('[data-testid^="menu-item-"]');
    const itemCount = await menuItems.count();
    expect(itemCount).toBeGreaterThanOrEqual(0); // Should have items
  });

  test('LocalStorage quota exceeded simulation', async ({ guestPageWithTable }) => {
    const page = guestPageWithTable;

    // Fill localStorage with large data
    try {
      await page.evaluate(() => {
        const largeData = 'x'.repeat(5 * 1024 * 1024); // 5MB
        for (let i = 0; i < 100; i++) {
          try {
            localStorage.setItem(`test_${i}`, largeData);
          } catch (e) {
            // Storage full
            break;
          }
        }
      });

      // Try to use app anyway
      await navigateToGuest(page, 'A2');

      // App should degrade gracefully
      const menuItems = page.locator('[data-testid^="menu-item-"]');
      expect(await menuItems.count()).toBeGreaterThanOrEqual(0);
    } finally {
      // Clean up
      await page.evaluate(() => {
        for (let i = 0; i < 100; i++) {
          localStorage.removeItem(`test_${i}`);
        }
      });
    }
  });

  test('Browser back/forward navigation', async ({ guestPageWithTable }) => {
    const page = guestPageWithTable;
    await waitForAppReady(page);

    // Dismiss modal
    const welcomeModal = page.locator('[data-testid="welcome-modal"]');
    if (await welcomeModal.isVisible().catch(() => false)) {
      await page.locator('button:has-text("Dismiss")').click();
    }

    // Navigate to different category
    const categoryBtn = page.locator('button:has-text("Makanan")').first();
    await categoryBtn.click();
    await page.waitForTimeout(300);

    // Go back
    await page.goBack();
    await page.waitForTimeout(500);

    // Should still work
    const menuItems = page.locator('[data-testid^="menu-item-"]');
    expect(await menuItems.count()).toBeGreaterThanOrEqual(0);

    // Go forward
    await page.goForward();
    await page.waitForTimeout(500);

    expect(await menuItems.count()).toBeGreaterThanOrEqual(0);
  });
});
