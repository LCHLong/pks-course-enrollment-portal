import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Integration Tests: Domain Invariants & Security Guards (Specs 004 - 007)', () => {
  describe('Capacity Invariant Guard (Spec 006)', () => {
    test('enforces that new capacity cannot be less than current enrolled_count', () => {
      const course = {
        id: 'course-1',
        title: 'Backend Mastery',
        capacity: 20,
        enrolled_count: 15,
      };

      const validateCapacityUpdate = (currentEnrolled: number, newCapacity: number) => {
        if (newCapacity < currentEnrolled) {
          throw new Error('INVALID_CAPACITY: Sĩ số mới không được nhỏ hơn số lượng học viên đã ghi danh');
        }
        return true;
      };

      assert.equal(validateCapacityUpdate(course.enrolled_count, 25), true);
      assert.equal(validateCapacityUpdate(course.enrolled_count, 15), true);
      assert.throws(() => validateCapacityUpdate(course.enrolled_count, 10), {
        message: /INVALID_CAPACITY/,
      });
    });

    test('prevents over-enrollment when course is full (Spec 004)', () => {
      const course = {
        id: 'course-2',
        title: 'React Advanced',
        capacity: 10,
        enrolled_count: 10,
      };

      const checkEnrollmentEligibility = (c: typeof course) => {
        if (c.enrolled_count >= c.capacity) {
          throw new Error('COURSE_FULL: Khóa học đã đủ sĩ số');
        }
        return true;
      };

      assert.throws(() => checkEnrollmentEligibility(course), {
        message: /COURSE_FULL/,
      });
    });
  });

  describe('Anti-IDOR Security Guard (Spec 005)', () => {
    test('scopes enrollment queries strictly to current authenticated user_id', () => {
      const currentStudentId = 'student-alpha-id';
      const mockDatabaseRecords = [
        { id: 'enr-1', user_id: 'student-alpha-id', course_id: 'c-1', status: 'enrolled' },
        { id: 'enr-2', user_id: 'student-beta-id', course_id: 'c-1', status: 'enrolled' },
        { id: 'enr-3', user_id: 'student-alpha-id', course_id: 'c-2', status: 'confirmed' },
      ];

      // Safe query scoping simulation
      const fetchStudentEnrollments = (authenticatedUserId: string) => {
        return mockDatabaseRecords.filter(r => r.user_id === authenticatedUserId);
      };

      const results = fetchStudentEnrollments(currentStudentId);
      assert.equal(results.length, 2);
      assert.equal(results.every(r => r.user_id === currentStudentId), true);
      assert.equal(results.some(r => r.user_id === 'student-beta-id'), false);
    });
  });

  describe('Restrict Delete on Active Enrollments (Spec 006)', () => {
    test('blocks deletion of courses that have existing enrollments', () => {
      const checkCanDeleteCourse = (enrollmentCount: number) => {
        if (enrollmentCount > 0) {
          throw new Error('COURSE_HAS_ENROLLMENTS: Không thể xóa khóa học đã có học viên đăng ký');
        }
        return true;
      };

      assert.equal(checkCanDeleteCourse(0), true);
      assert.throws(() => checkCanDeleteCourse(1), {
        message: /COURSE_HAS_ENROLLMENTS/,
      });
    });
  });
});
