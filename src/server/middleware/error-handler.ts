import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';
interface ResponseLike {
    status(code: number): {
        json(body: unknown): unknown;
    };
    setHeader(name: string, value: string): unknown;
}
export function errorHandler(error: unknown, response: ResponseLike) {
    let problem: AppError;
    if (error instanceof AppError)
        problem = error;
    else if (error instanceof ZodError) {
        const fields: Record<string, string[]> = {};
        for (const issue of error.issues) {
            const key = issue.path[0];
            if (typeof key === 'string')
                (fields[key] ??= []).push(issue.message);
        }
        problem = new AppError(400, 'VALIDATION_ERROR', 'Please correct the highlighted fields.', fields);
    }
    else {
        const kind = typeof error === 'object' && error !== null && 'type' in error ? error.type : undefined;
        if (kind === 'entity.parse.failed')
            problem = new AppError(400, 'VALIDATION_ERROR', 'Request must contain valid JSON.');
        else if (kind === 'entity.too.large')
            problem = new AppError(413, 'PAYLOAD_TOO_LARGE', 'Request is too large.');
        else {
            console.error('Unexpected request failure', error instanceof Error ? error.name : 'Unknown error');
            problem = new AppError(500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.');
        }
    }
    if (problem.status === 503)
        response.setHeader('Retry-After', '1');
    response.status(problem.status).json({ error: { code: problem.code, message: problem.message, ...(problem.fields && { fields: problem.fields }) } });
}
