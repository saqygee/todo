import type { Fields } from '../../shared/types/todo.js';
export class AppError extends Error {
    constructor(public readonly status: number, public readonly code: string, message: string, public readonly fields?: Fields) { super(message); }
}
export const notFound = () => new AppError(404, 'TODO_NOT_FOUND', 'This task is no longer available.');
