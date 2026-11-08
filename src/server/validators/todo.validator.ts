import { z } from 'zod';
export { createTodoSchema, updateTodoSchema, completionSchema, listQuerySchema } from '../../shared/schemas/todo.schema.js';
import { idSchema } from '../../shared/schemas/todo.schema.js';
export const todoParamsSchema = z.object({ id: idSchema });
