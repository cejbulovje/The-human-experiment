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
  document.querySelectorAll('[data-site-share]').forEach(button => {
    button.addEventListener('click', async () => {
      const t = translations[language()];
      const url = location.origin + '/';
      try {
        if (navigator.share) await navigator.share({ title: 'THE HUMAN EXPERIMENT', text: t.share, url });
        else {
          if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
          else {
            const helper = document.createElement('textarea');
            helper.value = url;
            helper.setAttribute('readonly', '');
            helper.style.position = 'fixed';
            helper.style.opacity = '0';
            document.body.append(helper);
            helper.select();
            const copied = document.execCommand('copy');
            helper.remove();
            if (!copied) throw new Error('copy_failed');
          }
          button.textContent = t.shared;
          setTimeout(applyLabels, 1800);
        }
      } catch (error) {
        if (error?.name !== 'AbortError') {
          button.textContent = t.failed;
          setTimeout(applyLabels, 1800);
        }
      }
    });
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
