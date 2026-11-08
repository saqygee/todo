import {it,expect} from 'vitest';
import {testDatabase} from '../database.js';
import {createTodoRepository} from '../../../src/server/repositories/todo.repository.js';
import {createTodoService} from '../../../src/server/services/todo.service.js';
it('checks the current transactional row and rolls back both content and date on rejection',async()=>{
 const ctx=await testDatabase();try{
 const now=Date.parse('2026-11-08T10:15:30Z');const old=new Date(now-1000);const item=await ctx.db.todo.create({data:{title:'Old',dueAt:old,ordinal:0}});
 const repo=createTodoRepository(ctx.db);const service=createTodoService(repo,()=>now);
 await service.update(item.id,{dueAt:new Date(now+60000).toISOString()});
 await expect(service.update(item.id,{title:'Stale',dueAt:old.toISOString()})).rejects.toThrow();
 expect((await repo.find(item.id))?.title).toBe('Old');
 await ctx.db.todo.update({where:{id:item.id},data:{dueAt:old}});expect(await service.complete(item.id,true)).toMatchObject({completed:true});await expect(service.remove(item.id)).resolves.toBeUndefined();
 }finally{await ctx.close();}
});
import {dueDateChangeSchema} from '../../../src/shared/schemas/due-date.schema.js';
it('re-reads current context and revalidates the clock after a rolled-back write attempt',async()=>{
 const ctx=await testDatabase();try{
 const start=Date.parse('2026-11-08T10:15:30Z');let clock=start,calls=0;
 const item=await ctx.db.todo.create({data:{title:'Retain',ordinal:0,dueAt:new Date(start-5000)}});
 const repo=createTodoRepository(ctx.db);const dueAt=new Date(start+500).toISOString();
 await expect(repo.update(item.id,{title:'Must roll back',dueAt},current=>{
   calls++;expect(current.title).toBe('Retain');
   dueDateChangeSchema(current.dueAt,clock).parse({dueAt});
   if(calls===1){clock+=1000;throw {code:'P2034'};}
 })).rejects.toThrow();
 expect(calls).toBe(2);expect(await repo.find(item.id)).toMatchObject({title:'Retain',dueAt:item.dueAt});
 let creates=0;clock=start;
 await expect(repo.create({title:'Expired',description:null,dueAt},()=>{
   creates++;dueDateChangeSchema(undefined,clock).parse({dueAt});
   if(creates===1){clock+=1000;throw {code:'SQLITE_BUSY'};}
 })).rejects.toThrow();
 expect(creates).toBe(2);expect(await ctx.db.todo.count()).toBe(1);
 }finally{await ctx.close();}
});
