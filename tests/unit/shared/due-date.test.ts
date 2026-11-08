import {it,expect} from 'vitest';
import {dueDateChangeSchema} from '../../../src/shared/schemas/due-date.schema.js';
import {todoSchema} from '../../../src/shared/schemas/todo.schema.js';
const now=Date.parse('2026-11-08T10:15:30Z');
it('allows absent dates and strictly future instants, rejecting equal or elapsed writes',()=>{
 const schema=dueDateChangeSchema(undefined,now);expect(schema.safeParse({}).success).toBe(true);expect(schema.safeParse({dueAt:null}).success).toBe(true);
 expect(schema.safeParse({dueAt:'2026-11-08T11:16:00+01:00'}).success).toBe(true);
 for(const dueAt of ['2026-11-08T10:15:30Z','2026-11-08T10:15:00Z','2026-11-07T00:00:00Z'])expect(schema.safeParse({dueAt}).success).toBe(false);
});
it('preserves exact stored instants and historical reads without exempting a different past value',()=>{
 const past=new Date('2026-11-01T12:00:00.123Z');const schema=dueDateChangeSchema(past,now);
 expect(schema.safeParse({dueAt:'2026-11-01T13:00:00.123+01:00'}).success).toBe(true);
 expect(schema.safeParse({dueAt:'2026-11-01T12:00:00.000Z'}).success).toBe(false);
 expect(todoSchema.safeParse({id:'f5f24d2f-7a55-4aeb-b101-5b28d2040b82',title:'Old',description:null,dueAt:past.toISOString(),ordinal:0,completed:false,deleted:false,createdAt:past.toISOString(),updatedAt:past.toISOString()}).success).toBe(true);
});
