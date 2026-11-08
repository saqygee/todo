import { resolve } from 'node:path';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../../generated/prisma/client.js';
export function createPrisma(url: string) {
    if (!url.startsWith('file:'))
        throw new Error('SQLite file URL required');
    // Do not block Node's event loop on SQLite locks; repositories retry asynchronously.
 return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: 'file:' + resolve(url.slice(5)), timeout: 0 }, { timestampFormat: 'iso8601' }) });
}
export type Database = ReturnType<typeof createPrisma>;
