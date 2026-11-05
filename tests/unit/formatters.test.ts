import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { formatCurrency } from '../../client/src/utils/formatCurrency';
import { formatDate } from '../../client/src/utils/formatDate';

describe('Unit Tests: UI Contract Formatters', () => {
  describe('formatCurrency (Strict Vietnamese Currency Rule)', () => {
    test('returns "Miễn phí" for 0 price courses', () => {
      assert.equal(formatCurrency(0), 'Miễn phí');
    });

    test('appends non-breaking space (\\u00A0) and currency symbol ₫', () => {
      const formatted = formatCurrency(1500000);
      assert.equal(formatted.includes('\u00A0₫'), true);
      assert.equal(formatted, `1.500.000\u00A0₫`);
    });

    test('formats small amounts correctly with non-breaking space', () => {
      assert.equal(formatCurrency(50000), `50.000\u00A0₫`);
      assert.equal(formatCurrency(100), `100\u00A0₫`);
    });
  });

  describe('formatDate (Vietnamese Locale Standard)', () => {
    test('formats valid ISO date string properly', () => {
      const formatted = formatDate('2026-11-05T08:00:00.000Z');
      assert.equal(typeof formatted, 'string');
      assert.equal(formatted.length > 0, true);
    });

    test('handles fallback when invalid date input is provided', () => {
      const formatted = formatDate('');
      assert.equal(typeof formatted, 'string');
    });
  });
});
