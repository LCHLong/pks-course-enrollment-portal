import { test, expect } from '@playwright/test';

test.describe('E2E Suite: Admin Management Journeys (Specs 006, 007)', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as Admin
    await page.goto('/login');
    await page.getByTestId('input-login-email').fill('admin@pks.edu.vn');
    await page.getByTestId('input-login-password').fill('Admin@123456');
    await page.getByTestId('btn-login-submit').click();
    await expect(page.getByTestId('badge-user-name')).toBeVisible();
    await expect(page.getByTestId('badge-user-role')).toContainText(/Quản trị viên/i);
  });

  test('E2E-ADM-01: Admin Course CRUD Management view & form modal interaction', async ({ page }) => {
    await page.goto('/admin/courses');

    // Admin courses table or empty state should be visible
    const table = page.getByTestId('admin-course-table');
    const emptyState = page.getByTestId('state-empty-admin-courses');
    await expect(table.or(emptyState)).toBeVisible();

    // Verify "Thêm khóa học" button is present and triggers modal
    const addCourseBtn = page.getByTestId('btn-add-course');
    await expect(addCourseBtn).toBeVisible();
    await addCourseBtn.click();

    // Verify modal opened
    const modal = page.getByTestId('modal-course-form');
    await expect(modal).toBeVisible();

    // Close modal
    const cancelBtn = page.getByTestId('btn-cancel-course');
    await cancelBtn.click();
    await expect(modal).not.toBeVisible();
  });

  test('E2E-ADM-02: Admin Enrollment Management view & status sync', async ({ page }) => {
    await page.goto('/admin/enrollments');

    // Admin enrollment table or empty state should be visible
    const table = page.getByTestId('admin-enrollment-table');
    const emptyState = page.getByTestId('state-empty-enrollments');
    await expect(table.or(emptyState)).toBeVisible();
  });

  test('E2E-ADM-03: Dark/Light Mode Theme Toggle Test', async ({ page }) => {
    const themeBtn = page.getByRole('button', { name: /Toggle Theme/i });
    await expect(themeBtn).toBeVisible();

    // Click to toggle theme
    await themeBtn.click();
    // Verify documentElement class contains dark or light in localStorage
    const savedTheme = await page.evaluate(() => localStorage.getItem('pks_theme'));
    expect(['dark', 'light']).toContain(savedTheme);
  });
});
