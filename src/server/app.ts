import express from 'express';
import { resolve } from 'node:path';
import type { TodoService } from './services/todo.service.js';
import { todoRoutes } from './routes/todo.routes.js';
import type { ErrorRequestHandler } from 'express';
import { requireJson } from './middleware/validate.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';
export function createApp(options: {
    service?: TodoService;
    clientDir?: string;
} = {}) {
    const app = express();
    app.disable('x-powered-by');
    app.use('/api', requireJson, express.json({ limit: '32kb' }));
    if (options.service)
        app.use('/api/todos', todoRoutes(options.service));
    app.use('/api', notFoundHandler);
    if (options.clientDir) {
        const folder = resolve(options.clientDir);
        app.use(express.static(folder));
        app.get('/{*path}', (_req, res, next) => { res.sendFile(resolve(folder, 'index.html'), error => { if (error)
            next(error); }); });
    }
    app.use(notFoundHandler);
    const errors: ErrorRequestHandler = (error, _req, res, _next) => errorHandler(error, res);
    app.use(errors);
    return app;
}
