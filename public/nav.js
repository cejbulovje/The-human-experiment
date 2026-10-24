(() => {
  const translations = {
    en: { menu: "Menu", home: "THE HUMAN EXPERIMENT home", projectLinks: "Project links", language: "Language", preferences: "Hypothetical preferences", research: "Personal preferences", goal: "Goal of the experiment", privacy: "Privacy", results: "Results", share: "Share the experiment", survey: "Survey", contact: "Contact", support: "Support the project", shared: "Link copied", failed: "Could not share", emailCopied: "Email copied!", emailCopyFailed: "Could not copy. Select the email address and copy it.", copyEmail: "Copy email address " },
    ru: { menu: "Меню", home: "Главная — THE HUMAN EXPERIMENT", projectLinks: "Ссылки проекта", language: "Язык", preferences: "Гипотетические предпочтения", research: "Гипотетические предпочтения", goal: "Цель эксперимента", privacy: "Конфиденциальность", results: "Результаты", share: "Поделиться экспериментом", survey: "Опрос", contact: "Контакты", support: "Поддержать проект", shared: "Ссылка скопирована", failed: "Не удалось поделиться", emailCopied: "Адрес электронной почты скопирован!", emailCopyFailed: "Не удалось скопировать. Выдели адрес и скопируй его.", copyEmail: "Скопировать адрес электронной почты " },
    es: { menu: "Menú", home: "Inicio — THE HUMAN EXPERIMENT", projectLinks: "Enlaces del proyecto", language: "Idioma", preferences: "Preferencias hipotéticas", research: "Preferencias hipotéticas", goal: "Objetivo del experimento", privacy: "Privacidad", results: "Resultados", share: "Compartir el experimento", survey: "Encuesta", contact: "Contacto", support: "Apoyar el proyecto", shared: "Enlace copiado", failed: "No se pudo compartir", emailCopied: "¡Correo copiado!", emailCopyFailed: "No se pudo copiar. Selecciona y copia la dirección.", copyEmail: "Copiar dirección de correo " },
    pt: { menu: "Menu", home: "Início — THE HUMAN EXPERIMENT", projectLinks: "Links do projeto", language: "Idioma", preferences: "Preferências hipotéticas", research: "Preferências hipotéticas", goal: "Objetivo da experiência", privacy: "Privacidade", results: "Resultados", share: "Compartilhar a experiência", survey: "Questionário", contact: "Contato", support: "Apoiar o projeto", shared: "Link copiado", failed: "Não foi possível compartilhar", emailCopied: "E-mail copiado!", emailCopyFailed: "Não foi possível copiar. Selecione e copie o endereço.", copyEmail: "Copiar endereço de e-mail " },
    zh: { menu: "菜单", home: "THE HUMAN EXPERIMENT 首页", projectLinks: "项目链接", language: "语言", preferences: "假设性偏好", research: "假设性偏好", goal: "实验目标", privacy: "隐私政策", results: "结果", share: "分享实验", survey: "问卷", contact: "联系", support: "支持项目", shared: "链接已复制", failed: "无法分享", emailCopied: "邮箱已复制！", emailCopyFailed: "无法复制，请选中邮箱地址并手动复制。", copyEmail: "复制邮箱地址 " },
    de: { menu: "Menü", home: "Startseite — THE HUMAN EXPERIMENT", projectLinks: "Projektlinks", language: "Sprache", preferences: "Hypothetische Präferenzen", research: "Hypothetische Präferenzen", goal: "Ziel des Experiments", privacy: "Datenschutz", results: "Ergebnisse", share: "Experiment teilen", survey: "Umfrage", contact: "Kontakt", support: "Projekt unterstützen", shared: "Link kopiert", failed: "Teilen nicht möglich", emailCopied: "E-Mail kopiert!", emailCopyFailed: "Kopieren fehlgeschlagen. Markiere die E-Mail-Adresse und kopiere sie.", copyEmail: "E-Mail-Adresse kopieren " },
    ja: { menu: "メニュー", home: "THE HUMAN EXPERIMENT ホーム", projectLinks: "プロジェクトへのリンク", language: "言語", preferences: "仮定上の希望", research: "仮定上の希望", goal: "実験の目的", privacy: "プライバシー", results: "結果", share: "実験を共有", survey: "アンケート", contact: "お問い合わせ", support: "プロジェクトを支援", shared: "リンクをコピーしました", failed: "共有できませんでした", emailCopied: "メールアドレスをコピーしました！", emailCopyFailed: "コピーできませんでした。メールアドレスを選択してコピーしてください。", copyEmail: "メールアドレスをコピー " },
    fr: { menu: "Menu", home: "Accueil — THE HUMAN EXPERIMENT", projectLinks: "Liens du projet", language: "Langue", preferences: "Préférences hypothétiques", research: "Préférences hypothétiques", goal: "Objectif de l’expérience", privacy: "Confidentialité", results: "Résultats", share: "Partager l’expérience", survey: "Questionnaire", contact: "Contact", support: "Soutenir le projet", shared: "Lien copié", failed: "Partage impossible", emailCopied: "Adresse e-mail copiée !", emailCopyFailed: "Copie impossible. Sélectionnez et copiez l’adresse e-mail.", copyEmail: "Copier l’adresse e-mail " },
    ar: { menu: "القائمة", home: "الصفحة الرئيسية لتجربة الإنسان", projectLinks: "روابط المشروع", language: "اللغة", preferences: "التفضيلات المفترضة", research: "التفضيلات المفترضة", goal: "هدف التجربة", privacy: "الخصوصية", results: "النتائج", share: "مشاركة التجربة", survey: "الاستبيان", contact: "اتصل بنا", support: "ادعم المشروع", shared: "تم نسخ الرابط", failed: "تعذرت المشاركة", emailCopied: "تم نسخ البريد الإلكتروني!", emailCopyFailed: "تعذر النسخ. حدّد عنوان البريد الإلكتروني وانسخه.", copyEmail: "نسخ عنوان البريد الإلكتروني " },
  };
  const language = () => {
    const picker = document.querySelector('#language, #page-language');
    const code = picker?.value || document.documentElement.lang || 'en';
    return translations[code] ? code : 'en';
  };
  const applyLabels = () => {
    const t = translations[language()];
    const languagePicker = document.querySelector('#language, #page-language');
    if (languagePicker) languagePicker.setAttribute('aria-label', t.language);
    document.querySelectorAll('.brand-lockup').forEach(link => link.setAttribute('aria-label', t.home));
    document.querySelectorAll('.footer-links[aria-label]').forEach(links => links.setAttribute('aria-label', t.projectLinks));
    const menu = document.querySelector('.site-menu[aria-label]');
    if (menu) menu.setAttribute('aria-label', t.menu);
    document.querySelectorAll('[data-menu]').forEach(el => {
      if (t[el.dataset.menu]) el.textContent = t[el.dataset.menu];
    });
    const trigger = document.querySelector('[data-menu-label]');
    if (trigger) {
      trigger.textContent = '☰';
      trigger.setAttribute('aria-label', t.menu);
      trigger.setAttribute('title', t.menu);
    }
  };
  document.querySelectorAll('[data-contact-copy]').forEach(button => {
    const email = 'mankindexperiment@gmail.com';
    const inMenu = Boolean(button.closest('.site-menu-panel'));
    let revealed = false;
    let status = button.parentElement.querySelector('.contact-copy-status');
    if (!status) {
      status = document.createElement('span');
      status.className = 'contact-copy-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      status.style.display = 'block';
      status.style.fontSize = '.85em';
      status.style.fontWeight = '700';
      status.style.color = 'var(--accent)';
      button.insertAdjacentElement('afterend', status);
    }
    if (inMenu) button.textContent = translations[language()].contact;
    const copyEmail = async () => {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(email);
      else {
        const helper = document.createElement('textarea');
        helper.value = email;
        helper.setAttribute('readonly', '');
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.append(helper);
        helper.select();
        const copied = document.execCommand('copy');
        helper.remove();
        if (!copied) throw new Error('copy_failed');
      }
      status.textContent = translations[language()].emailCopied;
      button.title = translations[language()].emailCopied;
    };
    button.addEventListener('click', async () => {
      if (inMenu && !revealed) {
        revealed = true;
        button.textContent = email;
        button.setAttribute('aria-label', translations[language()].copyEmail + email);
        status.textContent = '';
        return;
      }
      try {
        await copyEmail();
      } catch {
        status.textContent = translations[language()].emailCopyFailed;
        button.title = translations[language()].emailCopyFailed;
      }
    });
  });
  const shareLabels = {
    en: { title: "Share via", copy: "Copy link", email: "Email", close: "Close", copied: "Link copied", instagram: "Instagram (copy link)" },
    ru: { title: "Поделиться через", copy: "Скопировать ссылку", email: "Электронная почта", close: "Закрыть", copied: "Ссылка скопирована", instagram: "Instagram (скопировать ссылку)" },
    es: { title: "Compartir mediante", copy: "Copiar enlace", email: "Correo electrónico", close: "Cerrar", copied: "Enlace copiado" },
    pt: { title: "Partilhar através de", copy: "Copiar ligação", email: "E-mail", close: "Fechar", copied: "Ligação copiada" },
    zh: { title: "分享方式", copy: "复制链接", email: "电子邮件", close: "关闭", copied: "链接已复制" },
    de: { title: "Teilen über", copy: "Link kopieren", email: "E-Mail", close: "Schließen", copied: "Link kopiert" },
    ja: { title: "共有方法", copy: "リンクをコピー", email: "メール", close: "閉じる", copied: "リンクをコピーしました" },
    fr: { title: "Partager via", copy: "Copier le lien", email: "E-mail", close: "Fermer", copied: "Lien copié" },
    ar: { title: "المشاركة عبر", copy: "نسخ الرابط", email: "البريد الإلكتروني", close: "إغلاق", copied: "تم نسخ الرابط" }
  };
  let shareDialog;
  const getShareDialog = () => {
    if (shareDialog) return shareDialog;
    shareDialog = document.createElement('dialog');
    shareDialog.className = 'share-dialog';
    shareDialog.setAttribute('aria-labelledby', 'share-dialog-title');
    shareDialog.innerHTML = `
      <div class="share-dialog-head"><h2 id="share-dialog-title"></h2><button type="button" class="share-dialog-close" aria-label="Close">×</button></div>
      <div class="share-options">
        <a data-share-service="whatsapp" target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <a data-share-service="telegram" target="_blank" rel="noopener noreferrer">Telegram</a>
        <a data-share-service="facebook" target="_blank" rel="noopener noreferrer">Facebook</a>
        <a data-share-service="x" target="_blank" rel="noopener noreferrer">X</a>
        <a data-share-service="viber"></a>
        <a data-share-service="reddit" target="_blank" rel="noopener noreferrer">Reddit</a>
        <a data-share-service="linkedin" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a data-share-service="pinterest" target="_blank" rel="noopener noreferrer">Pinterest</a>
        <button type="button" data-share-service="instagram"></button>
        <a data-share-service="email"></a>
        <button type="button" data-share-service="copy"></button>
      </div>
      <p class="share-dialog-status" role="status" aria-live="polite"></p>`;
    document.body.append(shareDialog);
    shareDialog.querySelector('.share-dialog-close').addEventListener('click', () => shareDialog.close());
    shareDialog.addEventListener('click', event => { if (event.target === shareDialog) shareDialog.close(); });
    shareDialog.querySelector('[data-share-service="instagram"]').addEventListener('click', async () => {
      const url = location.origin + '/';
      try {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
        else {
          const helper = document.createElement('textarea');
          helper.value = url; helper.setAttribute('readonly', '');
          helper.style.position = 'fixed'; helper.style.opacity = '0';
          document.body.append(helper); helper.select();
          const copied = document.execCommand('copy'); helper.remove();
          if (!copied) throw new Error('copy_failed');
        }
        const labels = shareLabels[language()] || shareLabels.en;
        shareDialog.querySelector('.share-dialog-status').textContent = labels.copied + ' — open Instagram and paste it into your post or message.';
      } catch {
        shareDialog.querySelector('.share-dialog-status').textContent = translations[language()].failed;
      }
    });
    shareDialog.querySelector('[data-share-service="copy"]').addEventListener('click', async () => {
      const url = location.origin + '/';
      try {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
        else {
          const helper = document.createElement('textarea');
          helper.value = url; helper.setAttribute('readonly', '');
          helper.style.position = 'fixed'; helper.style.opacity = '0';
          document.body.append(helper); helper.select();
          const copied = document.execCommand('copy'); helper.remove();
          if (!copied) throw new Error('copy_failed');
        }
        shareDialog.querySelector('.share-dialog-status').textContent = shareLabels[language()].copied;
      } catch {
        shareDialog.querySelector('.share-dialog-status').textContent = translations[language()].failed;
      }
    });
    return shareDialog;
  };
  const openShareDialog = () => {
    const t = translations[language()];
    const labels = shareLabels[language()] || shareLabels.en;
    const dialog = getShareDialog();
    const url = location.origin + '/';
    const message = t.share + ' — ' + url;
    dialog.querySelector('#share-dialog-title').textContent = labels.title;
    dialog.querySelector('.share-dialog-close').setAttribute('aria-label', labels.close);
    dialog.querySelector('[data-share-service="email"]').textContent = labels.email;
    dialog.querySelector('[data-share-service="viber"]').textContent = 'Viber';
    dialog.querySelector('[data-share-service="instagram"]').textContent = labels.instagram || shareLabels.en.instagram;
    dialog.querySelector('[data-share-service="copy"]').textContent = labels.copy;
    dialog.querySelector('[data-share-service="whatsapp"]').href = 'https://wa.me/?text=' + encodeURIComponent(message);
    dialog.querySelector('[data-share-service="telegram"]').href = 'https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(t.share);
    dialog.querySelector('[data-share-service="facebook"]').href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
    dialog.querySelector('[data-share-service="x"]').href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(t.share) + '&url=' + encodeURIComponent(url);
    dialog.querySelector('[data-share-service="viber"]').href = 'viber://forward?text=' + encodeURIComponent(message);
    dialog.querySelector('[data-share-service="reddit"]').href = 'https://www.reddit.com/submit?url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(t.share);
    dialog.querySelector('[data-share-service="linkedin"]').href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url);
    dialog.querySelector('[data-share-service="pinterest"]').href = 'https://www.pinterest.com/pin/create/button/?url=' + encodeURIComponent(url) + '&description=' + encodeURIComponent(t.share);
    dialog.querySelector('[data-share-service="email"]').href = 'mailto:?subject=' + encodeURIComponent('THE HUMAN EXPERIMENT') + '&body=' + encodeURIComponent(message);
    dialog.querySelector('.share-dialog-status').textContent = '';
    if (!dialog.open) dialog.showModal();
  };
  document.querySelectorAll('[data-site-share]').forEach(button => {
    button.addEventListener('click', openShareDialog);
  });
  document.querySelectorAll('.site-menu-details').forEach(details => {
    document.addEventListener('click', event => { if (!details.contains(event.target)) details.open = false; });
    details.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { details.open = false; }));
  });
  // Page-specific scripts restore the saved language after this deferred script runs.
  // Refresh menu labels at DOMContentLoaded so they match that restored language.
  if (document.readyState === 'complete') applyLabels();
  else document.addEventListener('DOMContentLoaded', applyLabels, { once: true });
  document.querySelectorAll('#language, #page-language').forEach(picker => picker.addEventListener('change', applyLabels));
})();
