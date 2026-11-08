import type { RequestHandler } from 'express';
import { AppError } from '../utils/errors.js';
export const notFoundHandler: RequestHandler = (_req, _res, next) => next(new AppError(404, 'ROUTE_NOT_FOUND', 'This endpoint does not exist.'));
