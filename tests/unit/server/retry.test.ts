import { it, expect, vi } from 'vitest';
import { createTodoRepository, isRetryable } from '../../../src/server/repositories/todo.repository.js';
import { createPrisma } from '../../../src/server/config/prisma.js';
it('bounds whole-transaction retries and never retries arbitrary errors', async () => {
    const db = createPrisma('file:/tmp/todo-unused-retry.db');
    const ready = vi.spyOn(db, '$queryRaw').mockResolvedValue([]);
    const tx = vi.spyOn(db, '$transaction').mockRejectedValue({ code: 'P2034' });
    await expect(createTodoRepository(db).create({ title: 'Task', description: null, dueAt: null })).rejects.toMatchObject({ status: 503 });
    expect(tx).toHaveBeenCalledTimes(3);
    tx.mockClear().mockRejectedValue(new Error('not transient'));
    await expect(createTodoRepository(db).create({ title: 'Task', description: null, dueAt: null })).rejects.toThrow('not transient');
    expect(tx).toHaveBeenCalledTimes(1);
    tx.mockRestore();
    ready.mockRestore();
    await db.$disconnect();
    expect(isRetryable({ meta: { driverAdapterError: { cause: { originalCode: '5' } } } })).toBe(true);
    expect(isRetryable({ code: 'P2025' })).toBe(false);
});
