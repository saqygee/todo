import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createPrisma } from '../../src/server/config/prisma.js';
export function assertTestDatabase(url: string, ownedDirectory: string) {
    const path = resolve(url.slice(5));
    if (!url.startsWith('file:') || !path.startsWith(resolve(ownedDirectory) + '/') || path === resolve('prisma/dev.db'))
        throw new Error('Refusing non-test database');
}
export async function testDatabase() {
    const directory = await mkdtemp(join(tmpdir(), 'todo-test-'));
    const path = join(directory, 'test.db');
    const url = 'file:' + path;
    assertTestDatabase(url, directory);
    const raw = new DatabaseSync(path);
    raw.exec(await readFile('prisma/migrations/20261108000000_init/migration.sql', 'utf8'));
    raw.close();
    const db = createPrisma(url);
    return { db, url, path, async close() { await db.$disconnect(); await rm(directory, { recursive: true, force: true }); } };
}
