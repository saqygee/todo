import { it, expect, vi } from 'vitest';
import { createTodoService } from '../../../src/server/services/todo.service.js';
it('preserves PATCH intent and reports unavailable edits', async () => {
    const update = vi.fn(async () => null);
    const service = createTodoService({ list: vi.fn(), find: vi.fn(), create: vi.fn(), complete: vi.fn(), remove: vi.fn(), update });
    await expect(service.update('missing', { description: null })).rejects.toMatchObject({ status: 404 });
    expect(update).toHaveBeenCalledWith('missing', { description: null });
});
