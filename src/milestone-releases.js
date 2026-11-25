// Independent release history for each results stream. No raw private data is copied.
const STREAMS = {
  collective: {
    table: 'responses',
    eligible: "is_public=1 AND (public_id IS NULL OR public_id <> 'author-answer-1')",

    aggregate: ['q2','q3','q4'].map(k=>`'${k}',json((SELECT json_group_object(choice,n) FROM (SELECT ${k} AS choice,COUNT(*) AS n FROM eligible WHERE ${k} IS NOT NULL GROUP BY ${k})))`).join(','),

  },
  hypothetical: {
    table: 'hypothetical_preferences',
    eligible: "aggregate_consent=1 AND json_type(answers_json,'$.scope')='text' AND json_type(answers_json,'$.motivation')='array'",

    aggregate: ` 'scope',json((SELECT json_group_object(choice,n) FROM (SELECT json_extract(answers_json,'$.scope') AS choice,COUNT(*) AS n FROM eligible GROUP BY choice))), 'motivation',json((SELECT json_group_object(choice,n) FROM (SELECT j.value AS choice,COUNT(*) AS n FROM eligible,json_each(eligible.answers_json,'$.motivation') j WHERE j.type='text' GROUP BY j.value))), 'languages',json((SELECT json_group_object(language,n) FROM (SELECT language,COUNT(*) AS n FROM eligible GROUP BY language)))`,

  },
};
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
    await db.prepare(`WITH eligible AS (SELECT * FROM ${c.table} WHERE ${c.eligible}), summary AS (SELECT COUNT(*)+1 AS total,${stream==='hypothetical'?"(SELECT COALESCE(MAX(id),0) FROM hypothetical_preferences WHERE public_consent=1)":"COALESCE(MAX(id),0)"} AS upper_id FROM eligible)
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
// This release format deliberately excludes all individual answers and identifiers.
// The author's choices are part of the published questionnaire, not a database row.
// Keep these version-one values stable for previously released snapshots.
const AUTHOR_V1={
  collective:{q2:['3'],q3:['2'],q4:['5']},
  hypothetical:{scope:['trust_conditions'],motivation:['reality','similarity','contribute','other'],languages:['ru']}
};
const CHOICES={
  collective:{q2:['0','1','2','3','4','5','6'],q3:['0','1','2','3','4'],q4:['0','1','2','3','4','5','6']},
  hypothetical:{scope:['none','preapproved','veto','trust_conditions','unlimited','other'],motivation:['desires','reality','hope','similarity','understanding','contribute','curiosity','other','none'],languages:['en','ru','es','pt','zh','de','ja','fr','ar']}
};
export function aggregateCounts(stream,release){
  config(stream);
  const counts=countsOf(release),out={};
  for(const [question,choices] of Object.entries(CHOICES[stream])){
    out[question]={};
    for(const choice of choices){
      const n=Number(counts[question]?.[choice]||0);
      out[question][choice]=(Number.isSafeInteger(n)&&n>=0?n:0)+(AUTHOR_V1[stream][question].includes(choice)?1:0);
    }
  }
  return out;
}
export async function listReleases(db,stream){
  config(stream);
  const rows=await db.prepare('SELECT threshold,total,published_at FROM results_releases WHERE stream=? ORDER BY threshold DESC').bind(stream).all();
  return rows.results.map(r=>({threshold:r.threshold,total:r.total,publishedAt:r.published_at}));
}
export async function exportAggregate(db,stream,threshold){
  config(stream);
  if(!Number.isSafeInteger(threshold)||threshold<100)return null;
  const release=await db.prepare('SELECT threshold,total,published_at,counts_json FROM results_releases WHERE stream=? AND threshold=?').bind(stream,threshold).first();
  if(!release)return null;
  const lines=['\ufeff'+csvLine(['source','stream','threshold','total','published_at','question','choice','count'])];
  for(const [question,counts] of Object.entries(aggregateCounts(stream,release))){
    for(const [choice,count] of Object.entries(counts)){
      lines.push(csvLine(['THE HUMAN EXPERIMENT',stream,release.threshold,release.total,release.published_at,question,choice,count]));
    }
  }
  return lines.join('');
}
