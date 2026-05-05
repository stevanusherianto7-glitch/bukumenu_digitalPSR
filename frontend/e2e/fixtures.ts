import { test as base, Page, BrowserContext } from '@playwright/test';

/**
 * Test data fixtures for E2E tests
 */
export const testData = {
  tables: {
    valid: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10'],
    invalid: ['Z99', 'X1', 'TABLE1', ''],
  },
  menuItems: {
    favorite: '1', // Soto Pindang Kudus
    newItem: '2', // Teh Tarik
    regular: '3', // Nasi Goreng
  },
  categories: ['Terlaris', 'Makanan', 'Minuman', 'Menu Baru'],
  
  // Sample order flow
  orders: {
    basic: {
      items: [
        { id: '1', quantity: 2, notes: '', addons: [] },
      ],
      table: 'A1',
      orderType: 'dine-in',
    },
    complex: {
      items: [
        { id: '1', quantity: 1, notes: 'Tidak pedas', addons: ['a1'] },
        { id: '2', quantity: 3, notes: '', addons: [] },
        { id: '3', quantity: 2, notes: 'Extra ayam', addons: ['a2', 'a1'] },
      ],
      table: 'A5',
      orderType: 'take-away',
    },
  },

  // Discount scenarios
  discounts: {
    birthday: {
      enabled: true,
      percent: 20,
    },
    buffet: {
      enabled: true,
      percent: 15,
      minAmount: 500000,
    },
  },
};

/**
 * Custom fixtures for E2E tests
 */
export const test = base.extend({
  /**
   * Fixture: Pre-filled guest page with table number
   */
  guestPageWithTable: async ({ page }, use) => {
    // Navigate to guest page with table number
    await page.goto('/?meja=A1');
    // Wait for app to load
    await page.waitForLoadState('networkidle');
    await use(page);
  },

  /**
   * Fixture: Pre-filled cart with items
   */
  guestPageWithCart: async ({ page }, use) => {
    // Navigate and load items
    await page.goto('/?meja=A1');
    await page.waitForLoadState('networkidle');
    
    // Simulate adding items to cart via localStorage
    const cartData = {
      state: {
        items: [
          {
            id: '1',
            name: 'Soto Pindang Kudus',
            price: 25000,
            quantity: 2,
            notes: 'Tidak pedas',
            selectedAddons: [],
            cartId: '1-Tidak pedas-',
          },
        ],
        totalItems: 2,
        totalPrice: 50000,
        orderType: 'dine-in',
      },
      version: 0,
    };
    
    await page.evaluate((data) => {
      localStorage.setItem('pawon-salam-cart-storage', JSON.stringify(data));
    }, cartData);

    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await use(page);
  },

  /**
   * Fixture: Mobile viewport (Pixel 5)
   */
  mobileViewport: async ({ page }, use) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 393, height: 851 });
    await page.goto('/?meja=A1');
    await page.waitForLoadState('networkidle');
    await use(page);
  },
});

export { expect } from '@playwright/test';
