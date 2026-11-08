import process from 'node:process';
import {spawn,spawnSync} from 'node:child_process';
const compile=spawnSync(process.execPath,['node_modules/typescript/bin/tsc','-p','tsconfig.server.json'],{stdio:'inherit'});
if(compile.status)process.exit(compile.status);
const compiler=spawn(process.execPath,['node_modules/typescript/bin/tsc','-p','tsconfig.server.json','--watch','--preserveWatchOutput'],{stdio:'inherit'});
const server=spawn(process.execPath,['--env-file-if-exists=.env','--watch','dist/server/index.js'],{stdio:'inherit'});
function close(){compiler.kill('SIGTERM');server.kill('SIGTERM');}
process.on('SIGINT',close);process.on('SIGTERM',close);
