import { resolve, dirname } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';
import { createApp } from './app.js';
import { readConfig } from './config/env.js';
import { createPrisma } from './config/prisma.js';
import { createTodoRepository } from './repositories/todo.repository.js';
import { createTodoService } from './services/todo.service.js';
const config = readConfig(process.env);
mkdirSync(dirname(resolve(config.databaseUrl.slice(5))), { recursive: true });
const db = createPrisma(config.databaseUrl);
const clientDir = resolve('dist/client');
const app = createApp({ service: createTodoService(createTodoRepository(db)), ...(existsSync(clientDir) && { clientDir }) });
const server = app.listen(config.port, '127.0.0.1', () => { console.log(`Everyday is ready at http://127.0.0.1:${config.port}`); });
let closing = false;
function shutdown() { if (closing)
    return; closing = true; const deadline = setTimeout(() => { server.closeAllConnections(); void db.$disconnect().finally(() => process.exit(1)); }, 10000); deadline.unref(); server.close(() => { void db.$disconnect().then(() => { clearTimeout(deadline); process.exitCode = 0; }); }); }
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
