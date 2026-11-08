import { it, expect } from 'vitest';
import { testDatabase, assertTestDatabase } from './database.js';
it('migrates an isolated database and refuses developer paths', async () => {
    expect(() => assertTestDatabase('file:./prisma/dev.db', '/tmp/owned')).toThrow();
    const a = await testDatabase(), b = await testDatabase();
    try {
        expect(a.path).not.toBe(b.path);
        expect(await a.db.todo.count()).toBe(0);
    }
    finally {
        await a.close();
        await b.close();
    }
});
