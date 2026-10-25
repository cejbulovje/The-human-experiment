(() => {
  const introText = {
    ru: 'Я придумал эксперимент, поэтому решил воспользоваться правом первого голоса. Считайте это последним решением, которое я принимаю единолично. Ну… по крайней мере, постараюсь. 😉',
    en: 'I came up with this experiment, so I decided to exercise the right to cast the first vote. Consider this the last decision I make alone. Well… at least I’ll try. 😉'
  };
  function decorate() {
    const card = document.getElementById('author-answer-collective');
    if (!card || card.dataset.decorated === 'true') return;
    const article = card.querySelector('.author-answer-card');
    if (!article) return;
    const lang = document.getElementById('page-language')?.value || 'en';
    const locale = lang === 'ru' ? 'ru' : 'en';
    const heading = article.querySelector('.author-answer-title');
    if (heading && !heading.textContent.startsWith('🌍')) heading.textContent = '🌍 ' + heading.textContent;
    if (heading) {
      const intro = document.createElement('p');
      intro.className = 'author-answer-intro';
      intro.textContent = introText[locale];
      heading.before(intro);
    }
    const emojis = ['🤝','👁️','🛡️','🌐',null,'🪞','❤️','🌱',null,null,null,'🔄','💡','🌍','🎨','✨','🌟','🤝','🌍❤️'];
    const paragraphs = article.querySelectorAll('.author-answer-body p');
    paragraphs.forEach((p, i) => {
      const emoji = emojis[i];
      if (emoji && !p.textContent.endsWith(emoji)) p.textContent += ' ' + emoji;
    });
    card.dataset.decorated = 'true';
  }
  document.addEventListener('DOMContentLoaded', decorate);
  document.getElementById('page-language')?.addEventListener('change', () => {
    const card = document.getElementById('author-answer-collective');
    if (card) card.dataset.decorated = 'false';
    decorate();
  });
})();
