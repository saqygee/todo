import { z } from 'zod';
const schema = z.object({ DATABASE_URL: z.string().startsWith('file:').default('file:./prisma/dev.db'), PORT: z.coerce.number().int().min(1).max(65535).default(3000) });
export function readConfig(env: Record<string, string | undefined>) {
    const v = schema.parse(env);
    return { databaseUrl: v.DATABASE_URL, port: v.PORT };
}
