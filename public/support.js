(() => {
  const supportText = {
    en: {
      title: "Support THE HUMAN EXPERIMENT",
      language: "Language",
      heading: "Support the author and project",
      introHeading: "Big changes begin with a single decision.",
      intro: "THE HUMAN EXPERIMENT is an attempt to better understand people: how we make decisions, what drives us, and what kind of future we can create together.",
      introFuture: "Perhaps the answers to these questions will one day change how we understand ourselves and each other.",
      introContribution: "Voluntary donations support the author personally and help them continue the research and development of the site. Every contribution is appreciated.",
      donate: "Donate cryptocurrency",
      asset: "Cryptocurrency",
      network: "Network",
      qrAlt: "QR code for the wallet address",
      copy: "Copy wallet address",
      warning: "Send only {asset} on {network}.",
      transfer: "Before sending, check that the address and network in your wallet match those shown here.",
      payment: "Crypto donations are direct wallet transfers. No card payments or automatic currency conversion are available here.",
      copied: "Address copied",
      copyFailed: "Copy failed. Please select the address above manually.",
    },
    ru: {
      title: "Поддержать THE HUMAN EXPERIMENT",
      language: "Язык",
      heading: "Поддержать автора и проект",
      introHeading: "Большие перемены начинаются с одного решения.",
      intro: "THE HUMAN EXPERIMENT - попытка лучше понять людей: как мы принимаем решения, что нами движет и какое будущее мы можем создать вместе.",
      introFuture: "Возможно, однажды ответы на эти вопросы изменят то, как мы понимаем себя и друг друга.",
      introContribution: "Добровольные пожертвования поддерживают автора лично и помогают ему продолжать работу над исследованием и сайтом. Любая сумма важна.",
      donate: "Пожертвовать криптовалюту",
      asset: "Криптовалюта",
      network: "Сеть",
      qrAlt: "QR-код адреса кошелька",
      copy: "Скопировать адрес кошелька",
      warning: "Отправляйте только {asset} в сети {network}.",
      transfer: "Перед отправкой сверьте адрес и сеть в кошельке с указанными на этой странице.",
      payment: "Пожертвования в криптовалюте поступают напрямую на кошелёк. Оплата картой и автоматическая конвертация валют здесь недоступны.",
      copied: "Адрес скопирован",
      copyFailed: "Не удалось скопировать. Выделите адрес выше и скопируйте его вручную.",
    },
    es: {
      title: "Apoyar a THE HUMAN EXPERIMENT",
      language: "Idioma",
      heading: "Apoyar al autor y al proyecto",
      introHeading: "Los grandes cambios comienzan con una sola decisión.",
      intro: "THE HUMAN EXPERIMENT busca comprender mejor a las personas: cómo tomamos decisiones, qué nos motiva y qué futuro podemos construir juntos.",
      introFuture: "Quizá algún día las respuestas a estas preguntas cambien nuestra manera de entendernos a nosotros mismos y a los demás.",
      introContribution: "Las donaciones voluntarias apoyan personalmente al autor y le ayudan a seguir investigando y desarrollando el sitio. Se agradece cualquier cantidad.",
      donate: "Donar criptomonedas",
      asset: "Criptomoneda",
      network: "Red",
      qrAlt: "Código QR de la dirección de la billetera",
      copy: "Copiar la dirección de la billetera",
      warning: "Envía solo {asset} a través de la red {network}.",
      transfer: "Antes de enviar, comprueba que la dirección y la red de tu billetera coincidan con las de esta página.",
      payment: "Las donaciones en criptomonedas se envían directamente a la billetera. Aquí no se aceptan pagos con tarjeta ni se ofrece conversión automática de divisas.",
      copied: "Dirección copiada",
      copyFailed: "No se pudo copiar. Selecciona la dirección de arriba y cópiala manualmente.",
    },
    pt: {
      title: "Apoiar THE HUMAN EXPERIMENT",
      language: "Idioma",
      heading: "Apoiar o autor e o projeto",
      introHeading: "Grandes mudanças começam com uma única decisão.",
      intro: "THE HUMAN EXPERIMENT é uma tentativa de compreender melhor as pessoas: como tomamos decisões, o que nos motiva e que futuro podemos construir juntos.",
      introFuture: "Talvez um dia as respostas a essas perguntas mudem a forma como entendemos a nós mesmos e uns aos outros.",
      introContribution: "As doações voluntárias apoiam o autor pessoalmente e ajudam a continuar a pesquisa e o desenvolvimento do site. Qualquer valor é bem-vindo.",
      donate: "Doar criptomoedas",
      asset: "Criptomoeda",
      network: "Rede",
      qrAlt: "Código QR do endereço da carteira",
      copy: "Copiar o endereço da carteira",
      warning: "Envie apenas {asset} pela rede {network}.",
      transfer: "Antes de enviar, confira se o endereço e a rede na sua carteira correspondem aos desta página.",
      payment: "As doações em criptomoedas são enviadas diretamente à carteira. Pagamentos com cartão e conversão automática de moedas não estão disponíveis aqui.",
      copied: "Endereço copiado",
      copyFailed: "Não foi possível copiar. Selecione o endereço acima e copie-o manualmente.",
    },
    zh: {
      title: "支持 THE HUMAN EXPERIMENT",
      language: "语言",
      heading: "支持作者与项目",
      introHeading: "重大的改变始于一个决定。",
      intro: "THE HUMAN EXPERIMENT 试图更好地理解人：我们如何做决定，什么驱动着我们，以及我们能共同创造怎样的未来。",
      introFuture: "也许有一天，这些问题的答案会改变我们理解自己和彼此的方式。",
      introContribution: "自愿捐助既支持作者本人，也帮助其继续研究和改进网站。任何金额都值得感谢。",
      donate: "捐助加密货币",
      asset: "加密货币",
      network: "网络",
      qrAlt: "钱包地址二维码",
      copy: "复制钱包地址",
      warning: "请仅通过 {network} 网络发送 {asset}。",
      transfer: "发送前，请核对钱包中的地址和网络是否与本页一致。",
      payment: "加密货币捐助直接转入钱包。此页面不支持银行卡付款或自动货币兑换。",
      copied: "地址已复制",
      copyFailed: "复制失败。请选中上方的地址并手动复制。",
    },
    de: {
      title: "THE HUMAN EXPERIMENT unterstützen",
      language: "Sprache",
      heading: "Autor und Projekt unterstützen",
      introHeading: "Große Veränderungen beginnen mit einer einzigen Entscheidung.",
      intro: "THE HUMAN EXPERIMENT versucht, Menschen besser zu verstehen: wie wir Entscheidungen treffen, was uns antreibt und welche Zukunft wir gemeinsam gestalten können.",
      introFuture: "Vielleicht verändern die Antworten auf diese Fragen eines Tages, wie wir uns selbst und einander verstehen.",
      introContribution: "Freiwillige Spenden unterstützen den Autor persönlich und helfen ihm, die Forschung und die Website weiterzuentwickeln. Jeder Betrag ist willkommen.",
      donate: "Kryptowährung spenden",
      asset: "Kryptowährung",
      network: "Netzwerk",
      qrAlt: "QR-Code der Wallet-Adresse",
      copy: "Wallet-Adresse kopieren",
      warning: "Sende ausschließlich {asset} über das Netzwerk {network}.",
      transfer: "Prüfe vor dem Senden, ob Adresse und Netzwerk in deiner Wallet mit den Angaben auf dieser Seite übereinstimmen.",
      payment: "Kryptospenden gehen direkt an die Wallet. Kartenzahlungen und automatische Währungsumrechnung sind hier nicht verfügbar.",
      copied: "Adresse kopiert",
      copyFailed: "Kopieren fehlgeschlagen. Markiere die Adresse oben und kopiere sie manuell.",
    },
    ja: {
      title: "THE HUMAN EXPERIMENT を支援",
      language: "言語",
      heading: "作者とプロジェクトを支援",
      introHeading: "大きな変化は、一つの決断から始まります。",
      intro: "THE HUMAN EXPERIMENT は、人間をより深く理解するための試みです。私たちはどう決断し、何に突き動かされ、どんな未来を共につくれるのでしょうか。",
      introFuture: "いつか、これらの問いへの答えが、自分自身や互いを理解する仕方を変えるかもしれません。",
      introContribution: "任意の寄付は作者本人を支え、研究とウェブサイトの開発を続ける助けになります。金額の大小は問いません。",
      donate: "暗号資産で寄付する",
      asset: "暗号資産",
      network: "ネットワーク",
      qrAlt: "ウォレットアドレスの QR コード",
      copy: "ウォレットアドレスをコピー",
      warning: "{network} ネットワークで {asset} のみを送金してください。",
      transfer: "送金前に、ウォレットのアドレスとネットワークがこのページの表示と一致していることをご確認ください。",
      payment: "暗号資産の寄付はウォレットに直接送金されます。このページではカード決済や自動通貨換算は利用できません。",
      copied: "アドレスをコピーしました",
      copyFailed: "コピーできませんでした。上のアドレスを選択し、手動でコピーしてください。",
    },
    fr: {
      title: "Soutenir THE HUMAN EXPERIMENT",
      language: "Langue",
      heading: "Soutenir l'auteur et le projet",
      introHeading: "Les grands changements commencent par une seule décision.",
      intro: "THE HUMAN EXPERIMENT cherche à mieux comprendre les êtres humains : comment nous prenons des décisions, ce qui nous motive et quel avenir nous pouvons construire ensemble.",
      introFuture: "Peut-être qu’un jour les réponses à ces questions changeront la manière dont nous nous comprenons nous-mêmes et les uns les autres.",
      introContribution: "Les dons volontaires soutiennent personnellement l'auteur et l'aident à poursuivre la recherche et le développement du site. Chaque contribution compte.",
      donate: "Faire un don en cryptomonnaie",
      asset: "Cryptomonnaie",
      network: "Réseau",
      qrAlt: "Code QR de l’adresse du portefeuille",
      copy: "Copier l’adresse du portefeuille",
      warning: "Envoyez uniquement des {asset} sur le réseau {network}.",
      transfer: "Avant l’envoi, vérifiez que l’adresse et le réseau dans votre portefeuille correspondent aux indications de cette page.",
      payment: "Les dons en cryptomonnaie sont envoyés directement au portefeuille. Le paiement par carte et la conversion automatique de devises ne sont pas disponibles ici.",
      copied: "Adresse copiée",
      copyFailed: "La copie a échoué. Sélectionnez l’adresse ci-dessus et copiez-la manuellement.",
    },
    ar: {
      title: "ادعم \u2066THE HUMAN EXPERIMENT\u2069",
      language: "اللغة",
      heading: "دعم صاحب الفكرة والمشروع",
      introHeading: "التغييرات الكبيرة تبدأ بقرار واحد.",
      intro: "تسعى THE HUMAN EXPERIMENT إلى فهم الناس بصورة أفضل: كيف نتخذ القرارات، وما الذي يدفعنا، وأي مستقبل يمكننا أن نبنيه معًا.",
      introFuture: "لعلّ الإجابات عن هذه الأسئلة تغيّر يومًا ما طريقة فهمنا لأنفسنا وللآخرين.",
      introContribution: "التبرعات الطوعية تدعم صاحب الفكرة شخصيا وتساعده على مواصلة البحث وتطوير الموقع. كل مساهمة محل تقدير.",
      donate: "تبرّع بالعملات المشفرة",
      asset: "العملة المشفرة",
      network: "الشبكة",
      qrAlt: "رمز الاستجابة السريعة لعنوان المحفظة",
      copy: "انسخ عنوان المحفظة",
      warning: "أرسل عملة {asset} فقط عبر شبكة {network}.",
      transfer: "قبل الإرسال، تأكد من أن العنوان والشبكة في محفظتك يطابقان ما هو موضح في هذه الصفحة.",
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
