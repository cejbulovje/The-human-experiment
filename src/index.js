const CORS_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' };
const THRESHOLD = 100;
const OPTIONS = {
  q2: { en:['Appearance or body','Character or personality','Lifestyle or habits','Everything I consider necessary','I would change nothing','I would let them decide what to change','Other'], ru:['Внешность или тело','Характер или личность','Образ жизни или привычки','Всё, что посчитал бы нужным','Ничего не стал бы менять','Предоставил бы ему самому решать, что менять','Другое'] },
  q3: { en:['Respect their wishes','Try to reach an agreement','Do what I wanted anyway','It would depend on the situation','Other'], ru:['Уважал бы его желания','Попытался бы договориться','Всё равно поступил бы по-своему','Решение зависело бы от ситуации','Другое'] },
  q4: { en:['Leave the person as they are','Help them and improve their life','Change them according to my own ideas','Use them for their own interests','Let the person decide their own fate','Not sure','Other'], ru:['Оставить человека как есть','Помочь ему и улучшить его жизнь','Изменить его в соответствии со своими представлениями','Использовать его в собственных интересах','Предоставить ему возможность самому решать свою судьбу','Затрудняюсь ответить','Другое'] },
  gender: { en:['Man','Woman','Another identity','Prefer not to say'], ru:['Мужчина','Женщина','Другая идентичность','Предпочитаю не отвечать'] }
};
const json = (data,status=200)=>new Response(JSON.stringify(data),{status,headers:CORS_HEADERS});
export async function readJsonLimited(request,maxBytes){
  if(!request.body)return {error:'invalid_json'};
  const reader=request.body.getReader();const chunks=[];let size=0;
  try{
    while(true){
      const {done,value}=await reader.read();if(done)break;
      size+=value.byteLength;
      if(size>maxBytes){await reader.cancel();return {error:'too_large'};}
      chunks.push(value);
    }
  }catch{return {error:'invalid_json'};}
  const bytes=new Uint8Array(size);let offset=0;
  for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  try{return {body:JSON.parse(new TextDecoder().decode(bytes))};}catch{return {error:'invalid_json'};}
}
async function sha256(text){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');}
function validChoice(value,max){return Number.isInteger(value)&&value>=0&&value<max;}
async function verifyTurnstile(token,ip,secret){const body=new URLSearchParams({secret,response:token});if(ip)body.set('remoteip',ip);const result=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:body.toString()});if(!result.ok)return false;const data=await result.json();return data.success===true;}
async function rateLimit(request,env,scope='submit',maxRequests=3){
  const ip=request.headers.get('CF-Connecting-IP')||'unknown';
  const ipHash=await sha256(`${env.RATE_LIMIT_SALT}:${scope}:${ip}`);const now=Math.floor(Date.now()/1000);const cutoff=now-3600;
  const result=await env.DB.prepare(`INSERT INTO rate_limits (ip_hash, window_start, count) VALUES (?, ?, 1)
    ON CONFLICT(ip_hash) DO UPDATE SET
      count = CASE WHEN rate_limits.window_start <= ? THEN 1 ELSE rate_limits.count + 1 END,
      window_start = CASE WHEN rate_limits.window_start <= ? THEN ? ELSE rate_limits.window_start END
    RETURNING count`).bind(ipHash,now,cutoff,cutoff,now).first();
  // Expire old pseudonymous rate-limit keys so they are not retained indefinitely.
  await env.DB.prepare('DELETE FROM rate_limits WHERE window_start < ?').bind(now-86400).run();
  return Number(result?.count||0)<=maxRequests;
}
function validText(value,max){return typeof value==='string'&&value.trim().length>0&&value.trim().length<=max;}
export function parseOtherAnswers(body){
  if(!body||typeof body!=='object')return null;
  const q2Other=typeof body.q2Other==='string'?body.q2Other.trim():'';
  const q3Other=typeof body.q3Other==='string'?body.q3Other.trim():'';
  const q4Other=typeof body.q4Other==='string'?body.q4Other.trim():'';
  if(q2Other.length>500||q3Other.length>500||q4Other.length>500||(body.q2===6&&!validText(q2Other,500))||(body.q3===4&&!validText(q3Other,500))||(body.q4===6&&!validText(q4Other,500))||(body.q2!==6&&q2Other)||(body.q3!==4&&q3Other)||(body.q4!==6&&q4Other))return null;
  return {q2Other:q2Other||null,q3Other:q3Other||null,q4Other:q4Other||null};
}
async function submit(request,env){
  if(!env.DB||!env.TURNSTILE_SECRET_KEY||!env.RATE_LIMIT_SALT)return json({ok:false,error:'not_configured'},503);
  const parsed=await readJsonLimited(request,12000);if(parsed.error)return json({ok:false,error:parsed.error},parsed.error==='too_large'?413:400);const body=parsed.body;
  if(!body||!['en','ru','es','pt','zh','de','ja','fr','ar'].includes(body.language)||!validText(body.freeAnswer,5000)||!validChoice(body.q2,OPTIONS.q2.en.length)||!validChoice(body.q3,OPTIONS.q3.en.length)||!validChoice(body.q4,OPTIONS.q4.en.length))return json({ok:false,error:'invalid_response'},400);
  const otherAnswers=parseOtherAnswers(body);
  if(!otherAnswers)return json({ok:false,error:'invalid_other_answer'},400);
  const {q2Other,q3Other,q4Other}=otherAnswers;
  if(body.authorConfirmed!==true)return json({ok:false,error:'author_confirmation_required'},400);
  const signature=typeof body.signature==='string'?body.signature.trim():'';
  if(signature.length>60)return json({ok:false,error:'invalid_signature'},400);
  if(body.gender!==null&&body.gender!==undefined&&!validChoice(body.gender,OPTIONS.gender.en.length))return json({ok:false,error:'invalid_gender'},400);
  if(typeof body.turnstileToken!=='string'||body.turnstileToken.length>2048)return json({ok:false,error:'captcha_required'},400);
  const ip=request.headers.get('CF-Connecting-IP')||'';
  let captchaOK=false;try{captchaOK=await verifyTurnstile(body.turnstileToken,ip,env.TURNSTILE_SECRET_KEY);}catch{}
  if(!captchaOK)return json({ok:false,error:'captcha_failed'},400);
  let allowed=false;try{allowed=await rateLimit(request,env);}catch{return json({ok:false,error:'rate_limit_unavailable'},503);}
  if(!allowed)return json({ok:false,error:'rate_limited'},429);
  try{
    const publicId=crypto.randomUUID();
    const topic=classifyTopic(body.freeAnswer);
    await env.DB.prepare('INSERT INTO responses (language, free_answer, q2, q3, q4, q2_other, q3_other, q4_other, gender, created_at, public_id, is_public, topic, signature) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)').bind(body.language,body.freeAnswer.trim(),body.q2,body.q3,body.q4,q2Other,q3Other,q4Other,body.gender??null,new Date().toISOString(),publicId,topic,signature||null).run();
    return json({ok:true});
  }catch{return json({ok:false,error:'save_failed'},500);}
}
function classifyTopic(text){
  const value=String(text||'').toLowerCase();
  const groups=[
    ['character',/характер|личност|character|personality|temperament|привычк|habit|поведени|behavio/],
    ['appearance',/внешност|тел[оа]|красот|appearance|body|beauty|look/],
    ['freedom',/свобод|границ|соглас|выбор|freedom|boundary|consent|choice/],
    ['life',/жизн|счаст|здоров|деньг|работ|life|happ|health|money|work/],
    ['relationships',/любов|отношени|семь|друз|love|relationship|family|friend/],
    ['other',/.*/]
  ];
  return (groups.find(([key,re])=>re.test(value))||['other'])[0];
}
async function results(env){
  if(!env.DB)return json({error:'not_configured'},503);
  const totalRow=await env.DB.prepare('SELECT COUNT(*) AS total, MAX(created_at) AS updated_at FROM responses WHERE is_public=1').first();
  const total=Number(totalRow?.total||0);
  if(total<THRESHOLD)return json({unlocked:false,total,threshold:THRESHOLD});
  const getCounts=async(column,question)=>{
    const rows=await env.DB.prepare(`SELECT ${column} AS choice, COUNT(*) AS count FROM responses WHERE is_public=1 AND ${column} IS NOT NULL GROUP BY ${column}`).all();
    const counts=new Map((rows.results||[]).map(row=>[Number(row.choice),Number(row.count)]));
    const en=OPTIONS[question].en;const ru=OPTIONS[question].ru;
    const items=en.map((label,index)=>({label:`${label} / ${ru[index]}`,count:counts.get(index)||0})).filter(item=>item.count>0);
    return {items,answered:items.reduce((sum,item)=>sum+item.count,0)};
  };
  const [q2,q3,q4]=await Promise.all([getCounts('q2','q2'),getCounts('q3','q3'),getCounts('q4','q4')]);
  return json({unlocked:true,total,updatedAt:totalRow?.updated_at||new Date().toISOString(),q2:q2.items,q3:q3.items,q4:q4.items,answered:{q2:q2.answered,q3:q3.answered,q4:q4.answered}});
}
async function publicResponses(request,env){
  if(!env.DB)return json({error:'not_configured'},503);
  const url=new URL(request.url);const rawLimit=url.searchParams.get('limit');const parsedLimit=rawLimit===null||rawLimit===''?12:Number(rawLimit);const limit=Number.isSafeInteger(parsedLimit)?Math.max(1,Math.min(24,parsedLimit)):12;const rawOffset=url.searchParams.get('offset');const parsedOffset=rawOffset===null||rawOffset===''?0:Number(rawOffset);const offset=Number.isSafeInteger(parsedOffset)?Math.max(0,Math.min(1000000,parsedOffset)):0;
  const search=(url.searchParams.get('q')||'').trim().slice(0,160);const topic=(url.searchParams.get('topic')||'').trim();const from=(url.searchParams.get('from')||'').slice(0,10);const to=(url.searchParams.get('to')||'').slice(0,10);const sort=url.searchParams.get('sort')||'newest';
  const clauses=['r.is_public=1'];const binds=[];
  if(search){clauses.push('r.free_answer LIKE ?');binds.push(`%${search.replace(/[\\%_]/g,'')}%`);}
  if(topic&&['character','appearance','freedom','life','relationships','other'].includes(topic)){clauses.push('r.topic=?');binds.push(topic);}
  if(/^\d{4}-\d{2}-\d{2}$/.test(from)){clauses.push('substr(r.created_at,1,10)>=?');binds.push(from);}
  if(/^\d{4}-\d{2}-\d{2}$/.test(to)){clauses.push('substr(r.created_at,1,10)<=?');binds.push(to);}
  const where=clauses.join(' AND ');
  let order='r.created_at DESC';
  if(sort==='random')order='RANDOM()';
  else if(sort==='popular')order='reaction_count DESC, r.created_at DESC';
  else if(sort==='unusual')order='topic_frequency ASC, length(r.free_answer) DESC, r.created_at DESC';
  const count=await env.DB.prepare(`SELECT COUNT(*) AS total FROM responses r WHERE ${where}`).bind(...binds).first();
  const rows=await env.DB.prepare(`SELECT r.id, r.public_id, r.free_answer, r.language, r.topic, r.created_at, r.q2, r.q3, r.q4, r.q2_other, r.q3_other, r.q4_other, r.signature,
    (SELECT COUNT(*) FROM response_reactions rr WHERE rr.response_id=r.id AND rr.reaction='interesting') AS reaction_count,
    (SELECT COUNT(*) FROM responses r2 WHERE r2.is_public=1 AND r2.topic=r.topic) AS topic_frequency
    FROM responses r WHERE ${where} ORDER BY ${order} LIMIT ? OFFSET ?`).bind(...binds,limit,offset).all();
  const topics={character:'Character & habits',appearance:'Appearance',freedom:'Freedom & boundaries',life:'Life & wellbeing',relationships:'Relationships',other:'Other'};
  const items = (rows.results || []).map((row) => ({
    id: row.public_id || `legacy-${row.id}`,
    answer: row.free_answer,
    signature: row.signature || null,
    language: row.language,
    topic: row.topic || 'other',
    topicLabel: topics[row.topic] || topics.other,
    date: row.created_at,
    publicCode: String(row.public_id || row.id).slice(0, 8).toUpperCase(),
    reactionCount: Number(row.reaction_count || 0),
    context: {
      q2: `${OPTIONS.q2.en[row.q2] || ''} / ${OPTIONS.q2.ru[row.q2] || ''}`,
      q3: `${OPTIONS.q3.en[row.q3] || ''} / ${OPTIONS.q3.ru[row.q3] || ''}`,
      q4: `${OPTIONS.q4.en[row.q4] || ''} / ${OPTIONS.q4.ru[row.q4] || ''}`,
      q2Other: row.q2_other || '',
      q3Other: row.q3_other || '',
      q4Other: row.q4_other || ''
    }
  }));
  return json({items,total:Number(count?.total||0),limit,offset,hasMore:offset+items.length<Number(count?.total||0)});
}
async function suggestTopic(request,env){
  if(!env.DB||!env.RATE_LIMIT_SALT)return json({error:'not_configured'},503);
  const parsed=await readJsonLimited(request,2048);if(parsed.error)return json({error:parsed.error},parsed.error==='too_large'?413:400);const body=parsed.body;
  const allowedTopics=['character','appearance','freedom','life','relationships','other'];
  if(typeof body?.id!=='string'||body.id.length>80||!allowedTopics.includes(body.topic)||typeof body.voterToken!=='string'||body.voterToken.length<16||body.voterToken.length>128)return json({error:'invalid_suggestion'},400);
  let allowed=false;try{allowed=await rateLimit(request,env,'topic-suggestion',30);}catch{return json({error:'rate_limit_unavailable'},503);}
  if(!allowed)return json({error:'rate_limited'},429);
  const row=await env.DB.prepare('SELECT id FROM responses WHERE public_id=? AND is_public=1').bind(body.id).first();if(!row)return json({error:'not_found'},404);
  const voterHash=await sha256(`${env.RATE_LIMIT_SALT}:${body.voterToken}`);
  try{await env.DB.prepare('INSERT INTO topic_suggestions (response_id,suggested_topic,voter_hash,created_at) VALUES (?, ?, ?, ?)').bind(row.id,body.topic,voterHash,new Date().toISOString()).run();}
  catch{return json({error:'already_suggested'},409);}
  return json({ok:true});
}
async function react(request,env){
  if(!env.DB||!env.RATE_LIMIT_SALT)return json({error:'not_configured'},503);
  const parsed=await readJsonLimited(request,2048);if(parsed.error)return json({error:parsed.error},parsed.error==='too_large'?413:400);const body=parsed.body;
  if(typeof body?.id!=='string'||body.id.length>80||body.reaction!=='interesting'||typeof body.voterToken!=='string'||body.voterToken.length<16||body.voterToken.length>128)return json({error:'invalid_reaction'},400);
  let allowed=false;try{allowed=await rateLimit(request,env,'reaction',60);}catch{return json({error:'rate_limit_unavailable'},503);}
  if(!allowed)return json({error:'rate_limited'},429);
  const row=await env.DB.prepare('SELECT id FROM responses WHERE public_id=? AND is_public=1').bind(body.id).first();if(!row)return json({error:'not_found'},404);
  const voterHash=await sha256(`${env.RATE_LIMIT_SALT}:${body.voterToken}`);
  try{await env.DB.prepare('INSERT INTO response_reactions (response_id,reaction,voter_hash,created_at) VALUES (?, ?, ?, ?)').bind(row.id,body.reaction,voterHash,new Date().toISOString()).run();}
  catch{return json({error:'already_reacted'},409);}
  const result=await env.DB.prepare("SELECT COUNT(*) AS count FROM response_reactions WHERE response_id=? AND reaction='interesting'").bind(row.id).first();
  return json({ok:true,count:Number(result?.count||0)});
}

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname==='/api/submit'&&request.method==='POST')return submit(request,env);
    if(url.pathname==='/api/results'&&request.method==='GET'){
      try{return await results(env);}catch{return json({error:'results_unavailable'},503);}
    }
    if(url.pathname==='/api/public-responses'&&request.method==='GET'){
      try{return await publicResponses(request,env);}catch{return json({error:'responses_unavailable'},503);}
    }
    if(url.pathname==='/api/reaction'&&request.method==='POST'){
      try{return await react(request,env);}catch{return json({error:'reaction_unavailable'},503);}
    }
    if(url.pathname==='/api/topic-suggestion'&&request.method==='POST'){
      try{return await suggestTopic(request,env);}catch{return json({error:'topic_suggestion_unavailable'},503);}
    }
    if(url.pathname.startsWith('/api/'))return json({error:'not_found'},404);
    return env.ASSETS.fetch(request);
  }
};
