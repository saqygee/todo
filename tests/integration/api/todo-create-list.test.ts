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
it('returns descending ordinals through both list contracts',async()=>{
 const ctx=await testDatabase();try{
 await ctx.db.todo.createMany({data:[{title:'Old',ordinal:0},{title:'Completed',ordinal:2,completed:true},{title:'Recent',ordinal:5},{title:'Deleted',ordinal:6,deleted:true}]});
 const app=createApp({service:createTodoService(createTodoRepository(ctx.db))});
 expect((await request(app).get('/api/todos')).body.data.map((t:{ordinal:number})=>t.ordinal)).toEqual([5,0]);
 expect((await request(app).get('/api/todos?includeCompleted=true')).body.data.map((t:{ordinal:number})=>t.ordinal)).toEqual([5,2,0]);
 }finally{await ctx.close();}
});
it('rejects direct past due creates at the write boundary while keeping optional dates valid',async()=>{
 const ctx=await testDatabase();try{
 const now=Date.parse('2026-11-08T10:15:30Z');const app=createApp({service:createTodoService(createTodoRepository(ctx.db),()=>now)});
 for(const dueAt of ['2026-11-08T10:15:00Z','2026-11-08T10:15:30Z']){const result=await request(app).post('/api/todos').send({title:'Past',dueAt});expect(result.status).toBe(400);expect(result.body.error.fields.dueAt).toBeDefined();}
 expect(await ctx.db.todo.count()).toBe(0);
 expect((await request(app).post('/api/todos').send({title:'Future',dueAt:'2026-11-08T11:16:00+01:00'})).status).toBe(201);
 }finally{await ctx.close();}
});
