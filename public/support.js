(() => {
  const supportText = {
    en: {
      title: "Support THE HUMAN EXPERIMENT",
      language: "Language",
      heading: "Support the author and project",
      introHeading: "I’m glad something like this exists",
      intro: "I came up with two questions. What would you choose for someone else? And what would you trust others to choose for you? The most interesting part of this experiment is the one I can’t write. One of you will.",
      introFuture: "If you’d like this story to continue, you can support the project with a donation of any size.",
      introContribution: "Your donation comes directly to me and helps me spend more time on the site and the research. Thank you for making that possible.",
      donate: "Support this story",
      asset: "Cryptocurrency",
      network: "Network",
      qrAlt: "QR code for the wallet address",
      copy: "Copy wallet address",
      warning: "Only {asset} on {network}.",
      transfer: "Let your support reach its destination – check the currency, network and address before sending.",
      payment: "Crypto donations are direct wallet transfers. No card payments or automatic currency conversion are available here.",
      copied: "Address copied",
      copyFailed: "Copy failed. Please select the address above manually.",
    },
    ru: {
      title: "Поддержать THE HUMAN EXPERIMENT",
      language: "Язык",
      heading: "Поддержать автора и проект",
      introHeading: "Мне нравится, что такое вообще существует",
      intro: "Я придумал два вопроса. Что бы вы выбрали для другого человека? А что доверили бы другим выбрать для себя? Самую интересную часть этого эксперимента я придумать не могу. Её напишет кто-то из вас.",
      introFuture: "Если вам хочется, чтобы эта история продолжалась, вы можете поддержать проект любой суммой.",
      introContribution: "Ваш перевод придёт мне напрямую и поможет уделять больше времени сайту и исследованию. Спасибо, что даёте мне такую возможность.",
      donate: "Поддержать эту историю",
      asset: "Криптовалюта",
      network: "Сеть",
      qrAlt: "QR-код адреса кошелька",
      copy: "Скопировать адрес кошелька",
      warning: "Только {asset} в сети {network}.",
      transfer: "Пусть ваша поддержка доберётся до адресата – проверьте валюту, сеть и адрес перед отправкой.",
      payment: "Пожертвования в криптовалюте поступают напрямую на кошелёк. Оплата картой и автоматическая конвертация валют здесь недоступны.",
      copied: "Адрес скопирован",
      copyFailed: "Не удалось скопировать. Выделите адрес выше и скопируйте его вручную.",
    },
    es: {
      title: "Apoyar a THE HUMAN EXPERIMENT",
      language: "Idioma",
      heading: "Apoyar al autor y al proyecto",
      introHeading: "Me alegra que exista algo así",
      intro: "Se me ocurrieron dos preguntas. ¿Qué elegirías para otra persona? ¿Y qué dejarías que otros eligieran por ti? La parte más interesante de este experimento no la puedo escribir yo. La escribirá alguien que pase por aquí.",
      introFuture: "Si te gustaría que esta historia continuara, puedes apoyar el proyecto con la cantidad que quieras.",
      introContribution: "Tu aporte me llega directamente y me permite dedicar más tiempo al sitio y a la investigación. Gracias por hacerlo posible.",
      donate: "Apoyar esta historia",
      asset: "Criptomoneda",
      network: "Red",
      qrAlt: "Código QR de la dirección de la billetera",
      copy: "Copiar la dirección de la billetera",
      warning: "Solo {asset} en la red {network}.",
      transfer: "Que tu apoyo llegue a su destino – comprueba la moneda, la red y la dirección antes de enviar.",
      payment: "Las donaciones en criptomonedas se envían directamente a la billetera. Aquí no se aceptan pagos con tarjeta ni se ofrece conversión automática de divisas.",
      copied: "Dirección copiada",
      copyFailed: "No se pudo copiar. Selecciona la dirección de arriba y cópiala manualmente.",
    },
    pt: {
      title: "Apoiar THE HUMAN EXPERIMENT",
      language: "Idioma",
      heading: "Apoiar o autor e o projeto",
      introHeading: "Ainda bem que existe algo assim",
      intro: "Pensei em duas perguntas. O que você escolheria para outra pessoa? E o que confiaria a outras pessoas escolher por você? A parte mais interessante deste experimento eu não consigo escrever. Quem vai escrevê-la é alguém que passar por aqui.",
      introFuture: "Se quiser que esta história continue, você pode apoiar o projeto com o valor que desejar.",
      introContribution: "Sua contribuição chega diretamente a mim e me ajuda a dedicar mais tempo ao site e à pesquisa. Obrigado por tornar isso possível.",
      donate: "Apoiar esta história",
      asset: "Criptomoeda",
      network: "Rede",
      qrAlt: "Código QR do endereço da carteira",
      copy: "Copiar o endereço da carteira",
      warning: "Apenas {asset} na rede {network}.",
      transfer: "Que o seu apoio chegue ao destino – confira a moeda, a rede e o endereço antes de enviar.",
      payment: "As doações em criptomoedas são enviadas diretamente à carteira. Pagamentos com cartão e conversão automática de moedas não estão disponíveis aqui.",
      copied: "Endereço copiado",
      copyFailed: "Não foi possível copiar. Selecione o endereço acima e copie-o manualmente.",
    },
    zh: {
      title: "支持 THE HUMAN EXPERIMENT",
      language: "语言",
      heading: "支持作者与项目",
      introHeading: "有这样的项目，真好",
      intro: "我想了两个问题：如果让你替别人做选择，你会怎么选？如果换作你自己，你愿意把哪些决定交给别人？至于这里最有意思的回答会是什么，我可想不出来。写下它的，会是你们中的某个人。",
      introFuture: "如果你希望这个故事继续下去，可以随心意支持这个项目，金额由你决定。",
      introContribution: "你的捐款会直接到我手中，让我能花更多时间打理网站、继续这项研究。谢谢你给我这个机会。",
      donate: "支持这个故事",
      asset: "加密货币",
      network: "网络",
      qrAlt: "钱包地址二维码",
      copy: "复制钱包地址",
      warning: "仅限 {network} 网络上的 {asset}。",
      transfer: "愿您的支持顺利送达。发送前，请核对币种、网络和地址。",
      payment: "加密货币捐助直接转入钱包。此页面不支持银行卡付款或自动货币兑换。",
      copied: "地址已复制",
      copyFailed: "复制失败。请选中上方的地址并手动复制。",
    },
    de: {
      title: "THE HUMAN EXPERIMENT unterstützen",
      language: "Sprache",
      heading: "Autor und Projekt unterstützen",
      introHeading: "Schön, dass es so etwas gibt",
      intro: "Ich habe mir zwei Fragen ausgedacht. Was würdest du für einen anderen Menschen entscheiden? Und welche Entscheidungen über dein Leben würdest du anderen anvertrauen? Den interessantesten Teil dieses Experiments kann ich mir nicht ausdenken. Den schreibt jemand von euch.",
      introFuture: "Wenn du möchtest, dass diese Geschichte weitergeht, kannst du das Projekt mit einem Betrag deiner Wahl unterstützen.",
      introContribution: "Deine Spende kommt direkt bei mir an und hilft mir, mehr Zeit in die Website und die Forschung zu stecken. Danke, dass du mir das ermöglichst.",
      donate: "Diese Geschichte unterstützen",
      asset: "Kryptowährung",
      network: "Netzwerk",
      qrAlt: "QR-Code der Wallet-Adresse",
      copy: "Wallet-Adresse kopieren",
      warning: "Nur {asset} im Netzwerk {network}.",
      transfer: "Damit deine Unterstützung sicher ankommt – prüfe vor dem Senden die Währung, das Netzwerk und die Adresse.",
      payment: "Kryptospenden gehen direkt an die Wallet. Kartenzahlungen und automatische Währungsumrechnung sind hier nicht verfügbar.",
      copied: "Adresse kopiert",
      copyFailed: "Kopieren fehlgeschlagen. Markiere die Adresse oben und kopiere sie manuell.",
    },
    ja: {
      title: "THE HUMAN EXPERIMENT を支援",
      language: "言語",
      heading: "作者とプロジェクトを支援",
      introHeading: "こういうものがあるって、いいな",
      intro: "私が考えたのは二つの問いです。誰かに代わって選べるとしたら、あなたは何を選びますか。逆に、自分のことなら、どんな選択を誰かに委ねますか。ここに集まる答えのうち、いちばん面白いものは、私には思いつきません。それを書いてくれるのは、きっと皆さんの中の誰かです。",
      introFuture: "この先も続いてほしいと思ってくださったら、お好きな金額で応援していただけます。",
      introContribution: "ご寄付は私に直接届き、サイトの運営と研究にもっと時間を使えるようになります。そんな機会をくださることに感謝しています。",
      donate: "この物語を応援する",
      asset: "暗号資産",
      network: "ネットワーク",
      qrAlt: "ウォレットアドレスの QR コード",
      copy: "ウォレットアドレスをコピー",
      warning: "{network} ネットワークの {asset} のみ。",
      transfer: "あなたの応援が無事に届くよう、送金前に通貨、ネットワーク、アドレスをご確認ください。",
      payment: "暗号資産の寄付はウォレットに直接送金されます。このページではカード決済や自動通貨換算は利用できません。",
      copied: "アドレスをコピーしました",
      copyFailed: "コピーできませんでした。上のアドレスを選択し、手動でコピーしてください。",
    },
    fr: {
      title: "Soutenir THE HUMAN EXPERIMENT",
      language: "Langue",
      heading: "Soutenir l'auteur et le projet",
      introHeading: "Ça me plaît qu’un projet comme celui-ci existe",
      intro: "J’ai imaginé deux questions. Que choisiriez-vous pour quelqu’un d’autre ? Et que laisseriez-vous les autres choisir pour vous ? La partie la plus intéressante de cette expérience, je ne peux pas l’écrire. L’un de vous s’en chargera.",
      introFuture: "Si vous avez envie que cette histoire continue, vous pouvez soutenir le projet du montant de votre choix.",
      introContribution: "Votre don me parvient directement et me permet de consacrer plus de temps au site et à la recherche. Merci de me donner cette possibilité.",
      donate: "Soutenir cette histoire",
      asset: "Cryptomonnaie",
      network: "Réseau",
      qrAlt: "Code QR de l’adresse du portefeuille",
      copy: "Copier l’adresse du portefeuille",
      warning: "Uniquement des {asset} sur le réseau {network}.",
      transfer: "Pour que votre soutien arrive à destination – vérifiez la devise, le réseau et l’adresse avant l’envoi.",
      payment: "Les dons en cryptomonnaie sont envoyés directement au portefeuille. Le paiement par carte et la conversion automatique de devises ne sont pas disponibles ici.",
      copied: "Adresse copiée",
      copyFailed: "La copie a échoué. Sélectionnez l’adresse ci-dessus et copiez-la manuellement.",
    },
    ar: {
      title: "ادعم \u2066THE HUMAN EXPERIMENT\u2069",
      language: "اللغة",
      heading: "دعم صاحب الفكرة والمشروع",
      introHeading: "جميل أن يكون هناك شيء كهذا",
      intro: "خطر لي سؤالان. لو كان بيدك أن تختار لشخص آخر، فماذا كنت ستختار له؟ ولو كان الاختيار يخصّك أنت، فأيّ القرارات كنت ستتركها لغيرك؟ أما أكثر الأجوبة إثارةً للاهتمام هنا، فلا أستطيع أن أتخيّله مسبقًا. أحدكم سيكتبه.",
      introFuture: "إذا أردت أن تستمرّ هذه الحكاية، فيمكنك دعم المشروع بأيّ مبلغ تختاره.",
      introContribution: "يصلني تبرّعك مباشرةً، ويساعدني على تخصيص وقت أطول للموقع والبحث. شكرًا لأنك تتيح لي هذه الفرصة.",
      donate: "ادعم هذه القصة",
      asset: "العملة المشفرة",
      network: "الشبكة",
      qrAlt: "رمز الاستجابة السريعة لعنوان المحفظة",
      copy: "انسخ عنوان المحفظة",
      warning: "عملة {asset} فقط عبر شبكة {network}.",
      transfer: "ليصل دعمك إلى وجهته، تحقق من العملة والشبكة والعنوان قبل الإرسال.",
      payment: "تُرسل التبرعات بالعملات المشفرة مباشرةً إلى المحفظة. لا تتوفر هنا خدمة الدفع بالبطاقة أو التحويل التلقائي للعملات.",
      copied: "تم نسخ العنوان",
      copyFailed: "تعذّر النسخ. حدّد العنوان أعلاه وانسخه يدويًا.",
    },
  };

  const evmAddress = '0xbFEB0D358F2352533D56bDeBB819Be99458D45Cb';
  const networks = {
    tron: { name: 'TRON', address: 'TVeoiq13aYAFPRFjMVAwSTMQfn2CqzhrB7', assets: ['TRX', 'USDT'], tokenNames: { USDT: 'USDT (TRC-20)' } },
    ethereum: { name: 'Ethereum', address: evmAddress, assets: ['ETH', 'USDT', 'USDC'] },
    bsc: {
      name: 'BNB Smart Chain', address: evmAddress, assets: ['BNB', 'USDT', 'USDC'],
      tokenNames: { USDT: 'USDT (Binance-Peg)', USDC: 'USDC (Binance-Peg)' },
    },
    base: { name: 'Base', address: evmAddress, assets: ['ETH', 'USDC'] },
    // The receiving address for both networks was confirmed by the project owner; no proof of wallet control was performed.
    polygon: { name: 'Polygon PoS', address: evmAddress, assets: ['POL', 'USDT', 'USDC'], tokenNames: { USDT: 'USDT0' } },
    arbitrum: { name: 'Arbitrum One', address: evmAddress, assets: ['ETH', 'USDT', 'USDC'], tokenNames: { USDT: 'USDT0' } },
    bitcoin: { name: 'Bitcoin', address: 'bc1qx6xeudgmesldvyxjn7rqc8pta55thf8smz88r8', assets: ['BTC'] },
    solana: { name: 'Solana', address: '7o4qVZTY5LUQUSVqCUokQjbpZaLTeXNw9WVCsvDfuZrq', assets: ['SOL', 'USDT', 'USDC'] },
    ton: { name: 'TON', address: 'UQD83co5LlBTLBopoFiYO7DC7nS54oK94FzsxbKhjBgkiu5P', assets: ['TON', 'USDT'] },
    dogecoin: { name: 'Dogecoin', address: 'DMeXVEcRebqCXuwj7aj34cfx9rky6ybx6d', assets: ['DOGE'] },
  };

  const storageKey = 'human-experiment-language';
  const select = document.querySelector('#page-language');
  const assetSelect = document.querySelector('#donation-asset');
  const networkSelect = document.querySelector('#donation-network');
  const warning = document.querySelector('#donation-warning');
  let qr = document.querySelector('.support-qr');
  const wallet = document.querySelector('#wallet-address');
  const copyButton = document.querySelector('#copy-address');
  const status = document.querySelector('#copy-status');
  const labels = document.querySelectorAll('[data-t]');
  const supports = code => Object.hasOwn(supportText, code);

  let saved = '';
  let copyAttempt = 0;
  try { saved = localStorage.getItem(storageKey); } catch {}

  function renderWarning(text) {
    const asset = assetSelect.value;
    const network = networks[networkSelect.value];
    const tokenName = network.tokenNames?.[asset] || asset;
    warning.textContent = text.warning
      .replace('{asset}', '\u2066' + tokenName + '\u2069')
      .replace('{network}', '\u2066' + network.name + '\u2069');
  }

  function renderDonation() {
    const { address } = networks[networkSelect.value];
    wallet.textContent = address;
    // Each same-origin image was generated locally from its exact address.
    const qrSource = './donation-qr/' + address + '.svg';
    if (qr.getAttribute('src') !== qrSource) {
      const nextQr = qr.cloneNode();
      nextQr.src = qrSource;
      qr.replaceWith(nextQr);
      qr = nextQr;
    }
    renderWarning(supportText[document.documentElement.lang]);
    status.textContent = '';
    copyAttempt += 1;
  }

  function updateNetworks() {
    const previous = networkSelect.value;
    const matching = Object.entries(networks).filter(([, network]) => network.assets.includes(assetSelect.value));
    networkSelect.replaceChildren(...matching.map(([key, network]) => new Option(network.name, key)));
    if (matching.some(([key]) => key === previous)) networkSelect.value = previous;
    renderDonation();
  }

  function setLanguage(lang) {
    const text = supportText[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = text.title;
    select.value = lang;
    select.setAttribute('aria-label', text.language);
    qr.alt = text.qrAlt;
    labels.forEach(label => { label.textContent = text[label.dataset.t]; });
    renderWarning(text);
    status.textContent = '';
    try { localStorage.setItem(storageKey, lang); } catch {}
  }

  const browserLanguages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language || 'en'];
  const initialLanguage = supports(saved)
    ? saved
    : browserLanguages.map(code => code.toLowerCase().split('-')[0]).find(supports) || 'en';

  select.addEventListener('change', () => {
    setLanguage(supports(select.value) ? select.value : 'en');
  });

  copyButton.addEventListener('click', async () => {
    const attempt = ++copyAttempt;
    let result = 'copied';
    try {
      await navigator.clipboard.writeText(wallet.textContent);
    } catch {
      result = 'copyFailed';
    }
    if (attempt === copyAttempt) status.textContent = supportText[document.documentElement.lang][result];
  });

  const assets = new Set(Object.values(networks).flatMap(network => network.assets));
  assetSelect.replaceChildren(...[...assets].sort().map(asset => new Option(asset)));
  assetSelect.value = 'USDT';
  document.documentElement.lang = initialLanguage;
  updateNetworks();
  setLanguage(initialLanguage);
  assetSelect.addEventListener('change', updateNetworks);
  networkSelect.addEventListener('change', renderDonation);
  document.querySelector('.support-card').hidden = false;
  select.hidden = false;
})();
