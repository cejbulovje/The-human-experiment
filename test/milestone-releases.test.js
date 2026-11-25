import worker from '../src/index.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { highestMilestone,nextMilestone,releaseState,countsOf,listReleases,exportAggregate,aggregateCounts,csvCell } from '../src/milestone-releases.js';
const schema=readFileSync(new URL('../db/migrations/0016_results_releases.sql',import.meta.url),'utf8');
function fixture(){
  const raw=new DatabaseSync(':memory:');raw.exec(`CREATE TABLE responses(id INTEGER PRIMARY KEY AUTOINCREMENT,public_id TEXT,is_public INTEGER,language TEXT,free_answer TEXT,q2 INTEGER,q3 INTEGER,q4 INTEGER,q2_other TEXT,q3_other TEXT,q4_other TEXT,participant_id TEXT,signature TEXT); CREATE TABLE hypothetical_preferences(id INTEGER PRIMARY KEY AUTOINCREMENT,aggregate_consent INTEGER,public_consent INTEGER,language TEXT,answers_json TEXT,comment TEXT,delete_token_hash TEXT); ${schema}`);
  const db={prepare(sql){let params=[];return{bind(...p){params=p;return this;},first:async()=>raw.prepare(sql).get(...params),all:async()=>({results:raw.prepare(sql).all(...params)}),run:async()=>raw.prepare(sql).run(...params)}}};
  const add=(n=1,pub=1)=>{for(let i=0;i<n;i++)raw.prepare('INSERT INTO responses(public_id,is_public,language,free_answer,q2,q3,q4,participant_id,signature) VALUES(NULL,?,?,?,?,?,?,?,?)').run(pub,'ru',`text, "${i}"`,3,2,5,'PRIVATE_UUID','PRIVATE_SIGNATURE');};
  const personal=(n=1,agg=1,pub=1)=>{for(let i=0;i<n;i++)raw.prepare('INSERT INTO hypothetical_preferences(aggregate_consent,public_consent,language,answers_json,comment,delete_token_hash) VALUES(?,?,?,?,?,?)').run(agg,pub,'ru',JSON.stringify({scope:'none',motivation:['hope','curiosity']}),`personal ${i}`,'SECRET_TOKEN');};
  return {raw,db,add,personal};
}
test('milestone sequence includes 200 and 2 million',()=>{assert.deepEqual([0,99,100,199,200,499,500,1000000,1999999,2000000,5000000].map(highestMilestone),[0,0,100,100,200,200,500,1000000,1000000,2000000,5000000]);assert.equal(nextMilestone(1000000),2000000);});
test('collective: published aggregate includes author once and stays frozen',async()=>{
  const {raw,db,add}=fixture();add(98);add(4,0);
  raw.exec("INSERT INTO responses(public_id,is_public,q2,q3,q4) VALUES('author-answer-1',1,3,2,5)");
  let s=await releaseState(db,'collective');assert.equal(s.unlocked,false);assert.equal(s.remaining,1);
  assert.equal(await exportAggregate(db,'collective',100),null);
  add();s=await releaseState(db,'collective');assert.equal(s.total,100);
  assert.equal(countsOf(s.release).q2['3'],99);
  assert.equal(aggregateCounts('collective',s.release).q2['3'],100);
  const before=await exportAggregate(db,'collective',100);
  assert.match(before,/"THE HUMAN EXPERIMENT","collective","100","100"/);
  assert.match(before,/"q2","3","100"/);
  assert.doesNotMatch(before,/PRIVATE_UUID|PRIVATE_SIGNATURE|participant_id|free_answer|text,/);
  add(100);s=await releaseState(db,'collective');assert.equal(s.publishedThreshold,200);
  add();s=await releaseState(db,'collective');assert.equal(s.total,200);assert.equal(s.liveTotal,201);assert.equal(s.remaining,299);
  assert.deepEqual((await listReleases(db,'collective')).map(r=>r.threshold),[200,100]);
  raw.exec('DELETE FROM responses WHERE id=1');
  assert.equal(await exportAggregate(db,'collective',100),before);
});
test('personal: independent threshold, aggregate consent, no individual data',async()=>{
  const {db,personal}=fixture();personal(98);personal(1,1,0);personal(10,0,1);
  const s=await releaseState(db,'hypothetical');assert.equal(s.total,100);
  const counts=aggregateCounts('hypothetical',s.release);
  assert.equal(counts.scope.none,99);assert.equal(counts.scope.trust_conditions,1);
  assert.equal(counts.motivation.hope,99);assert.equal(counts.motivation.reality,1);
  assert.equal(counts.languages.ru,100);
  assert.equal((await releaseState(db,'collective')).unlocked,false);
  const csv=await exportAggregate(db,'hypothetical',100);
  assert.match(csv,/"motivation","hope","99"/);
  assert.doesNotMatch(csv,/SECRET_TOKEN|delete_token_hash|personal 0|comment|answers_json/);
  personal(1);assert.equal((await releaseState(db,'hypothetical')).total,100);
  assert.equal(await exportAggregate(db,'hypothetical',100),csv);
});
test('safe CSV quoting and unpublished threshold',async()=>{
  const {db,add}=fixture();add(999);await releaseState(db,'collective');
  assert.equal(await exportAggregate(db,'collective',2000),null);
  assert.equal(csvCell(' =1+2'),'"\' =1+2"');assert.equal(csvCell('a,"b"'),'"a,""b"""');assert.equal(csvCell('\tfoo'),'"\'\tfoo"');
});

test('worker exposes frozen releases in both results APIs and only aggregate CSV',async()=>{
 const {db,add,personal}=fixture();
 const request=path=>worker.fetch(new Request('https://example.test'+path),{DB:db});
 let r=await request('/api/results');let data=await r.json();assert.equal(data.unlocked,false);assert.deepEqual(data.releases,[]);
 r=await request('/api/results/export?stream=collective&threshold=100');assert.equal(r.status,404);
 add(99);personal(99);r=await request('/api/results');data=await r.json();assert.equal(data.total,100);assert.equal(data.q2.find(x=>x.count===100).count,100);
 r=await request('/api/preferences/stats');data=(await r.json()).stats;assert.equal(data.total,100);assert.equal(data.questions.scope.none,99);
 add();personal();r=await request('/api/preferences/stats');data=(await r.json()).stats;assert.equal(data.total,100);assert.equal(data.liveTotal,101);assert.equal(data.nextThreshold,200);
 for(const stream of ['collective','hypothetical']){
   r=await request('/api/results/export?stream='+stream+'&threshold=100');assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/text\/csv/);assert.doesNotMatch(await r.text(),/PRIVATE_UUID|SECRET_TOKEN|free_answer|comment/);
 }
 r=await request('/api/results/export?stream=invalid&threshold=100');assert.equal(r.status,400);
});
