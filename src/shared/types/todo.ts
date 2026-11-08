import type { z } from 'zod';
import type { createTodoSchema, updateTodoSchema, todoSchema } from '../schemas/todo.schema.js';
export type Todo = z.output<typeof todoSchema>;
export type CreateTodo = z.output<typeof createTodoSchema>;
export type UpdateTodo = z.output<typeof updateTodoSchema>;
export type Fields = Record<string, string[]>;
