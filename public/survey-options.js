// Indices are the stored answer IDs used by the survey and results.
const QUESTION_OPTIONS = {
  q2: {
    en: ["Appearance or body", "Character or personality", "Lifestyle or habits", "Everything I consider necessary", "I would change nothing", "I would let them decide what to change", "Other"],
    ru: ["Внешность или тело", "Характер или личность", "Образ жизни или привычки", "Всё, что посчитал бы нужным", "Ничего не стал бы менять", "Предоставил бы ему самому решать, что менять", "Другое"],
    es: ["Apariencia o cuerpo", "Carácter o personalidad", "Estilo de vida o hábitos", "Todo lo que considere necesario", "No cambiaría nada", "Dejaría que decidiera qué cambiar", "Otro"],
    pt: ["Aparência ou corpo", "Caráter ou personalidade", "Estilo de vida ou hábitos", "Tudo o que eu considerar necessário", "Não mudaria nada", "Deixaria a pessoa decidir o que mudar", "Outro"],
    zh: ["外貌或身体", "性格或个性", "生活方式或习惯", "我认为有必要改变的一切", "什么也不改变", "让对方决定改变什么", "其他"],
    de: ["Aussehen oder Körper", "Charakter oder Persönlichkeit", "Lebensstil oder Gewohnheiten", "Alles, was ich für nötig halte", "Ich würde nichts ändern", "Ich würde die Person selbst entscheiden lassen", "Sonstiges"],
    ja: ["外見や身体", "性格や人格", "生活様式や習慣", "必要だと思うすべて", "何も変えない", "何を変えるか本人に決めてもらう", "その他"],
    fr: ["Apparence ou corps", "Caractère ou personnalité", "Mode de vie ou habitudes", "Tout ce que je juge nécessaire", "Je ne changerais rien", "Je le laisserais décider quoi changer", "Autre"],
    ar: ["المظهر أو الجسد", "الشخصية أو الطباع", "نمط الحياة أو العادات", "كل ما أراه ضروريًا", "لن أغيّر شيئًا", "أترك له قرار ما يريد تغييره", "أخرى"]
  },
  q3: {
    en: ["Respect their wishes", "Try to reach an agreement", "Do what I wanted anyway", "It would depend on the situation", "Other"],
    ru: ["Уважал бы его желания", "Попытался бы договориться", "Всё равно поступил бы по-своему", "Решение зависело бы от ситуации", "Другое"],
    es: ["Respetar sus deseos", "Intentar llegar a un acuerdo", "Haría lo que quisiera de todos modos", "Dependería de la situación", "Otro"],
    pt: ["Respeitar os desejos dela", "Tentar chegar a um acordo", "Faria o que eu quisesse mesmo assim", "Dependeria da situação", "Outro"],
    zh: ["尊重对方的意愿", "尝试达成共识", "仍然按自己的想法做", "视情况而定", "其他"],
    de: ["Ihre Wünsche respektieren", "Eine Einigung suchen", "Trotzdem tun, was ich will", "Es kommt auf die Situation an", "Sonstiges"],
    ja: ["本人の希望を尊重する", "合意を目指す", "それでも自分の望むとおりにする", "状況による", "その他"],
    fr: ["Respecter ses souhaits", "Essayer de trouver un accord", "Faire quand même ce que je veux", "Cela dépendrait de la situation", "Autre"],
    ar: ["احترام رغباته", "محاولة التوصل إلى اتفاق", "فعل ما أريده على أي حال", "يعتمد على الموقف", "أخرى"]
  },
  q4: {
    en: ["Leave the person as they are", "Help them and improve their life", "Change them according to my own ideas", "Use the person for personal gain", "Let the person decide their own fate", "Not sure", "Other"],
    ru: ["Оставить человека как есть", "Помочь ему и улучшить его жизнь", "Изменить его в соответствии со своими представлениями", "Использовать его в собственных интересах", "Предоставить ему возможность самому решать свою судьбу", "Затрудняюсь ответить", "Другое"],
    es: ["Dejar a la persona como está", "Ayudarla y mejorar su vida", "Cambiarla según mis ideas", "Usarla para mis propios intereses", "Dejar que decida su destino", "No estoy seguro", "Otro"],
    pt: ["Deixar a pessoa como está", "Ajudá-la e melhorar sua vida", "Mudá-la conforme minhas ideias", "Usá-la em meu próprio interesse", "Deixar a pessoa decidir seu destino", "Não tenho certeza", "Outro"],
    zh: ["保持原样", "帮助对方并改善其生活", "按照自己的想法改变对方", "为了自己的利益利用对方", "让对方决定自己的命运", "不确定", "其他"],
    de: ["Die Person so lassen, wie sie ist", "Ihr helfen und ihr Leben verbessern", "Sie nach meinen Vorstellungen ändern", "Sie für eigene Interessen nutzen", "Die Person über ihr Schicksal entscheiden lassen", "Unsicher", "Sonstiges"],
    ja: ["そのままにする", "助けて生活を改善する", "自分の考えに合わせて変える", "自分の利益のために利用する", "本人に運命を決めてもらう", "わからない", "その他"],
    fr: ["Laisser la personne telle quelle", "L’aider et améliorer sa vie", "La changer selon mes idées", "L’utiliser à mes propres fins", "La laisser décider de son destin", "Je ne sais pas", "Autre"],
    ar: ["ترك الشخص كما هو", "مساعدته وتحسين حياته", "تغييره وفق أفكاري", "استغلاله لمصالحي", "ترك الشخص يقرر مصيره", "لست متأكدًا", "أخرى"]
  }
};
