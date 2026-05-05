import { Page, BrowserContext } from '@playwright/test';

/**
 * Helper utilities for E2E tests
 */

/**
 * Wait for application to be fully loaded
 */
export async function waitForAppReady(page: Page) {
  // Wait for main container
  await page.waitForSelector('[class*="min-h-screen"]', { timeout: 10000 });
  
  // Wait for network to be idle
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to guest app with table
 */
export async function navigateToGuest(page: Page, tableNumber: string = 'A1') {
  await page.goto(`/?meja=${tableNumber}`);
  await waitForAppReady(page);
}

/**
 * Select category filter
 */
export async function selectCategory(page: Page, categoryName: string) {
  const categoryButton = page.locator(`button:has-text("${categoryName}")`).first();
  await categoryButton.click();
  // Wait for animations
  await page.waitForTimeout(300);
}

/**
 * Click on menu item by name
 */
export async function clickMenuItem(page: Page, itemName: string) {
  const menuItem = page.locator(`text=${itemName}`).first();
  await menuItem.click();
}

/**
 * Add item to cart from detail modal
 */
export async function addItemToCart(
  page: Page,
  quantity: number = 1,
  notes: string = '',
  waitForCart: boolean = true
) {
  // Enter quantity
  const quantityInput = page.locator('input[type="number"]');
  await quantityInput.clear();
  await quantityInput.fill(String(quantity));

  // Enter notes if provided
  if (notes) {
    const notesTextarea = page.locator('textarea[placeholder*="Catatan"]');
    await notesTextarea.fill(notes);
  }

  // Click add to cart button
  const addButton = page.locator('button:has-text("Tambah")').first();
  await addButton.click();

  if (waitForCart) {
    // Wait for cart to open or update
    await page.waitForTimeout(500);
  }
}

/**
 * Get current cart total
 */
export async function getCartTotal(page: Page): Promise<number> {
  const totalText = await page.locator('text=/Rp.*\\d+/').first().textContent();
  if (!totalText) return 0;
  
  // Extract number from "Rp 50.000"
  const numberMatch = totalText.match(/(\d+(?:\.\d{3})*(?:,\d{2})?)/);
  if (!numberMatch) return 0;
  
  const cleanNumber = numberMatch[1].replace(/\./g, '').replace(',', '');
  return parseInt(cleanNumber, 10);
}

/**
 * Get cart item count
 */
export async function getCartItemCount(page: Page): Promise<number> {
  const badge = page.locator('[data-testid="cart-badge"], .badge-count').first();
  const text = await badge.textContent();
  return text ? parseInt(text, 10) : 0;
}

/**
 * Open cart panel
 */
export async function openCart(page: Page) {
  const cartButton = page.locator('button[aria-label="Buka Keranjang"], [data-testid="cart-button"]').first();
  await cartButton.click();
  await page.waitForTimeout(300);
}

/**
 * Close modal
 */
export async function closeModal(page: Page) {
  // Try different close button selectors
  let closeButton = page.locator('button[aria-label="Tutup"], [aria-label="Close"]').first();
  let exists = await closeButton.isVisible().catch(() => false);
  
  if (!exists) {
    // Try ESC key
    await page.keyboard.press('Escape');
  } else {
    await closeButton.click();
  }
  
  await page.waitForTimeout(300);
}

/**
 * Verify menu item is visible in list
 */
export async function isMenuItemVisible(page: Page, itemName: string): Promise<boolean> {
  const item = page.locator(`text=${itemName}`).first();
  return await item.isVisible().catch(() => false);
}

/**
 * Scroll to element
 */
export async function scrollToElement(page: Page, selector: string) {
  const element = page.locator(selector).first();
  await element.scrollIntoViewIfNeeded();
}

/**
 * Wait for specific network response
 */
export async function waitForNetworkResponse(page: Page, urlPattern: string | RegExp) {
  return await page.waitForResponse(
    (response) => {
      if (typeof urlPattern === 'string') {
        return response.url().includes(urlPattern);
      }
      return urlPattern.test(response.url());
    },
    { timeout: 10000 }
  );
}

/**
 * Mock API response
 */
export async function mockApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  responseBody: any,
  status: number = 200
) {
  await page.route(urlPattern, (route) => {
    route.abort('blockedbyclient');
    route.continue().catch(() => {});
  });

  // Intercept and mock
  await page.route(urlPattern, (route) => {
    route.fulfill({
      status,
      body: JSON.stringify(responseBody),
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

/**
 * Check if element has specific class
 */
export async function hasClass(page: Page, selector: string, className: string): Promise<boolean> {
  const element = page.locator(selector).first();
  const classes = await element.getAttribute('class');
  return classes?.includes(className) ?? false;
}

/**
 * Simulate network delay
 */
export async function simulateNetworkDelay(context: BrowserContext, delayMs: number = 2000) {
  // This would require Playwright's network throttling
  // For now, using simple wait
  // In real scenarios, use context's CDP session for advanced throttling
}

/**
 * Take screenshot with consistent naming
 */
export async function takeScreenshot(page: Page, name: string, options: any = {}) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `screenshots/${name}-${timestamp}.png`,
    fullPage: true,
    ...options,
  });
}

/**
 * Check for console errors
 */
export function setupConsoleErrorListener(page: Page): string[] {
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  return errors;
}

/**
 * Wait for element with timeout
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout: number = 10000
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get table validation status
 */
export async function validateTableStatus(page: Page, tableNumber: string): Promise<{
  isValid: boolean;
  showsWelcome: boolean;
}> {
  const urlParams = new URL(page.url()).searchParams;
  const isValid = urlParams.get('meja') === tableNumber;

  const welcomeModal = await page.locator('[data-testid="welcome-modal"], .welcome-modal').isVisible().catch(() => false);

  return {
    isValid,
    showsWelcome: welcomeModal,
  };
}
