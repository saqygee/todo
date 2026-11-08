import { it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/server/app.js';
it('keeps boundary errors safe and API misses JSON', async () => {
    const app = createApp();
    expect((await request(app).post('/api/todos').send('bad')).status).toBe(415);
    expect((await request(app).post('/api/todos').type('json').send('{')).status).toBe(400);
    expect((await request(app).post('/api/todos').send({ title: 'a'.repeat(40000) })).status).toBe(413);
    const missing = await request(app).get('/api/missing');
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe('ROUTE_NOT_FOUND');
});
