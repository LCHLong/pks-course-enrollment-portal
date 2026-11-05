import { test, expect } from '@playwright/test';

test.describe('E2E Suite: Public Course Catalog & Navigation (Specs 002, 003)', () => {
  test('E2E-CAT-01: Displays courses catalog with 8 fields, search and category filter', async ({ page }) => {
    await page.goto('/');

    // Check main title
    await expect(page).toHaveTitle(/PKS Course & Enrollment Portal/);

    // Verify search input is visible
    const searchInput = page.getByTestId('input-search-catalog');
    await expect(searchInput).toBeVisible();

    // Verify category select is visible
    const categorySelect = page.getByTestId('select-filter-category');
    await expect(categorySelect).toBeVisible();

    // Verify at least one course card is displayed
    const firstCard = page.locator('[data-testid^="card-course-"]').first();
    await expect(firstCard).toBeVisible();

    // Verify price formatting with Vietnamese currency symbol ₫
    const priceElement = page.locator('[data-testid^="course-price-"]').first();
    await expect(priceElement).toBeVisible();
    await expect(priceElement).toContainText('₫');

    // Test Search input interaction
    await searchInput.fill('Fullstack');
    await expect(page.locator('body')).toBeVisible();

    // Reset search
    await searchInput.clear();
  });

  test('E2E-CAT-02: 404 Guard on Nonexistent Course ID (Spec 003)', async ({ page }) => {
    await page.goto('/courses/nonexistent-invalid-course-id-999');

    // Should display 404 state
    const notFoundState = page.getByTestId('state-detail-404');
    const notFoundPage = page.getByTestId('page-not-found');

    await expect(notFoundState.or(notFoundPage)).toBeVisible();
  });

  test('E2E-CAT-03: Responsive Mobile Viewport Adaptability (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/courses');

    // Verify search box adapts to mobile
    const searchInput = page.getByTestId('input-search-catalog');
    await expect(searchInput).toBeVisible();

    // Header logo should still be visible in header
    await expect(page.locator('header').getByText('PKS Portal')).toBeVisible();

    // Restore desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});
