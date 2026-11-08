import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../utils/errors.js';
export function validate(schema: ZodType, source: 'body' | 'query' | 'params' = 'body'): RequestHandler {
    return (req, res, next) => { try {
        res.locals[source] = schema.parse(req[source]);
        next();
    }
    catch (e) {
        next(e);
    } };
}
export const requireJson: RequestHandler = (req, _res, next) => {
    if (['POST', 'PATCH'].includes(req.method) && !req.is('application/json'))
        return next(new AppError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Use application/json.'));
    next();
};
