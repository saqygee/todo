import { it, expect } from 'vitest';
import { toUtc, toLocalInput, formatDate } from '../../../src/client/utils/datetime.js';
it('handles absent dates, round trips local inputs, and preserves unchanged instants', () => {
    expect(toUtc('')).toBeNull();
    expect(toLocalInput(null)).toBe('');
    expect(formatDate(null)).toBe('No due date');
    const date = '2026-11-09T09:15:00.345Z';
    const local = toLocalInput(date);
    expect(toUtc(local, date)).toBe(date);
    expect(() => toUtc('bad')).toThrow();
});
