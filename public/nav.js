(() => {
  const translations = {
    en: { menu: 'Menu', goal: 'Goal of the experiment', privacy: 'Privacy', results: 'Results', share: 'Share the experiment', survey: 'Survey', contact: 'Contact', support: 'Support the project', shared: 'Link copied', failed: 'Could not share' },
    ru: { menu: 'Меню', goal: 'Цель эксперимента', privacy: 'Конфиденциальность', results: 'Результаты', share: 'Поделиться экспериментом', survey: 'Опрос', contact: 'Contact', support: 'Поддержать проект', shared: 'Ссылка скопирована', failed: 'Не удалось поделиться' },
    es: { menu: 'Menú', goal: 'Objetivo del experimento', privacy: 'Privacidad', results: 'Resultados', share: 'Compartir el experimento', survey: 'Encuesta', contact: 'Contact', support: 'Apoyar el proyecto', shared: 'Enlace copiado', failed: 'No se pudo compartir' },
    pt: { menu: 'Menu', goal: 'Objetivo da experiência', privacy: 'Privacidade', results: 'Resultados', share: 'Compartilhar a experiência', survey: 'Questionário', contact: 'Contact', support: 'Apoiar o projeto', shared: 'Link copiado', failed: 'Não foi possível compartilhar' },
    zh: { menu: '菜单', goal: '实验目标', privacy: '隐私政策', results: '结果', share: '分享实验', survey: '问卷', contact: 'Contact', support: '支持项目', shared: '链接已复制', failed: '无法分享' },
    de: { menu: 'Menü', goal: 'Ziel des Experiments', privacy: 'Datenschutz', results: 'Ergebnisse', share: 'Experiment teilen', survey: 'Umfrage', contact: 'Contact', support: 'Projekt unterstützen', shared: 'Link kopiert', failed: 'Teilen nicht möglich' },
    ja: { menu: 'メニュー', goal: '実験の目的', privacy: 'プライバシー', results: '結果', share: '実験を共有', survey: 'アンケート', contact: 'Contact', support: 'プロジェクトを支援', shared: 'リンクをコピーしました', failed: '共有できませんでした' },
    fr: { menu: 'Menu', goal: 'Objectif de l’expérience', privacy: 'Confidentialité', results: 'Résultats', share: 'Partager l’expérience', survey: 'Questionnaire', contact: 'Contact', support: 'Soutenir le projet', shared: 'Lien copié', failed: 'Partage impossible' },
    ar: { menu: 'القائمة', goal: 'هدف التجربة', privacy: 'الخصوصية', results: 'النتائج', share: 'مشاركة التجربة', survey: 'الاستبيان', contact: 'Contact', support: 'ادعم المشروع', shared: 'تم نسخ الرابط', failed: 'تعذرت المشاركة' }
  };
  const language = () => {
    const picker = document.querySelector('#language, #page-language');
    const code = picker?.value || document.documentElement.lang || 'en';
    return translations[code] ? code : 'en';
  };
  const applyLabels = () => {
    const t = translations[language()];
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
    button.textContent = 'Contact';
    button.addEventListener('click', async () => {
      if (!revealed) {
        revealed = true;
        button.textContent = email;
        button.setAttribute('aria-label', 'Copy email address ' + email);
        status.textContent = '';
        return;
      }
      try {
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
        status.textContent = 'Email copied!';
        button.title = 'Email copied!';
      } catch {
        status.textContent = 'Could not copy. Select the email address and copy it.';
        button.title = 'Select and copy this email address';
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
