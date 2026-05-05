import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCartStore } from '../../store/cartStore';
import { mockMenuItems, mockAddons } from '../mocks/data';

describe('Cart Store - Unit Tests', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useCartStore());
    act(() => {
      result.current.clearCart();
    });
  });

  describe('addItem', () => {
    it('should add a single item to empty cart', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.addItem(mockMenuItems[0], 1);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe(mockMenuItems[0].id);
      expect(result.current.items[0].quantity).toBe(1);
      expect(result.current.totalItems).toBe(1);
      expect(result.current.totalPrice).toBe(mockMenuItems[0].price);
    });

    it('should increment quantity if same item already exists', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.addItem(mockMenuItems[0], 1);
        result.current.addItem(mockMenuItems[0], 2);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(3);
      expect(result.current.totalItems).toBe(3);
    });

    it('should add different items separately', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.addItem(mockMenuItems[0], 1);
        result.current.addItem(mockMenuItems[1], 1);
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.totalItems).toBe(2);
      expect(result.current.totalPrice).toBe(mockMenuItems[0].price + mockMenuItems[1].price);
    });

    it('should handle items with notes as separate entries', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.addItem(mockMenuItems[0], 1, 'Tidak pedas');
        result.current.addItem(mockMenuItems[0], 1, 'Pedas');
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.items[0].notes).toBe('Tidak pedas');
      expect(result.current.items[1].notes).toBe('Pedas');
    });

    it('should handle items with addons correctly', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.addItem(mockMenuItems[0], 1, '', [mockAddons[0]]);
      });

      expect(result.current.items[0].selectedAddons).toHaveLength(1);
      expect(result.current.items[0].selectedAddons?.[0].id).toBe(mockAddons[0].id);
      // Price should include addon price
      expect(result.current.totalPrice).toBe(mockMenuItems[0].price + mockAddons[0].price);
    });

    it('should not add item with invalid quantity', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.addItem(mockMenuItems[0], 0);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should not add item with negative quantity', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.addItem(mockMenuItems[0], -1);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should not add item with negative price', () => {
      const { result } = renderHook(() => useCartStore());
      const invalidItem = { ...mockMenuItems[0], price: -100 };
      
      act(() => {
        result.current.addItem(invalidItem, 1);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.addItem(mockMenuItems[0], 2);
        result.current.addItem(mockMenuItems[1], 1);
      });

      const cartIdToRemove = result.current.items[0].cartId;
      
      act(() => {
        result.current.removeItem(cartIdToRemove);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe(mockMenuItems[1].id);
      expect(result.current.totalItems).toBe(1);
    });

    it('should update total price when removing item', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.addItem(mockMenuItems[0], 1);
        result.current.addItem(mockMenuItems[1], 1);
      });

      const cartIdToRemove = result.current.items[0].cartId;
      const expectedPrice = mockMenuItems[1].price;
      
      act(() => {
        result.current.removeItem(cartIdToRemove);
      });

      expect(result.current.totalPrice).toBe(expectedPrice);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.addItem(mockMenuItems[0], 1);
      });

      const cartId = result.current.items[0].cartId;
      
      act(() => {
        result.current.updateQuantity(cartId, 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
      expect(result.current.totalItems).toBe(5);
    });

    it('should remove item if quantity set to 0', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.addItem(mockMenuItems[0], 1);
      });

      const cartId = result.current.items[0].cartId;
      
      act(() => {
        result.current.updateQuantity(cartId, 0);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should remove item if quantity set to negative', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.addItem(mockMenuItems[0], 1);
      });

      const cartId = result.current.items[0].cartId;
      
      act(() => {
        result.current.updateQuantity(cartId, -5);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should recalculate totals on quantity update', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.addItem(mockMenuItems[0], 1);
        result.current.addItem(mockMenuItems[1], 1);
      });

      const cartId = result.current.items[0].cartId;
      
      act(() => {
        result.current.updateQuantity(cartId, 3);
      });

      expect(result.current.totalItems).toBe(4); // 3 + 1
      expect(result.current.totalPrice).toBe(mockMenuItems[0].price * 3 + mockMenuItems[1].price);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.addItem(mockMenuItems[0], 2);
        result.current.addItem(mockMenuItems[1], 1);
      });

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.totalPrice).toBe(0);
    });
  });

  describe('getDiscountedTotal', () => {
    it('should apply birthday discount', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.addItem(mockMenuItems[0], 1);
      });

      const settings = {
        isBirthdayPromoEnabled: true,
        birthdayDiscountPercent: 20,
        isBuffetPromoEnabled: false,
        buffetDiscountPercent: 0,
      };

      const discountedTotal = result.current.getDiscountedTotal(settings);
      const expected = Math.round(mockMenuItems[0].price * 0.8);
      
      expect(discountedTotal).toBe(expected);
    });

    it('should apply buffet discount for large orders', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        // Add items totaling > 500000 (each item is 25000, so 21 items = 525000)
        result.current.addItem(mockMenuItems[0], 21);
      });

      const settings = {
        isBirthdayPromoEnabled: false,
        birthdayDiscountPercent: 0,
        isBuffetPromoEnabled: true,
        buffetDiscountPercent: 15,
      };

      const discountedTotal = result.current.getDiscountedTotal(settings);
      const expected = Math.round(result.current.totalPrice * 0.85);
      
      expect(discountedTotal).toBe(expected);
    });

    it('should not apply buffet discount for small orders', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.addItem(mockMenuItems[0], 1);
      });

      const settings = {
        isBirthdayPromoEnabled: false,
        birthdayDiscountPercent: 0,
        isBuffetPromoEnabled: true,
        buffetDiscountPercent: 15,
      };

      const discountedTotal = result.current.getDiscountedTotal(settings);
      
      expect(discountedTotal).toBe(result.current.totalPrice);
    });

    it('should apply both discounts capped at 100%', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.addItem(mockMenuItems[0], 20);
      });

      const settings = {
        isBirthdayPromoEnabled: true,
        birthdayDiscountPercent: 60,
        isBuffetPromoEnabled: true,
        buffetDiscountPercent: 60,
      };

      const discountedTotal = result.current.getDiscountedTotal(settings);
      
      // Should be capped at 0 discount (or minimum price, not negative)
      expect(discountedTotal).toBeGreaterThanOrEqual(0);
    });
  });

  describe('orderType', () => {
    it('should have default orderType as dine-in', () => {
      const { result } = renderHook(() => useCartStore());
      
      expect(result.current.orderType).toBe('dine-in');
    });

    it('should change orderType to take-away', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.setOrderType('take-away');
      });

      expect(result.current.orderType).toBe('take-away');
    });

    it('should change orderType back to dine-in', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.setOrderType('take-away');
        result.current.setOrderType('dine-in');
      });

      expect(result.current.orderType).toBe('dine-in');
    });
  });

  describe('Complex scenarios', () => {
    it('should handle multiple operations correctly', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        // Add items
        result.current.addItem(mockMenuItems[0], 2);
        result.current.addItem(mockMenuItems[1], 1);
      });

      const firstCartId = result.current.items[0].cartId;
      const secondCartId = result.current.items[1].cartId;
      
      act(() => {
        // Update quantity
        result.current.updateQuantity(firstCartId, 3);
        // Remove second item
        result.current.removeItem(secondCartId);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(3);
      expect(result.current.totalItems).toBe(3);
    });

    it('should calculate correct totals with addons and quantity', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        result.current.addItem(mockMenuItems[0], 2, '', [mockAddons[0], mockAddons[1]]);
      });

      const expectedPrice = (mockMenuItems[0].price + mockAddons[0].price + mockAddons[1].price) * 2;
      
      expect(result.current.totalPrice).toBe(expectedPrice);
      expect(result.current.totalItems).toBe(2);
    });
  });
});
