import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

class MockD1 {
  constructor(total) {
    this.rows = Array.from({length: total}, (_, i) => ({is_public:1,q2:i%7,q3:i%5,q4:i%7}));
    this.snapshot = null;
    this.writes = 0;
  }
  prepare(sql) {
    let values = [];
    const db = this;
    return {
      bind(...args) { values = args; return this; },
      async first() {
        if (sql.includes('COUNT(*) AS total FROM responses')) return {total: db.rows.filter(r=>r.is_public===1).length};
        if (sql.includes('FROM public_results_snapshot')) return db.snapshot ? {...db.snapshot} : null;
        throw new Error('Unexpected first SQL: '+sql);
      },
      async all() {
        const col = ['q2','q3','q4'].find(c => sql.includes('SELECT '+c+' AS choice'));
        if (!col) throw new Error('Unexpected all SQL: '+sql);
        const counts = new Map();
        for (const row of db.rows) if (row.is_public===1 && row[col]!=null) counts.set(row[col],(counts.get(row[col])||0)+1);
        return {results:[...counts].map(([choice,count])=>({choice,count}))};
      },
      async run() {
        if (!sql.includes('INSERT INTO public_results_snapshot')) throw new Error('Unexpected run SQL: '+sql);
        const [published_threshold,total,updated_at,q2,q3,q4,answered]=values;
        if (!db.snapshot || published_threshold>db.snapshot.published_threshold) {
          db.snapshot={id:1,published_threshold,total,updated_at,q2,q3,q4,answered};
          db.writes++;
        }
        return {success:true};
      }
    };
  }
}
async function fetchResults(db) {
  const response=await worker.fetch(new Request('https://example.test/api/results'),{DB:db});
  return {status:response.status,body:await response.json()};
}
test('statistics stay locked at 98 participant responses plus the author answer',async()=>{
  const db=new MockD1(98); const {status,body}=await fetchResults(db);
  assert.equal(status,200); assert.equal(body.unlocked,false); assert.equal(body.total,99); assert.equal(body.remaining,1); assert.equal(db.writes,0);
});
test('99 participant responses plus the author answer publish one snapshot',async()=>{
  const db=new MockD1(99); const first=await fetchResults(db);
  assert.equal(first.status,200); assert.equal(first.body.unlocked,true); assert.equal(first.body.total,100);
  assert.equal(first.body.publishedThreshold,100); assert.equal(first.body.nextThreshold,200); assert.equal(db.writes,1);
  const q2=JSON.parse(db.snapshot.q2), q3=JSON.parse(db.snapshot.q3), q4=JSON.parse(db.snapshot.q4);
  assert.equal(q2.find(item=>item.label.includes('Everything I consider necessary'))?.count,15);
  assert.equal(q3.find(item=>item.label.includes('Do what I wanted anyway'))?.count,21);
  assert.equal(q4.find(item=>item.label.includes('Not sure'))?.count,15);
  const timestamp=db.snapshot.updated_at; const second=await fetchResults(db);
  assert.equal(second.status,200); assert.equal(second.body.publishedThreshold,100); assert.equal(db.writes,1); assert.equal(db.snapshot.updated_at,timestamp);
});
test('100 participant responses plus the author leave the published snapshot unchanged',async()=>{
  const db=new MockD1(99); await fetchResults(db); const old={...db.snapshot};
  db.rows.push({is_public:1,q2:0,q3:0,q4:0});
  const {status,body}=await fetchResults(db);
  assert.equal(status,200); assert.equal(body.total,100); assert.equal(body.liveTotal,101); assert.equal(body.publishedThreshold,100);
  assert.equal(db.writes,1); assert.deepEqual(db.snapshot,old);
});
test('499 participant responses plus the author refresh the snapshot to threshold 500',async()=>{
  const db=new MockD1(99); await fetchResults(db);
  db.rows.push(...Array.from({length:400},(_,i)=>({is_public:1,q2:i%7,q3:i%5,q4:i%7})));
  const {status,body}=await fetchResults(db);
  assert.equal(status,200); assert.equal(body.total,500); assert.equal(body.liveTotal,500);
  assert.equal(body.publishedThreshold,500); assert.equal(body.nextThreshold,1000); assert.equal(db.writes,2); assert.equal(db.snapshot.total,500);
});
