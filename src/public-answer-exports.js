// Export only public participant responses submitted after the explicit download notice.
// No technical identifiers, dates, signatures, gender, contact fields or deletion tokens.
import {csvCell} from './milestone-releases.js';
const PART_SIZE=200;
const STREAMS={
 collective:{table:'responses',where:"is_public=1 AND (public_id IS NULL OR public_id <> 'author-answer-1') AND export_notice_version=1",fields:['language','free_answer','q2','q3','q4','q2_other','q3_other','q4_other']},
 hypothetical:{table:'hypothetical_preferences',where:"public_consent=1 AND export_notice_version=1",fields:['language','comment','answers_json']}
};
const config=stream=>Object.hasOwn(STREAMS,stream)?STREAMS[stream]:null;
export async function answerExportReady(db,stream){
 const c=config(stream);if(!c||!db)return false;
 try{const result=await db.prepare('PRAGMA table_info('+c.table+')').all();return result.results.some(row=>row.name==='export_notice_version');}catch{return false;}
}
export async function answerReleaseParts(db,stream,releases){
 const c=config(stream);
 if(!releases.length||!await answerExportReady(db,stream))return releases;
 const first=await db.prepare('SELECT MIN(id) AS first_id FROM '+c.table+' WHERE '+c.where).first();
 if(first?.first_id==null)return releases;
 const bounds=await db.prepare('SELECT threshold,upper_id FROM results_releases WHERE stream=?').bind(stream).all();
 const byThreshold=new Map(bounds.results.map(row=>[Number(row.threshold),Number(row.upper_id)]));
 return releases.map(r=>{
   const last=byThreshold.get(Number(r.threshold));
   if(last<Number(first.first_id)||!Number.isSafeInteger(last))return r;
   const firstPart=Math.floor((Number(first.first_id)-1)/PART_SIZE)+1;
   const lastPart=Math.ceil(last/PART_SIZE);
   return {...r,firstAnswerPart:firstPart,lastAnswerPart:lastPart};
 });
}
export async function exportParticipantAnswers(db,stream,threshold,part){
 const c=config(stream);
 if(!c||!Number.isSafeInteger(threshold)||threshold<100||!Number.isSafeInteger(part)||part<1||!await answerExportReady(db,stream))return null;
 const release=await db.prepare('SELECT upper_id FROM results_releases WHERE stream=? AND threshold=?').bind(stream,threshold).first();
 if(!release||part>Math.ceil(Number(release.upper_id)/PART_SIZE))return null;
 const start=(part-1)*PART_SIZE,end=Math.min(part*PART_SIZE,Number(release.upper_id));
 const rows=await db.prepare('SELECT '+c.fields.join(',')+' FROM '+c.table+' WHERE id>? AND id<=? AND ('+c.where+') ORDER BY id ASC').bind(start,end).all();
 // JSON may only contain validated scope/motivation; serialize those keys explicitly.
 const columns=stream==='hypothetical'?['language','comment','scope','motivation']:c.fields;
 const line=values=>values.map(csvCell).join(',')+'\r\n';
 const csv=['\ufeff'+line(['source','stream','threshold',...columns])];
 for(const row of rows.results){
   let values;
   if(stream==='hypothetical'){
     let a;try{a=JSON.parse(row.answers_json);}catch{continue;}
     if(typeof a?.scope!=='string'||!Array.isArray(a.motivation)||!a.motivation.every(v=>typeof v==='string'))continue;
     values=[row.language,row.comment,a.scope,JSON.stringify(a.motivation)];
   }else values=c.fields.map(field=>row[field]);
   csv.push(line(['THE HUMAN EXPERIMENT',stream,threshold,...values]));
 }
 return csv.join('');
}
