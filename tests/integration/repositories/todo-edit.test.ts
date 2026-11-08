import { it, expect } from 'vitest';
import { testDatabase } from '../database.js';
import { createTodoRepository } from '../../../src/server/repositories/todo.repository.js';
it('serialises content and completion writes without overwriting unrelated fields', async () => {
    const ctx = await testDatabase();
    try {
        const repo = createTodoRepository(ctx.db);
        const item = await repo.create({ title: 'Before', description: 'Keep', dueAt: null });
        await Promise.all([repo.complete(item.id, true), repo.update(item.id, { title: 'After' })]);
        expect(await repo.find(item.id)).toMatchObject({ title: 'After', completed: true, description: 'Keep' });
    }
    finally {
        await ctx.close();
    }
});
