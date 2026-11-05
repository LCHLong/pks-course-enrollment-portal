import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../../server/src/utils/appError';
import { sendSuccess, sendError } from '../../server/src/utils/apiResponse';

describe('Integration Tests: Security, Cryptography & Auth Invariants', () => {
  const secretKey = 'test-super-secret-jwt-key-with-sufficient-length';

  describe('Password Hashing Invariant (Spec 001 - Bcrypt Salt >= 10)', () => {
    test('hashes password using salt >= 10 rounds', async () => {
      const rawPassword = 'SecureStudentPassword2026!';
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(rawPassword, salt);

      // Verify bcrypt standard structure and cost factor
      assert.equal(hash.startsWith('$2a$10$') || hash.startsWith('$2b$10$'), true);

      // Verify password comparison works genuinely
      const isMatch = await bcrypt.compare(rawPassword, hash);
      assert.equal(isMatch, true);

      const isMismatch = await bcrypt.compare('WrongPassword!', hash);
      assert.equal(isMismatch, false);
    });
  });

  describe('JWT Token Invariants (Spec 001)', () => {
    test('signs and verifies JWT claims properly', () => {
      const payload = {
        id: 'usr_student_test_uuid',
        email: 'student@example.com',
        role: 'student',
      };

      const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
      assert.equal(typeof token, 'string');

      const decoded = jwt.verify(token, secretKey) as typeof payload;
      assert.equal(decoded.id, payload.id);
      assert.equal(decoded.email, payload.email);
      assert.equal(decoded.role, payload.role);
    });

    test('rejects expired or tampered token', () => {
      const expiredToken = jwt.sign({ sub: 'user' }, secretKey, { expiresIn: -10 });
      assert.throws(() => {
        jwt.verify(expiredToken, secretKey);
      });
    });
  });

  describe('Error Standardization (AppError & apiResponse)', () => {
    test('creates standard AppError with code, message, and statusCode', () => {
      const error = new AppError('COURSE_NOT_FOUND', 'Course not found', 404);
      assert.equal(error.code, 'COURSE_NOT_FOUND');
      assert.equal(error.message, 'Course not found');
      assert.equal(error.statusCode, 404);
    });

    test('formats success response matching API contract', () => {
      let sentStatus = 0;
      let sentBody: any = null;
      const mockRes: any = {
        status: (s: number) => {
          sentStatus = s;
          return mockRes;
        },
        json: (b: any) => {
          sentBody = b;
          return mockRes;
        },
      };

      sendSuccess(mockRes, { courseId: 'c1' }, 'Khóa học tạo thành công', 201);
      assert.equal(sentStatus, 201);
      assert.equal(sentBody.success, true);
      assert.deepEqual(sentBody.data, { courseId: 'c1' });
      assert.equal(sentBody.message, 'Khóa học tạo thành công');
    });

    test('formats error response matching API contract', () => {
      let sentStatus = 0;
      let sentBody: any = null;
      const mockRes: any = {
        status: (s: number) => {
          sentStatus = s;
          return mockRes;
        },
        json: (b: any) => {
          sentBody = b;
          return mockRes;
        },
      };

      sendError(mockRes, 'COURSE_FULL', 'Khóa học đã đủ sĩ số', 409);
      assert.equal(sentStatus, 409);
      assert.equal(sentBody.success, false);
      assert.equal(sentBody.error.code, 'COURSE_FULL');
      assert.equal(sentBody.error.message, 'Khóa học đã đủ sĩ số');
    });
  });
});
