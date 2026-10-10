const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const {modules,units,lessons,sharedCase}=require('./content/course.cjs');
const routing=require('./content/question-routing.cjs');
const originalPath=path.join(root,'content/original-data.json');
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const embedded=html.match(/<script id="quizdata" type="application\/json">(.*?)<\/script>/s);
if(!fs.existsSync(originalPath))fs.writeFileSync(originalPath,JSON.stringify(JSON.parse(embedded[1]),null,2));
const original=JSON.parse(fs.readFileSync(originalPath,'utf8'));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const refs={
 sef6:['Schriftliche Prüfung: § 6 SEFPrV','https://www.gesetze-im-internet.de/sefprv/__6.html'],
 sef7:['Präsentation und Fachgespräch: § 7 SEFPrV','https://www.gesetze-im-internet.de/sefprv/__7.html'],
 arc42:['arc42: offizielle Strukturübersicht','https://arc42.org/overview/'],
 tdd:['Agile Alliance: Test Driven Development','https://agilealliance.org/glossary/tdd/'],
 owasp:['OWASP: Application Security Verification Standard','https://owasp.org/projects/asvs'],
 bsi:['BSI: IT-Grundschutz','https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/IT-Grundschutz/it-grundschutz_node.html'],
};
const referenceLinks={
 '0.1':[1,23,25],'1.1':[23],'1.2':[23,15],'1.3':[19,21,24],
 '2.0':[20],'2.1':[5,18],'2.2':[5,18],'2.3':[5,22],'2.4':[5,18],
 '2.5':[6,16],'2.6':[6,22],'2.7':[18,2],'2.8':[6,16],'2.9':[7,24],
 '2.10':[7,11],'2.11':[20,21,23],'2.12':[5,22],
 '3.1':[3,16],'3.2':[3,9],'3.3':[7],'3.4':[7],'3.5':[4,9],
 '3.6':[4,16],'3.7':[8],'3.8':[8,11],'3.9':[13],
 '3.10':[2,3,4,19],'3.11':[20,21,23],
 '4.0':[9,22],'5.0':[10,22],'6.0':[11,22],'7.0':[12,17],
 '8.0':[13,14,25],'9.0':[15,22],
};
const chapters=units.map(([code,title,minutes],i)=>{
 const spec=lessons[code];if(!spec)throw new Error(`Missing lesson ${code}`);
 const module=Number(code.split('.')[0]);
 let lesson=`<div class="callout"><strong>Lernziel</strong><p>${esc(spec.goal)}</p></div>`;
 if(code==='2.0')lesson+=sharedCase;
 else if(module>=2)lesson+='<p class="mini">Die Praxisbeispiele beziehen sich auf die eigene Übungsfallstudie „Mittelland Logistik“ aus Einheit 2.0.</p>';
 for(const [heading,text]of spec.blocks)lesson+=`<h3>${esc(heading)}</h3><p>${esc(text)}</p>`;
 lesson+=`<h3>Praxisbeispiel</h3><blockquote>${esc(spec.example)}</blockquote><h3>Selbstcheck ohne Antwortoptionen</h3><p>${esc(spec.task)}</p><details><summary>Mögliche Lösung anzeigen</summary><p>${esc(spec.answer)}</p></details><h3>Merksatz</h3><p><strong>${esc(spec.takeaway)}</strong></p>`;
 if(spec.refs?.length)lesson+=`<h3>Weiterführende Primärquellen</h3><ul>${spec.refs.map(key=>`<li><a href="${refs[key][1]}" target="_blank" rel="noopener noreferrer">${esc(refs[key][0])}</a></li>`).join('')}</ul>`;
 return{id:i+1,code,title,module,minutes,examRelevant:modules.find(m=>m.id===module).examRelevant,lesson,referenceIds:referenceLinks[code]};
});
const byCode=Object.fromEntries(chapters.map(c=>[c.code,c.id]));
const ordinal={};
const questions=original.questions.map(q=>{
 const index=ordinal[q.chapter]||0;ordinal[q.chapter]=index+1;
 const code=routing[q.chapter]?.[index];if(!byCode[code])throw new Error(`No route for ${q.id}`);
 return{...q,chapter:byCode[code],originalChapter:q.chapter};
});
let code;const counts={};
for(const line of fs.readFileSync(path.join(root,'content/course-questions.txt'),'utf8').split(/\r?\n/)){
 if(!line.trim())continue;if(line.startsWith('## ')){code=line.slice(3);continue}
 const fields=line.split('|');if(fields.length!==6)throw new Error(`Invalid question row: ${line}`);
 const [question,solution,...rest]=fields;const explanation=rest.pop();
 const index=counts[code]=(counts[code]||0)+1;const correct=(byCode[code]+index)%4;
 const options=[...rest];options.splice(correct,0,solution);
 questions.push({id:`course-${code.replace('.','-')}-${String(index).padStart(2,'0')}`,chapter:byCode[code],question,options,correct,explanation,hint:explanation.match(/[^.!?]+[.!?]?/g).at(-1).trim()});
}
if(questions.length!==475)throw new Error(`Expected 475 questions, got ${questions.length}`);
if(new Set(questions.map(q=>q.id)).size!==475||new Set(questions.map(q=>q.question.toLowerCase().trim())).size!==475)throw new Error('Duplicate ID/text');
for(const c of chapters)if(questions.filter(q=>q.chapter===c.id).length<5)throw new Error(`Too few questions in ${c.code}`);
const data={version:3,modules,chapters,questions,referenceChapters:original.chapters,caseStudy:{title:'Mittelland Logistik',kind:'Eigene fiktive Übungsfallstudie',html:sharedCase},courseNote:'Die Gliederung folgt den bereitgestellten Kursbildern. Einzelzeiten sind Kursangaben; für Module 4–9 waren keine Unterthemen oder Zeiten sichtbar. Deren Vertiefung orientiert sich an den offiziellen Qualifikationsschwerpunkten.'};
html=html.replace(embedded[1],JSON.stringify(data).replace(/<\//g,'<\\/'));
// Replace the generic chapter presentation; storage and answer handling stay intact.
html=html.replace(/\n\/\/ COURSE_UI_BEGIN[\s\S]*?\/\/ COURSE_UI_END\n/,'\n');
html=html.replace(/^function (?:start|home|chapterList|drawCourses|lesson|practice)\([\s\S]*?(?=^function )/gm,'');
html=html.replace("filter:'all',search:''}","filter:'all',search:'',module:'all'}");
html=html.replace(/if\(state.page==='progress'\)progress\(\);(?:if\(state.page==='references'\)referenceLibrary\(\);)*/,"if(state.page==='progress')progress();if(state.page==='references')referenceLibrary();");
html=html.replaceAll("String(c.id).padStart(2,'0')","chapterLabel(c.id)");
html=html.replaceAll("String(state.chapter).padStart(2,'0')","chapterLabel(state.chapter)");
html=html.replace("state.mode==='chapter'?`Kapitel ${chapterLabel(state.chapter)}`:isExam", "state.mode==='chapter'?`Lerneinheit ${chapterLabel(state.chapter)}`:state.mode==='module'?`Modul ${state.quizModule}`:isExam");
html=html.replace("<h2 class=\"section-title\">Deine Kapitel</h2>","<h2 class=\"section-title\">Deine Lerneinheiten</h2>");
html=html.replace("<p class=\"mini\">Fortschritt basiert auf Fragen,", "<p class=\"mini\">Deine bisherigen Antworten bleiben erhalten und sind jetzt passenden Kursthemen zugeordnet. Fortschritt basiert auf Fragen,");
const ui=fs.readFileSync(path.join(root,'content/course-ui.js'),'utf8');
html=html.replace(/\nrender\(\);\r?\n<\/script>/,'\n// COURSE_UI_BEGIN\n'+ui+'\n// COURSE_UI_END\nrender();\n</script>');
const style='.module-select{width:100%;padding:12px;border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--txt);margin-top:6px}.module-section{margin:12px 0 20px}.module-section h2{margin:5px 0;font-size:22px;overflow-wrap:anywhere}.module-section .heading-row>div{min-width:0;flex:1 1 260px}.reference-details{border-top:1px solid var(--line);margin-top:25px;padding-top:15px}.reference-details details{padding:10px 0}.lesson summary{cursor:pointer;font-weight:700}.module-select:focus-visible{outline:3px solid var(--blue);outline-offset:2px}';
if(!html.includes('.module-select{'))html=html.replace('</style>',style+'\n</style>');
html=html.replace(/Lerne Softwareentwicklung interaktiv mit [^"<>]+/,'Lerne passend zum Kurs: 10 Module, 34 Lerneinheiten, 475 erklärte Quizfragen und Prüfungstraining.');
fs.writeFileSync(path.join(root,'index.html'),html);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
manifest.description='Dein Kurs: 10 Module, 34 Lerneinheiten und 475 erklärte Fragen – auch offline.';
fs.writeFileSync(path.join(root,'manifest.webmanifest'),JSON.stringify(manifest,null,2)+'\n');
const sw=path.join(root,'sw.js');fs.writeFileSync(sw,fs.readFileSync(sw,'utf8').replace(/it-lernquiz-offline-v[\w-]+/,'it-lernquiz-offline-v3-course'));
console.log(JSON.stringify({modules:modules.length,units:chapters.length,questions:questions.length,counts:chapters.map(c=>({code:c.code,count:questions.filter(q=>q.chapter===c.id).length}))},null,2));
