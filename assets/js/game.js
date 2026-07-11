// Basic anti-inspection deterrents
document.addEventListener("contextmenu",e=>e.preventDefault());
document.addEventListener("selectstart",e=>e.preventDefault());
document.addEventListener("dragstart",e=>e.preventDefault());
document.addEventListener("keydown",e=>{if(e.key==="F12"||(e.ctrlKey&&e.shiftKey&&["I","J","C"].includes(e.key.toUpperCase()))||(e.ctrlKey&&["u","U","s","S"].includes(e.key))){e.preventDefault();return false;}});
setInterval(()=>{try{console.clear();}catch(e){}},1000);
setInterval(()=>{if(window.outerWidth-window.innerWidth>160||window.outerHeight-window.innerHeight>160){try{console.clear();}catch(e){}}},1000);

// ---- Particle System ----
function createParticles(){const c=document.getElementById('particles');for(let i=0;i<30;i++){const p=document.createElement('div');p.className='particle';p.style.left=Math.random()*100+'%';p.style.animationDuration=(Math.random()*8+4)+'s';p.style.animationDelay=Math.random()*5+'s';p.style.width=(Math.random()*2+1)+'px';p.style.height=p.style.width;c.appendChild(p)}}
createParticles();

// ---- Game State ----
let score=0,casesSolved=0,currentLevel=0,totalCases=5;
let unlockedSkills=new Set(),l5Selections=[];

const RANKS=[
  {min:0,max:30,name:'CURIOUS INTERN',color:'#888'},
  {min:31,max:60,name:'SOC TRAINEE',color:'#ffaa00'},
  {min:61,max:90,name:'THREAT INVESTIGATOR',color:'var(--neon-blue)'},
  {min:91,max:120,name:'ELITE THREAT HUNTER',color:'var(--neon-green)'},
  {min:121,max:999,name:'CYBER DETECTIVE LEGEND',color:'var(--neon-yellow)'}
];

const SKILL_MAP={
  1:'collection',2:'domain',3:'ip',4:'osint',5:'exposure',6:'intel'
};

const MISSIONS={
  0:'Accept first case',1:'Investigate phishing email',2:'Analyze brute force IP',3:'Assess OSINT exposure',
  4:'Scan internet exposure',5:'Rapid response challenge',6:'Mission complete'
};

function getRank(){for(let r of RANKS)if(score>=r.min&&score<=r.max)return r;return RANKS[RANKS.length-1]}
function updateUI(){const r=getRank();document.getElementById('top-rank').textContent=r.name;document.getElementById('top-rank').style.color=r.color;document.getElementById('top-score').textContent=score;document.getElementById('top-cases').textContent=casesSolved+'/'+totalCases;document.getElementById('top-progress').style.width=((casesSolved/totalCases)*100)+'%';document.getElementById('current-mission').textContent=MISSIONS[currentLevel]||'Mission complete';}
function unlockSkill(skill){unlockedSkills.add(skill);document.querySelectorAll('.skill-pill[data-skill="'+skill+'"]').forEach(p=>p.classList.add('unlocked'));}
function saveGame(){const data={score,casesSolved,currentLevel,unlockedSkills:Array.from(unlockedSkills),timestamp:new Date().toISOString()};localStorage.setItem('thu_save',JSON.stringify(data));}
function loadGame(){const raw=localStorage.getItem('thu_save');if(!raw){alert('No saved progress found.');return;}const data=JSON.parse(raw);score=data.score||0;casesSolved=data.casesSolved||0;currentLevel=data.currentLevel||0;if(data.unlockedSkills)data.unlockedSkills.forEach(s=>unlockSkill(s));updateUI();if(currentLevel>0&&currentLevel<=5){startLevel(currentLevel);}else if(currentLevel>5){showFinalEvaluation();}else{document.getElementById('opening-screen').classList.add('active');}}
function resetGame(){if(!confirm('Reset all progress? This cannot be undone.'))return;localStorage.removeItem('thu_save');score=0;casesSolved=0;currentLevel=0;unlockedSkills.clear();l5Selections=[];document.querySelectorAll('.skill-pill').forEach(p=>p.classList.remove('unlocked'));updateUI();location.reload();}

// ---- Screen Management ----
function hideAllScreens(){document.querySelectorAll('.screen, .center-screen').forEach(s=>{s.classList.remove('active');s.style.display='none';});}
function showScreen(id){hideAllScreens();const el=document.getElementById(id);if(el){el.style.display='block';el.classList.add('active');window.scrollTo(0,0);}}

