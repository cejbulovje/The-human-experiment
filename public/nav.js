(() => {
  const translations = {
    en: { menu: 'Menu', goal: 'Goal of the experiment', privacy: 'Privacy', share: 'Share the experiment', survey: 'Survey', contact: 'Contact', support: 'Support the project', shared: 'Link copied', failed: 'Could not share' },
    ru: { menu: 'Меню', goal: 'Цель эксперимента', privacy: 'Конфиденциальность', share: 'Поделиться экспериментом', survey: 'Опрос', contact: 'Контакты', support: 'Поддержать проект', shared: 'Ссылка скопирована', failed: 'Не удалось поделиться' },
    es: { menu: 'Menú', goal: 'Objetivo del experimento', privacy: 'Privacidad', share: 'Compartir el experimento', survey: 'Encuesta', contact: 'Contacto', support: 'Apoyar el proyecto', shared: 'Enlace copiado', failed: 'No se pudo compartir' },
    pt: { menu: 'Menu', goal: 'Objetivo da experiência', privacy: 'Privacidade', share: 'Compartilhar a experiência', survey: 'Questionário', contact: 'Contato', support: 'Apoiar o projeto', shared: 'Link copiado', failed: 'Não foi possível compartilhar' },
    zh: { menu: '菜单', goal: '实验目标', privacy: '隐私政策', share: '分享实验', survey: '问卷', contact: '联系方式', support: '支持项目', shared: '链接已复制', failed: '无法分享' },
    de: { menu: 'Menü', goal: 'Ziel des Experiments', privacy: 'Datenschutz', share: 'Experiment teilen', survey: 'Umfrage', contact: 'Kontakt', support: 'Projekt unterstützen', shared: 'Link kopiert', failed: 'Teilen nicht möglich' },
    ja: { menu: 'メニュー', goal: '実験の目的', privacy: 'プライバシー', share: '実験を共有', survey: 'アンケート', contact: 'お問い合わせ', support: 'プロジェクトを支援', shared: 'リンクをコピーしました', failed: '共有できませんでした' },
    fr: { menu: 'Menu', goal: 'Objectif de l’expérience', privacy: 'Confidentialité', share: 'Partager l’expérience', survey: 'Questionnaire', contact: 'Contact', support: 'Soutenir le projet', shared: 'Lien copié', failed: 'Partage impossible' },
    ar: { menu: 'القائمة', goal: 'هدف التجربة', privacy: 'الخصوصية', share: 'مشاركة التجربة', survey: 'الاستبيان', contact: 'اتصل بنا', support: 'ادعم المشروع', shared: 'تم نسخ الرابط', failed: 'تعذرت المشاركة' }
  };
  const getLanguage = () => {
    const picker = document.querySelector('#language, #page-language');
    const candidate = picker?.value || document.documentElement.lang || 'en';
    return translations[candidate] ? candidate : 'en';
  };
  const applyLabels = () => {
    const t = translations[getLanguage()];
    document.querySelectorAll('[data-menu]').forEach(el => {
      const key = el.dataset.menu;
      if (t[key]) el.textContent = t[key];
    });
    const trigger = document.querySelector('[data-menu-label]');
    if (trigger) {
      trigger.textContent = '☰';
      trigger.setAttribute('aria-label', t.menu);
      trigger.setAttribute('title', t.menu);
    }
  };
  document.querySelectorAll('[data-site-share]').forEach(button => {
    button.addEventListener('click', async () => {
      const t = translations[getLanguage()];
      const payload = { title: 'THE HUMAN EXPERIMENT', text: t.share, url: location.origin + '/' };
      try {
        if (navigator.share) await navigator.share(payload);
        else if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(payload.url);
          button.textContent = t.shared;
          setTimeout(() => { applyLabels(); }, 1800);
        } else {
          const helper = document.createElement('textarea');
          helper.value = payload.url;
          helper.setAttribute('readonly', '');
          helper.style.position = 'fixed';
          helper.style.opacity = '0';
          document.body.append(helper);
          helper.select();
          const copied = document.execCommand('copy');
          helper.remove();
          if (!copied) throw new Error('copy_failed');
          button.textContent = t.shared;
          setTimeout(() => { applyLabels(); }, 1800);
        }
      } catch (error) {
        if (error?.name !== 'AbortError') {
          button.textContent = t.failed;
          setTimeout(() => { applyLabels(); }, 1800);
        }
      }
    });
  });
  document.querySelectorAll('.site-menu-details').forEach(details => {
    document.addEventListener('click', event => {
      if (!details.contains(event.target)) details.open = false;
    });
    details.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { details.open = false; }));
  });
  applyLabels();
  document.querySelectorAll('#language, #page-language').forEach(picker => picker.addEventListener('change', applyLabels));
})();
