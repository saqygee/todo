import { it, expect, vi } from 'vitest';
import { readConfig } from '../../../src/server/config/env.js';
import { errorHandler } from '../../../src/server/middleware/error-handler.js';
import { AppError } from '../../../src/server/utils/errors.js';
it('validates environment', () => {
    expect(readConfig({ DATABASE_URL: 'file:./prisma/dev.db', PORT: '3001' }).port).toBe(3001);
    expect(() => readConfig({ DATABASE_URL: 'postgres://example' })).toThrow();
    expect(() => readConfig({ PORT: 'zero' })).toThrow();
});
it('serialises safe errors without leaking internals', () => {
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    const setHeader = vi.fn();
    const response = { status, setHeader };
    const log = vi.spyOn(console, 'error').mockImplementation(() => { });
    errorHandler(new Error('secret SQL path'), response);
    expect(status).toHaveBeenCalledWith(500);
    expect(JSON.stringify(json.mock.calls)).not.toContain('secret SQL');
    errorHandler(new AppError(503, 'STORAGE_BUSY', 'Storage busy'), response);
    expect(setHeader).toHaveBeenCalledWith('Retry-After', '1');
    log.mockRestore();
});
