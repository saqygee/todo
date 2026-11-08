import { resolve, dirname } from 'node:path';
import { mkdirSync, openSync, closeSync } from 'node:fs';
import { defineConfig } from 'prisma/config';
const url=process.env.DATABASE_URL??'file:./prisma/dev.db';
if(!url.startsWith('file:')) throw new Error('DATABASE_URL must be a SQLite file URL.');
const path=resolve(url.slice(5));
// The schema engine on this supported toolchain needs an existing empty SQLite file.
// Opening in append mode creates missing files without modifying existing database bytes.
mkdirSync(dirname(path),{recursive:true});
closeSync(openSync(path,'a'));
export default defineConfig({schema:'prisma/schema.prisma',migrations:{path:'prisma/migrations'},datasource:{url:'file:'+path}});
