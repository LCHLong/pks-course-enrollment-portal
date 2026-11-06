import { describe, it } from 'node:test';
import assert from 'node:assert';
import { removeVietnameseTones, matchesVietnamese } from '../../server/src/utils/vietnamese.js';

describe('Vietnamese Search & Diacritics Normalization', () => {
  it('strips accents correctly from Vietnamese sentences', () => {
    assert.strictEqual(
      removeVietnameseTones('Lập Trình Web Fullstack Chuyên Nghiệp'),
      'lap trinh web fullstack chuyen nghiep'
    );
    assert.strictEqual(removeVietnameseTones('Đào tạo'), 'dao tao');
    assert.strictEqual(removeVietnameseTones('Khóa học'), 'khoa hoc');
    assert.strictEqual(removeVietnameseTones('Khoá học'), 'khoa hoc');
  });

  it('matches generic course queries like "khoa" and "khoa hoc"', () => {
    assert.strictEqual(matchesVietnamese('Lập Trình Web Fullstack', 'khoa'), true);
    assert.strictEqual(matchesVietnamese('Lập Trình Web Fullstack', 'Khoá'), true);
    assert.strictEqual(matchesVietnamese('Lập Trình Web Fullstack', 'khóa học'), true);
  });

  it('matches accent-insensitive terms correctly', () => {
    assert.strictEqual(matchesVietnamese('Lập Trình Web Fullstack', 'lap trinh'), true);
    assert.strictEqual(matchesVietnamese('Luyện Thi Chứng Chỉ MOS Excel', 'excel'), true);
    assert.strictEqual(matchesVietnamese('React.js & Tailwind CSS Hiện Đại', 'react'), true);
    assert.strictEqual(matchesVietnamese('Tin Học Văn Phòng', 'tin hoc'), true);
    assert.strictEqual(matchesVietnamese('Kiến Trúc Microservices', 'microservices'), true);
  });

  it('rejects completely irrelevant search queries', () => {
    assert.strictEqual(matchesVietnamese('React.js & Tailwind CSS', 'photoshop'), false);
    assert.strictEqual(matchesVietnamese('MOS Excel Expert', 'flutter'), false);
  });
});
