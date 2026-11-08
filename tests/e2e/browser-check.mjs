import process from 'node:process';
import {Buffer} from 'node:buffer';
import {performance} from 'node:perf_hooks';
import console from 'node:console';
// Real Chrome acceptance probe using built-in CDP; no extra browser framework.
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {once} from 'node:events';
import {setTimeout as delay} from 'node:timers/promises';
const dir=await mkdtemp(join(tmpdir(),'todo-browser-'));
const raw=new DatabaseSync(join(dir,'test.db'));raw.exec(await readFile('prisma/migrations/20261108000000_init/migration.sql','utf8'));raw.close();
const port=43127;const base=`http://127.0.0.1:${port}`;
const server=spawn(process.execPath,['dist/server/index.js'],{env:{...process.env,DATABASE_URL:'file:'+join(dir,'test.db'),PORT:String(port)},stdio:['ignore','pipe','pipe']});
const chrome=spawn('/usr/bin/google-chrome',['--headless=new','--no-sandbox','--disable-dev-shm-usage','--remote-debugging-port=0','--user-data-dir='+join(dir,'chrome'),'about:blank'],{stdio:['ignore','ignore','pipe']});
let ws;
try{
 let endpoint='';chrome.stderr.on('data',chunk=>{endpoint+=String(chunk);});
 for(let i=0;i<100&&!endpoint.includes('DevTools listening on');i++)await delay(100);
 const url=endpoint.match(/DevTools listening on (ws:\/\/[^\s]+)/)?.[1];if(!url)throw Error('Chrome did not expose CDP: '+endpoint.slice(-500));
 ws=new globalThis.WebSocket(url);await once(ws,'open');let id=0;const pending=new Map();
 ws.addEventListener('message',event=>{const msg=JSON.parse(String(event.data));if(msg.id){const entry=pending.get(msg.id);pending.delete(msg.id);if(msg.error)entry?.reject(Error(JSON.stringify(msg.error)));else entry?.resolve(msg.result);}});
 function send(method,params={},sessionId){return new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params,...(sessionId&&{sessionId})}));});}
 const {targetId}=await send('Target.createTarget',{url:'about:blank'});const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
 const call=(method,params={})=>send(method,params,sessionId);
 const evaluate=async expression=>{const result=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));return result.result?.value;};
 const check=async(expression,label)=>{for(let i=0;i<100;i++){if(await evaluate(expression))return;await delay(30);}throw Error('Failed: '+label);};
 const click=async text=>{await evaluate(`Array.from(document.querySelectorAll('button')).find(b=>b.textContent===${JSON.stringify(text)})?.click()`);};
 const input=async(id,value)=>{await evaluate(`(()=>{const el=document.getElementById(${JSON.stringify(id)});Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));})()`);};
 for(let i=0;i<100;i++){try{if((await globalThis.fetch(base+'/api/todos')).ok)break;}catch{/* Wait until the local server is listening. */}await delay(50);}
 await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await call('Page.navigate',{url:base});
 await check(`document.body.innerText.includes('Your list is clear.')`,'empty list');
 const screenshot=await call('Page.captureScreenshot',{format:'png'});await writeFile('/tmp/todo-empty.png',Buffer.from(screenshot.data,'base64'));
 const buttons=await evaluate(`Array.from(document.querySelectorAll('aside button')).map(b=>b.textContent)`);if(JSON.stringify(buttons)!==JSON.stringify(['create new task','Display completed']))throw Error('Button order');
 const right=await evaluate(`document.querySelector('aside').getBoundingClientRect().left>=document.querySelector('.list-panel').getBoundingClientRect().right`);if(!right)throw Error('Buttons not right aligned');
 await click('create new task');await check(`document.activeElement?.id==='title'`,'form focus');if(await evaluate(`!!document.querySelector('.list-panel')`))throw Error('List remained visible');
 await click('Save task');await check(`!!document.getElementById('title-error')`,'inline validation');
 await click('Cancel');await check(`document.activeElement?.textContent==='create new task'`,'return focus');
 const create=async title=>{await click('create new task');await input('title',title);await click('Save task');await check(`!!document.querySelector('.list-panel')&&!document.body.innerText.includes('Loading your tasks')`,'created list');};
 await create('Prepare the assessment demo');
 await check(`document.body.innerText.includes('Prepare the assessment demo')`,'created title');
 await evaluate(`document.querySelector('input[type=checkbox]').click()`);await check(`document.body.innerText.includes('Your list is clear.')`,'completed hidden');
 await click('Display completed');await check(`!!document.querySelector('input[type=checkbox]:checked')`,'completed shown with incomplete');
 await evaluate(`document.querySelector('input[type=checkbox]').click()`);await check(`!!document.querySelector('input[type=checkbox]:not(:checked)')`,'reopened');
 await evaluate(`document.querySelector('button[aria-label^="Edit:"]').click()`);await check(`document.getElementById('title')?.value==='Prepare the assessment demo'`,'edit prefill');await input('title','Demo ready');await click('Save task');await check(`document.body.innerText.includes('Demo ready')`,'edit saved');
 await evaluate(`document.querySelector('button[aria-label^="Delete:"]').click()`);await check(`document.body.innerText.includes('Your list is clear.')`,'delete');
 const contrast=await evaluate(`(()=>{const rgb=c=>c.match(/[\\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});const lum=c=>{const a=rgb(c);return a[0]*.2126+a[1]*.7152+a[2]*.0722};const b=getComputedStyle(document.querySelector('.primary'));return (lum(b.color)+.05)/(lum(b.backgroundColor)+.05);})()`);
 await call('Accessibility.enable');const ax=await call('Accessibility.getFullAXTree');const names=ax.nodes.filter(n=>!n.ignored).map(n=>n.name?.value).filter(Boolean);if(!names.includes('create new task')||!names.includes('Display completed'))throw Error('Missing accessible names');
 // Keyboard Space activates the focused visibility button.
 await evaluate(`document.querySelector('aside button[aria-pressed]').focus()`);const pressed=await evaluate(`document.activeElement.getAttribute('aria-pressed')`);
 await call('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32});await call('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32});await check(`document.querySelector('button[aria-pressed]').getAttribute('aria-pressed')!==${JSON.stringify(pressed)}`,'keyboard activation');
 // Populate the acceptance dataset through the public API.
 for(let i=0;i<100;i++){const response=await globalThis.fetch(base+'/api/todos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:i===0?'Plan the week ahead':i===1?'Take a quiet moment':`Everyday task ${i+1}`})});if(response.status!==201)throw Error('Seed failed');const body=await response.json();if(i%3===0)await globalThis.fetch(`${base}/api/todos/${body.data.id}/completion`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:'{"completed":true}'});}
 const all=await (await globalThis.fetch(base+'/api/todos?includeCompleted=true')).json();
 if(all.data.length!==100||all.data.some((item,index)=>item.deleted||(index>0&&item.ordinal<=all.data[index-1].ordinal)))throw Error('Inclusive membership/order');
 await call('Page.reload');await check(`document.querySelectorAll('.task').length===66`,'100 task default filter');
 const results={list:[],filter:[],write:[]};
 for(let i=0;i<20;i++){
  let start=performance.now();await call('Page.reload');await check(`document.querySelectorAll('.task').length>=66`,'reload result');results.list.push(performance.now()-start);
  start=performance.now();await click('Display completed');await check(`document.querySelector('button[aria-pressed=true]')&&document.querySelectorAll('.task').length>=100`,'inclusive filter result');results.filter.push(performance.now()-start);
  start=performance.now();await create('Timed task '+i);await check(`document.body.innerText.includes(${JSON.stringify('Timed task '+i)})`,'timed create result');results.write.push(performance.now()-start);
 }
 await call('Page.navigate',{url:base});await check(`document.querySelectorAll('.task').length>=66`,'final list');const image=await call('Page.captureScreenshot',{format:'png'});await writeFile('/tmp/todo-list.png',Buffer.from(image.data,'base64'));
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});const overflow=await evaluate('document.documentElement.scrollWidth>window.innerWidth');if(overflow)throw Error('Mobile horizontal overflow');
 const summary={browser:'Google Chrome headless (native CDP)',primaryButtonContrast:contrast,accessibleButtonNames:true,keyboardSpaceToggle:true,flow:'create/cancel/validate/complete/reopen/edit/delete passed',timing:Object.fromEntries(Object.entries(results).map(([k,v])=>[k,{trials:v.length,under2seconds:v.filter(ms=>ms<2000).length,maxMs:Math.round(Math.max(...v)),medianMs:Math.round([...v].sort((a,b)=>a-b)[10])}])),mobileOverflow:overflow,screenshots:['/tmp/todo-empty.png','/tmp/todo-list.png']};
 await writeFile('tests/e2e/browser-results.json',JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary,null,2));
}finally{ws?.close();chrome.kill('SIGTERM');server.kill('SIGTERM');await delay(300);await rm(dir,{recursive:true,force:true});}
