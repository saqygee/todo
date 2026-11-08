import { it, expect } from 'vitest';
import request from 'supertest';
import { testDatabase } from '../database.js';
import { createApp } from '../../../src/server/app.js';
import { createTodoRepository } from '../../../src/server/repositories/todo.repository.js';
import { createTodoService } from '../../../src/server/services/todo.service.js';
it('sets explicit completion and keeps deleted records unavailable', async () => {
    const ctx = await testDatabase();
    try {
        const repo = createTodoRepository(ctx.db);
        const item = await repo.create({ title: 'Task', description: null, dueAt: null });
        const app = createApp({ service: createTodoService(repo) });
        const done = await request(app).patch(`/api/todos/${item.id}/completion`).send({ completed: true });
        expect(done.status).toBe(200);
        expect(done.body.data.completed).toBe(true);
        expect(done.body.data.ordinal).toBe(0);
        expect((await request(app).get('/api/todos')).body.data).toHaveLength(0);
        expect((await request(app).get('/api/todos?includeCompleted=true')).body.data).toHaveLength(1);
        for (let i = 0; i < 2; i++)
            expect((await request(app).patch(`/api/todos/${item.id}/completion`).send({ completed: false })).body.data.completed).toBe(false);
        expect((await request(app).patch(`/api/todos/${item.id}/completion`).send({ completed: 'false' })).status).toBe(400);
        await ctx.db.todo.update({ where: { id: item.id }, data: { deleted: true } });
        expect((await request(app).patch(`/api/todos/${item.id}/completion`).send({ completed: true })).status).toBe(404);
    }
    finally {
        await ctx.close();
    }
});
