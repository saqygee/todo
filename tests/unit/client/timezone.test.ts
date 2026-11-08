import { it, expect } from 'vitest';
import { toUtc, toLocalInput, formatDate } from '../../../src/client/utils/datetime.js';
it('converts across date boundaries and DST, rejecting gaps and choosing the earlier overlap', () => {
    const previous = process.env.TZ;
    try {
        for (const zone of ['UTC', 'Asia/Tokyo', 'America/New_York', 'Europe/London']) {
            process.env.TZ = zone;
            const stamp = '2026-11-08T00:30:00.000Z';
            expect(toUtc(toLocalInput(stamp), stamp)).toBe(stamp);
            expect(formatDate(stamp)).not.toContain('Invalid');
        }
        process.env.TZ = 'America/New_York';
        expect(() => toUtc('2026-03-08T02:30')).toThrow();
        expect(toUtc('2026-11-01T01:30')).toBe('2026-11-01T05:30:00.000Z');
        process.env.TZ = 'Europe/London';
        expect(() => toUtc('2026-03-29T01:30')).toThrow();
        expect(toUtc('2026-10-25T01:30')).toBe('2026-10-25T00:30:00.000Z');
    }
    finally {
        if (previous === undefined)
            delete process.env.TZ;
        else
            process.env.TZ = previous;
    }
});
