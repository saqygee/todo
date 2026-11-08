import { it, expect } from 'vitest';
import { testDatabase } from '../database.js';
import { createTodoRepository } from '../../../src/server/repositories/todo.repository.js';
it('cannot resurrect records through raced or stale edits and status writes', async () => {
    const ctx = await testDatabase();
    try {
        const repo = createTodoRepository(ctx.db);
        const item = await repo.create({ title: 'Task', description: null, dueAt: null });
        await Promise.all([repo.remove(item.id), repo.update(item.id, { title: 'Changed' }), repo.complete(item.id, true)]);
        expect(await repo.find(item.id)).toBeNull();
        expect(await repo.update(item.id, { title: 'stale' })).toBeNull();
        expect(await repo.complete(item.id, false)).toBeNull();
        expect(await repo.remove(item.id)).toBe(false);
        expect((await ctx.db.todo.findUnique({ where: { id: item.id } }))?.deleted).toBe(true);
    }
    finally {
        await ctx.close();
    }
});