// ---- Boot Sequence ----
function runBootSequence(){const l1=document.getElementById('open-line-1'),l2=document.getElementById('open-line-2'),prog=document.getElementById('open-progress'),fill=document.getElementById('open-fill'),l3=document.getElementById('open-line-3'),alert=document.getElementById('open-alert'),btn=document.getElementById('open-btn');setTimeout(()=>{l2.classList.remove('hidden');prog.classList.remove('hidden');let v=0;const iv=setInterval(()=>{v+=Math.random()*15+5;if(v>=100){v=100;clearInterval(iv);setTimeout(()=>{l3.classList.remove('hidden');setTimeout(()=>{alert.classList.remove('hidden');setTimeout(()=>btn.classList.remove('hidden'),800)},600)},400)}fill.style.width=v+'%';},200);},1500);}

// ---- Start Game ----
function startGame(){document.getElementById('opening-screen').classList.add('glitch');setTimeout(()=>{startLevel(1);},400);}
function startLevel(n){currentLevel=n;saveGame();hideAllScreens();if(n===1){showScreen('level1-screen');typeQuestion('l1-question','You are the assigned analyst. What is your FIRST action?');}
else if(n===2){showScreen('level2-screen');typeQuestion('l2-question','What should you do first?');}
else if(n===3){showScreen('level3-screen');typeQuestion('l3-question','What is the potential issue here?');}
else if(n===4){showScreen('level4-screen');typeQuestion('l4-question','Why would attackers care about this vulnerability?');}
else if(n===5){showScreen('level5-screen');l5Selections=[];document.querySelectorAll('.challenge-card').forEach(c=>{c.classList.remove('selected','order-1','order-2','order-3');c.dataset.order='';});document.getElementById('l5-submit-btn').classList.add('hidden');}
updateUI();}

// ---- Typewriter ----
function typeQuestion(id,text){const el=document.getElementById(id);el.innerHTML='';let i=0;function type(){if(i<text.length){el.innerHTML=text.substring(0,i+1)+'<span class="cursor"></span>';i++;setTimeout(type,40);}else{el.classList.add('typing-complete');el.innerHTML=text;}}setTimeout(type,500);}

// ---- Level 1 ----
function handleL1(choice){hideAllScreens();if(choice==='A'){score-=10;showScreen('l1-wrong-a');}
else if(choice==='B'){showScreen('l1-wrong-b');}
else if(choice==='D'){score-=5;showScreen('l1-wrong-d');}
else if(choice==='C'){showL1Terminal();}
updateUI();saveGame();}
function showL1Terminal(){showScreen('l1-terminal');const w=document.getElementById('l1-terminal-window');const lines=[{delay:600,html:'<span class="terminal-prompt">threat-hunter@unit:~$</span> <span>check_domain_age("company-payroll-update.com")</span>'},{delay:1200,html:'<span class="terminal-output">Querying WHOIS database...</span>'},{delay:1800,html:'<span class="terminal-output">Domain registered: <span style="color:var(--neon-red)">12 days ago</span></span>'},{delay:2200,html:'<span class="terminal-output">Registrar: Unknown / Suspicious</span>'},{delay:2800,html:'<span class="terminal-prompt">threat-hunter@unit:~$</span> <span>check_reputation("company-payroll-update.com")</span>'},{delay:3400,html:'<span class="terminal-output">Scanning threat intelligence feeds...</span>'},{delay:4000,html:'<span class="terminal-output">Known reputation: <span style="color:var(--neon-red)">Suspicious</span></span>'},{delay:4600,html:'<span class="terminal-output">Risk classification: <span style="color:var(--neon-red)">HIGH</span></span>'},{delay:5200,html:'<span class="terminal-prompt">threat-hunter@unit:~$</span> <span>generate_report()</span>'},{delay:5800,html:'<span class="terminal-output">=== ANALYSIS COMPLETE ===</span>'}];
lines.forEach((line,idx)=>{setTimeout(()=>{const div=document.createElement('div');div.className='terminal-line';div.style.animationDelay='0s';div.innerHTML=line.html;w.appendChild(div);if(idx===lines.length-1){setTimeout(()=>{score+=20;casesSolved=1;unlockSkill('collection');unlockSkill('domain');showScreen('l1-success');updateUI();saveGame();},1500);}},line.delay);});}
function retryLevel(n){startLevel(n);}

