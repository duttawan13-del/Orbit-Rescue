const root=document.getElementById('orbit');
const paths={home:'M3 10l9-7 9 7v11h-6v-7H9v7H3z',chart:'M4 20h16M6 16v-4m6 4V5m6 11V9',play:'M7 4l13 8-13 8z',book:'M12 6Q8 2 2 5v14q5-3 10 1 5-4 10-1V5q-6-3-10 1zm0 0v14',layers:'M12 3l9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5',target:'M12 3a9 9 0 1 0 .01 0M12 7a5 5 0 1 0 .01 0M12 11a1 1 0 1 0 .01 0',medal:'M8 3l4 7 4-7M5 3l4 8m10-8-4 8M12 10a5 5 0 1 0 .01 0',back:'M19 12H5m6-6-6 6 6 6',arrow:'M4 12h15m-6-6 6 6-6 6'};
const icon=k=>'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="'+paths[k]+'"/></svg>';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stageNames=['ซ่อมเรดาร์','ตั้งระบบนำทาง','จุดเครื่องยนต์'];
const topics=['รู้จักดาวเคราะห์','เข้าใจวงโคจร','วิเคราะห์ภารกิจ'];
const colors=['#85d9cc','#c4abe8','#ffad7b'];
const advice=['ลองวาดลำดับดาวเคราะห์ แล้วแยกดาวเคราะห์หินออกจากดาวเคราะห์ยักษ์','ลองใช้ลูกบอลกับไฟฉายจำลองการหมุน การโคจร และการรับแสง','ลองอธิบายว่าระยะทาง แสง และบรรยากาศมีผลต่อการเลือกอุปกรณ์ของยานอย่างไร'];
const button=(action,label,style='soft',symbol='')=>'<button class="btn '+style+'" data-do="'+action+'">'+(symbol?icon(symbol):'')+label+'</button>';
const back='<button class="back" data-do="home">'+icon('back')+' กลับศูนย์ควบคุม</button>';
const time=s=>Math.floor(s/60)+' นาที '+(s%60)+' วินาที';
let page='home',token=localStorage.getItem('orbit.flight'),flight,board,feedback=-1,busy=false,active=0,tickAt=performance.now(),candidate=null;
function tick(){const now=performance.now();if(!document.hidden&&flight?.status==='playing'&&['quiz','feedback','stage'].includes(page))active+=(now-tickAt)/1000;tickAt=now;}
async function api(route,body,key=token,keepalive=false){
 const r=await fetch('/api/'+route,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(key?{Authorization:'Bearer '+key}:{})},body:body?JSON.stringify(body):undefined,keepalive,cache:'no-store'});
 const data=await r.json().catch(()=>({error:'เชื่อมต่อศูนย์ควบคุมไม่สำเร็จ'}));if(!r.ok)throw Object.assign(new Error(data.error||'ติดต่อฐานข้อมูลไม่สำเร็จ'),{code:r.status});return data;
}
function syncTime(){tick();if(token&&flight?.status==='playing')api('time',{seconds:Math.floor(active)},token,true).catch(()=>{});}
setInterval(syncTime,15000);window.addEventListener('pagehide',syncTime);document.addEventListener('visibilitychange',()=>{if(document.hidden)syncTime();tickAt=performance.now();});
function go(next){tick();page=next;draw();window.scrollTo(0,0);}
function shell(content){
 const nav=(id,label,k)=>'<button data-do="'+id+'" class="'+((id==='board'&&page==='board')||(id==='home'&&page!=='board')?'on':'')+'">'+icon(k)+label+'</button>';
 root.innerHTML='<header class="top"><div class="shell bar"><button class="brand" data-do="home"><img src="/favicon.svg" alt="">ORBIT <em>RESCUE</em></button><nav aria-label="เมนูหลัก" class="nav">'+nav('home','ศูนย์ควบคุม','home')+nav('board','อันดับนักบิน','chart')+'</nav></div></header><main class="shell main"><div class="toast" role="alert"></div>'+content+'<footer class="footer"><span>ORBIT RESCUE · เกมทบทวนระบบสุริยะ</span><span class="micro">MISSION CONTROL</span></footer></main>';
}
const section=(n,title,inside)=>back+'<section class="panel"><div class="kicker"><i class="dot"></i>'+n+'</div><h1>'+title+'</h1>'+inside+'</section>';
function home(){
 const stat=(k,title,caption)=>'<div class="stat"><i class="iconbox">'+icon(k)+'</i><div><strong>'+title+'</strong><small>'+caption+'</small></div></div>';
 const missions=stageNames.map((s,i)=>'<article class="mission" style="--accent:'+colors[i]+'"><img alt="" src="/sector-'+i+'.png"><div><div class="micro">SECTOR 0'+(i+1)+'</div><h3>'+s+'</h3><small>'+topics[i]+'</small></div></article>').join('');
 return '<section class="hero"><div class="heroText"><div class="kicker"><i class="dot"></i>SOLAR SYSTEM ADVENTURE</div><h1>ภารกิจกู้ยาน<br><span>อวกาศ</span></h1><p>ยานสำรวจเสียหายกลางระบบสุริยะ! ใช้ความรู้ของคุณซ่อมยานทั้ง 3 ระบบ แล้วพาลูกเรือกลับโลก</p><div class="actions">'+button(token?'resume':'register',token?(flight?.status==='finished'?'ดูผลเที่ยวบิน':'เปิดเที่ยวบินล่าสุด'):'เริ่มภารกิจ','primary','play')+button('help','วิธีเล่น','soft','book')+'</div></div></section><div class="stats">'+stat('layers','3 ด่าน','ระบบที่ต้องซ่อม')+stat('target','12 ข้อ','ต่อหนึ่งเที่ยวบิน')+stat('medal','120 คะแนน','คะแนนเต็ม')+'</div><div class="sectionhead"><h2>แผนที่ภารกิจ</h2><span class="micro">MISSION MAP / 03</span></div><div class="map">'+missions+'</div>';
}
function draw(){
 let h='';
 if(page==='home')h=home();
 if(page==='help')h=section('FLIGHT MANUAL','คู่มือนักบิน','<ol class="help"><li>ลงทะเบียนนักบิน แล้วออกเดินทางซ่อมเรดาร์ ระบบนำทาง และเครื่องยนต์ตามลำดับ</li><li>แต่ละด่านสุ่ม 4 ข้อจากคลัง 6 ข้อ มีทั้งเลือกตอบและถูก–ผิด ตอบได้ข้อละหนึ่งครั้ง</li><li>ตอบถูกได้ 10 คะแนน ตอบผิดได้ 0 คะแนน เมื่อส่งคำตอบแล้วให้อ่านคำอธิบายก่อนเดินทางต่อ</li><li>ตอบครบ 4 ข้อจะได้ชิ้นส่วนและปลดล็อกด่านต่อไป ครบ 12 ข้อจะซ่อมยานสำเร็จ เป้าหมายการเรียนรู้คือถูกอย่างน้อย 8 ข้อ</li><li>ไม่มีเวลาจำกัด ระบบบันทึกทุกคำตอบ กลับมาเล่นต่อด้วยเบราว์เซอร์เดิมหรือเริ่มเที่ยวบินใหม่หลังจบได้</li></ol><h2>เหรียญประจำเที่ยวบิน</h2><p>0–7 ข้อ · นักบินฝึกหัด<br>8–9 ข้อ · นักสำรวจอวกาศ<br>10–12 ข้อ · ผู้เชี่ยวชาญวงโคจร</p>'+button(token?'resume':'register',token?'เปิดเที่ยวบินล่าสุด':'ลงทะเบียนนักบิน','primary','play'));
 if(page==='register')h=section('CREW REGISTRATION','ลงทะเบียนนักบิน','<p class="muted">ชื่อเล่นจะปรากฏในตารางอันดับ ข้อมูลประจำตัวใช้บันทึกผลการเรียน</p><form id="enlist"><div class="formgrid">'+[['fullName','ชื่อ–นามสกุล',100],['student','รหัสนักเรียน / นักศึกษา',40],['team','ชั้นเรียน / กลุ่มเรียน',60],['nick','ชื่อเล่นนักบิน',32]].map(([k,v,n])=>'<label>'+v+'<input name="'+k+'" maxlength="'+n+'" required pattern=".*\\S.*" autocomplete="off"></label>').join('')+'</div><button class="btn primary" type="submit">'+icon('play')+' ออกเดินทาง</button></form>');
 if(page==='quiz'){
 const q=flight.next,count=flight.history.length,s=q.stage;
 h=section('SECTOR 0'+(s+1)+' / 03',stageNames[s],'<div class="quizhead"><span class="chip">'+q.level+' · '+topics[s]+'</span><b>'+flight.score+' / 120 คะแนน</b></div><div class="progress"><i style="width:'+count/12*100+'%"></i></div><div class="micro">ข้อ '+(count+1)+' / 12 · '+(q.choices.length===2?'ถูก–ผิด':'เลือกตอบ')+'</div><h2>'+q.prompt+'</h2><div class="choices">'+q.choices.map((v,i)=>'<button class="choice" data-do="answer" data-choice="'+i+'"><b>'+String.fromCharCode(65+i)+'</b>'+v+'</button>').join('')+'</div><small class="muted">เลือกหนึ่งคำตอบ · ตอบถูก +10 คะแนน</small>');
 }
 if(page==='feedback'){
 const a=flight.history[feedback];h=section('MISSION LOG',a.ok?'ตอบถูก! +10 คะแนน':'มาดูคำเฉลยกัน','<p>'+a.prompt+'</p><div class="feedback '+(a.ok?'':'warn')+'"><strong>คำตอบของคุณ · '+a.choice+'</strong>'+(!a.ok?'<br><strong>คำตอบที่ถูก · '+a.solution+'</strong>':'')+'<p>'+a.why+'</p></div><div class="actions">'+button('continue',flight.status==='finished'?'รับผลภารกิจ':(feedback+1)%4===0?'รับชิ้นส่วนยาน':'ข้อต่อไป','primary','arrow')+'<span class="muted">'+flight.score+' / 120 คะแนน</span></div>');
 }
 if(page==='stage'){let i=flight.stages-1;h=section('SYSTEM RESTORED','ซ่อมสำเร็จ! '+stageNames[i],'<img class="stagepic" alt="" src="/sector-'+i+'.png"><p>ได้รับชิ้นส่วนที่ '+(i+1)+' จาก 3 ชิ้น ระบบถัดไปพร้อมให้ซ่อมแล้ว</p>'+button('quiz','เข้าสู่ด่าน '+(i+2)+' · '+stageNames[i+1],'primary','arrow'));}
 if(page==='result'){
 const f=flight;const missing=[...new Set(f.history.filter(a=>!a.ok).map(a=>a.stage))];
 h=section('MISSION COMPLETE','ยานกลับถึงโลกแล้ว!','<p class="nick">นักบิน <strong>'+esc(f.nick)+'</strong> ซ่อมครบทั้ง 3 ระบบ</p><div class="feedback"><div class="kicker">FLIGHT AWARD</div><h2>🏅 '+f.medal+'</h2><span>'+(f.correct>=8?'ผ่านเป้าหมายการเรียนรู้':'ลองอีกเที่ยวบิน ตั้งเป้าถูกอย่างน้อย 8 ข้อ')+'</span></div>'+numbers([['คะแนน',f.score+' / 120'],['ร้อยละ',Math.round(f.score/120*100)+'%'],['ถูก / ผิด',f.correct+' / '+f.wrong],['เวลาในเกม',time(f.seconds)]])+'<h2>ฝึกต่อหลังภารกิจ</h2><p>'+(missing.length?missing.map(i=>advice[i]).join('<br>'):'ลองวาดเส้นทางกลับโลก แล้วอธิบายให้เพื่อนฟังว่าแต่ละระบบช่วยให้ยานกลับมาได้อย่างไร')+'</p><details><summary>ดูบันทึกคำตอบทั้ง 12 ข้อ</summary>'+f.history.map((a,i)=>'<p><b>'+ (i+1)+'. '+a.prompt+'</b><br>คุณตอบ '+a.choice+' · '+(a.ok?'ถูก':'คำตอบที่ถูกคือ '+a.solution)+'<br>'+a.why+'</p>').join('')+'</details><div class="actions">'+button('board','ดูอันดับนักบิน','primary','chart')+button('register','เริ่มเที่ยวบินใหม่','soft','play')+'</div>');
 }
 if(page==='board'){
 const b=board;h=back+'<section class="panel wide"><div class="kicker"><i class="dot"></i>FLIGHT RECORDS</div><h1>อันดับนักบิน</h1><p class="muted">นับผู้เล่นจากรหัสนักเรียน สถิติและอันดับใช้คะแนนที่ดีที่สุดของแต่ละคนจากเที่ยวบินที่จบแล้ว คะแนนเท่ากันได้อันดับร่วม</p>'+numbers([['ผู้เล่นทั้งหมด',b.players],['คะแนนเฉลี่ย',b.average??'—'],['คะแนนสูงสุด',b.high??'—'],['คะแนนต่ำสุด',b.low??'—']])+(b.rows.length?'<div class="tablewrap"><table><caption>ผลการบินสูงสุด 50 รายการ</caption><thead><tr><th>อันดับ</th><th>นักบิน</th><th>คะแนน</th><th>เวลาในเกม</th></tr></thead><tbody>'+b.rows.map(r=>'<tr><td>'+r.rank+'</td><td class="nick">'+esc(r.nick)+'</td><td>'+r.score+'</td><td>'+time(r.seconds)+'</td></tr>').join('')+'</tbody></table></div>':'<div class="feedback">ยังไม่มีเที่ยวบินที่จบภารกิจ เมื่อซ่อมครบทั้ง 3 ระบบ ผลการบินจะปรากฏที่นี่</div>')+'</section>';
 }
 shell(h);
}
function numbers(pairs){return '<div class="gridnums">'+pairs.map(([label,val])=>'<div><b>'+esc(val)+'</b><span>'+label+'</span></div>').join('')+'</div>';}
async function run(fn){
 if(busy)return;busy=true;root.setAttribute('aria-busy','true');
 try{await fn();}catch(e){const box=root.querySelector('.toast');box.className='toast error';box.textContent=e.message||'เชื่อมต่อไม่สำเร็จ กรุณาลองอีกครั้ง';box.scrollIntoView({block:'nearest'});}finally{busy=false;root.removeAttribute('aria-busy');}
}
root.addEventListener('click',e=>{
 const el=e.target.closest('[data-do]');if(!el)return;
 run(async()=>{const action=el.dataset.do;
 if(action==='home'){syncTime();go('home');}
 if(['help','register','quiz'].includes(action)){if(action==='register')candidate=null;go(action);}
 if(action==='resume'){try{flight=await api('state',{});}catch(e){if(e.code!==404)throw e;localStorage.removeItem('orbit.flight');token=null;go('register');return;}active=Math.max(active,flight.seconds);go(flight.status==='finished'?'result':'quiz');}
 if(action==='board'){syncTime();board=await api('board');go('board');}
 if(action==='answer'){tick();feedback=flight.history.length;flight=await api('answer',{index:feedback,choice:Number(el.dataset.choice),seconds:Math.floor(active)});go('feedback');}
 if(action==='continue')go(flight.status==='finished'?'result':(feedback+1)%4===0?'stage':'quiz');
 });
});
root.addEventListener('submit',e=>{e.preventDefault();if(e.target.id!=='enlist')return;run(async()=>{candidate??=crypto.randomUUID();const data=Object.fromEntries(new FormData(e.target));flight=await api('start',data,candidate);token=candidate;localStorage.setItem('orbit.flight',token);candidate=null;active=flight.seconds;go('quiz');});});
draw();