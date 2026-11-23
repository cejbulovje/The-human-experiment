const preferenceQuestions = {
  ru: {
    questions:["1. Что, если вообще что-либо, вы позволили бы человечеству изменить в себе?","2. Что могло бы побудить вас стать добровольцем в этой воображаемой ситуации?","3. Какие решения о своей жизни и будущем вы доверили бы человечеству?"],
    helpers:["Выберите один вариант.","Можно выбрать несколько вариантов.","Расскажите, что вы позволили бы решать другим и какие решения, если такие есть, оставили бы за собой."],
    scope:["Ничего не позволил бы менять.","Позволил бы менять только то, что сам заранее одобрил.","Позволил бы им решать, что менять, но оставил бы за собой право отказать.","Доверил бы человечеству самостоятельно решать, что менять, сохранив лишь несколько принципиальных условий.","Доверил бы им любые изменения без ограничений с моей стороны.","Другое."],
    motivation:["Желание узнать, чего люди на самом деле хотят и о чём мечтают.","Желание увидеть, каким человечество является на самом деле, за пределами публичных образов и заявлений.","Желание понять, есть ли у человечества надежда на лучшее будущее или оно деградирует.","Желание узнать, насколько люди похожи друг на друга в своих желаниях, несмотря на различия.","Желание проверить, способны ли люди понимать и учитывать желания друг друга.","Желание внести собственный вклад в исследование человечества.","Любопытство к самому эксперименту и его результатам.","Другое.","Ничто из перечисленного не побудило бы меня участвовать в эксперименте."],
    free:"Напишите свой ответ…",summaryLabels:["Границы изменений","Мотивация","Свободный ответ"],noSelection:"Не выбрано"
  },
  en: {
    questions:["1. What changes, if any, would you let humanity make to you?","2. What might motivate you to volunteer in this imagined scenario?","3. What would you entrust to humanity about your life and future?"],
    helpers:["Choose one option.","You may select more than one option.","Describe what you would let others decide and what, if anything, you would keep for yourself."],
    scope:["I would not allow any changes.","I would allow only changes I had approved in advance.","I would let them decide what to change, while keeping the right to refuse.","I would trust humanity to decide independently what to change, subject to a few fundamental conditions.","I would trust them with any changes without restrictions from me.","Other."],
    motivation:["I want to learn what people really want and dream about.","I want to see what humanity is really like beyond public images and statements.","I want to understand whether humanity has hope for a better future or is degenerating.","I want to learn how similar people’s desires are despite their differences.","I want to find out whether people can understand and take one another’s wishes into account.","I want to contribute to the study of humanity.","Curiosity about the experiment and its results.","Other.","None of these would motivate me to take part in the experiment."],
    free:"Write your answer…",summaryLabels:["Limits of change","Motivation","Free response"],noSelection:"None selected"
  },
  es: {
    questions: ["1. ¿Qué permitirías que la humanidad cambiara en ti, si es que permitirías algún cambio?","2. ¿Qué podría motivarte a ofrecerte como voluntario en este escenario imaginario?","3. ¿Qué decisiones sobre tu vida y tu futuro confiarías a la humanidad?"],
    helpers: ["Elige una opción.","Puedes elegir varias opciones.","Describe qué dejarías que decidieran otras personas y qué decisiones, si las hay, te reservarías."],
    scope: ["No permitiría ningún cambio.","Solo permitiría los cambios que hubiera aprobado de antemano.","Dejaría que decidieran qué cambiar y conservaría el derecho a negarme.","Confiaría en que la humanidad decidiera qué cambiar, con unas pocas condiciones fundamentales.","Confiaría cualquier cambio a los demás sin imponerles límites.","Otra opción."],
    motivation: ["Quiero saber qué desea la gente y con qué sueña.","Quiero conocer cómo es la humanidad más allá de su imagen y sus declaraciones públicas.","Quiero entender si la humanidad va hacia un futuro mejor o está empeorando.","Quiero saber cuánto se parecen los deseos de las personas a pesar de sus diferencias.","Quiero saber si las personas pueden comprender y tener en cuenta los deseos de los demás.","Quiero contribuir al estudio de la humanidad.","Curiosidad por el experimento y sus resultados.","Otra opción.","Nada de lo anterior me motivaría a participar."],
    free: "Escribe tu respuesta…",
    summaryLabels: ["Límites de los cambios","Motivación","Respuesta libre"],
    noSelection: "Sin selección"
  },
  pt: {
    questions: ["1. O que você permitiria que a humanidade mudasse em você, se permitisse alguma mudança?","2. O que poderia levar você a se voluntariar nesse cenário imaginado?","3. Que decisões sobre sua vida e seu futuro você confiaria à humanidade?"],
    helpers: ["Escolha uma opção.","Você pode escolher mais de uma opção.","Descreva o que deixaria outras pessoas decidirem e quais decisões, se houver, reservaria para si."],
    scope: ["Eu não permitiria nenhuma mudança.","Eu só permitiria mudanças que tivesse aprovado previamente.","Eu deixaria que decidissem o que mudar e manteria o direito de recusar.","Eu confiaria à humanidade a decisão sobre o que mudar, com algumas condições fundamentais.","Eu confiaria aos outros qualquer mudança sem impor limites.","Outra opção."],
    motivation: ["Quero saber o que as pessoas realmente desejam e com o que sonham.","Quero conhecer a humanidade além das imagens e declarações públicas.","Quero entender se a humanidade caminha para um futuro melhor ou está piorando.","Quero saber quanto os desejos das pessoas se parecem apesar das diferenças.","Quero descobrir se as pessoas conseguem compreender e considerar os desejos umas das outras.","Quero contribuir para o estudo da humanidade.","Curiosidade sobre o experimento e seus resultados.","Outra opção.","Nenhuma das opções acima me motivaria a participar."],
    free: "Escreva sua resposta…",
    summaryLabels: ["Limites das mudanças","Motivação","Resposta livre"],
    noSelection: "Nenhuma opção selecionada"
  },
  zh: {
    questions: ["1. 如果你愿意让全人类改变你，你会允许哪些改变？","2. 在这个假想情境中，什么可能促使你成为志愿者？","3. 对于自己的人生和未来，你愿意把哪些决定交给全人类？"],
    helpers: ["请选择一项。","可以多选。","请说明你愿意让他人决定什么，以及你是否想保留某些决定权。"],
    scope: ["我不允许任何改变。","我只允许事先经我同意的改变。","我会让他们决定改变什么，但保留拒绝的权利。","我会让全人类自行决定改变什么，但要遵守几项基本条件。","我会把任何改变交给他们决定，不设限制。","其他。"],
    motivation: ["我想了解人们真正想要什么、梦想什么。","我想了解公开形象和言论背后的人类是什么样的。","我想了解人类是在走向更好的未来，还是在退步。","我想了解尽管人们各有不同，他们的愿望有多相似。","我想知道人们能否理解并顾及彼此的愿望。","我想为研究人类作出贡献。","我对实验本身和结果感到好奇。","其他。","上述选项都不会促使我参与。"],
    free: "写下你的回答…",
    summaryLabels: ["改变的界限","动机","自由回答"],
    noSelection: "未选择"
  },
  de: {
    questions: ["1. Was, wenn überhaupt, dürfte die Menschheit an dir verändern?","2. Was könnte dich dazu bewegen, dich in diesem Szenario freiwillig zu melden?","3. Welche Entscheidungen über dein Leben und deine Zukunft würdest du der Menschheit anvertrauen?"],
    helpers: ["Wähle eine Option.","Du kannst mehrere Optionen auswählen.","Beschreibe, was andere entscheiden dürften und welche Entscheidungen du dir gegebenenfalls selbst vorbehalten würdest."],
    scope: ["Ich würde keine Veränderungen zulassen.","Ich würde nur vorher von mir genehmigte Veränderungen zulassen.","Ich würde andere entscheiden lassen, was sich ändert, und mir das Recht vorbehalten, Nein zu sagen.","Ich würde der Menschheit die Entscheidung überlassen, unter einigen grundlegenden Bedingungen.","Ich würde anderen ohne eigene Einschränkungen jede Veränderung anvertrauen.","Etwas anderes."],
    motivation: ["Ich möchte erfahren, was sich Menschen wirklich wünschen und wovon sie träumen.","Ich möchte erfahren, wie die Menschheit jenseits öffentlicher Selbstdarstellung und Aussagen ist.","Ich möchte verstehen, ob die Menschheit auf eine bessere Zukunft zusteuert oder Rückschritte macht.","Ich möchte erfahren, wie ähnlich sich menschliche Wünsche trotz aller Unterschiede sind.","Ich möchte herausfinden, ob Menschen die Wünsche anderer verstehen und berücksichtigen können.","Ich möchte zur Erforschung der Menschheit beitragen.","Neugier auf das Experiment und seine Ergebnisse.","Etwas anderes.","Nichts davon würde mich zur Teilnahme bewegen."],
    free: "Schreib deine Antwort…",
    summaryLabels: ["Grenzen für Veränderungen","Motivation","Freitextantwort"],
    noSelection: "Nichts ausgewählt"
  },
  ja: {
    questions: ["1. 自分について、人類にどんな変更を認めますか。何も変更しないという選択もできます。","2. この想像上の状況で、何があれば志願したいと思いますか？","3. 自分の人生や将来について、どんな決定を人類に委ねたいですか？"],
    helpers: ["一つ選んでください。","複数選べます。","何を他の人に決めてもらい、何を自分で決めたいかを、自由に書いてください。"],
    scope: ["どんな変更も認めません。","事前に自分が承認した変更だけを認めます。","何を変えるかは任せますが、拒否する権利を保ちます。","いくつかの基本条件を守ることを前提に、何を変えるかは人類の判断に任せます。","どんな変更も、自分から制限を設けずに任せます。","その他。"],
    motivation: ["人々が本当に何を望み、どんな夢を持っているかを知りたい。","公の場でのイメージや発言の背後にある人類の姿を知りたい。","人類がよりよい未来に向かっているのか、それとも後退しているのかを知りたい。","違いがあっても、人々の願いがどれほど似ているのかを知りたい。","人々がお互いの願いを理解し、考慮できるかを知りたい。","人類を理解するための研究に貢献したい。","実験そのものや結果に興味がある。","その他。","どれも参加の動機にはならない。"],
    free: "回答を書いてください…",
    summaryLabels: ["変更の範囲","動機","自由記述"],
    noSelection: "選択なし"
  },
  fr: {
    questions: ["1. Qu’est-ce que tu laisserais l’humanité changer chez toi, si tu acceptais un changement ?","2. Qu’est-ce qui pourrait te motiver à te porter volontaire dans ce scénario imaginé ?","3. Quelles décisions sur ta vie et ton avenir confierais-tu à l’humanité ?"],
    helpers: ["Choisis une option.","Tu peux choisir plusieurs options.","Indique ce que tu laisserais les autres décider et quelles décisions tu souhaiterais éventuellement garder pour toi."],
    scope: ["Je n’autoriserais aucun changement.","Je n’autoriserais que les changements que j’aurais approuvés à l’avance.","Je les laisserais choisir quoi changer, tout en gardant le droit de refuser.","Je laisserais l’humanité décider librement des changements, sous réserve de quelques conditions essentielles.","Je leur confierais toute décision de changement sans imposer de limites.","Autre."],
    motivation: ["Je veux savoir ce que les gens désirent vraiment et ce dont ils rêvent.","Je veux découvrir ce qu’est l’humanité au-delà des images et des déclarations publiques.","Je veux comprendre si l’humanité avance vers un avenir meilleur ou si elle régresse.","Je veux savoir à quel point les désirs des gens se ressemblent malgré leurs différences.","Je veux savoir si les gens peuvent comprendre et prendre en compte les souhaits des autres.","Je veux contribuer à l’étude de l’humanité.","Par curiosité pour l’expérience et ses résultats.","Autre.","Rien de ce qui précède ne me motiverait à participer."],
    free: "Écris ta réponse…",
    summaryLabels: ["Limites des changements","Motivation","Réponse libre"],
    noSelection: "Aucune sélection"
  },
  ar: {
    questions: ["1. ما التغييرات التي ستسمح للبشرية بإجرائها عليك، إن كنت ستسمح بأي تغيير؟","2. ما الذي قد يدفعك إلى التطوّع في هذا السيناريو المتخيّل؟","3. ما القرارات التي ستعهد بها إلى البشرية بشأن حياتك ومستقبلك؟"],
    helpers: ["اختر خيارًا واحدًا.","يمكنك اختيار أكثر من خيار.","صِف ما ستترك للآخرين أن يقرّروه وما قد ترغب في الاحتفاظ بحق تقريره بنفسك."],
    scope: ["لن أسمح بأي تغيير.","لن أسمح إلا بتغييرات وافقت عليها مسبقًا.","سأترك لهم قرار ما سيغيّرونه، مع احتفاظي بحق الرفض.","سأترك للبشرية حرية تقرير ما ستغيّره ضمن بعض الشروط الأساسية.","سأعهد إليهم بأي تغيير من دون أن أفرض قيودًا.","خيار آخر."],
    motivation: ["أريد أن أعرف ما يريده الناس حقًا وما يحلمون به.","أريد أن أعرف كيف تبدو البشرية بعيدًا عن الصور والتصريحات العلنية.","أريد أن أفهم هل تتجه البشرية إلى مستقبل أفضل أم تتراجع.","أريد أن أعرف مدى تشابه رغبات الناس رغم اختلافاتهم.","أريد أن أعرف ما إذا كان الناس يستطيعون فهم رغبات بعضهم ومراعاتها.","أريد المساهمة في دراسة البشرية.","يدفعني الفضول بشأن التجربة ونتائجها.","خيار آخر.","لا شيء مما سبق سيدفعني إلى المشاركة."],
    free: "اكتب إجابتك…",
    summaryLabels: ["حدود التغيير","الدافع","إجابة حرّة"],
    noSelection: "لم يُحدَّد خيار"
  }
};
