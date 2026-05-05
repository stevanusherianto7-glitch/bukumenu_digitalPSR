# Guest Module Testing Guide

## 📋 Overview

This directory contains comprehensive integration and unit tests for the Guest Module (Pawon Salam Digital Menu - Guest Application).

**Test Coverage:**
- ✅ Unit Tests: Store logic (cartStore, menuStore)
- ✅ Component Tests: GuestView, ProductDetailModal, Cart, CategoryFilter
- ✅ Integration Tests: Complete user flows and workflows
- ✅ Edge Cases: Error handling, boundary conditions
- ✅ Performance Tests: Large data sets, memory efficiency

## 🚀 Quick Start

### Installation

Tests are already configured in `package.json`. Install dependencies if not done:

```bash
npm install
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode (recommended for development)
npm run test -- --watch

# Run tests with UI dashboard
npm run test:ui

# Run tests once (CI mode)
npm run test:run

# Run specific test file
npm run test -- cartStore.test.ts

# Run tests matching pattern
npm run test -- --grep "should add item"

# Generate coverage report
npm run test -- --coverage
```

## 📁 Test Structure

```
src/__tests__/
├── setup.ts                 # Global test setup & mocks
├── testUtils.tsx           # Common test utilities
├── mocks/
│   ├── supabase.ts        # Supabase client mock
│   └── data.ts            # Mock data & fixtures
├── stores/
│   ├── cartStore.test.ts  # Cart store unit tests
│   └── menuStore.test.ts  # Menu store unit tests
├── components/
│   └── GuestView.test.tsx # GuestView component tests
└── integration/
    └── guestFlow.test.ts  # Complete workflow tests
```

## 🧪 Test Files Description

### 1. **cartStore.test.ts** (95 tests)
Tests the shopping cart state management:
- ✅ Adding items (single, multiple, with addons)
- ✅ Removing items
- ✅ Updating quantities
- ✅ Clearing cart
- ✅ Discount calculations
- ✅ Order type management (dine-in/take-away)
- ✅ Edge cases (negative quantities, zero prices)

### 2. **menuStore.test.ts** (45 tests)
Tests the menu data management:
- ✅ Loading menu items from Supabase
- ✅ Category management
- ✅ Caching with localStorage
- ✅ Data transformation (snake_case → camelCase)
- ✅ Item deletion
- ✅ Category addition

### 3. **GuestView.test.tsx** (40 tests)
Tests the main guest UI component:
- ✅ Initial rendering
- ✅ Category filtering
- ✅ Product detail modal
- ✅ Cart interactions
- ✅ Table number validation
- ✅ Welcome modal
- ✅ Accessibility features

### 4. **guestFlow.test.ts** (50+ integration tests)
Tests complete user workflows:
- ✅ Browse → Select → Add to Cart → Checkout
- ✅ Item customization (notes, addons)
- ✅ Cart modification flows
- ✅ Menu management
- ✅ Discount scenarios
- ✅ Performance with large carts

## 📊 Key Test Scenarios

### User Flow: Placing an Order

```typescript
1. User loads app → Menu loads (cached or from Supabase)
2. User browses categories → Items filter correctly
3. User clicks product → DetailModal opens
4. User customizes (notes + addons) → Selects quantity
5. User adds to cart → Cart updates
6. User can:
   - Add more items
   - Modify cart (update qty, remove items)
   - Apply discounts
   - Choose order type (dine-in/take-away)
7. Cart is persistent (localStorage)
```

### Store Tests: Cart Operations

```typescript
// Add item
cart.addItem(item, quantity, notes, addons)

// Results in:
- Correct total price (item + addons) × quantity
- Correct item count
- Unique cartId for each variant
- Merging of duplicate items
```

## 🔧 Mock Setup

### Supabase Mock
Located in `mocks/supabase.ts`, mocks:
- Database queries (select, insert, update, delete)
- Authentication
- Real-time subscriptions

### Data Fixtures
Located in `mocks/data.ts`, provides:
- `mockMenuItems` - Sample menu items
- `mockAddons` - Sample add-ons
- `mockCategories` - Sample categories
- `mockCartItems` - Pre-built cart examples

### Environment Mocks (setup.ts)
- `localStorage`
- `window.matchMedia`
- `URL.revokeObjectURL`
- `IntersectionObserver`

## 💡 Writing New Tests

### Template for Unit Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCartStore } from '../../store/cartStore';

describe('Feature Name', () => {
  beforeEach(() => {
    // Reset state before each test
  });

  describe('Specific functionality', () => {
    it('should do something specific', () => {
      const { result } = renderHook(() => useCartStore());
      
      act(() => {
        // Perform actions
      });

      expect(result.current.items).toHaveLength(1);
    });
  });
});
```

### Template for Component Tests

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Component Name', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<YourComponent />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Updated')).toBeInTheDocument();
  });
});
```

## 📈 Coverage Goals

Target coverage for guest module:
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

Check coverage:
```bash
npm run test -- --coverage
```

## 🐛 Debugging Tests

### Debug in Browser
```bash
# Run with debugging UI
npm run test:ui
```

### Debug in Terminal
```bash
# Add debug logs in tests
import { screen, debug } from '@testing-library/react';

// In test:
debug(screen.getByTestId('element'));
```

### Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Check import paths, ensure mocks are set up in setup.ts |
| "Element not found" | Use `waitFor()` for async elements |
| Store state not updating | Wrap state updates in `act()` |
| Tests hang | Check for missing mocks or infinite loops |

## 🔄 CI/CD Integration

Tests run automatically on:
- Pull requests
- Before merging to main branch
- During deployment

Add to your CI pipeline:
```bash
npm run test:run -- --coverage --reporter=junit
```

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## ✅ Test Maintenance Checklist

- [ ] Update mocks when API changes
- [ ] Keep tests DRY (reuse testUtils)
- [ ] One test per concept
- [ ] Clear test descriptions
- [ ] No test interdependencies
- [ ] Remove skipped tests (`it.skip`)

## 🤝 Contributing Tests

When adding new features:
1. Write tests **first** (TDD approach recommended)
2. Make tests fail
3. Implement feature
4. Make tests pass
5. Run full test suite: `npm run test:run`
6. Ensure coverage maintained

---

**Last Updated**: May 5, 2026
**Status**: ✅ Ready for Full Integration Testing
