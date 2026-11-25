(()=>{
const milestoneNoticeWords = {
  "en": [
    "When are results published?",
    "Statistics open and update at these milestones, continuing in the same pattern.",
    "Valid responses now",
    "Next milestone",
    "Remaining"
  ],
  "ru": [
    "Когда публикуются результаты?",
    "Статистика открывается и обновляется при достижении этих порогов, далее - по тому же принципу.",
    "Действительных ответов сейчас",
    "Следующий порог",
    "Осталось"
  ],
  "es": [
    "¿Cuándo se publican los resultados?",
    "Las estadísticas se abren y actualizan al alcanzar estos umbrales; el patrón continúa.",
    "Respuestas válidas actuales",
    "Próximo umbral",
    "Faltan"
  ],
  "pt": [
    "Quando os resultados são publicados?",
    "As estatísticas são liberadas e atualizadas nestes marcos; o padrão continua.",
    "Respostas válidas atuais",
    "Próximo marco",
    "Faltam"
  ],
  "zh": [
    "何时公布结果？",
    "统计结果在达到以下里程碑时公开和更新，之后按相同规律继续。",
    "当前有效回答",
    "下一个里程碑",
    "还差"
  ],
  "de": [
    "Wann werden Ergebnisse veröffentlicht?",
    "Die Statistik wird bei diesen Schwellenwerten freigeschaltet und aktualisiert; das Muster setzt sich fort.",
    "Aktuelle gültige Antworten",
    "Nächster Schwellenwert",
    "Noch erforderlich"
  ],
  "ja": [
    "結果はいつ公開されますか？",
    "統計は次の基準に達すると公開・更新され、その後も同じ規則が続きます。",
    "現在の有効回答数",
    "次の基準",
    "残り"
  ],
  "fr": [
    "Quand les résultats sont-ils publiés ?",
    "Les statistiques sont ouvertes et mises à jour à ces seuils, puis selon le même schéma.",
    "Réponses valides actuelles",
    "Prochain seuil",
    "Restantes"
  ],
  "ar": [
    "متى تُنشر النتائج؟",
    "تُتاح الإحصاءات وتُحدَّث عند بلوغ هذه الحدود، ثم يستمر النمط نفسه.",
    "الإجابات الصالحة حاليًا",
    "الحد التالي",
    "المتبقي"
  ]
};

const downloadWords={"en":["Download aggregate CSV","No published files yet.","Support the project","Aggregate statistics only; please cite THE HUMAN EXPERIMENT."],"ru":["Скачать статистику CSV","Опубликованных файлов пока нет.","Поддержать проект","Только обобщённая статистика. При использовании указывайте источник THE HUMAN EXPERIMENT."],"es":["Descargar estadísticas CSV","Todavía no hay archivos publicados.","Apoyar el proyecto","Solo estadísticas agregadas; cita THE HUMAN EXPERIMENT."],"pt":["Descarregar estatísticas CSV","Ainda não há ficheiros publicados.","Apoiar o projeto","Apenas estatísticas agregadas; cite THE HUMAN EXPERIMENT."],"zh":["下载汇总统计 CSV","尚无已发布的文件。","支持项目","仅含汇总统计；请注明来源 THE HUMAN EXPERIMENT。"],"de":["Statistik als CSV herunterladen","Noch keine veröffentlichten Dateien.","Projekt unterstützen","Nur aggregierte Statistik; bitte THE HUMAN EXPERIMENT als Quelle nennen."],"ja":["集計統計 CSV をダウンロード","公開済みファイルはまだありません。","プロジェクトを支援","集計統計のみ。出典 THE HUMAN EXPERIMENT を明記してください。"],"fr":["Télécharger les statistiques CSV","Aucun fichier publié pour le moment.","Soutenir le projet","Statistiques agrégées uniquement ; citez THE HUMAN EXPERIMENT."],"ar":["تنزيل الإحصاءات المجمعة CSV","لا توجد ملفات منشورة بعد.","دعم المشروع","إحصاءات مجمعة فقط؛ يُرجى ذكر المصدر THE HUMAN EXPERIMENT."]};
const answerWords={"en":["Download participant answers","Part","Downloaded copies cannot be recalled. Older answers without the updated notice are not included."],"ru":["Скачать ответы участников","Часть","Скачанные копии невозможно отозвать. Старые ответы без обновлённого уведомления не включены."],"es":["Descargar respuestas de participantes","Parte","Las copias descargadas no se pueden recuperar. No se incluyen respuestas anteriores al aviso actualizado."],"pt":["Descarregar respostas dos participantes","Parte","As cópias descarregadas não podem ser recolhidas. Respostas anteriores ao aviso atualizado não são incluídas."],"zh":["下载参与者回答","分卷","已下载的副本无法撤回。更新通知前的回答不包括在内。"],"de":["Teilnehmendenantworten herunterladen","Teil","Heruntergeladene Kopien können nicht zurückgerufen werden. Antworten vor dem aktualisierten Hinweis sind nicht enthalten."],"ja":["参加者の回答をダウンロード","パート","取得済みのコピーは取り消せません。通知更新前の回答は含まれません。"],"fr":["Télécharger les réponses des participants","Partie","Les copies téléchargées ne peuvent pas être rappelées. Les réponses antérieures à l’avis actualisé ne sont pas incluses."],"ar":["تنزيل إجابات المشاركين","الجزء","لا يمكن استرداد النسخ المنزّلة. لا تُدرج الإجابات السابقة للإشعار المحدّث."]};
window.renderResultsReleaseNotice=function(section,stream,data){
 if(!section)return;
 let panel=section.querySelector('[data-release-panel]');
 if((['localhost','127.0.0.1','[::1]'].includes(location.hostname)&&new URLSearchParams(location.search).get('demo')==='101')||!data||typeof data.unlocked!=='boolean'||(stream==='hypothetical'&&!Array.isArray(data.releases))){if(panel)panel.hidden=true;return;}
 const live=Number(data.liveTotal??data.total),next=Number(data.nextThreshold??data.threshold);
 if(!Number.isSafeInteger(live)||live<0||!Number.isSafeInteger(next)||next<100){if(panel)panel.hidden=true;return;}
 if(!panel){panel=document.createElement('div');panel.dataset.releasePanel=stream;panel.className='status-panel';const anchor=section.querySelector('.results-stat-card')||section.querySelector('#hypothetical-stats');if(anchor)anchor.after(panel);else section.prepend(panel);}
 const lang=document.documentElement.lang||'en',w=milestoneNoticeWords[lang]||milestoneNoticeWords.en,d=downloadWords[lang]||downloadWords.en,f=n=>Number(n).toLocaleString(lang);
 const node=(tag,value)=>{const el=document.createElement(tag);el.textContent=value;return el;};
 const scale=node('p',[100,200,500,1000,2000,5000,10000].map(f).join(' → ')+' → …');scale.dir='ltr';
 const progress=node('p',w[2]+': '+f(live)+' · '+w[3]+': '+f(next)+' · '+w[4]+': '+f(Math.max(0,next-live)));progress.setAttribute('role','status');
 panel.replaceChildren(node('strong',w[0]),node('p',w[1]),scale,progress);
 if(Array.isArray(data.releases)){
   panel.append(node('strong',d[0]));
   if(!data.releases.length)panel.append(node('p',d[1]));
   else{const list=document.createElement('ul');for(const r of data.releases){if(!Number.isSafeInteger(r.threshold)||r.threshold<100)continue;const item=document.createElement('li');const link=node('a','CSV · '+f(r.threshold)+' · '+new Date(r.publishedAt).toLocaleDateString(lang));link.href='/api/results/export?stream='+stream+'&threshold='+r.threshold;link.setAttribute('download','');item.append(link);
   if(Number.isSafeInteger(r.firstAnswerPart)&&Number.isSafeInteger(r.lastAnswerPart)&&r.firstAnswerPart>=1&&r.lastAnswerPart>=r.firstAnswerPart){
     const a=answerWords[lang]||answerWords.en;const area=document.createElement('div');const answers=node('a',a[0]);answers.setAttribute('download','');const label=node('label',a[1]+' ');const part=document.createElement('input');part.type='number';part.min=String(r.firstAnswerPart);part.max=String(r.lastAnswerPart);part.step='1';part.value=part.min;part.style.width='7em';const update=()=>{const n=Number(part.value);if(Number.isSafeInteger(n)&&n>=r.firstAnswerPart&&n<=r.lastAnswerPart)answers.href='/api/results/export?kind=answers&stream='+stream+'&threshold='+r.threshold+'&part='+n;else answers.removeAttribute('href');};part.addEventListener('input',update);label.append(part);area.append(answers,document.createTextNode(' · '),label,document.createTextNode(' / '+f(r.lastAnswerPart)));update();item.append(area,node('p',a[2]));
   }
   list.append(item);}panel.append(list,node('p',d[3]));}
   const support=node('a',d[2]);support.href='/support.html';panel.append(support);
 }
 panel.hidden=false;
};
})();
