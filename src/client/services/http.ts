import axios from 'axios';
import { z } from 'zod';
import type { Fields } from '../../shared/types/todo.js';
export const http = axios.create({ baseURL: '/api', timeout: 10000 });
const errorSchema = z.object({ error: z.object({ message: z.string(), fields: z.record(z.string(), z.array(z.string())).optional() }) });
export class RequestError extends Error {
    constructor(message: string, public fields?: Fields, public uncertain = false) { super(message); }
}
export function requestError(error: unknown) {
    if (error instanceof RequestError)
        return error;
    if (axios.isAxiosError(error)) {
        const parsed = errorSchema.safeParse(error.response?.data);
        if (parsed.success)
            return new RequestError(parsed.data.error.message, parsed.data.error.fields);
        return new RequestError('Unable to save or load tasks. Refresh the list before retrying a change.', undefined, !error.response);
    }
    return new RequestError('Something went wrong. Please try again.');
}
