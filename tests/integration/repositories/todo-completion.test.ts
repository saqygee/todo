import { it, expect } from 'vitest';
import { testDatabase } from '../database.js';
import { createTodoRepository } from '../../../src/server/repositories/todo.repository.js';
it('preserves content and order through repeated explicit states', async () => {
    const ctx = await testDatabase();
    try {
        const repo = createTodoRepository(ctx.db);
        const item = await repo.create({ title: 'Keep', description: 'Details', dueAt: null });
        for (const completed of [true, true, false, false]) {
            const changed = await repo.complete(item.id, completed);
            expect(changed).toMatchObject({ title: 'Keep', description: 'Details', ordinal: 0, completed });
        }
    }
    finally {
        await ctx.close();
    }
});
