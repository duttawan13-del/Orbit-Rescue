import {questions,drawDeck} from "./questions.mjs";
const fail=(message,status)=>Object.assign(new Error(message),{status});
const clean=(v,n)=>typeof v==="string" && v.trim().length<=n ? v.trim() : "";
const json=(value,status=200)=>Response.json(value,{status,headers:{"Cache-Control":"no-store"}});
function view(row){
 const deck=JSON.parse(row.deck), answers=JSON.parse(row.answers), next=questions[deck[answers.length]];
 return {nick:row.nick,score:row.score,maximum:row.maximum,correct:row.correct,wrong:row.wrong,seconds:row.seconds,stages:row.stages,status:row.status,medal:row.medal,started:row.started,ended:row.ended,
 history:answers.map((choice,i)=>{const q=questions[deck[i]];return {stage:q.stage,choice:q.choices[choice],solution:q.choices[q.key],ok:choice===q.key,why:q.why,prompt:q.prompt};}),
 next:next?{prompt:next.prompt,choices:next.choices,topic:next.topic,stage:next.stage,level:next.level,points:next.points}:null};
}
export async function missionApi(req,db){
 try{
 const path=new URL(req.url).pathname.slice(5);
 if(path==="board" && req.method==="GET"){
 const total=await db.prepare("SELECT COUNT(DISTINCT student) AS n FROM flights").first();
 const best="WITH ranked AS (SELECT *, ROW_NUMBER() OVER(PARTITION BY student ORDER BY score DESC, ended ASC) AS pos FROM flights WHERE status='finished'), best AS (SELECT * FROM ranked WHERE pos=1)";
 const stats=await db.prepare(best+" SELECT COUNT(*) AS finished, ROUND(AVG(score),1) AS average, MIN(score) AS low, MAX(score) AS high FROM best").first();
 const rows=await db.prepare(best+" SELECT nick,score,seconds,RANK() OVER(ORDER BY score DESC) AS rank FROM best ORDER BY score DESC, ended ASC LIMIT 50").all();
 return json({players:total.n,...stats,rows:rows.results});
 }
 if(req.method!=="POST") throw fail("ไม่พบคำสั่งนี้",404);
 const origin=req.headers.get("origin"); if(origin && origin!==new URL(req.url).origin)throw fail("กรุณาเปิดเกมจากเว็บไซต์หลัก",403);
 const token=req.headers.get("authorization")?.replace(/^Bearer /,"");
 if(!/^[a-f0-9-]{36}$/i.test(token||""))throw fail("กรุณาเริ่มภารกิจใหม่",401);
 const body=await req.json().catch(()=>{throw fail("ข้อมูลไม่สมบูรณ์",400)});
 const fetchRow=()=>db.prepare("SELECT * FROM flights WHERE token=?").bind(token).first();
 if(path==="start"){
 const fields=["student","fullName","team","nick"].map((k,i)=>clean(body[k],[40,100,60,32][i]));
 if(fields.some(v=>!v))throw fail("กรุณากรอกข้อมูลผู้เล่นให้ครบตามความยาวที่กำหนด",400);
 await db.prepare("INSERT INTO flights(token,student,full_name,team,nick,started,deck) VALUES(?,?,?,?,?,?,?) ON CONFLICT(token) DO NOTHING").bind(token,...fields,Date.now(),JSON.stringify(drawDeck())).run();
 }
 const row=await fetchRow();if(!row)throw fail("ไม่พบเที่ยวบินนี้ กรุณาเริ่มเกมใหม่",404);
 if(["start","state"].includes(path))return json(view(row));
 const seconds=Math.min(Math.floor((Date.now()-row.started)/1000), Math.max(0,Math.floor(Number(body.seconds)||0)));
 if(path==="time"){await db.prepare("UPDATE flights SET seconds=MAX(seconds,?) WHERE token=? AND status='playing'").bind(seconds,token).run();return json({ok:true});}
 if(path!=="answer")throw fail("ไม่พบคำสั่งนี้",404);
 const answers=JSON.parse(row.answers),deck=JSON.parse(row.deck),idx=body.index;
 if(!Number.isInteger(idx)||idx<0||idx>answers.length)throw fail("กรุณาโหลดความคืบหน้าอีกครั้ง",409);
 if(idx<answers.length)return json(view(row));
 const q=questions[deck[idx]],choice=body.choice;
 if(!q||!Number.isInteger(choice)||choice<0||choice>=q.choices.length)throw fail("กรุณาเลือกหนึ่งคำตอบ",400);
 const correct=row.correct+Number(q.key===choice);
 answers.push(choice); const count=answers.length,done=count===deck.length;
 const medal=done?(correct>=10?"ผู้เชี่ยวชาญวงโคจร":correct>=8?"นักสำรวจอวกาศ":"นักบินฝึกหัด"):null;
 await db.prepare("UPDATE flights SET answers=?,correct=?,wrong=?,score=?,stages=?,ended=?,seconds=MAX(seconds,?),medal=?,status=? WHERE token=? AND answers=?").bind(JSON.stringify(answers),correct,count-correct,correct*10,Math.floor(count/4),done?Date.now():null,seconds,medal,done?"finished":"playing",token,row.answers).run();
 return json(view(await fetchRow()));
 }catch(e){if(!e.status)console.error("Mission API failure",e.name);return json({error:e.status?e.message:"ติดต่อฐานข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง"},e.status||503);}
}