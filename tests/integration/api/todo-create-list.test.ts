import { it, expect } from 'vitest';
import request from 'supertest';
import { testDatabase } from '../database.js';
import { createApp } from '../../../src/server/app.js';
import { createTodoRepository } from '../../../src/server/repositories/todo.repository.js';
import { createTodoService } from '../../../src/server/services/todo.service.js';
it('serves the create/list/detail contract with strict boundary validation', async () => {
    const ctx = await testDatabase();
    try {
        const app = createApp({ service: createTodoService(createTodoRepository(ctx.db)) });
        const a = await request(app).post('/api/todos').send({ title: 'Task' });
        expect(a.status).toBe(201);
        expect(a.headers.location).toBe('/api/todos/' + a.body.data.id);
        expect(a.body.data).toMatchObject({ title: 'Task', ordinal: 0, description: null, dueAt: null, completed: false, deleted: false });
        expect((await request(app).get('/api/todos')).body.data).toHaveLength(1);
        expect((await request(app).get('/api/todos/' + a.body.data.id)).status).toBe(200);
        for (const query of ['includeCompleted=yes', 'includeCompleted=true&includeCompleted=false', 'other=x'])
            expect((await request(app).get('/api/todos?' + query)).status).toBe(400);
        expect((await request(app).get('/api/todos/invalid')).status).toBe(400);
        expect((await request(app).post('/api/todos').send({ title: 'Task', ordinal: 5 })).status).toBe(400);
        const invalid = await request(app).post('/api/todos').send({ title: '', dueAt: '2026-01-01T12:00:00' });
        expect(invalid.body.error.fields.title).toBeDefined();
    }
    finally {
        await ctx.close();
    }
});
