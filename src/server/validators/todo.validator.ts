import { z } from 'zod';
import { createTodoSchema, updateTodoSchema, completionSchema, listQuerySchema, idSchema } from '../../shared/schemas/todo.schema.js';
export const todoParamsSchema = z.object({ id: idSchema });

/** HTTP input validation; shared schemas remain the source of field rules. */
export const todoValidator = {
    id: (params: unknown) => todoParamsSchema.parse(params).id,
    list: (query: unknown) => listQuerySchema.parse(query),
    create: (body: unknown) => createTodoSchema.parse(body),
    update: (body: unknown) => updateTodoSchema.parse(body),
    completion: (body: unknown) => completionSchema.parse(body),
};
