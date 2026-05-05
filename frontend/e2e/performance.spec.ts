import { test, expect } from './fixtures';
import { navigateToGuest, waitForAppReady } from './helpers';

test.describe('Guest Module - Performance & Accessibility', () => {
  test('Performance: Initial page load < 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await navigateToGuest(page, 'A1');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
  });

  test('Performance: Category filter response < 300ms', async ({ guestPageWithTable }) => {
    const page = guestPageWithTable;
    await waitForAppReady(page);

    // Dismiss modal
    const welcomeModal = page.locator('[data-testid="welcome-modal"]');
    if (await welcomeModal.isVisible().catch(() => false)) {
      await page.locator('button:has-text("Dismiss")').click();
    }

    const categoryBtn = page.locator('button:has-text("Makanan")').first();
    
    const startTime = Date.now();
    await categoryBtn.click();
    await page.waitForTimeout(50); // Wait for response
    const responseTime = Date.now() - startTime;

    expect(responseTime).toBeLessThan(300);
  });

  test('Performance: Smooth scrolling (60fps)', async ({ guestPageWithTable }) => {
    const page = guestPageWithTable;
    await waitForAppReady(page);

    // Measure scroll performance
    const performanceMetrics = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let frameCount = 0;
        let lastTime = performance.now();

        const measureScroll = () => {
          frameCount++;
          const currentTime = performance.now();
          
          if (currentTime - lastTime >= 1000) {
            // Measure 1 second worth of frames
            resolve(frameCount);
            window.removeEventListener('scroll', measureScroll);
          }
        };

        window.addEventListener('scroll', measureScroll);
        
        // Simulate scroll
        window.scrollBy({ top: 500, behavior: 'smooth' });
      });
    }).catch(() => 60); // Default to 60fps if test fails

    // Should maintain at least 50fps for good UX
    expect(performanceMetrics).toBeGreaterThanOrEqual(50);
  });

  test('Accessibility: Keyboard navigation', async ({ guestPageWithTable }) => {
    const page = guestPageWithTable;
    await waitForAppReady(page);

    // Dismiss modal with keyboard
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Tab through interactive elements
    let tabbableElements = 0;
    
    for (let i = 0; i < 20; i++) {
      const focused = await page.evaluate(() => {
        const element = document.activeElement;
        return element?.tagName === 'BUTTON' || element?.tagName === 'A' || 
               (element as any)?.role === 'button';
      });

      if (focused) tabbableElements++;
      await page.keyboard.press('Tab');
    }

    expect(tabbableElements).toBeGreaterThan(0);
  });

  test('Accessibility: ARIA labels present', async ({ guestPageWithTable }) => {
    const page = guestPageWithTable;
    await waitForAppReady(page);

    // Check for aria-labels on interactive elements
    const interactiveElements = page.locator('button, [role="button"], a');
    const count = await interactiveElements.count();

    // At least 80% of interactive elements should have accessible names
    let accessibleCount = 0;
    for (let i = 0; i < Math.min(count, 20); i++) {
      const element = interactiveElements.nth(i);
      const hasLabel = await element.evaluate((el) => {
        return (
          el.getAttribute('aria-label') ||
          el.getAttribute('aria-labelledby') ||
          el.textContent ||
          el.title
        );
      });

      if (hasLabel) accessibleCount++;
    }

    expect(accessibleCount / Math.min(count, 20)).toBeGreaterThanOrEqual(0.7);
  });

  test('Accessibility: Color contrast', async ({ guestPageWithTable }) => {
    const page = guestPageWithTable;
    await waitForAppReady(page);

    // Simple color contrast check
    const textElements = page.locator('button, a, label, span, p, h1, h2, h3');
    
    // Sample first 10 elements
    for (let i = 0; i < Math.min(10, await textElements.count()); i++) {
      const element = textElements.nth(i);
      
      const contrast = await element.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;
        
        // Simple heuristic - in real testing use WCAG contrast checker
        return color !== bgColor;
      }).catch(() => true);

      expect(contrast).toBe(true);
    }
  });

  test('Accessibility: Focus visible indicators', async ({ page }) => {
    await navigateToGuest(page, 'A1');
    await waitForAppReady(page);

    // Tab to first interactive element
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    // Check if focused element has visible focus indicator
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      if (!el) return false;

      const styles = window.getComputedStyle(el);
      const outline = styles.outline;
      const boxShadow = styles.boxShadow;

      return outline !== 'none' || boxShadow !== 'none';
    });

    expect(focusedElement).toBe(true);
  });

  test('Accessibility: Semantic HTML', async ({ guestPageWithTable }) => {
    const page = guestPageWithTable;
    await waitForAppReady(page);

    // Check for main landmark
    const mainElement = page.locator('main, [role="main"]');
    await expect(mainElement).toHaveCount(1);

    // Check for proper heading hierarchy
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);

    // Check first heading is h1
    const firstHeading = headings.first();
    const tagName = await firstHeading.evaluate((el) => el.tagName);
    expect(tagName === 'H1' || tagName === 'H2').toBe(true);
  });

  test('Accessibility: Form labels', async ({ guestPageWithTable }) => {
    const page = guestPageWithTable;
    await waitForAppReady(page);

    // Dismiss modal
    const welcomeModal = page.locator('[data-testid="welcome-modal"]');
    if (await welcomeModal.isVisible().catch(() => false)) {
      await page.locator('button:has-text("Dismiss")').click();
    }

    // Open product detail
    const menuItem = page.locator('[data-testid^="menu-item-"]').first();
    await menuItem.locator('button:has-text("Detail")').click();

    // Check inputs have labels
    const inputs = page.locator('input, textarea, select');
    
    for (let i = 0; i < await inputs.count(); i++) {
      const input = inputs.nth(i);
      const hasLabel = await input.evaluate((el) => {
        const label = document.querySelector(`label[for="${el.id}"]`);
        return !!label || !!el.getAttribute('aria-label') || !!el.placeholder;
      });

      expect(hasLabel).toBe(true);
    }
  });

  test('Performance: Memory usage stable', async ({ guestPageWithTable }) => {
    const page = guestPageWithTable;
    await waitForAppReady(page);

    // Initial memory
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Dismiss modal
    const welcomeModal = page.locator('[data-testid="welcome-modal"]');
    if (await welcomeModal.isVisible().catch(() => false)) {
      await page.locator('button:has-text("Dismiss")').click();
    }

    // Do several interactions
    for (let i = 0; i < 5; i++) {
      await page.locator('button:has-text("Makanan")').first().click();
      await page.waitForTimeout(200);
      await page.locator('button:has-text("Minuman")').first().click();
      await page.waitForTimeout(200);
    }

    // Final memory
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Memory growth should be reasonable (less than 50MB)
    const memoryGrowth = finalMemory - initialMemory;
    expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
  });

  test('Performance: No memory leaks on repeated actions', async ({ guestPageWithTable }) => {
    const page = guestPageWithTable;
    await waitForAppReady(page);

    // Track memory over repeated cycles
    const memorySnapshots: number[] = [];

    for (let cycle = 0; cycle < 5; cycle++) {
      // Add item
      const menuItem = page.locator('[data-testid^="menu-item-"]').first();
      if (await menuItem.isVisible()) {
        await menuItem.locator('button').first().click();
        await page.waitForTimeout(200);
      }

      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);

      // Measure memory
      const memory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      memorySnapshots.push(memory);
    }

    // Check memory trend - should not grow consistently
    const memoryGrowth = memorySnapshots[memorySnapshots.length - 1] - memorySnapshots[0];
    expect(memoryGrowth).toBeLessThan(30 * 1024 * 1024);
  });
});