// ---- Level 2 ----
function handleL2(choice){hideAllScreens();if(choice==='A'){score-=10;showScreen('l2-wrong-a');}
else if(choice==='C'){score-=15;showScreen('l2-wrong-c');}
else if(choice==='D'){showScreen('l2-wrong-d');}
else if(choice==='B'){showL2Terminal();}
updateUI();saveGame();}
function showL2Terminal(){showScreen('l2-terminal');const w=document.getElementById('l2-terminal-window');const lines=[{delay:600,html:'<span class="terminal-prompt">threat-hunter@unit:~$</span> <span>query_ip_reputation("185.220.101.42")</span>'},{delay:1200,html:'<span class="terminal-output">Querying abuse databases...</span>'},{delay:1800,html:'<span class="terminal-output">Known malicious activity: <span style="color:var(--neon-red)">YES</span></span>'},{delay:2400,html:'<span class="terminal-output">Seen in: Credential stuffing campaigns</span>'},{delay:3000,html:'<span class="terminal-output">First seen: 3 months ago</span>'},{delay:3600,html:'<span class="terminal-output">Reports: 47 abuse complaints</span>'},{delay:4200,html:'<span class="terminal-prompt">threat-hunter@unit:~$</span> <span>check_geolocation("185.220.101.42")</span>'},{delay:4800,html:'<span class="terminal-output">Location: Masked via Tor exit node</span>'},{delay:5400,html:'<span class="terminal-output">Risk: <span style="color:var(--neon-red)">HIGH</span></span>'},{delay:6000,html:'<span class="terminal-prompt">threat-hunter@unit:~$</span> <span>generate_report()</span>'},{delay:6600,html:'<span class="terminal-output">=== ANALYSIS COMPLETE ===</span>'}];
lines.forEach((line,idx)=>{setTimeout(()=>{const div=document.createElement('div');div.className='terminal-line';div.innerHTML=line.html;w.appendChild(div);if(idx===lines.length-1){setTimeout(()=>{score+=25;casesSolved=2;unlockSkill('ip');showScreen('l2-success');updateUI();saveGame();},1500);}},line.delay);});}

// ---- Level 3 ----
function handleL3(choice){hideAllScreens();if(choice==='A'){showScreen('l3-wrong-a');}
else if(choice==='C'){score-=5;showScreen('l3-wrong-c');}
else if(choice==='D'){score-=10;showScreen('l3-wrong-d');}
else if(choice==='B'){showScreen('l3-reveal');}
updateUI();saveGame();}
function showL3Success(){score+=25;casesSolved=3;unlockSkill('osint');showScreen('l3-success');updateUI();saveGame();}

// ---- Level 4 ----
function handleL4(choice){hideAllScreens();if(choice==='A'){showScreen('l4-wrong-a');}
else if(choice==='C'){showScreen('l4-wrong-c');}
else if(choice==='D'){showScreen('l4-wrong-d');}
else if(choice==='B'){showL4Scan();}
updateUI();saveGame();}
function showL4Scan(){showScreen('l4-scan');const counter=document.getElementById('scan-counter');const status=document.getElementById('scan-status');const targets=[342,12493,54102,89347,112304,134892,145000];let idx=0;const iv=setInterval(()=>{if(idx<targets.length){counter.textContent=targets[idx].toLocaleString();const msgs=['Scanning subnet ranges...','Probing open ports...','Identifying service banners...','Cross-referencing CVE database...','Compiling exposure map...','Finalizing scan...','Scan complete'];status.textContent=msgs[idx];idx++;}else{clearInterval(iv);document.getElementById('l4-continue-btn').classList.remove('hidden');}},700);}
function showL4Reveal(){showScreen('l4-reveal');}
function showL4Success(){score+=30;casesSolved=4;unlockSkill('exposure');unlockSkill('intel');showScreen('l4-success');updateUI();saveGame();}

// ---- Level 5 ----
function selectChallenge(card,idx){if(card.dataset.order)return;const order=l5Selections.length+1;if(order>3)return;l5Selections.push(idx);card.dataset.order=order;card.classList.add('selected','order-'+order);if(order===3)document.getElementById('l5-submit-btn').classList.remove('hidden');}
function submitL5(){const optimal=[2,1,3];let points=50;let correct=0;l5Selections.forEach((sel,i)=>{if(sel===optimal[i])correct++;});if(correct===3){document.getElementById('l5-result-title').textContent='PERFECT PRIORITIZATION';document.getElementById('l5-points').textContent='+50 ANALYST POINTS';document.getElementById('l5-narration').textContent='All skills combined. You prioritized threat intelligence correctly.';}
else if(correct===2){points=35;document.getElementById('l5-result-title').textContent='GOOD PRIORITIZATION';document.getElementById('l5-points').textContent='+35 ANALYST POINTS';document.getElementById('l5-narration').textContent='Solid instincts. One priority was slightly off.';}
else if(correct===1){points=20;document.getElementById('l5-result-title').textContent='NEEDS IMPROVEMENT';document.getElementById('l5-points').textContent='+20 ANALYST POINTS';document.getElementById('l5-narration').textContent='Review the concepts. Priority order matters in incident response.';}
else{points=10;document.getElementById('l5-result-title').textContent='REVIEW REQUIRED';document.getElementById('l5-points').textContent='+10 ANALYST POINTS';document.getElementById('l5-narration').textContent='Threat data collection comes first. Then domain, then OSINT.';}
score+=points;casesSolved=5;showScreen('l5-result');updateUI();saveGame();}

