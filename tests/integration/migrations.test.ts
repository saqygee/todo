import { it, expect } from 'vitest';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createPrisma } from '../../src/server/config/prisma.js';
const exec = promisify(execFile);
it('deploys committed migrations into a fresh nested directory and survives reconnect', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'todo-migration-'));
    const url = 'file:' + join(dir, 'nested', 'fresh.db');
    try {
        const options = { env: { ...process.env, DATABASE_URL: url } };
        const first = await exec(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], options);
        expect(first.stdout).toContain('successfully applied');
        const a = createPrisma(url);
        const item = await a.todo.create({ data: { title: 'Persistent', ordinal: 0 } });
        await a.$disconnect();
        const second = await exec(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], options);
        expect(second.stdout).toContain('No pending migrations');
        const b = createPrisma(url);
        try {
            expect((await b.todo.findUnique({ where: { id: item.id } }))?.title).toBe('Persistent');
        }
        finally {
            await b.$disconnect();
        }
    }
    finally {
        await rm(dir, { recursive: true, force: true });
    }
});
