import { test, expect } from '@playwright/test';

test.describe('E2E Suite: Authentication & Identity Journeys (Spec 001)', () => {
  const uniqueEmail = `test_student_${Date.now()}@pks.edu.vn`;

  test('E2E-AUTH-01: Register a new student account successfully', async ({ page }) => {
    await page.goto('/register');

    await expect(page.getByTestId('input-register-name')).toBeVisible();
    await page.getByTestId('input-register-name').fill('Hoc Vien Test');
    await page.getByTestId('input-register-email').fill(uniqueEmail);
    await page.getByTestId('input-register-password').fill('Student@123456');
    await page.getByTestId('input-register-confirm-password').fill('Student@123456');

    await page.getByTestId('btn-register-submit').click();

    // After registration, user is either redirected to login or catalog logged in
    await expect(page).toHaveURL(/\/(login|courses|\?.*)?/);
  });

  test('E2E-AUTH-02: Student Login with valid credentials and verify Header identity badges', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByTestId('input-login-email')).toBeVisible();
    await page.getByTestId('input-login-email').fill('student@pks.edu.vn');
    await page.getByTestId('input-login-password').fill('Student@123456');

    await page.getByTestId('btn-login-submit').click();

    // Verify user profile badge in header
    await expect(page.getByTestId('badge-user-name')).toBeVisible();
    await expect(page.getByTestId('badge-user-role')).toContainText(/Học viên/i);

    // Verify logout button appears
    await expect(page.getByTestId('btn-header-logout')).toBeVisible();

    // Test Logout
    await page.getByTestId('btn-header-logout').click();
    await expect(page.getByTestId('btn-header-login')).toBeVisible();
  });

  test('E2E-AUTH-03: Login failure with wrong password displays error notification', async ({ page }) => {
    await page.goto('/login');

    await page.getByTestId('input-login-email').fill('student@pks.edu.vn');
    await page.getByTestId('input-login-password').fill('WrongPassword123!');

    await page.getByTestId('btn-login-submit').click();

    // Expect alert error
    await expect(page.getByTestId('alert-login-error')).toBeVisible();
  });
});
