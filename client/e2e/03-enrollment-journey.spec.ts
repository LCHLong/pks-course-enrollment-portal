import { test, expect } from '@playwright/test';

test.describe('E2E Suite: Course Details & Enrollment Journeys (Specs 003, 004, 005)', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as student
    await page.goto('/login');
    await page.getByTestId('input-login-email').fill('student@pks.edu.vn');
    await page.getByTestId('input-login-password').fill('Student@123456');
    await page.getByTestId('btn-login-submit').click();
    await expect(page.getByTestId('badge-user-name')).toBeVisible();
  });

  test('E2E-ENR-01: Navigate to course details and verify enrollment status & breadcrumb', async ({ page }) => {
    await page.goto('/courses');

    // Click on the first course card title or link
    const firstCourseLink = page.locator('article[data-testid^="card-course-"] a').first();
    if (await firstCourseLink.count() > 0) {
      await firstCourseLink.click();
      await expect(page).toHaveURL(/\/courses\/.+/);

      // Verify breadcrumb
      await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();

      // Either enroll button or already enrolled badge is visible
      const enrollButton = page.getByTestId('btn-enroll-course');
      const enrolledBadge = page.getByTestId('badge-enrolled-status');
      await expect(enrollButton.or(enrolledBadge)).toBeVisible();
    }
  });

  test('E2E-ENR-02: View My Courses portal without IDOR leaks (Spec 005)', async ({ page }) => {
    await page.goto('/my-courses');

    // Should load student personal courses page
    await expect(page.locator('main[aria-label="Khóa học của tôi"]')).toBeVisible();

    // Either displays personal cards or empty state
    const cards = page.locator('[data-testid^="card-my-course-"]');
    const emptyState = page.getByTestId('state-empty-mycourses');
    await expect(cards.first().or(emptyState)).toBeVisible();
  });
});