// ---- Final Evaluation ----
function showFinalEvaluation(){currentLevel=6;saveGame();showScreen('final-eval');const r=getRank();document.getElementById('final-rank-title').textContent=r.name;document.getElementById('final-rank-title').style.color=r.color;document.getElementById('final-graffiti').textContent=r.name==='CYBER DETECTIVE LEGEND'?'YOU ARE A LEGEND':'YOU THINK LIKE AN ANALYST';document.getElementById('final-score').textContent=score;document.getElementById('final-cases').textContent=casesSolved+'/5';document.getElementById('final-skills').textContent=unlockedSkills.size;
['collection','domain','ip','osint','exposure','intel'].forEach(s=>{const el=document.getElementById('skill-'+s);if(unlockedSkills.has(s))el.classList.remove('locked');});
document.getElementById('cert-rank').textContent=r.name;document.getElementById('cert-text').textContent='Completed '+casesSolved+' cases with '+score+' points';document.getElementById('cert-date').textContent=new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
if(score>=91)launchConfetti();}

// ---- Confetti ----
function launchConfetti(){const c=document.getElementById('confetti');c.innerHTML='';const colors=['var(--neon-blue)','var(--neon-green)','var(--neon-red)','var(--neon-purple)','var(--neon-yellow)'];for(let i=0;i<60;i++){const p=document.createElement('div');p.className='confetti-piece';p.style.left=Math.random()*100+'%';p.style.top='-10px';p.style.background=colors[Math.floor(Math.random()*colors.length)];p.style.animationDuration=(Math.random()*2+2)+'s';p.style.animationDelay=Math.random()*1+'s';p.style.width=(Math.random()*6+4)+'px';p.style.height=p.style.width;p.style.borderRadius=Math.random()>0.5?'50%':'0';c.appendChild(p);}}

// ---- Certificate Download ----
function downloadCertificate(){const canvas=document.createElement('canvas');canvas.width=800;canvas.height=500;const ctx=canvas.getContext('2d');ctx.fillStyle='#050508';ctx.fillRect(0,0,800,500);ctx.strokeStyle='#00f0ff';ctx.lineWidth=3;ctx.strokeRect(20,20,760,460);ctx.strokeStyle='rgba(0,240,255,0.2)';ctx.lineWidth=1;ctx.strokeRect(35,35,730,430);const r=getRank();ctx.fillStyle='#00f0ff';ctx.font='bold 28px Rajdhani';ctx.textAlign='center';ctx.fillText('THREAT HUNTER UNIT',400,80);ctx.fillStyle='#888';ctx.font='16px Share Tech Mono';ctx.fillText('Certificate of Completion',400,110);ctx.fillStyle='#00ff88';ctx.font='bold 36px Rajdhani';ctx.fillText(r.name,400,200);ctx.fillStyle='#ccc';ctx.font='18px Share Tech Mono';ctx.fillText('Completed all 5 cases with '+score+' points',400,250);ctx.fillStyle='#555';ctx.font='14px Share Tech Mono';ctx.fillText(new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}),400,420);ctx.fillStyle='#ffcc00';ctx.font='40px serif';ctx.fillText('🛡️',400,340);const link=document.createElement('a');link.download='threat-hunter-certificate.png';link.href=canvas.toDataURL();link.click();}

// ---- Play Again ----
function playAgain(){score=0;casesSolved=0;currentLevel=0;unlockedSkills.clear();l5Selections=[];document.querySelectorAll('.skill-pill').forEach(p=>p.classList.remove('unlocked'));document.querySelectorAll('.skill-item').forEach(s=>s.classList.add('locked'));localStorage.removeItem('thu_save');const tw=document.getElementById('l1-terminal-window');if(tw)tw.innerHTML='<div class="terminal-line"><span class="terminal-prompt">threat-hunter@unit:~$</span> <span>initiate_threat_intel_search()</span></div>';const tw2=document.getElementById('l2-terminal-window');if(tw2)tw2.innerHTML='<div class="terminal-line"><span class="terminal-prompt">threat-hunter@unit:~$</span> <span>query_ip_reputation("185.220.101.42")</span></div>';document.getElementById('scan-counter').textContent='0';document.getElementById('scan-status').textContent='Initializing scan probes...';document.getElementById('l4-continue-btn').classList.add('hidden');updateUI();location.reload();}

// ---- Initialize ----
runBootSequence();
updateUI();
