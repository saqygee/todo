import { it, expect } from 'vitest';
import { testDatabase } from '../database.js';
import { createTodoRepository } from '../../../src/server/repositories/todo.repository.js';
import { createPrisma } from '../../../src/server/config/prisma.js';
import { DatabaseSync } from 'node:sqlite';
it('creates from a lifetime max, filters/sorts and persists ISO timestamps', async () => {
    const ctx = await testDatabase();
    try {
        const repo = createTodoRepository(ctx.db);
        const a = await repo.create({ title: 'a', description: null, dueAt: null });
        expect(a.ordinal).toBe(0);
        expect(a.completed).toBe(false);
        expect(a.id).toMatch(/^[\da-f-]{36}$/);
        await ctx.db.todo.update({ where: { id: a.id }, data: { deleted: true } });
        const b = await repo.create({ title: 'b', description: null, dueAt: '2026-11-09T09:00:00.000Z' });
        expect(b.ordinal).toBe(1);
        expect((await repo.list(false)).map(t => t.title)).toEqual(['b']);
        await ctx.db.todo.update({ where: { id: b.id }, data: { completed: true } });
        expect(await repo.list(false)).toEqual([]);
        expect(await repo.list(true)).toHaveLength(1);
        expect(await repo.find(a.id)).toBeNull();
        const raw = new DatabaseSync(ctx.path);
        const row = raw.prepare('SELECT dueAt, createdAt FROM Todo WHERE id = ?').get(b.id);
        raw.close();
        expect(new Date(String(row?.dueAt)).toISOString()).toBe('2026-11-09T09:00:00.000Z');
        expect(String(row?.dueAt)).toMatch(/(?:Z|\+00:00)$/);
        expect(String(row?.createdAt)).toContain('T');
    }
    finally {
        await ctx.close();
    }
});
it('allocates unique ordinals for overlapping creates and rolls failed writes back', async () => {
    const ctx = await testDatabase();
    try {
        const repo = createTodoRepository(ctx.db);
        const second = createPrisma(ctx.url);
        const other = createTodoRepository(second);
        const tasks = await Promise.all(Array.from({ length: 5 }, (_, i) => (i % 2 ? other : repo).create({ title: String(i), description: null, dueAt: null })));
        await second.$disconnect();
        expect(new Set(tasks.map(t => t.ordinal)).size).toBe(5);
        await expect(ctx.db.$transaction(async (tx) => { await tx.todo.create({ data: { title: 'rollback', ordinal: 100 } }); throw Error('rollback'); })).rejects.toThrow();
        expect(await ctx.db.todo.count()).toBe(5);
        await ctx.db.todo.create({data:{title:'Max ordinal',ordinal:2147483647}});
        await expect(repo.create({title:'Overflow',description:null,dueAt:null})).rejects.toMatchObject({status:409});
        expect(await ctx.db.todo.count()).toBe(6);
    }
    finally {
        await ctx.close();
    }
});
it('lists newest first in both filters, without renumbering gaps or moving edited tasks',async()=>{
 const ctx=await testDatabase();try{
 await ctx.db.todo.createMany({data:[{title:'Old',ordinal:0},{title:'Done',ordinal:2,completed:true},{title:'New',ordinal:5},{title:'Deleted',ordinal:7,deleted:true}]});
 const repo=createTodoRepository(ctx.db);
 expect((await repo.list(false)).map(t=>t.ordinal)).toEqual([5,0]);
 expect((await repo.list(true)).map(t=>t.ordinal)).toEqual([5,2,0]);
 const oldest=(await repo.list(true)).find(t=>t.ordinal===0)!;await repo.update(oldest.id,{title:'Edited old'});
 expect((await repo.list(true)).map(t=>t.ordinal)).toEqual([5,2,0]);
 const added=await repo.create({title:'Newest',description:null,dueAt:null});expect(added.ordinal).toBe(8);expect((await repo.list(false))[0]?.id).toBe(added.id);
 }finally{await ctx.close();}
});
