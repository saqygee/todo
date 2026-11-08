import type { TodoRepository } from '../repositories/todo.repository.js';
import type { CreateTodo, UpdateTodo } from '../../shared/types/todo.js';
import { notFound } from '../utils/errors.js';
export function createTodoService(repository: TodoRepository) {
    return {
        list: (includeCompleted: boolean) => repository.list(includeCompleted),
        async get(id: string) { const record = await repository.find(id); if (!record)
            throw notFound(); return record; },
        create: (input: CreateTodo) => repository.create(input),
        async update(id: string, input: UpdateTodo) { const record = await repository.update(id, input); if (!record)
            throw notFound(); return record; },
        async remove(id: string) { if (!await repository.remove(id))
            throw notFound(); },
        async complete(id: string, completed: boolean) { const record = await repository.complete(id, completed); if (!record)
            throw notFound(); return record; }
    };
}
export type TodoService = ReturnType<typeof createTodoService>;
