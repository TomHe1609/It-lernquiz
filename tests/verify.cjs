// Run with Node and Playwright installed; TEST_BASE_REF selects the original release.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {execFileSync} = require('node:child_process');
const {chromium} = require('playwright');
const root = path.resolve(__dirname,'..');
const originalRef = process.env.TEST_BASE_REF || 'db53955';
const old = name => execFileSync('git',['show',`${originalRef}:${name}`],{cwd:root,encoding:'utf8',maxBuffer:4e6});
const read = name => fs.readFileSync(path.join(root,name),'utf8');
const parse = html => JSON.parse(html.match(/<script id="quizdata" type="application\/json">(.*?)<\/script>/s)[1]);
const original = parse(old('index.html')), data = parse(read('index.html'));
assert.deepEqual(data.chapters,original.chapters,'Lessons changed');
assert.deepEqual(data.questions.slice(0,100),original.questions,'Original questions changed');
assert.equal(data.questions.length,375);
assert.equal(new Set(data.questions.map(q=>q.id)).size,375);
assert.equal(new Set(data.questions.map(q=>q.question.trim().toLowerCase())).size,375);
for(const c of data.chapters) assert.equal(data.questions.filter(q=>q.chapter===c.id).length,15);
for(const q of data.questions){
 assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);
 assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4);
 assert.ok(q.explanation.length>20&&q.hint.length>10);
 assert.ok(data.chapters.some(c=>c.id===q.chapter));
}
let serveOld = false;
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.png':'image/png','.webmanifest':'application/manifest+json'};
const server = http.createServer((req,res)=>{
 const name = new URL(req.url,'http://localhost').pathname.replace(/^\/It-lernquiz\/?/,'') || 'index.html';
 if(name.includes('..')||!fs.existsSync(path.join(root,name))){res.writeHead(404);res.end();return}
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',mime[path.extname(name)]||'text/plain');
 res.end(serveOld && ['index.html','sw.js','manifest.webmanifest'].includes(name)?old(name):fs.readFileSync(path.join(root,name)));
});
const report = [];
let browser;
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url = `http://localhost:${server.address().port}/It-lernquiz/`;
 browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 const context=await browser.newContext();const page=await context.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url);
 await page.waitForFunction(()=>navigator.serviceWorker.controller!==null,{},{timeout:20000});
 console.log('App and offline worker loaded.');
 await page.locator('[data-nav="chapters"]').click();
 assert.equal(await page.locator('#coursegrid .course').count(),25);
 for(const c of data.chapters){
  await page.evaluate(ch=>{state.chapter=ch;state.tab='learn';nav('lesson')},c.id);
  assert.ok((await page.locator('.lesson').innerText()).length>50);
  await page.locator('[data-action="quiz-ch"]').click();
  assert.equal(await page.evaluate(()=>state.set.length),15);
 }
 // Exercise every answer and every explanation, not just schema parsing.
 await page.evaluate(()=>{for(const q of allQ){
  state={...state,page:'quiz',mode:'chapter',set:[q],index:0,sessionAnswers:[],selected:null,submitted:false};render();
  document.querySelector(`[data-answer="${q.correct}"]`).click();
  document.querySelector('[data-action="check"]').click();
  if(document.querySelector('.feedback.good p')?.textContent!==q.explanation)throw new Error(`Explanation ${q.id}`);
  document.querySelector('[data-action="next"]').click();
  if(document.querySelector('.score')?.textContent!=='1/1')throw new Error(`Result ${q.id}`);
 }});
 console.log('All 375 DOM answer/check/next interactions passed.');
 await page.evaluate(()=>nav('progress'));
 assert.ok((await page.locator('#view').innerText()).includes('100 %'));
 await page.evaluate(()=>{state.search='';state.filter='done';nav('chapters')});
 assert.equal(await page.locator('#coursegrid .course').count(),25);
 await page.evaluate(()=>{state.filter='started';drawCourses()});assert.equal(await page.locator('#coursegrid .course').count(),0);
 report.push('All 375 answers/explanations and 25 chapter quizzes; completion filters and 100% progress passed.');
 await page.evaluate(()=>{record.attempts={};record.sessions=0;save();nav('practice')});
 for(const mode of ['mix','new','exam']){
  await page.locator(`[data-mode="${mode}"]`).click();
  assert.equal(await page.evaluate(()=>state.set.length),20);
  assert.equal(new Set(await page.evaluate(()=>state.set.map(q=>q.id))).size,20);
  if(mode==='exam'){
   for(let i=0;i<20;i++){
    await page.locator('[data-answer="0"]').click();assert.equal(await page.locator('.feedback').count(),0);
    await page.locator('[data-action="check"]').click();
   }
   assert.equal(await page.locator('.review-item').count(),20);
   assert.equal(await page.evaluate(()=>record.sessions),1);
  }
  await page.evaluate(()=>nav('practice'));
 }
 await page.evaluate(()=>{const q=allQ[100];saveAttempt(q.id,false);start(1,'wrong')});
 assert.ok(await page.evaluate(()=>state.set.every(q=>record.attempts[q.id]&&!record.attempts[q.id].lastCorrect)));
 report.push('Mix, new questions, error review, 20-question exam with delayed feedback and result review passed.');
 // Old exports must still load using the original version and IDs.
 const legacy={attempts:Object.fromEntries(original.questions.slice(0,4).map(q=>[q.id,{count:2,lastCorrect:true,everCorrect:true,at:'2026-10-01T12:00:00Z'}])),settings:{theme:'light',font:2},sessions:7};
 await page.evaluate(()=>nav('progress'));page.once('dialog',d=>d.accept());
 await page.locator('#import').setInputFiles({name:'old-progress.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:1,record:legacy}))});
 await page.waitForFunction(()=>record.sessions===7);
 assert.deepEqual(await page.evaluate(()=>record),legacy);
 const downloadPromise=page.waitForEvent('download');await page.locator('[data-action="export"]').click();const download=await downloadPromise;
 const stream=await download.createReadStream();let exported='';for await(const chunk of stream)exported+=chunk;
 assert.deepEqual(JSON.parse(exported).record,legacy);
 await page.reload();assert.deepEqual(await page.evaluate(()=>record),legacy);
 report.push('Legacy import, export, reload, settings and old question progress passed.');
 const shotDir=process.env.SCREENSHOT_DIR; if(shotDir)fs.mkdirSync(shotDir,{recursive:true});
 for(const width of [320,375,390,430,844,1280]){
  await page.setViewportSize({width,height:width===844?390:844});
  for(const screen of ['home','chapters','lesson','quiz','progress','result']){
   await page.evaluate(screen=>{record.settings.font=3;state.filter='all';state.search='';state.chapter=1;state.tab='learn';if(screen==='quiz'||screen==='result'){start(1,'chapter');if(screen==='result'){state.sessionAnswers=state.set.map(q=>({q:q.id,correct:true,picked:q.correct}));nav('result')}}else nav(screen)},screen);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Overflow ${width} ${screen}`);
   if(shotDir&&width===390&&['home','quiz'].includes(screen))await page.screenshot({path:path.join(shotDir,`mobile-${screen}.png`),fullPage:true});
  }
 }
 report.push('320–1280px layouts, landscape and maximum text size: no page overflow.');
 await context.setOffline(true);await page.reload();
 assert.equal(await page.evaluate(()=>allQ.length),375);
 await page.evaluate(()=>start(25,'chapter'));await page.locator('[data-answer="0"]').click();await page.locator('[data-action="check"]').click();
 assert.equal(await page.locator('.feedback').count(),1);
 report.push('Offline reload and answering with the full 375-question bank passed.');
 await context.close();
 // Install the actual old app/worker, then serve the new release on the SAME origin.
 serveOld=true;const upgrade=await browser.newContext();const oldPage=await upgrade.newPage();await oldPage.goto(url);
 await oldPage.waitForFunction(()=>navigator.serviceWorker.controller!==null,{},{timeout:20000});
 await oldPage.evaluate(v=>{localStorage.setItem('bssw_quiz_v1',JSON.stringify(v))},legacy);
 assert.ok((await oldPage.evaluate(()=>caches.keys())).includes('it-lernquiz-offline-v1'));
 serveOld=false;await oldPage.reload();await oldPage.evaluate(async()=>{const r=await navigator.serviceWorker.ready;await r.update()});
 await oldPage.waitForFunction(async()=>{const keys=await caches.keys();return keys.includes('it-lernquiz-offline-v2-375')&&!keys.includes('it-lernquiz-offline-v1')});
 await upgrade.setOffline(true);await oldPage.reload();assert.equal(await oldPage.evaluate(()=>allQ.length),375);
 assert.deepEqual(await oldPage.evaluate(()=>record),legacy);
 await oldPage.evaluate(()=>nav('progress'));assert.ok((await oldPage.locator('#view').innerText()).includes('4 von 15 bearbeitet'));
 assert.equal(await oldPage.evaluate(()=>pct(allAnswered(),allQ.length)),1);
 report.push('Actual v1→v2 service worker upgrade removes old cache; offline bank and legacy progress remain intact.');
 assert.deepEqual(errors,[],'Browser errors');
 console.log(report.join('\n'));
 if(process.env.REPORT_FILE)fs.writeFileSync(process.env.REPORT_FILE,report.join('\n')+'\n');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();server.close()});
