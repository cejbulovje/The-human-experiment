(() => {
  const supportText = {
    en: {
      title: "Support THE HUMAN EXPERIMENT",
      language: "Language",
      heading: "Support the project",
      introHeading: "Big changes begin with a single decision.",
      intro: "THE HUMAN EXPERIMENT is an attempt to better understand people: how we make decisions, what drives us, and what kind of future we can create together.",
      introFuture: "Perhaps the answers to these questions will one day change how we understand ourselves and each other.",
      introContribution: "Your contribution can help this idea grow. Even a small donation can become part of something much bigger.",
      donate: "Donate cryptocurrency",
      asset: "Cryptocurrency",
      network: "Network",
      qrAlt: "QR code for the wallet address",
      copy: "Copy wallet address",
      warning: "Send only {asset} on {network}.",
      transfer: "Other networks may cause permanent loss of funds. Confirm the address and network in your wallet before sending. Blockchain transfers are generally irreversible.",
      payment: "Crypto donations are direct wallet transfers. No card payments or automatic currency conversion are available here.",
      copied: "Address copied",
      copyFailed: "Copy failed. Please select the address above manually.",
    },
    ru: {
      title: "Поддержать THE HUMAN EXPERIMENT",
      language: "Язык",
      heading: "Поддержать проект",
      introHeading: "Большие перемены начинаются с одного решения.",
      intro: "THE HUMAN EXPERIMENT — попытка лучше понять людей: как мы принимаем решения, что нами движет и какое будущее мы можем создать вместе.",
      introFuture: "Возможно, однажды ответы на эти вопросы изменят то, как мы понимаем себя и друг друга.",
      introContribution: "Твоя поддержка поможет этой идее развиваться. Даже небольшое пожертвование может стать частью чего-то гораздо большего.",
      donate: "Пожертвовать криптовалюту",
      asset: "Криптовалюта",
      network: "Сеть",
      qrAlt: "QR-код адреса кошелька",
      copy: "Скопировать адрес кошелька",
      warning: "Отправляйте только {asset} в сети {network}.",
      transfer: "При использовании другой сети средства могут быть безвозвратно потеряны. Перед отправкой проверьте адрес и сеть в своём кошельке. Переводы в блокчейне, как правило, необратимы.",
      payment: "Пожертвования в криптовалюте поступают напрямую на кошелёк. Оплата картой и автоматическая конвертация валют здесь недоступны.",
      copied: "Адрес скопирован",
      copyFailed: "Не удалось скопировать. Выделите адрес выше и скопируйте его вручную.",
    },
    es: {
      title: "Apoyar a THE HUMAN EXPERIMENT",
      language: "Idioma",
      heading: "Apoyar el proyecto",
      introHeading: "Los grandes cambios comienzan con una sola decisión.",
      intro: "THE HUMAN EXPERIMENT busca comprender mejor a las personas: cómo tomamos decisiones, qué nos motiva y qué futuro podemos construir juntos.",
      introFuture: "Quizá algún día las respuestas a estas preguntas cambien nuestra manera de entendernos a nosotros mismos y a los demás.",
      introContribution: "Tu aportación puede ayudar a que esta idea crezca. Incluso una pequeña donación puede formar parte de algo mucho más grande.",
      donate: "Donar criptomonedas",
      asset: "Criptomoneda",
      network: "Red",
      qrAlt: "Código QR de la dirección de la billetera",
      copy: "Copiar la dirección de la billetera",
      warning: "Envía solo {asset} a través de la red {network}.",
      transfer: "Si usas otra red, podrías perder los fondos de forma permanente. Verifica la dirección y la red en tu billetera antes de enviar. Las transferencias en la cadena de bloques suelen ser irreversibles.",
      payment: "Las donaciones en criptomonedas se envían directamente a la billetera. Aquí no se aceptan pagos con tarjeta ni se ofrece conversión automática de divisas.",
      copied: "Dirección copiada",
      copyFailed: "No se pudo copiar. Selecciona la dirección de arriba y cópiala manualmente.",
    },
    pt: {
      title: "Apoiar THE HUMAN EXPERIMENT",
      language: "Idioma",
      heading: "Apoiar o projeto",
      introHeading: "Grandes mudanças começam com uma única decisão.",
      intro: "THE HUMAN EXPERIMENT é uma tentativa de compreender melhor as pessoas: como tomamos decisões, o que nos motiva e que futuro podemos construir juntos.",
      introFuture: "Talvez um dia as respostas a essas perguntas mudem a forma como entendemos a nós mesmos e uns aos outros.",
      introContribution: "Sua contribuição pode ajudar essa ideia a crescer. Mesmo uma pequena doação pode fazer parte de algo muito maior.",
      donate: "Doar criptomoedas",
      asset: "Criptomoeda",
      network: "Rede",
      qrAlt: "Código QR do endereço da carteira",
      copy: "Copiar o endereço da carteira",
      warning: "Envie apenas {asset} pela rede {network}.",
      transfer: "O uso de outra rede pode resultar na perda definitiva dos fundos. Confira o endereço e a rede na sua carteira antes de enviar. As transferências em blockchain geralmente são irreversíveis.",
      payment: "As doações em criptomoedas são enviadas diretamente à carteira. Pagamentos com cartão e conversão automática de moedas não estão disponíveis aqui.",
      copied: "Endereço copiado",
      copyFailed: "Não foi possível copiar. Selecione o endereço acima e copie-o manualmente.",
    },
    zh: {
      title: "支持 THE HUMAN EXPERIMENT",
      language: "语言",
      heading: "支持项目",
      introHeading: "重大的改变始于一个决定。",
      intro: "THE HUMAN EXPERIMENT 试图更好地理解人：我们如何做决定，什么驱动着我们，以及我们能共同创造怎样的未来。",
      introFuture: "也许有一天，这些问题的答案会改变我们理解自己和彼此的方式。",
      introContribution: "你的支持能帮助这个想法成长。即使是一笔小小的捐助，也能成为一件更大事情的一部分。",
      donate: "捐助加密货币",
      asset: "加密货币",
      network: "网络",
      qrAlt: "钱包地址二维码",
      copy: "复制钱包地址",
      warning: "请仅通过 {network} 网络发送 {asset}。",
      transfer: "使用其他网络可能导致资金永久丢失。发送前，请在钱包中核对地址和网络。区块链转账通常无法撤销。",
      payment: "加密货币捐助直接转入钱包。此页面不支持银行卡付款或自动货币兑换。",
      copied: "地址已复制",
      copyFailed: "复制失败。请选中上方的地址并手动复制。",
    },
    de: {
      title: "THE HUMAN EXPERIMENT unterstützen",
      language: "Sprache",
      heading: "Projekt unterstützen",
      introHeading: "Große Veränderungen beginnen mit einer einzigen Entscheidung.",
      intro: "THE HUMAN EXPERIMENT versucht, Menschen besser zu verstehen: wie wir Entscheidungen treffen, was uns antreibt und welche Zukunft wir gemeinsam gestalten können.",
      introFuture: "Vielleicht verändern die Antworten auf diese Fragen eines Tages, wie wir uns selbst und einander verstehen.",
      introContribution: "Dein Beitrag kann helfen, diese Idee weiterzuentwickeln. Selbst eine kleine Spende kann Teil von etwas viel Größerem sein.",
      donate: "Kryptowährung spenden",
      asset: "Kryptowährung",
      network: "Netzwerk",
      qrAlt: "QR-Code der Wallet-Adresse",
      copy: "Wallet-Adresse kopieren",
      warning: "Sende ausschließlich {asset} über das Netzwerk {network}.",
      transfer: "Bei Verwendung eines anderen Netzwerks kann das Guthaben dauerhaft verloren gehen. Prüfe vor dem Senden die Adresse und das Netzwerk in deiner Wallet. Blockchain-Überweisungen lassen sich in der Regel nicht rückgängig machen.",
      payment: "Kryptospenden gehen direkt an die Wallet. Kartenzahlungen und automatische Währungsumrechnung sind hier nicht verfügbar.",
      copied: "Adresse kopiert",
      copyFailed: "Kopieren fehlgeschlagen. Markiere die Adresse oben und kopiere sie manuell.",
    },
    ja: {
      title: "THE HUMAN EXPERIMENT を支援",
      language: "言語",
      heading: "プロジェクトを支援",
      introHeading: "大きな変化は、一つの決断から始まります。",
      intro: "THE HUMAN EXPERIMENT は、人間をより深く理解するための試みです。私たちはどう決断し、何に突き動かされ、どんな未来を共につくれるのでしょうか。",
      introFuture: "いつか、これらの問いへの答えが、自分自身や互いを理解する仕方を変えるかもしれません。",
      introContribution: "あなたの支援が、このアイデアを育てる力になります。小さな寄付でも、ずっと大きな取り組みの一部になれます。",
      donate: "暗号資産で寄付する",
      asset: "暗号資産",
      network: "ネットワーク",
      qrAlt: "ウォレットアドレスの QR コード",
      copy: "ウォレットアドレスをコピー",
      warning: "{network} ネットワークで {asset} のみを送金してください。",
      transfer: "別のネットワークを使用すると、資金を永久に失うおそれがあります。送金前に、ウォレットでアドレスとネットワークを確認してください。ブロックチェーン上の送金は通常、取り消せません。",
      payment: "暗号資産の寄付はウォレットに直接送金されます。このページではカード決済や自動通貨換算は利用できません。",
      copied: "アドレスをコピーしました",
      copyFailed: "コピーできませんでした。上のアドレスを選択し、手動でコピーしてください。",
    },
    fr: {
      title: "Soutenir THE HUMAN EXPERIMENT",
      language: "Langue",
      heading: "Soutenir le projet",
      introHeading: "Les grands changements commencent par une seule décision.",
      intro: "THE HUMAN EXPERIMENT cherche à mieux comprendre les êtres humains : comment nous prenons des décisions, ce qui nous motive et quel avenir nous pouvons construire ensemble.",
      introFuture: "Peut-être qu’un jour les réponses à ces questions changeront la manière dont nous nous comprenons nous-mêmes et les uns les autres.",
      introContribution: "Votre contribution peut aider cette idée à grandir. Même un petit don peut faire partie de quelque chose de bien plus grand.",
      donate: "Faire un don en cryptomonnaie",
      asset: "Cryptomonnaie",
      network: "Réseau",
      qrAlt: "Code QR de l’adresse du portefeuille",
      copy: "Copier l’adresse du portefeuille",
      warning: "Envoyez uniquement des {asset} sur le réseau {network}.",
      transfer: "L’utilisation d’un autre réseau peut entraîner la perte définitive des fonds. Vérifiez l’adresse et le réseau dans votre portefeuille avant l’envoi. Les transferts sur la blockchain sont généralement irréversibles.",
      payment: "Les dons en cryptomonnaie sont envoyés directement au portefeuille. Le paiement par carte et la conversion automatique de devises ne sont pas disponibles ici.",
      copied: "Adresse copiée",
      copyFailed: "La copie a échoué. Sélectionnez l’adresse ci-dessus et copiez-la manuellement.",
    },
    ar: {
      title: "ادعم \u2066THE HUMAN EXPERIMENT\u2069",
      language: "اللغة",
      heading: "ادعم المشروع",
      introHeading: "التغييرات الكبيرة تبدأ بقرار واحد.",
      intro: "تسعى THE HUMAN EXPERIMENT إلى فهم الناس بصورة أفضل: كيف نتخذ القرارات، وما الذي يدفعنا، وأي مستقبل يمكننا أن نبنيه معًا.",
      introFuture: "لعلّ الإجابات عن هذه الأسئلة تغيّر يومًا ما طريقة فهمنا لأنفسنا وللآخرين.",
      introContribution: "يمكن لمساهمتك أن تساعد هذه الفكرة على النمو. حتى التبرع الصغير يمكن أن يكون جزءًا من أمر أكبر بكثير.",
      donate: "تبرّع بالعملات المشفرة",
      asset: "العملة المشفرة",
      network: "الشبكة",
      qrAlt: "رمز الاستجابة السريعة لعنوان المحفظة",
      copy: "انسخ عنوان المحفظة",
      warning: "أرسل عملة {asset} فقط عبر شبكة {network}.",
      transfer: "قد يؤدي استخدام شبكة أخرى إلى فقدان الأموال نهائيًا. تحقق من العنوان والشبكة في محفظتك قبل الإرسال. لا يمكن عادةً التراجع عن التحويلات على سلسلة الكتل.",
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
