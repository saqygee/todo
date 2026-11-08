import { describe, it, expect } from 'vitest';
import { createTodoSchema, updateTodoSchema, completionSchema, listQuerySchema, idSchema } from '../../../src/shared/schemas/todo.schema.js';
describe('strict task validation', () => {
    it('requires only a trimmed title and normalises optional fields', () => {
        expect(createTodoSchema.parse({ title: '  Task  ' })).toEqual({ title: 'Task', description: null, dueAt: null });
        expect(createTodoSchema.parse({ title: 'Task', description: '   ', dueAt: null }).description).toBeNull();
    });
    it('enforces boundaries and disallows system fields', () => {
        for (const title of ['', '   ', 'a'.repeat(121)])
            expect(createTodoSchema.safeParse({ title }).success).toBe(false);
        expect(createTodoSchema.safeParse({ title: 'a'.repeat(120), description: 'b'.repeat(500) }).success).toBe(true);
        expect(createTodoSchema.safeParse({ title: 'Task', description: 'a'.repeat(501) }).success).toBe(false);
        for (const key of ['id', 'ordinal', 'deleted', 'completed', 'createdAt', 'updatedAt'])
            expect(createTodoSchema.safeParse({ title: 'Task', [key]: 1 }).success).toBe(false);
    });
    it('validates explicit timezone/calendar dates and converts to UTC', () => {
        expect(createTodoSchema.parse({ title: 'Task', dueAt: '2026-11-09T10:00:00+01:00' }).dueAt).toBe('2026-11-09T09:00:00.000Z');
        for (const dueAt of ['2026-11-09T10:00:00', '2026-02-30T10:00:00Z', 'invalid', ''])
            expect(createTodoSchema.safeParse({ title: 'Task', dueAt }).success).toBe(false);
    });
    it('preserves PATCH omission and supports explicit clearing', () => {
        expect(updateTodoSchema.parse({ title: 'Task' })).toEqual({ title: 'Task' });
        expect(updateTodoSchema.parse({ description: null, dueAt: null })).toEqual({ description: null, dueAt: null });
        expect(updateTodoSchema.safeParse({}).success).toBe(false);
    });
    it('requires real Booleans, UUIDs and literal query values', () => {
        expect(completionSchema.parse({ completed: false })).toEqual({ completed: false });
        for (const input of [{ completed: 'false' }, {}, { completed: true, deleted: false }])
            expect(completionSchema.safeParse(input).success).toBe(false);
        expect(idSchema.safeParse('invalid').success).toBe(false);
        expect(listQuerySchema.parse({})).toEqual({ includeCompleted: false });
        expect(listQuerySchema.parse({ includeCompleted: 'true' })).toEqual({ includeCompleted: true });
        for (const input of [{ includeCompleted: 'yes' }, { includeCompleted: ['true', 'false'] }, { unknown: 'true' }])
            expect(listQuerySchema.safeParse(input).success).toBe(false);
    });
});
