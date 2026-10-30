/* Preview-only sample responses: no API calls, DB writes, stats, or AI-analysis input. */
(() => {
  const previewHost = 'experiment-hypothetical-preferences-protot-the-human-experiment.cejbulovje.workers.dev';
  const isResultsDemo = location.pathname === '/results.html' && new URL(location.href).searchParams.get('demo') === '101';
  if (location.hostname !== previewHost || (location.pathname === '/results.html' && !isResultsDemo)) return;
  const samples = {
    collective: [
      {text:'Я бы помог человеку получить образование и найти дело, которое ему действительно интересно. Но сначала спросил бы, чего хочет он сам.', choices:[['Что изменить первым','Образ жизни или привычки'],['Если желания расходятся','Попробовать договориться'],['Что выберет большинство','Помочь человеку и улучшить его жизнь']]},
      {text:'Для меня важно, чтобы человек чувствовал себя в безопасности и мог сам решать, как ему жить. Помощь не должна превращаться в контроль.', choices:[['Что изменить первым','Я бы ничего не менял'],['Если желания расходятся','Уважать его желания'],['Что выберет большинство','Оставить человека таким, какой он есть']]},
      {text:'Я бы предложил варианты, объяснил последствия и дал человеку время решить. Даже хорошая идея не должна навязываться силой.', choices:[['Что изменить первым','Позволить ему самому решить, что менять'],['Если желания расходятся','Попробовать договориться'],['Что выберет большинство','Предоставить человеку самому решать свою судьбу']]},
      {text:'Если человек просит о помощи, я готов поддержать его. Но я не считаю, что большинство автоматически знает лучше самого человека.', choices:[['Что изменить первым','Характер или личность'],['Если желания расходятся','Уважать его желания'],['Что выберет большинство','Помочь человеку и улучшить его жизнь']]}
    ],
    hypothetical: [
      {text:'Я бы позволил менять только то, что сам заранее одобрил. Мне важно сохранять возможность самому принимать решения и остановить изменения, если я передумаю.', textEn:'I would allow only changes I had approved in advance. It is important to me to retain the ability to make my own decisions and stop the changes if I change my mind.', choices:[['Что бы ты позволил человечеству изменить в себе?','Позволил бы менять только то, что сам заранее одобрил.'],['Что могло бы побудить тебя участвовать в этом эксперименте?','Желание узнать, чего люди на самом деле хотят и о чём мечтают.; Любопытство к самому эксперименту и его результатам.']]},
      {text:'Я готов доверить человечеству самостоятельно решать, что менять, если заранее обозначены несколько принципиальных условий. Для меня важны безопасность, возможность отказаться от опасных действий и уважение к моему решению прекратить участие.', textEn:'I am willing to trust humanity to decide independently what to change, provided a few fundamental conditions are set in advance. Safety, the ability to refuse dangerous actions, and respect for my decision to end participation are important to me.', choices:[['Что бы ты позволил человечеству изменить в себе?','Доверил бы человечеству самостоятельно решать, что менять, сохранив лишь несколько принципиальных условий.'],['Что могло бы побудить тебя участвовать в этом эксперименте?','Желание проверить, способны ли люди понимать и учитывать желания друг друга.; Желание внести собственный вклад в исследование человечества.']]},
      {text:'Я бы не позволил менять себя без моего согласия. Мне было бы интересно увидеть, насколько люди способны понимать желания друг друга, но моё участие не означало бы отказа от права решать за себя.', textEn:'I would not allow changes to be made to me without my consent. I would be interested to see how well people can understand one another’s wishes, but taking part would not mean giving up my right to make my own decisions.', choices:[['Что бы ты позволил человечеству изменить в себе?','Ничего не позволил бы менять.'],['Что могло бы побудить тебя участвовать в этом эксперименте?','Желание проверить, способны ли люди понимать и учитывать желания друг друга.; Любопытство к самому эксперименту и его результатам.']]}
    ]
  };
  const extraTestTexts = [
    'Я бы сначала выслушал самого человека, а затем вместе с ним рассмотрел возможные варианты.',
    'Для меня важно, чтобы помощь учитывала желания человека, а не только представления окружающих о том, что ему нужно.',
    'Я бы сравнил последствия каждого решения и оставил человеку возможность отказаться.',
    'Мне кажется важным сочетать заботу о человеке с уважением к его самостоятельности.',
    'Я бы не принимал решение за другого, пока не понял его приоритеты и опасения.',
    'Перед серьёзными изменениями я хотел бы обсудить риски, альтернативы и возможность остановить процесс.',
    'Я бы поддержал решение, которое учитывает личные желания и не создаёт неоправданной опасности.',
    'Для меня важно, чтобы общие правила не лишали человека права голоса в вопросах собственной жизни.',
    'Я бы предложил несколько вариантов, но окончательное решение оставил за самим человеком.',
    'Я бы оценивал не только предполагаемую пользу, но и то, насколько человек сам согласен на изменения.'
  ];
  const extraTestTextsEn = [
    'I would first listen to the person and then consider the available options together.',
    'It is important to me that help takes a person’s wishes into account, not just other people’s ideas about what they need.',
    'I would compare the consequences of each decision and leave the person the option to refuse.',
    'I think it is important to balance care for a person with respect for their independence.',
    'I would not make a decision for someone else before understanding their priorities and concerns.',
    'Before major changes, I would want to discuss the risks, alternatives, and the option to stop the process.',
    'I would support a decision that respects personal wishes and does not create unnecessary danger.',
    'It is important to me that shared rules do not deprive people of a say in matters affecting their own lives.',
    'I would offer several options, but leave the final decision to the person themselves.',
    'I would consider not only the expected benefits, but also whether the person truly agrees to the changes.'
  ];
  const baseTestSamples = samples.hypothetical.slice();
  const baseCollectiveSamples = samples.collective.slice();
  for (let testIndex = 0; testIndex < 97; testIndex += 1) {
    const text = extraTestTexts[testIndex % extraTestTexts.length] + ' (дополнительный тестовый вариант ' + (testIndex + 1) + ').';
    const textEn = extraTestTextsEn[testIndex % extraTestTextsEn.length] + ' (additional test sample ' + (testIndex + 1) + ').';
    const personalBase = baseTestSamples[testIndex % baseTestSamples.length];
    samples.hypothetical.push({
      text: personalBase.text + '\n\n' + text,
      textEn: personalBase.textEn + '\n\n' + textEn,
      choices: personalBase.choices.map(([question, answer]) => [question, answer])
    });
    const collectiveBase = baseCollectiveSamples[testIndex % baseCollectiveSamples.length];
    samples.collective.push({
      text: collectiveBase.text + '\n\n' + text,
      choices: collectiveBase.choices.map(([question, answer]) => [question, answer])
    });
  }
  const sampleUiByLanguage = {
    en:{sample:'SAMPLE ANSWER · EXCLUDED FROM STATISTICS',question3:'3. What would you allow humanity to do with your life if you trusted it to decide your fate?',read:'Read full answer',collapse:'Collapse answer',heading:'Sample answer #',note:'Demonstration sample. Not a participant response and excluded from statistics.',questionnaire:'Questionnaire answers',additional:'Participant’s additional answers',questions:['What would you allow humanity to change about you?','What might motivate you to take part in this experiment?'],reaction:'♡ Interesting thought · –',reactionTitle:'Reactions are not counted for the demonstration sample',share:'Share answer',copied:'Link copied',next:'Next →',previous:'← Previous',samplesStatus:'Demo cards: {count}. Excluded from statistics.'},
    ru:{sample:'ТЕСТОВЫЙ ОТВЕТ · НЕ УЧИТЫВАЕТСЯ В СТАТИСТИКЕ',question3:'3. Что бы ты позволил человечеству сделать с твоей жизнью, если бы доверил ему решать твою судьбу?',read:'Показать полный ответ',collapse:'Свернуть ответ',heading:'Демонстрационный ответ №',note:'Демонстрационный пример. Не является ответом участника и не учитывается в статистике.',questionnaire:'Ответы на вопросы анкеты',additional:'Дополнительные ответы участника',questions:['Что бы ты позволил человечеству изменить в себе?','Что могло бы побудить тебя участвовать в этом эксперименте?'],reaction:'♡ Интересная мысль · –',reactionTitle:'Демонстрационный пример не участвует в подсчёте реакций',share:'Поделиться ответом',copied:'Ссылка скопирована',next:'Следующие →',previous:'← Предыдущие',samplesStatus:'Демонстрационные карточки: {count}. Не учитываются в статистике.'},
    es:{sample:'RESPUESTA DE MUESTRA · EXCLUIDA DE LAS ESTADÍSTICAS',question3:'3. ¿Qué permitirías que la humanidad hiciera con tu vida si confiaras en que decidiera tu destino?',read:'Leer respuesta completa',collapse:'Contraer respuesta',heading:'Respuesta de muestra n.º ',note:'Ejemplo de demostración. No es una respuesta de participante y no cuenta en las estadísticas.',questionnaire:'Respuestas al cuestionario',additional:'Respuestas adicionales del participante',questions:['¿Qué permitirías que la humanidad cambiara de ti?','¿Qué podría motivarte a participar en este experimento?'],reaction:'♡ Idea interesante · –',reactionTitle:'Las reacciones no se cuentan para esta muestra de demostración',share:'Compartir respuesta',copied:'Enlace copiado',next:'Siguiente →',previous:'← Anteriores',samplesStatus:'Tarjetas de demostración: {count}. Excluidas de las estadísticas.'},
    pt:{sample:'RESPOSTA DE EXEMPLO · EXCLUÍDA DAS ESTATÍSTICAS',question3:'3. O que você permitiria que a humanidade fizesse com sua vida se confiasse a ela a decisão do seu destino?',read:'Ler resposta completa',collapse:'Recolher resposta',heading:'Resposta de exemplo nº ',note:'Exemplo demonstrativo. Não é uma resposta de participante e não entra nas estatísticas.',questionnaire:'Respostas ao questionário',additional:'Respostas adicionais do participante',questions:['O que você permitiria que a humanidade mudasse em você?','O que poderia motivar você a participar deste experimento?'],reaction:'♡ Ideia interessante · –',reactionTitle:'As reações não são contabilizadas para este exemplo demonstrativo',share:'Compartilhar resposta',copied:'Link copiado',next:'Próxima →',previous:'← Anteriores'},
    zh:{sample:'示例回答 · 不计入统计',question3:'3. 如果你相信人类可以决定你的命运，你会允许人类如何改变你的生活？',read:'阅读完整回答',collapse:'收起回答',heading:'示例回答 #',note:'演示示例。不是参与者的回答，不计入统计。',questionnaire:'问卷回答',additional:'参与者的其他回答',questions:['你会允许人类改变你自身的哪些方面？','什么可能促使你参与这项实验？'],reaction:'♡ 有启发的想法 · –',reactionTitle:'此演示示例的反应不会计数',share:'分享回答',copied:'链接已复制',next:'下一页 →',previous:'← 上一页',samplesStatus:'演示卡片：{count}。不计入统计。'},
    de:{sample:'BEISPIELANTWORT · NICHT IN DER STATISTIK',question3:'3. Was würdest du die Menschheit mit deinem Leben machen lassen, wenn du ihr die Entscheidung über dein Schicksal anvertraust?',read:'Vollständige Antwort lesen',collapse:'Antwort einklappen',heading:'Beispielantwort Nr. ',note:'Demonstrationsbeispiel. Keine Teilnehmerantwort und nicht Teil der Statistik.',questionnaire:'Antworten auf den Fragebogen',additional:'Weitere Antworten der teilnehmenden Person',questions:['Was würdest du die Menschheit an dir verändern lassen?','Was könnte dich zur Teilnahme an diesem Experiment bewegen?'],reaction:'♡ Interessanter Gedanke · –',reactionTitle:'Reaktionen für dieses Demonstrationsbeispiel werden nicht gezählt',share:'Antwort teilen',copied:'Link kopiert',next:'Weiter →',previous:'← Zurück',samplesStatus:'Demokarten: {count}. Nicht in der Statistik enthalten.'},
    ja:{sample:'サンプル回答 · 統計対象外',question3:'3. 人類があなたの運命を決めると信頼した場合、あなたの人生に何をすることを認めますか？',read:'回答全文を読む',collapse:'回答を閉じる',heading:'サンプル回答 #',note:'デモ用サンプルです。参加者の回答ではなく、統計にも含まれません。',questionnaire:'アンケートの回答',additional:'参加者の追加回答',questions:['人類に自分の何を変えてもらいたいですか？','この実験に参加する動機は何ですか？'],reaction:'♡ 興味深い考え · –',reactionTitle:'このデモ用サンプルのリアクションは集計されません',share:'回答を共有',copied:'リンクをコピーしました',next:'次へ →',previous:'← 前へ',samplesStatus:'デモカード：{count}。統計には含まれません。'},
    fr:{sample:'RÉPONSE EXEMPLE · EXCLUE DES STATISTIQUES',question3:'3. Que laisseriez-vous l’humanité faire de votre vie si vous lui faisiez confiance pour décider de votre destin ?',read:'Lire la réponse complète',collapse:'Réduire la réponse',heading:'Réponse exemple n° ',note:'Exemple de démonstration. Ce n’est pas une réponse de participant et elle est exclue des statistiques.',questionnaire:'Réponses au questionnaire',additional:'Réponses supplémentaires du participant',questions:['Que laisseriez-vous l’humanité changer chez vous ?','Qu’est-ce qui pourrait vous inciter à participer à cette expérience ?'],reaction:'♡ Idée intéressante · –',reactionTitle:'Les réactions ne sont pas comptées pour cet exemple de démonstration',share:'Partager la réponse',copied:'Lien copié',next:'Suivant →',previous:'← Précédent',samplesStatus:'Cartes de démonstration : {count}. Exclues des statistiques.'},
    ar:{sample:'إجابة تجريبية · لا تدخل في الإحصاءات',question3:'3. ما الذي تسمح للبشرية بفعله في حياتك إذا وثقت بها لتقرر مصيرك؟',read:'قراءة الإجابة كاملة',collapse:'طي الإجابة',heading:'إجابة تجريبية رقم ',note:'مثال توضيحي. ليس إجابة مشارك ولا يدخل في الإحصاءات.',questionnaire:'إجابات الاستبيان',additional:'إجابات إضافية للمشارك',questions:['ما الذي تسمح للبشرية بتغييره فيك؟','ما الذي قد يدفعك للمشاركة في هذه التجربة؟'],reaction:'♡ فكرة مثيرة للاهتمام · –',reactionTitle:'لا تُحتسب التفاعلات لهذا المثال التوضيحي',share:'مشاركة الإجابة',copied:'تم نسخ الرابط',next:'التالي →',previous:'← السابق',samplesStatus:'بطاقات تجريبية: {count}. مستثناة من الإحصاءات.'}
  };
  const ru = document.documentElement.lang === 'ru';
  const demoLabel = (sampleUiByLanguage[(document.documentElement.lang||'en').split('-')[0]]||sampleUiByLanguage.en).sample;
  function makeSample(item, kind, index) {
    const locale = document.documentElement.lang || 'en';
    const ru = locale === 'ru';
    const ui = sampleUiByLanguage[locale.split('-')[0]] || sampleUiByLanguage.en;
    const card = document.createElement('article');
    card.className = 'answer-card preview-sample-answer';
    card.id = 'sample-answer-' + kind + '-' + index;
    card.dataset.previewSample = String(index);

    const top = document.createElement('div');
    top.className = 'answer-card-top';
    const code = document.createElement('span');
    code.className = 'answer-code';
    code.textContent = (ru ? '№ ' : '# ') + (index + 1) + ' · ' + ui.sample;
    top.append(code);

    const freeTextQuestion = document.createElement('section');
    freeTextQuestion.className = 'author-questionnaire-section sample-free-text-question';
    const freeTextLabel = document.createElement('strong');
    freeTextLabel.className = 'author-questionnaire-question';
    freeTextLabel.textContent = ui.question3;
    freeTextQuestion.append(freeTextLabel);

    const preview = document.createElement('p');
    preview.className = 'sample-answer-preview';
    const fullText = String(kind === 'hypothetical' && !ru ? (item.textEn || item.text || '') : (item.text || ''));
    const previewLimit = 650;
    let previewText = fullText;
    if (previewText.length > previewLimit) {
      const cut = previewText.lastIndexOf(' ', previewLimit);
      previewText = previewText.slice(0, cut > 450 ? cut : previewLimit).trimEnd() + '…';
    }
    preview.textContent = previewText;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'author-answer-toggle sample-answer-expand';
    toggle.textContent = ui.read;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.hidden = previewText === fullText;

    const full = document.createElement('div');
    full.className = 'author-answer-full';
    full.hidden = true;
    const heading = document.createElement('h3');
    heading.className = 'author-answer-title';
    heading.textContent = ui.heading + (index + 1);
    const body = document.createElement('div');
    body.className = 'author-answer-body';
    const paragraph = document.createElement('p');
    paragraph.textContent = fullText;
    body.append(paragraph);
    const note = document.createElement('p');
    note.className = 'author-answer-note';
    note.textContent = ui.note;
    full.append(heading, body, note);

    toggle.addEventListener('click', () => {
      const open = full.hidden;
      full.hidden = !open;
      preview.hidden = open;
      toggle.textContent = open
        ? ui.collapse
        : ui.read;
      toggle.setAttribute('aria-expanded', String(open));
    });

    const choices = document.createElement('div');
    choices.className = 'answer-context author-questionnaire-choices';
    choices.hidden = false;
    const choicesTitle = document.createElement('strong');
    choicesTitle.className = 'author-questionnaire-choices-title';
    choicesTitle.textContent = kind === 'hypothetical' ? ui.questionnaire : ui.additional;
    choices.append(choicesTitle);
    item.choices.forEach(([question, answer], questionIndex) => {
      const section = document.createElement('section');
      section.className = 'author-questionnaire-section';
      const label = document.createElement('strong');
      label.className = 'author-questionnaire-question';
      const personalQuestionLabels = ui.questions;
      label.textContent = (questionIndex + 1) + '. ' + (kind === 'hypothetical' ? (personalQuestionLabels[questionIndex] || question) : question);
      section.append(label);
      const personalAnswerTranslations = {
        'Ничего не позволил бы менять.': 'I would not allow any changes.',
        'Позволил бы менять только то, что сам заранее одобрил.': 'I would allow only changes I had approved in advance.',
        'Доверил бы человечеству самостоятельно решать, что менять, сохранив лишь несколько принципиальных условий.': 'I would trust humanity to decide independently what to change, subject to a few fundamental conditions.',
        'Желание узнать, чего люди на самом деле хотят и о чём мечтают.': 'I want to learn what people really want and dream about.',
        'Желание проверить, способны ли люди понимать и учитывать желания друг друга.': 'I want to find out whether people can understand and take one another’s wishes into account.',
        'Желание внести собственный вклад в исследование человечества.': 'I want to contribute to the study of humanity.',
        'Любопытство к самому эксперименту и его результатам.': 'Curiosity about the experiment and its results.'
      };
      const answers = String(answer || '').split(';').map(value => value.trim()).filter(Boolean)
        .map(value => kind === 'hypothetical' && !ru ? (personalAnswerTranslations[value] || value) : value);
      if (answers.length > 1) {
        const list = document.createElement('ul');
        list.className = 'author-questionnaire-answer-list';
        answers.forEach(value => {
          const item = document.createElement('li');
          item.textContent = value;
          list.append(item);
        });
        section.append(list);
      } else {
        const value = document.createElement('p');
        value.className = 'author-questionnaire-answer-text';
        value.textContent = answers[0] || '–';
        section.append(value);
      }
      choices.append(section);
    });

    const actions = document.createElement('div');
    actions.className = 'answer-actions author-answer-actions';
    const reaction = document.createElement('button');
    reaction.type = 'button';
    reaction.className = 'reaction-button';
    reaction.disabled = true;
    reaction.textContent = ui.reaction;
    reaction.title = ui.reactionTitle;

    const share = document.createElement('button');
    share.type = 'button';
    share.className = 'subtle-button';
    share.textContent = ui.share;
    share.addEventListener('click', async () => {
      const url = new URL(window.location.href);
      url.hash = 'sample-answer-' + kind + '-' + index;
      try {
        await navigator.clipboard.writeText(url.toString());
        share.textContent = ui.copied;
      } catch {
        window.location.hash = url.hash;
      }
    });

    if (kind === 'hypothetical') {
      card.append(top, freeTextQuestion, preview, toggle, full, choices, actions);
    } else {
      card.append(top, preview, toggle, full, choices, actions);
    }
    actions.append(reaction, share);
    return card;
  }
  function fillPersonalPage(page = 0) {
    const list = document.querySelector('.hypothetical-answer-list');
    if (!list) return;
    const authorRoot = document.getElementById('author-answer-hypothetical');
    if (authorRoot) {
      authorRoot.hidden = false;
      if (list.firstElementChild !== authorRoot) list.prepend(authorRoot);
    }
    const pageSize = Number(document.getElementById('hypothetical-page-size')?.value) || 20;
    const more = document.getElementById('hypothetical-load-more');
    const shown = Math.max(0, Number(page) || 0) * pageSize;
    list.querySelectorAll(':scope > .preview-sample-answer').forEach(card => card.remove());
    const sort = document.getElementById('hypothetical-sort')?.value || 'oldest';
    const query = (document.getElementById('hypothetical-search')?.value || '').trim().toLocaleLowerCase();
    const question = document.getElementById('hypothetical-question-filter')?.value || '';
    const matching = samples.hypothetical.map((item, index) => ({ item, index })).filter(({ item }) => {
      const searchable = [item.text, ...(item.choices || []).flat()].join(' ').toLocaleLowerCase();
      const questionMatches = !question || (item.choices || []).some(([label]) => {
        const value = String(label).toLocaleLowerCase();
        return question === 'priority' && /priority|приоритет|главн/i.test(value)
          || question === 'preserve' && /preserve|сохран|важно/i.test(value)
          || question === 'wishes' && /wish|желан|учитывать/i.test(value)
          || question === 'body' && /body|тел|изменени/i.test(value);
      });
      return (!query || searchable.includes(query)) && questionMatches;
    });
    const orderedSamples = sort === 'latest' ? matching.slice().reverse() : matching;
    const ui = sampleUiByLanguage[(document.documentElement.lang || 'en').split('-')[0]] || sampleUiByLanguage.en;
    const stats = document.getElementById('hypothetical-stats');
    if (stats) stats.textContent = ui.samplesStatus.replace('{count}', String(matching.length));
    const next = Math.min(orderedSamples.length, shown + pageSize);
    for (let index = shown; index < next; index += 1) {
      const entry = orderedSamples[index];
      list.append(makeSample(entry.item, 'hypothetical', entry.index + 1));
    }
    const currentPage = Math.floor(shown / pageSize);
    if (authorRoot) {
      const authorCard = authorRoot.querySelector('.author-answer-card');
      authorRoot.hidden = currentPage > 0;
      authorRoot.style.display = currentPage > 0 ? 'none' : '';
      if (authorCard) authorCard.hidden = currentPage > 0;
    }
    list.dataset.testSamplesShown = String(next);
    list.dataset.testSamplesPage = String(currentPage);
    const previous = document.getElementById('hypothetical-load-previous');
    if (previous) { previous.hidden = shown === 0; previous.textContent = (sampleUiByLanguage[(document.documentElement.lang||'en').split('-')[0]]||sampleUiByLanguage.en).previous; }
    if (more) {
      more.hidden = next >= samples.hypothetical.length;
      more.textContent = (sampleUiByLanguage[(document.documentElement.lang||'en').split('-')[0]]||sampleUiByLanguage.en).next;
    }
    const empty = list.querySelector('.hypothetical-empty-state');
    if (empty) empty.hidden = true;
  }
  function render() {
    // Collective results already have paginated preview responses in results.js.
    // Do not append a second, unpaginated set of cards to that list.
    fillPersonalPage(0);
  }
  document.addEventListener('DOMContentLoaded', render, { once: true });
  document.addEventListener('results-language-changed', () => {
    const list = document.querySelector('.hypothetical-answer-list');
    const page = Math.max(0, Number(list?.dataset.testSamplesPage || 0));
    fillPersonalPage(page);
  });
  document.addEventListener('DOMContentLoaded', () => {
    const more = document.getElementById('hypothetical-load-more');
    const previous = document.getElementById('hypothetical-load-previous');
    const pageSize = document.getElementById('hypothetical-page-size');
    const sort = document.getElementById('hypothetical-sort');
    const search = document.getElementById('hypothetical-search');
    const question = document.getElementById('hypothetical-question-filter');
    sort?.addEventListener('change', event => {
      event.stopImmediatePropagation();
      fillPersonalPage(0);
    }, true);
    search?.addEventListener('input', event => {
      event.stopImmediatePropagation();
      fillPersonalPage(0);
    }, true);
    question?.addEventListener('change', event => {
      event.stopImmediatePropagation();
      fillPersonalPage(0);
    }, true);
    previous?.addEventListener('click', event => {
      event.stopImmediatePropagation();
      fillPersonalPage(Math.max(0, Number(document.querySelector('.hypothetical-answer-list')?.dataset.testSamplesPage || 0) - 1));
    }, true);
    more?.addEventListener('click', event => {
      event.stopImmediatePropagation();
      fillPersonalPage(Number(document.querySelector('.hypothetical-answer-list')?.dataset.testSamplesPage || 0) + 1);
    }, true);
    pageSize?.addEventListener('change', event => {
      event.stopImmediatePropagation();
      fillPersonalPage(0);
    }, true);
  }, { once: true });

})();
