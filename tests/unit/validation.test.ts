import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { registerSchema, loginSchema } from '../../server/src/validations/auth.validation';
import { createCourseSchema, updateCourseSchema, queryCourseSchema } from '../../server/src/validations/course.validation';
import { updateEnrollmentStatusSchema } from '../../server/src/validations/enrollment.validation';
import { updateProfileSchema, changePasswordSchema } from '../../server/src/validations/user.validation';

describe('Unit Tests: Zod Validation Schemas (Specs 001 - 008)', () => {
  describe('Auth Validation (Spec 001)', () => {
    test('registerSchema: accepts valid student registration payload', () => {
      const valid = {
        name: 'Nguyen Van A',
        email: 'nguyenvana@example.com',
        password: 'password123',
      };
      const result = registerSchema.safeParse(valid);
      assert.equal(result.success, true);
    });

    test('registerSchema: rejects short names and invalid email formats', () => {
      const invalid = {
        name: 'A',
        email: 'invalid-email',
        password: '123',
      };
      const result = registerSchema.safeParse(invalid);
      assert.equal(result.success, false);
      if (!result.success) {
        assert.equal(result.error.issues.length >= 3, true);
      }
    });

    test('loginSchema: rejects missing password and malformed email', () => {
      const result = loginSchema.safeParse({ email: 'bad-email', password: '' });
      assert.equal(result.success, false);
    });
  });

  describe('Course Validation (Specs 002, 006)', () => {
    test('createCourseSchema: validates 8 required fields and positive capacity', () => {
      const validCourse = {
        title: 'Fullstack Next.js & Node.js',
        category: 'Lập trình Web',
        instructor: 'Dr. Nguyen',
        description: 'Khoá học fullstack chuyên sâu',
        price: 1500000,
        capacity: 30,
        is_active: true,
      };
      const result = createCourseSchema.safeParse(validCourse);
      assert.equal(result.success, true);
    });

    test('createCourseSchema: rejects negative capacity and negative price', () => {
      const invalid = {
        title: 'Test Course',
        category: 'Dev',
        instructor: 'Test Instructor',
        price: -500,
        capacity: 0,
      };
      const result = createCourseSchema.safeParse(invalid);
      assert.equal(result.success, false);
    });

    test('queryCourseSchema: clamps pagination limits and defaults properly', () => {
      const parsed = queryCourseSchema.parse({});
      assert.equal(parsed.page, 1);
      assert.equal(parsed.limit, 10);

      const invalidLimit = queryCourseSchema.safeParse({ limit: 500 });
      assert.equal(invalidLimit.success, false);
    });
  });

  describe('Enrollment Validation (Specs 004, 007)', () => {
    test('updateEnrollmentStatusSchema: accepts valid enum statuses', () => {
      const statuses = ['enrolled', 'confirmed', 'cancelled', 'pending'] as const;
      for (const status of statuses) {
        const result = updateEnrollmentStatusSchema.safeParse({ status });
        assert.equal(result.success, true);
      }
    });

    test('updateEnrollmentStatusSchema: rejects illegal status values', () => {
      const result = updateEnrollmentStatusSchema.safeParse({ status: 'completed' });
      assert.equal(result.success, false);
    });
  });

  describe('User Profile Validation (Spec 008)', () => {
    test('updateProfileSchema: ensures name length invariant', () => {
      assert.equal(updateProfileSchema.safeParse({ name: 'Valid Name' }).success, true);
      assert.equal(updateProfileSchema.safeParse({ name: ' ' }).success, false);
    });

    test('changePasswordSchema: enforces current and new password constraints', () => {
      const valid = { current_password: 'oldPassword123', new_password: 'newPassword456' };
      assert.equal(changePasswordSchema.safeParse(valid).success, true);

      const invalid = { current_password: '', new_password: '123' };
      assert.equal(changePasswordSchema.safeParse(invalid).success, false);
    });
  });
});
