import { it, expect } from 'vitest';
import { http, requestError } from '../../../src/client/services/http.js';
it('configures bounded requests and safely maps errors', () => {
    expect(http.defaults.baseURL).toBe('/api');
    expect(http.defaults.timeout).toBeGreaterThan(0);
    expect(requestError(new Error('secret')).message).not.toContain('secret');
});
