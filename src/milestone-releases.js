// Independent release history for each results stream. No raw private data is copied.
const STREAMS = {
  collective: {
    table: 'responses',
    eligible: "is_public=1 AND (public_id IS NULL OR public_id <> 'author-answer-1')",
    public: "is_public=1 AND (public_id IS NULL OR public_id <> 'author-answer-1')",
    aggregate: ['q2','q3','q4'].map(k=>`'${k}',(SELECT json_group_object(choice,n) FROM (SELECT ${k} AS choice,COUNT(*) AS n FROM eligible WHERE ${k} IS NOT NULL GROUP BY ${k}))`).join(','),
    fields: ['language','free_answer','q2','q3','q4','q2_other','q3_other','q4_other'],
  },
  hypothetical: {
    table: 'hypothetical_preferences',
    eligible: "aggregate_consent=1 AND json_type(answers_json,'$.scope')='text' AND json_type(answers_json,'$.motivation')='array'",
    public: "public_consent=1 AND aggregate_consent=1 AND json_type(answers_json,'$.scope')='text' AND json_type(answers_json,'$.motivation')='array'",
    aggregate: ` 'scope',(SELECT json_group_object(choice,n) FROM (SELECT json_extract(answers_json,'$.scope') AS choice,COUNT(*) AS n FROM eligible GROUP BY choice)), 'motivation',(SELECT json_group_object(choice,n) FROM (SELECT j.value AS choice,COUNT(*) AS n FROM eligible,json_each(eligible.answers_json,'$.motivation') j WHERE j.type='text' GROUP BY j.value)), 'languages',(SELECT json_group_object(language,n) FROM (SELECT language,COUNT(*) AS n FROM eligible GROUP BY language))`,
    fields: ['language','answers_json','comment'],
  },
};
export const PART_SIZE = 500;
export function highestMilestone(total) {
  let best=0;
  for(let base=100;base<=total && Number.isSafeInteger(base*5);base*=10){
    for(const m of [1,2,5]) if(base*m<=total) best=base*m;
  }
  return best;
}
export function nextMilestone(last=0) {
  if(last<100) return 100;
  for(let base=100;Number.isSafeInteger(base*10);base*=10){
    for(const m of [1,2,5]) if(base*m>last) return base*m;
  }
  return null;
}
const config=stream=>{if(!Object.hasOwn(STREAMS,stream))throw new Error('invalid_stream');return STREAMS[stream];};
const latest=(db,stream)=>db.prepare('SELECT threshold,total,upper_id,published_at,counts_json FROM results_releases WHERE stream=? ORDER BY threshold DESC LIMIT 1').bind(stream).first();
export async function releaseState(db,stream) {
  const c=config(stream);
  const count=await db.prepare(`SELECT COUNT(*)+1 AS total FROM ${c.table} WHERE ${c.eligible}`).first();
  const liveTotal=Number(count.total);
  let release=await latest(db,stream);
  const target=highestMilestone(liveTotal);
  if(target>Number(release?.threshold||0)){
    // A single SQL statement takes a consistent snapshot; unique key and guard prevent races.
    await db.prepare(`WITH eligible AS (SELECT * FROM ${c.table} WHERE ${c.eligible}), summary AS (SELECT COUNT(*)+1 AS total,COALESCE(MAX(id),0) AS upper_id FROM eligible)
      INSERT OR IGNORE INTO results_releases(stream,threshold,total,upper_id,published_at,counts_json)
      SELECT ?,?,total,upper_id,strftime('%Y-%m-%dT%H:%M:%fZ','now'),json_object(${c.aggregate}) FROM summary
      WHERE total>=? AND NOT EXISTS (SELECT 1 FROM results_releases WHERE stream=? AND threshold>=?)`).bind(stream,target,target,stream,target).run();
    release=await latest(db,stream);
  }
  const publishedThreshold=Number(release?.threshold||0);
  const nextThreshold=nextMilestone(publishedThreshold);
  return {release,unlocked:!!release,total:release?Number(release.total):liveTotal,liveTotal,publishedThreshold,nextThreshold,threshold:100,remaining:nextThreshold===null?0:Math.max(0,nextThreshold-liveTotal),updatedAt:release?.published_at||null};
}
export function countsOf(release) {return release?JSON.parse(release.counts_json):{};}
// Quote every cell; prefix formulas, including leading whitespace/control characters.
export function csvCell(value){let s=value==null?'':String(value);if(/^[\s\u0000-\u001f\u007f\ufeff]*[=+\-@]/u.test(s)||/^[\t\r\n]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
const csvLine=values=>values.map(csvCell).join(',')+'\r\n';
const partsFor=release=>Math.max(1,Math.ceil(Number(release.upper_id)/PART_SIZE));
export async function listReleases(db,stream){config(stream);await releaseState(db,stream);const rows=await db.prepare('SELECT threshold,total,upper_id,published_at FROM results_releases WHERE stream=? ORDER BY threshold DESC').bind(stream).all();return rows.results.map(r=>({threshold:r.threshold,total:r.total,publishedAt:r.published_at,parts:partsFor(r)}));}
export async function exportPart(db,stream,threshold,part,author){
  const c=config(stream);
  if(!Number.isSafeInteger(threshold)||threshold<100||!Number.isSafeInteger(part)||part<1)return null;
  const release=await db.prepare('SELECT threshold,total,upper_id,published_at FROM results_releases WHERE stream=? AND threshold=?').bind(stream,threshold).first();
  if(!release||part>partsFor(release))return null;
  const start=(part-1)*PART_SIZE,end=Math.min(part*PART_SIZE,Number(release.upper_id));
  // Current public consent is checked again. Deleted/hidden rows are never returned.
  // Internal IDs bound the range but are deliberately excluded from the SELECT output.
  const rows=await db.prepare(`SELECT ${c.fields.join(',')} FROM ${c.table} WHERE id>? AND id<=? AND (${c.public}) ORDER BY id ASC`).bind(start,end).all();
  const lines=['\ufeff'+csvLine(['source',...c.fields])];
  if(part===1&&author)lines.push(csvLine(['author',...c.fields.map(k=>author[k])]));
  for(const r of rows.results)lines.push(csvLine(['participant',...c.fields.map(k=>r[k])]));
  return lines.join('');
}
