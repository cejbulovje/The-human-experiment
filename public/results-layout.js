(() => {
  const labels = {
    en:['Display answers','List','Cards','Previous','Next'],
    ru:['Вид ответов','Строки','Карточки','Предыдущие','Следующие'],
    es:['Vista de respuestas','Lista','Tarjetas','Anterior','Siguiente'],
    pt:['Vista das respostas','Lista','Cartões','Anterior','Seguinte'],
    zh:['答案视图','列表','卡片','上一页','下一页'],
    de:['Antwortansicht','Liste','Karten','Zurück','Weiter'],
    ja:['回答の表示','リスト','カード','前へ','次へ'],
    fr:['Affichage des réponses','Liste','Cartes','Précédent','Suivant'],
    ar:['عرض الإجابات','قائمة','بطاقات','السابق','التالي']
  };
  const picker=document.querySelector('#page-language');
  const words=()=>labels[picker?.value]||labels.en;
  const lists=[...document.querySelectorAll('#answer-list, .hypothetical-answer-list')];
  let layout='list';
  try { if(localStorage.getItem('human-experiment-answer-layout')==='cards') layout='cards'; } catch {}
  const groups=[];
  function updateLayout() {
    const w=words();
    lists.forEach(list=>list.dataset.answerLayout=layout);
    groups.forEach(group=>{
      group.root.setAttribute('aria-label',w[0]);
      [group.list,group.cards].forEach((button,index)=>{
        const label=w[index+1];
        button.setAttribute('aria-label',label); button.title=label;
        button.setAttribute('aria-pressed',String(layout===(index?'cards':'list')));
      });
      group.previous.textContent='← '+w[3];
      group.next.textContent=w[4]+' →';
      if(group.personal) { group.controls[0].textContent='← '+w[3]; group.controls[1].textContent=w[4]+' →'; }
    });
  }
  lists.forEach(list=>{
    const section=list.closest('.public-answers-section');
    const bottom=section?.querySelector('.answer-history-controls');
    if(!bottom) return;
    const controls=[...bottom.querySelectorAll('button')];
    if(controls.length<2) return;
    const toolbar=document.createElement('div'); toolbar.className='answer-display-toolbar';
    const root=document.createElement('div'); root.className='answer-layout-toggle'; root.setAttribute('role','group');
    const listButton=document.createElement('button'); listButton.type='button'; listButton.textContent='☰';
    const cardButton=document.createElement('button'); cardButton.type='button'; cardButton.textContent='▦';
    root.append(listButton,cardButton);
    const pages=document.createElement('div'); pages.className='answer-history-controls answer-history-top';
    const previous=document.createElement('button'); previous.type='button'; previous.className='subtle-button';
    const next=document.createElement('button'); next.type='button'; next.className='subtle-button';
    pages.append(previous,next); toolbar.append(root,pages); list.before(toolbar);
    const sync=()=>{
      previous.hidden=bottom.hidden||controls[0].hidden;
      next.hidden=bottom.hidden||controls[1].hidden;
      previous.disabled=controls[0].disabled; next.disabled=controls[1].disabled;
      pages.hidden=previous.hidden&&next.hidden;
    };
    previous.addEventListener('click',()=>controls[0].click());
    next.addEventListener('click',()=>controls[1].click());
    [listButton,cardButton].forEach((button,index)=>button.addEventListener('click',()=>{
      layout=index?'cards':'list'; try{localStorage.setItem('human-experiment-answer-layout',layout);}catch{}
      updateLayout();
    }));
    new MutationObserver(sync).observe(bottom,{attributes:true,subtree:true,attributeFilter:['hidden','disabled']});
    groups.push({root,list:listButton,cards:cardButton,previous,next,controls,personal:list.classList.contains('hypothetical-answer-list')});
    sync();
  });
  picker?.addEventListener('change',updateLayout);
  document.addEventListener('results-language-changed',updateLayout);
  updateLayout();
})();
