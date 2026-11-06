/**
 * Vietnamese Text Utilities for Smart Search & Diacritics Normalization
 */

/**
 * Strips Vietnamese diacritics / tones from a string to facilitate accent-insensitive matching.
 * e.g. "Lập Trình Web Fullstack" -> "lap trinh web fullstack"
 *      "Khoá học" -> "khoa hoc"
 *      "Đào tạo" -> "dao tao"
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'))
    .toLowerCase()
    .trim();
}

/**
 * Checks whether a given keyword matches target text under Vietnamese accent-insensitive rules.
 */
export function matchesVietnamese(target: string, query: string): boolean {
  if (!query) return true;
  if (!target) return false;

  const normalizedTarget = removeVietnameseTones(target);
  const normalizedQuery = removeVietnameseTones(query);

  // If query is a generic course keyword ("khoa", "khoa hoc", "courses", "course")
  if (['khoa', 'khoa hoc', 'course', 'courses', 'hoc'].includes(normalizedQuery)) {
    return true;
  }

  // Check substring containment
  if (normalizedTarget.includes(normalizedQuery)) {
    return true;
  }

  // Also check individual words
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
  if (queryTokens.length > 1) {
    return queryTokens.every((token) => normalizedTarget.includes(token));
  }

  return false;
}
