import { it, expect, vi } from 'vitest';
import { createTodoService } from '../../../src/server/services/todo.service.js';
it('passes false unchanged and rejects unavailable completion', async () => {
    const complete = vi.fn(async () => null);
    const service = createTodoService({ list: vi.fn(), find: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), complete });
    await expect(service.complete('missing', false)).rejects.toMatchObject({ status: 404 });
    expect(complete).toHaveBeenCalledWith('missing', false);
});
