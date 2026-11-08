import { it, expect, vi } from 'vitest';
import { createTodoService } from '../../../src/server/services/todo.service.js';
it('delegates list/create and translates unavailable records', async () => {
    const repository = { list: vi.fn(async () => []), find: vi.fn(async () => null), create: vi.fn(), update: vi.fn(), complete: vi.fn(), remove: vi.fn() };
    const service = createTodoService(repository);
    expect(await service.list(false)).toEqual([]);
    expect(repository.list).toHaveBeenCalledWith(false);
    await expect(service.get('missing')).rejects.toMatchObject({ status: 404 });
});
