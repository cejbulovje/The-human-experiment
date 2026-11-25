import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker from '../src/index.js';

const sqlFile=name=>readFileSync(new URL('../db/'+name,import.meta.url),'utf8');

test('migration leaves existing texts opted out and preserves historical statistics choices', t=>{
  const db=new DatabaseSync(':memory:');
  t.after(()=>db.close());
  db.exec('CREATE TABLE responses(id INTEGER); INSERT INTO responses VALUES(1); CREATE TABLE hypothetical_preferences(aggregate_consent INTEGER); INSERT INTO hypothetical_preferences VALUES(0),(1)');
  db.exec(sqlFile('migrations/0018_ai_text_consent.sql'));
  assert.equal(db.prepare('SELECT ai_text_consent FROM responses').get().ai_text_consent,0);
  assert.deepEqual(db.prepare('SELECT * FROM hypothetical_preferences').all().map(Object.values),[[0,0],[1,0]]);
});

for(const personal of [false,true]){
  const stream=personal?'hypothetical':'collective';
  test(stream+' counts choices automatically and sends only opted-in written fields to AI',async t=>{
    const db=new DatabaseSync(':memory:');
    t.after(()=>db.close());
    db.exec(sqlFile('schema.sql'));
    db.exec(sqlFile('migrations/0017_public_answer_export_notice.sql'));
    const prompts=[];
    const env={
      DB:{prepare(sql){
        const statement=db.prepare(sql);
        let params=[];
        return {
          bind(...values){params=values;return this;},
          first(){return statement.get(...params);},
          run(){return {meta:statement.run(...params)};},
          all(){return {results:statement.all(...params)};}
        };
      }},
      AI:{run(model,{messages}){
        prompts.push(messages.at(-1).content);
        return {response:'Synthetic summary '+prompts.length};
      }},
      PREFERENCES_ENABLED:'true',RATE_LIMIT_SALT:'test',TURNSTILE_SECRET_KEY:'test'
    };
    t.mock.method(globalThis,'fetch',async()=>Response.json({success:true}));
    let visitor=0;
    const post=(path,body)=>worker.fetch(new Request('https://example.test/api/'+path,{
      method:'POST',headers:{'CF-Connecting-IP':'192.0.2.'+(++visitor)},body:JSON.stringify(body)
    }),env);
    const submit=(text,consent,key=crypto.randomUUID())=>{
      const common={language:'en',turnstileToken:'test',exportNoticeVersion:1,aiTextConsent:consent};
      return personal?post('preferences',{...common,submissionKey:key,comment:text,answers:{scope:'trust_conditions',motivation:['curiosity']},aggregateConsent:true,publicConsent:true,consentToStore:true})
        :post('submit',{...common,participantId:key,freeAnswer:text,q2:6,q2Other:'Other text '+text,q3:1,q4:1,authorConfirmed:true,signature:'Private signature'});
    };
    const analyze=()=>post('ai-analysis',{stream,question:'What themes are expressed?'});
    for(const consent of [undefined,false])assert.equal((await submit('Excluded written response.',consent)).status,200);
    assert.equal((await submit('Invalid consent response.','true')).status,400);
    assert.equal((await analyze()).status,409);
    assert.equal(prompts.length,0);
    const key=crypto.randomUUID();
    const saved=await submit('Included written response.',true,key);
    assert.equal(saved.status,200);
    const {deletionToken}=await saved.json();
    if(personal){
      const retry=await submit('Included written response.',false,key);
      assert.equal(retry.status,409);
      assert.equal((await retry.json()).error,'submission_changed');
    }
    const stats=await worker.fetch(new Request('https://example.test/api/'+(personal?'preferences/stats':'results')),env);
    const data=await stats.json();
    assert.equal(personal?data.stats.total:data.total,4); // Three participants and the author.
    const result=await analyze();
    assert.equal(result.status,200);
    assert.equal((await result.json()).analyzedResponses,1);
    assert.equal(prompts.length,2);
    const batch=JSON.parse(prompts[0].split('\nNEW RESPONSES:\n').at(-1));
    assert.deepEqual(batch,personal?[{comment:'Included written response.'}]:[{
      free_answer:'Included written response.',q2_other:'Other text Included written response.',q3_other:null,q4_other:null
    }]);
    if(personal){
      assert.equal((await post('preferences/delete',{deletionToken})).status,200);
      assert.equal((await analyze()).status,409);
      assert.equal(prompts.length,2);
      assert.equal((await submit('Replacement written response.',true)).status,200);
      assert.equal((await analyze()).status,200);
      assert.match(prompts[2],/Replacement written response/);
      assert.doesNotMatch(prompts[2],/Synthetic summary 1|Included written response/);
    }
  });
}
