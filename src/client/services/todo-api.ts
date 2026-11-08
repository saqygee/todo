import { http } from './http.js';
import { listResponseSchema, todoResponseSchema } from '../../shared/schemas/todo.schema.js';
import type { CreateTodo, UpdateTodo } from '../../shared/types/todo.js';
export const todoApi = {
    async list(includeCompleted: boolean, signal?: AbortSignal) { const response = await http.get('/todos', { params: { includeCompleted }, signal }); return listResponseSchema.parse(response.data).data; },
    async get(id: string) { return todoResponseSchema.parse((await http.get('/todos/' + id)).data).data; },
    async create(input: CreateTodo) { return todoResponseSchema.parse((await http.post('/todos', input)).data).data; },
    async update(id: string, input: UpdateTodo) { return todoResponseSchema.parse((await http.patch('/todos/' + id, input)).data).data; },
    async complete(id: string, completed: boolean) { return todoResponseSchema.parse((await http.patch(`/todos/${id}/completion`, { completed })).data).data; },
    async remove(id: string) { await http.delete('/todos/' + id); }
};
