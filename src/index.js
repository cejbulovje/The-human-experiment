const CORS_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' };
const THRESHOLD = 100;
const OPTIONS = {
  q2: { en:['Appearance or body','Character or personality','Lifestyle or habits','Everything I consider necessary','I would change nothing','I would let them decide what to change','Other'], ru:['Внешность или тело','Характер или личность','Образ жизни или привычки','Всё, что посчитал бы нужным','Ничего не стал бы менять','Предоставил бы ему самому решать, что менять','Другое'] },
  q3: { en:['Respect their wishes','Try to reach an agreement','Do what I wanted anyway','It would depend on the situation','Other'], ru:['Уважал бы его желания','Попытался бы договориться','Всё равно поступил бы по-своему','Решение зависело бы от ситуации','Другое'] },
  q4: { en:['Leave the person as they are','Help them and improve their life','Change them according to my own ideas','Use them for their own interests','Let the person decide their own fate','Not sure','Other'], ru:['Оставить человека как есть','Помочь ему и улучшить его жизнь','Изменить его в соответствии со своими представлениями','Использовать его в собственных интересах','Предоставить ему возможность самому решать свою судьбу','Затрудняюсь ответить','Другое'] },
  gender: { en:['Man','Woman','Another identity','Prefer not to say'], ru:['Мужчина','Женщина','Другая идентичность','Предпочитаю не отвечать'] }
};
const json = (data,status=200)=>new Response(JSON.stringify(data),{status,headers:CORS_HEADERS});
async function sha256(text){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');}
function validChoice(value,max){return Number.isInteger(value)&&value>=0&&value<max;}
async function verifyTurnstile(token,ip,secret){const body=new URLSearchParams({secret,response:token});if(ip)body.set('remoteip',ip);const result=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:body.toString()});if(!result.ok)return false;const data=await result.json();return data.success===true;}
async function rateLimit(request,env){
  const ip=request.headers.get('CF-Connecting-IP')||'unknown';
  const ipHash=await sha256(`${env.RATE_LIMIT_SALT}:${ip}`);const now=Math.floor(Date.now()/1000);const cutoff=now-3600;
  const result=await env.DB.prepare(`INSERT INTO rate_limits (ip_hash, window_start, count) VALUES (?, ?, 1)
    ON CONFLICT(ip_hash) DO UPDATE SET
      count = CASE WHEN rate_limits.window_start <= ? THEN 1 ELSE rate_limits.count + 1 END,
      window_start = CASE WHEN rate_limits.window_start <= ? THEN ? ELSE rate_limits.window_start END
    RETURNING count`).bind(ipHash,now,cutoff,cutoff,now).first();
  // Expire old pseudonymous rate-limit keys so they are not retained indefinitely.
  await env.DB.prepare('DELETE FROM rate_limits WHERE window_start < ?').bind(now-86400).run();
  return Number(result?.count||0)<=3;
}
function validText(value,max){return typeof value==='string'&&value.trim().length>0&&value.trim().length<=max;}
async function submit(request,env){
  if(!env.DB||!env.TURNSTILE_SECRET_KEY||!env.RATE_LIMIT_SALT)return json({ok:false,error:'not_configured'},503);
  const length=Number(request.headers.get('content-length')||0);if(length>12000)return json({ok:false,error:'too_large'},413);
  let body;try{body=await request.json();}catch{return json({ok:false,error:'invalid_json'},400);}
  if(!body||!['en','ru'].includes(body.language)||!validText(body.freeAnswer,5000)||!validChoice(body.q2,OPTIONS.q2.en.length)||!validChoice(body.q3,OPTIONS.q3.en.length)||!validChoice(body.q4,OPTIONS.q4.en.length))return json({ok:false,error:'invalid_response'},400);
  if(body.gender!==null&&body.gender!==undefined&&!validChoice(body.gender,OPTIONS.gender.en.length))return json({ok:false,error:'invalid_gender'},400);
  if(typeof body.turnstileToken!=='string'||body.turnstileToken.length>2048)return json({ok:false,error:'captcha_required'},400);
  const ip=request.headers.get('CF-Connecting-IP')||'';
  let captchaOK=false;try{captchaOK=await verifyTurnstile(body.turnstileToken,ip,env.TURNSTILE_SECRET_KEY);}catch{}
  if(!captchaOK)return json({ok:false,error:'captcha_failed'},400);
  let allowed=false;try{allowed=await rateLimit(request,env);}catch{return json({ok:false,error:'rate_limit_unavailable'},503);}
  if(!allowed)return json({ok:false,error:'rate_limited'},429);
  try{
    await env.DB.prepare(`undefined`).bind(body.language,body.freeAnswer.trim(),body.q2,body.q3,body.q4,body.gender??null,new Date().toISOString()).run();
    return json({ok:true});
  }catch{return json({ok:false,error:'save_failed'},500);}
}
async function results(env){
  if(!env.DB)return json({error:'not_configured'},503);
  const totalRow=await env.DB.prepare('SELECT COUNT(*) AS total, MAX(created_at) AS updated_at FROM responses').first();
  const total=Number(totalRow?.total||0);
  if(total<THRESHOLD)return json({unlocked:false,total,threshold:THRESHOLD});
  const getCounts=async(column,question)=>{
    const rows=await env.DB.prepare(`SELECT ${column} AS choice, COUNT(*) AS count FROM responses WHERE ${column} IS NOT NULL GROUP BY ${column}`).all();
    const counts=new Map((rows.results||[]).map(row=>[Number(row.choice),Number(row.count)]));
    const en=OPTIONS[question].en;const ru=OPTIONS[question].ru;
    return en.map((label,index)=>({label:`${label} / ${ru[index]}`,count:counts.get(index)||0})).filter(item=>item.count>0);
  };
  const [q2,q3,q4]=await Promise.all([getCounts('q2','q2'),getCounts('q3','q3'),getCounts('q4','q4')]);
  return json({unlocked:true,total,updatedAt:totalRow?.updated_at||new Date().toISOString(),q2,q3,q4});
}
export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname==='/api/submit'&&request.method==='POST')return submit(request,env);
    if(url.pathname==='/api/results'&&request.method==='GET'){
      try{return await results(env);}catch{return json({error:'results_unavailable'},503);}
    }
    if(url.pathname.startsWith('/api/'))return json({error:'not_found'},404);
    return env.ASSETS.fetch(request);
  }
};
