import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { expect } from 'vitest';

/**
 * Custom render function with common providers
 * Add wrappers (providers, themes, etc.) here as needed
 */
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { ...options });
};

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

/**
 * Common test utilities and helpers
 */

export const waitForLoadingToFinish = async (
  screen: any,
  timeout = 1000
) => {
  const loader = screen.queryByRole('status');
  if (loader) {
    await new Promise(resolve => setTimeout(resolve, timeout));
  }
};

export const getFormFieldByLabelText = (
  screen: any,
  labelText: string | RegExp
) => {
  return screen.getByLabelText(labelText);
};

export const findButtonByText = (
  screen: any,
  text: string | RegExp
) => {
  return screen.getByRole('button', { name: text });
};

/**
 * Mock delay for simulating network requests
 */
export const mockDelay = (ms: number = 100) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Assert that an element has specific classes
 */
export const assertHasClasses = (
  element: HTMLElement,
  classes: string[]
) => {
  classes.forEach(cls => {
    expect(element).toHaveClass(cls);
  });
};

/**
 * Assert that an element does not have specific classes
 */
export const assertDoesNotHaveClasses = (
  element: HTMLElement,
  classes: string[]
) => {
  classes.forEach(cls => {
    expect(element).not.toHaveClass(cls);
  });
};
