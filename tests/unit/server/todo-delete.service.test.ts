import { it, expect, vi } from 'vitest';
import { createTodoService } from '../../../src/server/services/todo.service.js';
it('reports unavailable deletion and accepts successful deletion', async () => {
    const remove = vi.fn(async () => false);
    const service = createTodoService({ list: vi.fn(), find: vi.fn(), create: vi.fn(), complete: vi.fn(), update: vi.fn(), remove });
    await expect(service.remove('missing')).rejects.toMatchObject({ status: 404 });
    remove.mockResolvedValueOnce(true);
    await expect(service.remove('present')).resolves.toBeUndefined();
});
