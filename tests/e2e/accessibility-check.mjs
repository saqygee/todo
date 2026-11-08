import process from 'node:process';
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
const port=43128;const base=`http://127.0.0.1:${port}`;
const server=spawn(process.execPath,['dist/server/index.js'],{env:{...process.env,DATABASE_URL:'file:'+join(dir,'test.db'),PORT:String(port)},stdio:['ignore','pipe','pipe']});
const chrome=spawn('/usr/bin/google-chrome',['--no-first-run','--no-default-browser-check','--password-store=basic','--disable-sync','--force-renderer-accessibility','--no-sandbox','--disable-dev-shm-usage','--remote-debugging-port=0','--user-data-dir='+join(dir,'chrome'),'about:blank'],{stdio:['ignore','ignore','pipe']});
const orca=spawn('/usr/bin/orca',['--user-prefs='+join(dir,'orca'),'--enable=speech','--debug-file='+join(dir,'orca.log')],{stdio:['ignore','pipe','pipe']});
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
 const check=async(expression,label)=>{for(let i=0;i<100;i++){if(await evaluate(expression))return;await delay(30);}throw Error('Failed: '+label+'; active='+JSON.stringify(await evaluate(`({tag:document.activeElement?.tagName,text:document.activeElement?.textContent?.slice(0,80),id:document.activeElement?.id})`)));};
 for(let i=0;i<100;i++){try{if((await globalThis.fetch(base+'/api/todos')).ok)break;}catch{/* Wait until the local server is listening. */}await delay(50);}
 await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await call('Page.navigate',{url:base});
 await check(`document.body.innerText.includes('Your list is clear.')`,'empty list');
 await call('Page.bringToFront');await delay(1500);
 const steps=[];
 const press=async(key,shift=false)=>{const map={Tab:9,Enter:13,' ':32};await call('Input.dispatchKeyEvent',{type:'keyDown',key,code:key===' '?'Space':key,windowsVirtualKeyCode:map[key],modifiers:shift?8:0,...(key==='Enter'?{text:'\r',unmodifiedText:'\r'}:key===' '?{text:' ',unmodifiedText:' '}:{})});await call('Input.dispatchKeyEvent',{type:'keyUp',key,code:key===' '?'Space':key,windowsVirtualKeyCode:map[key],modifiers:shift?8:0});await delay(150);};
 const focus=async expression=>check(expression,'keyboard focus');
 // Establish a deterministic starting point, then navigate all primary flows by keyboard.
 await evaluate(`document.querySelector('.brand').focus()`);await press('Tab');await focus(`document.activeElement?.textContent==='create new task'`);
 await press('Enter');await focus(`document.activeElement?.id==='title'`);steps.push('Keyboard create form entry focuses title');
 await delay(1000);await press('Enter');await check(`!!document.getElementById('title-error')`,'required error');await delay(1500);await press('Tab');await press('Tab',true);await delay(1000);
 await call('Accessibility.enable');const invalid=await call('Accessibility.getFullAXTree');
 const titleNode=invalid.nodes.find(n=>!n.ignored&&n.role?.value==='textbox'&&n.name?.value==='Title');
 if(!titleNode?.properties?.some(p=>p.name==='invalid'&&p.value?.value==='true'))throw Error('Title invalid state absent from accessibility tree');
 if(!JSON.stringify(invalid).includes('Enter a title.'))throw Error('Error not in accessibility tree');steps.push('Required title error and invalid state exposed');
 const contrastIssues=[];
 const auditContrast=async()=>{const issues=await evaluate(`(()=>{const values=c=>c.match(/[\\d.]+/g).map(Number);const lum=c=>{const a=values(c).slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return a[0]*.2126+a[1]*.7152+a[2]*.0722};const background=e=>{while(e){const c=getComputedStyle(e).backgroundColor;const a=values(c);if(a.length<4||a[3]===1)return c;e=e.parentElement;}return 'rgb(255,255,255)';};const result=[];const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(walker.nextNode()){const n=walker.currentNode,e=n.parentElement;if(!n.textContent.trim()||e.closest('script,style,[disabled]')||!e.getBoundingClientRect().width)continue;const s=getComputedStyle(e);if(s.visibility==='hidden'||s.display==='none')continue;const x=lum(s.color),y=lum(background(e));const ratio=(Math.max(x,y)+.05)/(Math.min(x,y)+.05);const size=parseFloat(s.fontSize);const large=size>=24||(size>=18.66&&Number(s.fontWeight)>=700);if(ratio<(large?3:4.5))result.push({text:n.textContent.trim().slice(0,70),ratio:Math.round(ratio*100)/100,required:large?3:4.5});}return result;})()`);contrastIssues.push(...issues);};
 await auditContrast();
 await call('Input.insertText',{text:'Screen reader task'});await press('Enter');await check(`document.body.innerText.includes('Screen reader task')&&!!document.querySelector('.list-panel')`,'keyboard create save');await delay(600);steps.push('Title-only keyboard save returns to list');await auditContrast();
 await press('Enter');await focus(`document.activeElement?.id==='title'`);for(let i=0;i<16&&!await evaluate(`document.activeElement?.textContent==='Cancel'`);i++)await press('Tab');await focus(`document.activeElement?.textContent==='Cancel'`);await press('Enter');await focus(`document.activeElement?.textContent==='create new task'`);steps.push('Keyboard cancel returns focus without saving');
 for(let i=0;i<3;i++)await press('Tab',true);await focus(`document.activeElement?.type==='checkbox'`);await press(' ');await check(`document.body.innerText.includes('Your list is clear.')`,'keyboard completion');steps.push('Keyboard completion hides item and focuses list heading');
 await press('Tab');await press('Tab');await focus(`document.activeElement?.textContent==='Display completed'`);await press(' ');await check(`!!document.querySelector('input[type=checkbox]:checked')`,'keyboard inclusive filter');await delay(600);
 for(let i=0;i<4;i++)await press('Tab',true);await focus(`document.activeElement?.type==='checkbox'`);await press(' ');await check(`!!document.querySelector('input[type=checkbox]:not(:checked)')`,'keyboard reopening');steps.push('Keyboard display completed and reopening preserve list');
 // Completion moves focus to the heading; tab reaches the item checkbox and then Edit.
 await press('Tab');await press('Tab');await focus(`document.activeElement?.textContent==='Edit'`);await press('Enter');await focus(`document.activeElement?.id==='title'`);
 await call('Input.dispatchKeyEvent',{type:'keyDown',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:2});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:2});await call('Input.insertText',{text:'Screen reader edited'});await press('Enter');await check(`document.body.innerText.includes('Screen reader edited')&&!!document.querySelector('.list-panel')`,'keyboard edit');steps.push('Keyboard editing and save work');
 await press('Tab',true);await focus(`document.activeElement?.textContent==='Delete'`);await press('Enter');await check(`document.body.innerText.includes('Your list is clear.')`,'keyboard delete');await delay(1000);steps.push('Keyboard deletion returns to empty list');
 await call('Emulation.setDeviceMetricsOverride',{width:320,height:900,deviceScaleFactor:1,mobile:false});if(await evaluate('document.documentElement.scrollWidth>window.innerWidth'))throw Error('320px reflow overflow');steps.push('320 CSS pixel reflow has no horizontal overflow');
 await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await evaluate(`document.documentElement.style.zoom='2'`);if(await evaluate('document.documentElement.scrollWidth>window.innerWidth'))throw Error('200% zoom overflow');steps.push('200% zoom has no horizontal overflow');
 const speech=await readFile(join(dir,'orca.log'),'utf8');const utterances=speech.split('\n').filter(l=>l.includes('SPEECH OUTPUT:')).map(l=>l.slice(l.indexOf('SPEECH OUTPUT:')));
 await writeFile('/tmp/todo-orca-speech.txt',utterances.join('\n')+'\n');
 const summary={screenReader:'Orca (isolated D-Bus session)',steps,contrastIssues,utteranceCount:utterances.length,speechSamples:utterances.filter(l=>/Title|Enter a title|Screen reader|Task|completed|Cancel|Save task/.test(l)).slice(-80),speechBackend:'Orca generated speech transcript reviewed; no claim of listening to audio',fullSpeechLog:'/tmp/todo-orca-speech.txt'};
 await writeFile('tests/e2e/accessibility-results.json',JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary,null,2));
 if(contrastIssues.length)throw Error('Text contrast issues found');
 if(!utterances.some(line=>line.includes('Enter a title.')))throw Error('Orca did not announce the validation message');
 if(!utterances.some(line=>line.includes('Task deleted.')))throw Error('Orca did not announce deletion');
}finally{try{const log=await readFile(join(dir,'orca.log'),'utf8');await writeFile('/tmp/todo-orca-speech.txt',log.split('\n').filter(l=>l.includes('SPEECH OUTPUT:')).join('\n'));}catch{/* Keep the original test failure. */}ws?.close();orca.kill('SIGTERM');chrome.kill('SIGTERM');server.kill('SIGTERM');await delay(300);await rm(dir,{recursive:true,force:true});}
