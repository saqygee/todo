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

import { minuteEligible, hourEligible } from '../../../src/client/utils/datetime.js';
it('excludes the partly elapsed minute, exhausted hours and days without advancing selection',()=>{
 const now=new Date(2026,10,8,10,15,30).getTime();
 expect(minuteEligible('2026-11-08','10','15',now)).toBe(false);
 expect(minuteEligible('2026-11-08','10','16',now)).toBe(true);
 expect(hourEligible('2026-11-08','09',now)).toBe(false);
 expect(hourEligible('2026-11-08','10',now)).toBe(true);
 const late=new Date(2026,10,8,23,59,30).getTime();
 expect(hourEligible('2026-11-08','23',late)).toBe(false);
 expect(minuteEligible('2026-11-09','00','00',late)).toBe(true);
 expect(minuteEligible('2026-11-09','00','00',late+30000)).toBe(false);
});
