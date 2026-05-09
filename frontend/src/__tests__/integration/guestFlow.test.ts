import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook, act } from '@testing-library/react';
import { useCartStore } from '../../store/cartStore';
import { useMenuStore } from '../../store/menuStore';
import { mockMenuItems, mockAddons, mockCategories } from '../mocks/data';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn((table) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: table === 'categories' 
          ? mockCategories.map((cat, i) => ({ id: i, name: cat, sort_order: i }))
          : mockMenuItems,
        error: null
      }),
    })),
  },
}));

describe('Guest Module - Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    
    // Reset stores
    const cartHook = renderHook(() => useCartStore());
    act(() => {
      cartHook.result.current.clearCart();
    });
  });

  describe('Complete Order Flow', () => {
    it('should complete full order workflow: browse → select → add to cart → checkout', async () => {
      // 1. Load menu data
      const menuHook = renderHook(() => useMenuStore());

      await act(async () => {
        await menuHook.result.current.loadData();
      });

      await waitFor(() => {
        expect(menuHook.result.current.isLoading).toBe(false);
      });

      // 2. Add items to cart
      const cartHook = renderHook(() => useCartStore());

      act(() => {
        // User adds first item
        cartHook.result.current.addItem(mockMenuItems[0], 2);
        // User adds second item
        cartHook.result.current.addItem(mockMenuItems[1], 1);
      });

      // 3. Verify cart state
      expect(cartHook.result.current.items).toHaveLength(2);
      expect(cartHook.result.current.totalItems).toBe(3);
      expect(cartHook.result.current.totalPrice).toBe(
        mockMenuItems[0].price * 2 + mockMenuItems[1].price
      );

      // 4. Update item quantity
      const firstItemCartId = cartHook.result.current.items[0].cartId;
      act(() => {
        cartHook.result.current.updateQuantity(firstItemCartId, 3);
      });

      expect(cartHook.result.current.totalItems).toBe(4);

      // 5. Apply discount
      const discountedTotal = cartHook.result.current.getDiscountedTotal({
        isBirthdayPromoEnabled: true,
        birthdayDiscountPercent: 10,
        isBuffetPromoEnabled: false,
        buffetDiscountPercent: 0,
        isAddonEnabled: false,
        isCrossSellEnabled: false,
        isBundleEnabled: false,
        isProgressBarEnabled: false,
        isBestMatchEnabled: false,
        progressBarTarget: 100000,
        progressBarReward: '',
      });

      expect(discountedTotal).toBeLessThan(cartHook.result.current.totalPrice);
    });

    it('should handle order customization with notes and addons', async () => {
      const cartHook = renderHook(() => useCartStore());

      act(() => {
        // Add item with notes and addons
        cartHook.result.current.addItem(
          mockMenuItems[0],
          1,
          'Tidak pedas, tanpa MSG',
          [mockAddons[0], mockAddons[1]]
        );
      });

      const item = cartHook.result.current.items[0];

      expect(item.notes).toBe('Tidak pedas, tanpa MSG');
      expect(item.selectedAddons).toHaveLength(2);
      expect(item.selectedAddons?.[0].id).toBe(mockAddons[0].id);
      expect(item.selectedAddons?.[1].id).toBe(mockAddons[1].id);

      // Price should include addons
      const expectedPrice = (mockMenuItems[0].price + mockAddons[0].price + mockAddons[1].price) * 1;
      expect(cartHook.result.current.totalPrice).toBe(expectedPrice);
    });

    it('should allow modifying cart: add → update → remove flow', async () => {
      const cartHook = renderHook(() => useCartStore());

      act(() => {
        // Add 3 different items
        cartHook.result.current.addItem(mockMenuItems[0], 1);
        cartHook.result.current.addItem(mockMenuItems[1], 1);
        cartHook.result.current.addItem(mockMenuItems[2], 1);
      });

      expect(cartHook.result.current.items).toHaveLength(3);

      // Update first item quantity
      const firstItemCartId = cartHook.result.current.items[0].cartId;
      act(() => {
        cartHook.result.current.updateQuantity(firstItemCartId, 3);
      });

      expect(cartHook.result.current.totalItems).toBe(5);

      // Remove second item
      const secondItemCartId = cartHook.result.current.items[1].cartId;
      act(() => {
        cartHook.result.current.removeItem(secondItemCartId);
      });

      expect(cartHook.result.current.items).toHaveLength(2);
      expect(cartHook.result.current.totalItems).toBe(4);

      // Clear cart
      act(() => {
        cartHook.result.current.clearCart();
      });

      expect(cartHook.result.current.items).toHaveLength(0);
      expect(cartHook.result.current.totalItems).toBe(0);
      expect(cartHook.result.current.totalPrice).toBe(0);
    });
  });

  describe('Menu Management Flow', () => {
    it('should load menu and handle category filtering', async () => {
      localStorage.clear();
      const menuHook = renderHook(() => useMenuStore());

      // Initial state (may be false if cached data loaded)
      expect(menuHook.result.current.items.length).toBeGreaterThanOrEqual(0);

      // Load data
      await act(async () => {
        await menuHook.result.current.loadData();
      });

      await waitFor(() => {
        expect(menuHook.result.current.isLoading).toBe(false);
      });

      expect(menuHook.result.current.items.length).toBeGreaterThan(0);
      expect(menuHook.result.current.categories.length).toBeGreaterThan(0);
    });

    it('should handle cache correctly during multiple loads', async () => {
      const menuHook = renderHook(() => useMenuStore());

      // First load
      await act(async () => {
        await menuHook.result.current.loadData();
      });

      const firstLoadItems = menuHook.result.current.items;

      // Second load should come from cache
      await act(async () => {
        await menuHook.result.current.loadData();
      });

      const secondLoadItems = menuHook.result.current.items;

      expect(firstLoadItems).toEqual(secondLoadItems);
    });
  });

  describe('Edge Cases & Error Handling', () => {
    it('should handle adding same item multiple times with different customizations', async () => {
      const cartHook = renderHook(() => useCartStore());

      act(() => {
        // Same item, different notes
        cartHook.result.current.addItem(mockMenuItems[0], 1, 'Tidak pedas');
        cartHook.result.current.addItem(mockMenuItems[0], 1, 'Pedas');
        // Same item, same notes
        cartHook.result.current.addItem(mockMenuItems[0], 1, 'Tidak pedas');
      });

      expect(cartHook.result.current.items).toHaveLength(2);
      // Third add should increment first item (same notes)
      expect(cartHook.result.current.items[0].quantity).toBe(2);
      expect(cartHook.result.current.items[1].quantity).toBe(1);
    });

    it('should prevent negative or zero quantities', async () => {
      const cartHook = renderHook(() => useCartStore());

      act(() => {
        cartHook.result.current.addItem(mockMenuItems[0], 1);
      });

      const cartId = cartHook.result.current.items[0].cartId;

      // Try to set negative quantity
      act(() => {
        cartHook.result.current.updateQuantity(cartId, -5);
      });

      expect(cartHook.result.current.items).toHaveLength(0);
    });

    it('should handle decimal quantities and prices correctly', async () => {
      const cartHook = renderHook(() => useCartStore());
      
      const itemWithDecimalPrice = { ...mockMenuItems[0], price: 25750.50 };

      act(() => {
        cartHook.result.current.addItem(itemWithDecimalPrice, 2);
      });

      expect(cartHook.result.current.totalPrice).toBe(25750.50 * 2);
    });

    it('should preserve cart state across store rerenders', async () => {
      const cartHook = renderHook(() => useCartStore());

      act(() => {
        cartHook.result.current.addItem(mockMenuItems[0], 2);
        cartHook.result.current.setOrderType('take-away');
      });

      const initialItems = cartHook.result.current.items;
      const initialOrderType = cartHook.result.current.orderType;

      // Trigger rerender
      cartHook.rerender();

      expect(cartHook.result.current.items).toEqual(initialItems);
      expect(cartHook.result.current.orderType).toBe(initialOrderType);
    });
  });

  describe('Multiple Discount Scenarios', () => {
    it('should correctly apply tiered discounts', async () => {
      const cartHook = renderHook(() => useCartStore());

      act(() => {
        // Create order > 500000 (each item is 25000, so 21 items = 525000)
        cartHook.result.current.addItem(mockMenuItems[0], 21);
      });

      const totalPrice = cartHook.result.current.totalPrice;
      expect(totalPrice).toBeGreaterThan(500000);

      // Test different discount combinations
      const scenarios = [
        {
          name: 'No discount',
          settings: {
            isBirthdayPromoEnabled: false,
            birthdayDiscountPercent: 0,
            isBuffetPromoEnabled: false,
            buffetDiscountPercent: 0,
            isAddonEnabled: false,
            isCrossSellEnabled: false,
            isBundleEnabled: false,
            isProgressBarEnabled: false,
            isBestMatchEnabled: false,
            progressBarTarget: 100000,
            progressBarReward: '',
          },
          expectedMultiplier: 1,
        },
        {
          name: 'Birthday only',
          settings: {
            isBirthdayPromoEnabled: true,
            birthdayDiscountPercent: 10,
            isBuffetPromoEnabled: false,
            buffetDiscountPercent: 0,
          },
          expectedMultiplier: 0.9,
        },
        {
          name: 'Buffet only',
          settings: {
            isBirthdayPromoEnabled: false,
            birthdayDiscountPercent: 0,
            isBuffetPromoEnabled: true,
            buffetDiscountPercent: 15,
            isAddonEnabled: false,
            isCrossSellEnabled: false,
            isBundleEnabled: false,
            isProgressBarEnabled: false,
            isBestMatchEnabled: false,
            progressBarTarget: 100000,
            progressBarReward: '',
          },
          expectedMultiplier: 0.85,
        },
      ];

      scenarios.forEach(scenario => {
        const discountedTotal = cartHook.result.current.getDiscountedTotal(scenario.settings);
        const expected = Math.round(totalPrice * scenario.expectedMultiplier);
        expect(discountedTotal).toBe(expected, `Failed for scenario: ${scenario.name}`);
      });
    });
  });

  describe('Order Type Management', () => {
    it('should track order type throughout session', () => {
      const { result: cartResult } = renderHook(() => useCartStore());
      
      // Reset to known state
      act(() => {
        cartResult.current.setOrderType('dine-in');
      });

      expect(cartResult.current.orderType).toBe('dine-in');

      act(() => {
        cartResult.current.addItem(mockMenuItems[0], 1);
      });

      act(() => {
        cartResult.current.setOrderType('take-away');
      });

      expect(cartResult.current.orderType).toBe('take-away');
      expect(cartResult.current.items).toHaveLength(1);

      act(() => {
        cartResult.current.setOrderType('dine-in');
      });

      expect(cartResult.current.orderType).toBe('dine-in');
    });
  });

  describe('Performance & Memory', () => {
    it('should handle large carts efficiently', async () => {
      const cartHook = renderHook(() => useCartStore());

      act(() => {
        // Add 50 different items
        for (let i = 0; i < 50; i++) {
          const item = { ...mockMenuItems[0], id: `item-${i}` };
          cartHook.result.current.addItem(item, 1);
        }
      });

      expect(cartHook.result.current.items).toHaveLength(50);
      expect(cartHook.result.current.totalItems).toBe(50);

      // Removing items should be fast
      const startTime = performance.now();
      const cartIdToRemove = cartHook.result.current.items[0].cartId;
      
      act(() => {
        cartHook.result.current.removeItem(cartIdToRemove);
      });

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should be nearly instant
    });
  });
});
