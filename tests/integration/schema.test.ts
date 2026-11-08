import { it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
it('defines nullable optional fields, unique order and indexes in a migration', async () => {
    const schema = await readFile('prisma/schema.prisma', 'utf8');
    expect(schema).toMatch(/description\s+String\?/);
    expect(schema).toMatch(/dueAt\s+DateTime\?/);
    expect(schema).toMatch(/ordinal\s+Int\s+@unique/);
    const migration = await readFile('prisma/migrations/20261108000000_init/migration.sql', 'utf8');
    expect(migration).toContain('Todo_deleted_completed_ordinal_idx');
    expect(migration).toContain('Todo_deleted_ordinal_idx');
});
