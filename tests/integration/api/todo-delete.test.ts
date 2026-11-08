import { it, expect } from 'vitest';
import request from 'supertest';
import { testDatabase } from '../database.js';
import { createApp } from '../../../src/server/app.js';
import { createTodoRepository } from '../../../src/server/repositories/todo.repository.js';
import { createTodoService } from '../../../src/server/services/todo.service.js';
it('soft deletes, never resets ordinals and rejects stale operations', async () => {
    const ctx = await testDatabase();
    try {
        const repo = createTodoRepository(ctx.db);
        const app = createApp({ service: createTodoService(repo) });
        const tasks = [];
        for (let i = 0; i < 3; i++)
            tasks.push(await repo.create({ title: String(i), description: null, dueAt: null }));
        for (const item of tasks.slice(1))
            expect((await request(app).delete('/api/todos/' + item.id)).status).toBe(204);
        const next = await repo.create({ title: 'Next', description: null, dueAt: null });
        expect(next.ordinal).toBe(3);
        for (const item of [tasks[0]!, next])
            expect((await request(app).delete('/api/todos/' + item.id)).status).toBe(204);
        expect((await repo.create({ title: 'After all', description: null, dueAt: null })).ordinal).toBe(4);
        const deleted = tasks[1]!;
        expect((await ctx.db.todo.findUnique({ where: { id: deleted.id } }))?.deleted).toBe(true);
        for (const result of [await request(app).get('/api/todos/' + deleted.id), await request(app).delete('/api/todos/' + deleted.id), await request(app).patch('/api/todos/' + deleted.id).send({ title: 'stale' }), await request(app).patch(`/api/todos/${deleted.id}/completion`).send({ completed: true })])
            expect(result.status).toBe(404);
        expect((await request(app).get('/api/todos?includeCompleted=true')).body.data).toHaveLength(1);
    }
    finally {
        await ctx.close();
    }
});
