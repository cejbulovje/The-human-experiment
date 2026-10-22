(()=> {
  const form=document.getElementById('ai-chat-form');
  const input=document.getElementById('ai-chat-question');
  const messages=document.getElementById('ai-chat-messages');
  const status=document.getElementById('ai-chat-status');
  const send=document.getElementById('ai-chat-send');
  if(!form||!input||!messages||!status||!send)return;
  const languageSelect=document.getElementById('page-language');
  const copy={
    en:{thinking:'Thinking…',failed:'The AI assistant is temporarily unavailable. Please try again later.',setup:'The AI assistant is not configured yet.',limit:'You have reached the request limit. Please try again later.',placeholder:'Ask about the results or discuss the experiment…',you:'You',ai:'AI guide'},
    ru:{thinking:'Обдумываю вопрос…',failed:'ИИ-помощник временно недоступен. Попробуйте позже.',setup:'ИИ-помощник пока не настроен.',limit:'Достигнут лимит запросов. Попробуйте позже.',placeholder:'Спросите о результатах или обсудите эксперимент…',you:'Вы',ai:'ИИ-помощник'},
    es:{thinking:'Pensando…',failed:'El asistente de IA no está disponible temporalmente.',setup:'El asistente de IA aún no está configurado.',limit:'Has alcanzado el límite de solicitudes.',placeholder:'Pregunta sobre los resultados o comenta el experimento…',you:'Tú',ai:'Asistente de IA'},
    pt:{thinking:'Pensando…',failed:'O assistente de IA está temporariamente indisponível.',setup:'O assistente de IA ainda não foi configurado.',limit:'Você atingiu o limite de solicitações.',placeholder:'Pergunte sobre os resultados ou converse sobre o experimento…',you:'Você',ai:'Assistente de IA'},
    zh:{thinking:'正在思考…',failed:'AI 助手暂时不可用。',setup:'AI 助手尚未配置。',limit:'已达到请求限制。',placeholder:'询问结果或讨论这项实验…',you:'你',ai:'AI 助手'},
    de:{thinking:'Denke nach…',failed:'Der KI-Assistent ist vorübergehend nicht verfügbar.',setup:'Der KI-Assistent ist noch nicht eingerichtet.',limit:'Du hast das Anfragelimit erreicht.',placeholder:'Frage nach Ergebnissen oder diskutiere das Experiment…',you:'Du',ai:'KI-Assistent'},
    ja:{thinking:'考えています…',failed:'AI アシスタントは一時的に利用できません。',setup:'AI アシスタントはまだ設定されていません。',limit:'リクエスト上限に達しました。',placeholder:'結果について質問したり、実験について話し合ったりできます…',you:'あなた',ai:'AI アシスタント'},
    fr:{thinking:'Réflexion…',failed:'L’assistant IA est temporairement indisponible.',setup:'L’assistant IA n’est pas encore configuré.',limit:'Vous avez atteint la limite de requêtes.',placeholder:'Posez une question sur les résultats ou discutez de l’expérience…',you:'Vous',ai:'Assistant IA'},
    ar:{thinking:'جارٍ التفكير…',failed:'مساعد الذكاء الاصطناعي غير متاح مؤقتًا.',setup:'لم يتم إعداد مساعد الذكاء الاصطناعي بعد.',limit:'وصلت إلى حد الطلبات.',placeholder:'اسأل عن النتائج أو ناقش التجربة…',you:'أنت',ai:'مساعد الذكاء الاصطناعي'}
  };
  const t=()=>copy[languageSelect?.value]||copy.en;
  input.placeholder=t().placeholder;
  languageSelect?.addEventListener('change',()=>{input.placeholder=t().placeholder;});
  function addMessage(role,text){
    const item=document.createElement('article');
    item.className='ai-chat-message '+(role==='user'?'is-user':'is-assistant');
    const label=document.createElement('strong');
    label.className='ai-chat-speaker';
    label.textContent=role==='user'?t().you:t().ai;
    const body=document.createElement('p');
    body.textContent=text;
    item.append(label,body);
    messages.append(item);
    messages.scrollTop=messages.scrollHeight;
  }
  async function ask(question){
    addMessage('user',question);
    input.value='';
    input.disabled=true;send.disabled=true;status.textContent=t().thinking;
    try{
      const response=await fetch('/api/ai-chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question,language:languageSelect?.value||document.documentElement.lang||'en'})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok){
        if(data.error==='ai_not_configured')throw new Error('setup');
        if(data.error==='rate_limited')throw new Error('limit');
        throw new Error('failed');
      }
      addMessage('assistant',data.answer);
      status.textContent='';
    }catch(error){
      status.textContent=error.message==='setup'?t().setup:error.message==='limit'?t().limit:t().failed;
    }finally{input.disabled=false;send.disabled=false;input.focus();}
  }
  form.addEventListener('submit',event=>{event.preventDefault();const question=input.value.trim();if(question&&question.length<=1200)ask(question);});
  document.querySelectorAll('[data-ai-prompt]').forEach(button=>button.addEventListener('click',()=>{const question=button.getAttribute('data-ai-prompt')||'';if(question&&!send.disabled)ask(question);}));
})();