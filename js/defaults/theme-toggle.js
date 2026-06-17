(function () {
  const STORAGE_KEY = 'theme';

  function applyTheme(mode) {
    if (mode === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
      btn.setAttribute('title', mode === 'light' ? 'Mudar para modo escuro' : 'Mudar para modo claro');
      btn.innerHTML = mode === 'light' ? getSunIcon() : getMoonIcon();
    }
  }

  function getSunIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>`;
  }

  function getMoonIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>`;
  }

  function createButton() {
    if (document.getElementById('themeToggleBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'themeToggleBtn';
    document.body.appendChild(btn);

    const saved = localStorage.getItem(STORAGE_KEY) || 'dark';
    applyTheme(saved);

    btn.addEventListener('click', function () {
      const current = localStorage.getItem(STORAGE_KEY) || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  }

  const saved = localStorage.getItem(STORAGE_KEY) || 'dark';
  if (saved === 'light') document.documentElement.classList.add('light-mode');

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createButton);
  } else {
    createButton();
  }
})();
