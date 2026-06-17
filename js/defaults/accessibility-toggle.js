(function () {
  const STORAGE_KEY = 'accessibility-text-large';

  function applyAccessibility(isActive) {
    if (isActive) {
      document.documentElement.classList.add('accessibility-large-text');
    } else {
      document.documentElement.classList.remove('accessibility-large-text');
    }
    const btn = document.getElementById('accessibilityToggleBtn');
    if (btn) {
      btn.setAttribute('title', isActive ? 'Diminuir tamanho do texto' : 'Aumentar tamanho do texto');
      btn.innerHTML = getAccessibilityIcon();

      if (isActive) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  }

  function getAccessibilityIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/>
      <path d="M8 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3"/>
      <path d="M12 4v16"/>
      <path d="M9 9h6"/>
    </svg>`;
  }

  function createButton() {
    if (document.getElementById('accessibilityToggleBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'accessibilityToggleBtn';
    document.body.appendChild(btn);

    const saved = localStorage.getItem(STORAGE_KEY) === 'true';
    applyAccessibility(saved);

    btn.addEventListener('click', function () {
      const current = localStorage.getItem(STORAGE_KEY) === 'true';
      const next = !current;
      localStorage.setItem(STORAGE_KEY, next);
      applyAccessibility(next);
    });
  }

  const saved = localStorage.getItem(STORAGE_KEY) === 'true';
  if (saved) document.documentElement.classList.add('accessibility-large-text');

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createButton);
  } else {
    createButton();
  }
})();
