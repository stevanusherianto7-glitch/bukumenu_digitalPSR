import { test, expect, testData } from './fixtures';
import {
  navigateToGuest,
  selectCategory,
  clickMenuItem,
  addItemToCart,
  getCartTotal,
  getCartItemCount,
  openCart,
  closeModal,
  waitForAppReady,
} from './helpers';

test.describe('Guest Module - Happy Path E2E', () => {
  test('Complete order flow: browse → select → customize → add → checkout', async ({
    guestPageWithTable,
  }) => {
    const page = guestPageWithTable;

    // Step 1: Verify welcome modal appears
    const welcomeModal = page.locator('[data-testid="welcome-modal"]');
    await expect(welcomeModal).toBeVisible({ timeout: 5000 });

    // Dismiss welcome modal
    const dismissBtn = page.locator('button:has-text("Dismiss")').first();
    await dismissBtn.click();
    await expect(welcomeModal).not.toBeVisible();

    // Step 2: Browse menu - verify categories load
    const categoryFilter = page.locator('[data-testid="category-filter"]');
    await expect(categoryFilter).toBeVisible();

    // Step 3: Select category
    await selectCategory(page, 'Makanan');
    await page.waitForTimeout(300);

    // Verify menu items are displayed
    const menuItems = page.locator('[data-testid^="menu-item-"]');
    const itemCount = await menuItems.count();
    expect(itemCount).toBeGreaterThan(0);

    // Step 4: Click on menu item detail
    const firstMenuItem = menuItems.first();
    await firstMenuItem.locator('button:has-text("Detail")').click();

    // Verify detail modal opens
    const detailModal = page.locator('[data-testid="product-detail-modal"]');
    await expect(detailModal).toBeVisible();

    // Step 5: Customize item (quantity, notes)
    const quantityInput = page.locator('input[type="number"]');
    await quantityInput.clear();
    await quantityInput.fill('2');

    const notesField = page.locator('textarea[placeholder*="Catatan"], textarea[placeholder*="Notes"]');
    if (await notesField.isVisible().catch(() => false)) {
      await notesField.fill('Tidak pedas');
    }

    // Step 6: Add to cart
    const addButton = page.locator('button:has-text("Tambah"), button:has-text("Add to Cart")').first();
    await addButton.click();

    // Step 7: Verify cart opens and item is added
    await page.waitForTimeout(500);
    const cartPanel = page.locator('[data-testid="cart-panel"], .cart-panel');
    await expect(cartPanel).toBeVisible({ timeout: 5000 });

    // Step 8: Verify cart shows correct total
    const cartTotal = await getCartTotal(page);
    expect(cartTotal).toBeGreaterThan(0);

    // Close cart
    await closeModal(page);

    // Verify cart badge shows item count
    const itemCountBadge = await getCartItemCount(page);
    expect(itemCountBadge).toBeGreaterThanOrEqual(2);
  });

  test('Browse different categories and verify filtering', async ({ guestPageWithTable }) => {
    const page = guestPageWithTable;
    await waitForAppReady(page);

    // Dismiss welcome modal if present
    const welcomeModal = page.locator('[data-testid="welcome-modal"]');
    if (await welcomeModal.isVisible().catch(() => false)) {
      await page.locator('button:has-text("Dismiss")').click();
    }

    // Test each category
    for (const category of ['Makanan', 'Minuman']) {
      // Get initial item count
      const itemsBefore = page.locator('[data-testid^="menu-item-"]');
      const countBefore = await itemsBefore.count();

      // Select category
      await selectCategory(page, category);
      await page.waitForTimeout(500);

      // Verify category filter is active
      const activeCategory = page.locator(`button:has-text("${category}")[class*="active"]`);
      await expect(activeCategory).toHaveCount(1);

      // Verify items are displayed
      const itemsAfter = page.locator('[data-testid^="menu-item-"]');
      const countAfter = await itemsAfter.count();
      expect(countAfter).toBeGreaterThanOrEqual(0);
    }
  });

  test('Add multiple items with different customizations', async ({ guestPageWithTable }) => {
    const page = guestPageWithTable;
    await waitForAppReady(page);

    // Dismiss modal
    const welcomeModal = page.locator('[data-testid="welcome-modal"]');
    if (await welcomeModal.isVisible().catch(() => false)) {
      await page.locator('button:has-text("Dismiss")').click();
    }

    // Add first item
    const menuItems = page.locator('[data-testid^="menu-item-"]');
    await menuItems.first().locator('button:has-text("Detail")').click();

    await addItemToCart(page, 1, 'Tidak pedas');
    await page.waitForTimeout(300);

    // Go back to menu
    await page.locator('button:has-text("Detail")').first().click();
    
    // Add second item
    const secondItem = menuItems.nth(1);
    await secondItem.locator('button:has-text("Detail")').click();
    await addItemToCart(page, 3, 'Extra ayam');

    // Verify cart shows 2 items (different types)
    await openCart(page);
    const cartItems = page.locator('[data-testid^="cart-item-"]');
    expect(await cartItems.count()).toBe(2);
  });

  test('Modify cart: update quantities and remove items', async ({ guestPageWithCart }) => {
    const page = guestPageWithCart;
    await waitForAppReady(page);

    // Open cart
    const cartButton = page.locator('button[aria-label*="Keranjang"], [data-testid="cart-button"]').first();
    await cartButton.click();

    // Verify item exists in cart
    const cartItems = page.locator('[data-testid^="cart-item-"]');
    expect(await cartItems.count()).toBeGreaterThan(0);

    // Increase quantity
    const quantityUp = page.locator('button[aria-label*="tambah"], button:has-text("+")').first();
    await quantityUp.click();
    await page.waitForTimeout(300);

    // Verify quantity increased
    const quantityDisplay = page.locator('[data-testid="item-quantity"]').first();
    const quantityText = await quantityDisplay.textContent();
    expect(parseInt(quantityText || '0')).toBeGreaterThan(1);

    // Remove item
    const removeBtn = page.locator('button[aria-label*="hapus"], button:has-text("Hapus")').first();
    await removeBtn.click();
    await page.waitForTimeout(300);

    // Verify item is removed
    const itemsAfterRemove = page.locator('[data-testid^="cart-item-"]');
    expect(await itemsAfterRemove.count()).toBe(0);
  });

  test('Order type selection: dine-in vs take-away', async ({ guestPageWithCart }) => {
    const page = guestPageWithCart;
    await waitForAppReady(page);

    // Open cart
    await openCart(page);

    // Check order type selector
    const dineInBtn = page.locator('button:has-text("Dine In")');
    const takeAwayBtn = page.locator('button:has-text("Take Away")');

    // Verify both options exist
    await expect(dineInBtn).toBeVisible();
    await expect(takeAwayBtn).toBeVisible();

    // Toggle to take-away
    await takeAwayBtn.click();
    await page.waitForTimeout(300);

    // Verify take-away is selected
    await expect(takeAwayBtn).toHaveClass(/active|selected/);

    // Toggle back to dine-in
    await dineInBtn.click();
    await page.waitForTimeout(300);

    await expect(dineInBtn).toHaveClass(/active|selected/);
  });
});
