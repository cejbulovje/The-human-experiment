const translations = {
  en: {
    eyebrow:'AN OPEN THOUGHT EXPERIMENT',title:"What would you do if you could decide another person's fate?",intro1:'Imagine another person voluntarily entrusted you with the right to decide what their future would be.',intro2:'Before you is a person with their own appearance, character, beliefs, and desires. You can leave everything as it is, try to get to know them and understand what they want, change individual traits, or completely shape their personality according to your own vision.',prompt:'What would you do?',q1:'Tell us what you would do',q1help:'Answer in your own words. There are no expected answers.', 'answer-label':'Your answer','answer-placeholder':'I would…','private-note':'Your written answer will not be displayed publicly automatically.','single-choice':'Choose one answer.',q2:'If you could change this person, what would you change first?',q3:"If this person's wishes conflicted with yours, what would you do?",q4:'What do you think most people would want to do in this situation?',optional:'Optional questions about you',gender:'What is your gender?', 'captcha-note':'Complete the anti-bot check to submit your response.',submit:'Submit my answer',privacy:'Please do not include names, contact details, or other information that could identify you or someone else. Your answer is stored for analysis; written answers are not published automatically.','results-eyebrow':'THE COLLECTIVE PICTURE','results-title':'What will people choose?','results-copy':'Aggregate results will open after the first 100 valid responses.','view-results':'View results','privacy-link':'Privacy',
    q2Options:['Appearance or body','Character or personality','Lifestyle or habits','Everything I consider necessary','I would change nothing','I would let them decide what to change','Other'],q3Options:['Respect their wishes','Try to reach an agreement','Do what I wanted anyway','It would depend on the situation','Other'],q4Options:['Leave the person as they are','Help them and improve their life','Change them according to their own ideas','Use them for their own interests','Let the person decide their own fate','Not sure','Other'],genderOptions:['Man','Woman','Another identity','Prefer not to say'],required:'Please answer the three multiple-choice questions.',captchaMissing:'Please complete the anti-bot check.',sending:'Submitting…',success:'Thank you. Your response has been recorded.',failure:'We could not submit your response. Please try again in a moment.',network:'A network error occurred. Please try again.',alreadySubmitted:'A response has already been submitted from this browser.',
  },
  ru: {
    eyebrow:'ОТКРЫТЫЙ МЫСЛЕННЫЙ ЭКСПЕРИМЕНТ',title:'Что бы ты сделал, если бы мог решать судьбу другого человека?',intro1:'Представь, что другой человек добровольно доверил тебе право решать, каким будет его будущее.',intro2:'Перед тобой — человек со своей внешностью, характером, убеждениями и желаниями. Ты можешь оставить всё как есть, попытаться узнать его и понять, чего он хочет сам, изменить отдельные черты или полностью сформировать его личность по своему представлению.',prompt:'Что бы ты сделал?',q1:'Расскажи, что бы ты сделал',q1help:'Ответь своими словами. Здесь нет ожидаемых ответов.','answer-label':'Твой ответ','answer-placeholder':'Я бы…','private-note':'Твой письменный ответ не будет автоматически опубликован.','single-choice':'Выбери один вариант.',q2:'Если бы ты мог изменить этого человека, что бы ты изменил в первую очередь?',q3:'Если бы желания этого человека противоречили твоим, как бы ты поступил?',q4:'Как ты думаешь, чего захотело бы большинство людей в такой ситуации?',optional:'Необязательные вопросы о тебе',gender:'Какой у тебя пол?','captcha-note':'Пройди проверку, чтобы отправить ответ.',submit:'Отправить ответ',privacy:'Не указывай имена, контакты и другие сведения, по которым можно узнать тебя или другого человека. Ответ сохраняется для анализа; письменные ответы не публикуются автоматически.','results-eyebrow':'ОБЩАЯ КАРТИНА','results-title':'Что выберут люди?','results-copy':'Общая статистика откроется после первых 100 действительных ответов.','view-results':'Посмотреть результаты','privacy-link':'Конфиденциальность',
    q2Options:['Внешность или тело','Характер или личность','Образ жизни или привычки','Всё, что посчитал бы нужным','Ничего не стал бы менять','Предоставил бы ему самому решать, что менять','Другое'],q3Options:['Уважал бы его желания','Попытался бы договориться','Всё равно поступил бы по-своему','Решение зависело бы от ситуации','Другое'],q4Options:['Оставить человека как есть','Помочь ему и улучшить его жизнь','Изменить его в соответствии со своими представлениями','Использовать его в собственных интересах','Предоставить ему возможность самому решать свою судьбу','Затрудняюсь ответить','Другое'],genderOptions:['Мужчина','Женщина','Другая идентичность','Предпочитаю не отвечать'],required:'Ответь на три вопроса с вариантами.',captchaMissing:'Пройди проверку на ботов.',sending:'Отправка…',success:'Спасибо. Твой ответ сохранён.',failure:'Не удалось отправить ответ. Попробуй ещё раз.',network:'Ошибка соединения. Попробуй ещё раз.',alreadySubmitted:'С этого браузера уже был отправлен ответ.'
  }
};
let turnstileToken = '';
function getParticipantId(){
  try{
    let id=localStorage.getItem('human-experiment-participant-id');
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id||'')){
      id=crypto.randomUUID();
      localStorage.setItem('human-experiment-participant-id',id);
    }
    return id;
  }catch{return crypto.randomUUID();}
}
window.onTurnstileSuccess = token => { turnstileToken = token; };
window.onTurnstileExpired = () => { turnstileToken = ''; };
const form = document.querySelector('#survey-form');
const languageSelect = document.querySelector('#language');
const answer = document.querySelector('#free-answer');
const charCount = document.querySelector('#char-count');
const status = document.querySelector('#form-status');
const submitButton = document.querySelector('#submit-button');
const turnstileWidget = document.querySelector('#turnstile-widget');
const setupWarning = document.querySelector('#setup-warning');
if (!turnstileWidget.dataset.sitekey || turnstileWidget.dataset.sitekey.includes('REPLACE_WITH')) {
  setupWarning.hidden = false;
  submitButton.disabled = true;
}
function renderOptions(id, values, name, optional=false) {
  const root = document.getElementById(id); root.replaceChildren();
  values.forEach((value,index) => {
    const label = document.createElement('label'); label.className='option';
    const input = document.createElement('input'); input.type='radio'; input.name=name; input.value=String(index); input.required=!optional;
    const span = document.createElement('span'); span.textContent=value;
    label.append(input,span); root.append(label);
  });
}
function renderLanguage(lang) {
  const t=translations[lang]||translations.en; document.documentElement.lang=lang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{const key=el.dataset.i18n;if(t[key])el.textContent=t[key];});
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{const key=el.dataset.i18nPlaceholder;if(t[key])el.placeholder=t[key];});
  renderOptions('q2-options',t.q2Options,'q2'); renderOptions('q3-options',t.q3Options,'q3'); renderOptions('q4-options',t.q4Options,'q4');
  renderOptions('gender-options',t.genderOptions,'gender',true);
  if(charCount) charCount.textContent=`${answer.value.length} / 5000`;
}
languageSelect.addEventListener('change',()=>renderLanguage(languageSelect.value));
answer.addEventListener('input',()=>{charCount.textContent=`${answer.value.length} / 5000`;});
renderLanguage('en');
form.addEventListener('submit',async event=>{
  event.preventDefault(); const lang=languageSelect.value; const t=translations[lang];
  status.className='form-status'; status.textContent='';
  if(!form.reportValidity()){status.textContent=t.required;status.className='form-status error';return;}
  if(!turnstileToken){status.textContent=t.captchaMissing;status.className='form-status error';return;}
  const selected=name=>{const input=form.querySelector(`input[name="${name}"]:checked`);return input?Number(input.value):null;};
  const payload={language:lang,participantId:getParticipantId(),freeAnswer:answer.value.trim(),q2:selected('q2'),q3:selected('q3'),q4:selected('q4'),gender:selected('gender'),turnstileToken};
  submitButton.disabled=true; submitButton.textContent=t.sending;
  try{
    const response=await fetch('/api/submit',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
    const result=await response.json();
    if(!response.ok||!result.ok) throw new Error(result.error||'submit_failed');
    status.textContent=t.success;status.className='form-status success';form.reset();turnstileToken='';
    if(window.turnstile) window.turnstile.reset(); charCount.textContent='0 / 5000';
  }catch(error){status.textContent=error.message==='already_submitted'?t.alreadySubmitted:error.message==='network'?t.network:t.failure;status.className='form-status error';turnstileToken='';if(window.turnstile)window.turnstile.reset();}
  finally{submitButton.disabled=turnstileWidget.dataset.sitekey.includes('REPLACE_WITH');submitButton.textContent=t.submit;}
});
