import { it, expect } from 'vitest';
import request from 'supertest';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createApp } from '../../../src/server/app.js';
it('serves built HTML and keeps unknown API endpoints JSON', async () => {
    const folder = await mkdtemp(join(tmpdir(), 'todo-assets-'));
    try {
        await writeFile(join(folder, 'index.html'), '<!doctype html><title>Everyday</title>');
        const app = createApp({ clientDir: folder });
        const page = await request(app).get('/');
        expect(page.status).toBe(200);
        expect(page.text).toContain('Everyday');
        expect((await request(app).get('/app/view')).status).toBe(200);
        const api = await request(app).get('/api/missing');
        expect(api.status).toBe(404);
        expect(api.type).toMatch(/json/);
    }
    finally {
        await rm(folder, { recursive: true, force: true });
    }
});
