import { it, expect } from 'vitest';
import request from 'supertest';
import { testDatabase } from '../database.js';
import { createApp } from '../../../src/server/app.js';
import { createTodoRepository } from '../../../src/server/repositories/todo.repository.js';
import { createTodoService } from '../../../src/server/services/todo.service.js';
it('edits only allowlisted content, clears nulls and keeps the last successful save', async () => {
    const ctx = await testDatabase();
    try {
        const repo = createTodoRepository(ctx.db);
        const item = await repo.create({ title: 'Before', description: 'Details', dueAt: '2026-12-01T12:00:00Z' });
        const app = createApp({ service: createTodoService(repo) });
        await repo.complete(item.id, true);
        const first = await request(app).patch(`/api/todos/${item.id}`).send({ title: 'First' });
        expect(first.status).toBe(200);
        expect(first.body.data).toMatchObject({ completed: true, description: 'Details', ordinal: 0, createdAt: item.createdAt.toISOString() });
        const second = await request(app).patch(`/api/todos/${item.id}`).send({ title: 'Last', description: null, dueAt: null });
        expect(second.body.data).toMatchObject({ title: 'Last', description: null, dueAt: null, completed: true });
        for (const body of [{}, { completed: false }, { deleted: false }, { title: '' }, { dueAt: 'invalid' }])
            expect((await request(app).patch(`/api/todos/${item.id}`).send(body)).status).toBe(400);
        await ctx.db.todo.update({ where: { id: item.id }, data: { deleted: true } });
        expect((await request(app).patch(`/api/todos/${item.id}`).send({ title: 'stale' })).status).toBe(404);
    }
    finally {
        await ctx.close();
    }
});
it('allows unchanged overdue instants or clearing, rejects changed past due dates without partial writes',async()=>{
 const ctx=await testDatabase();try{
 const now=Date.parse('2026-11-08T10:15:30Z');const item=await ctx.db.todo.create({data:{title:'Legacy',dueAt:new Date(now-1000),ordinal:0}});
 const app=createApp({service:createTodoService(createTodoRepository(ctx.db),()=>now)});
 expect((await request(app).patch('/api/todos/'+item.id).send({title:'Keep',dueAt:item.dueAt!.toISOString()})).status).toBe(200);
 const bad=await request(app).patch('/api/todos/'+item.id).send({title:'Must not save',dueAt:new Date(now-2000).toISOString()});expect(bad.status).toBe(400);expect(bad.body.error.fields.dueAt).toBeTruthy();expect((await ctx.db.todo.findUnique({where:{id:item.id}}))?.title).toBe('Keep');
 expect((await request(app).patch('/api/todos/'+item.id).send({dueAt:null})).body.data.dueAt).toBeNull();
 await ctx.db.todo.update({where:{id:item.id},data:{deleted:true}});
 for(const id of [item.id,'00000000-0000-4000-8000-000000000000'])expect((await request(app).patch('/api/todos/'+id).send({dueAt:new Date(now-2000).toISOString()})).status).toBe(404);
 }finally{await ctx.close();}
});
