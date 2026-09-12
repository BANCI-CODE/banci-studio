(() => {
  'use strict';

  const setText = (selector, value) => {
    document.querySelectorAll(selector).forEach(element => { element.textContent = value; });
  };

  const setList = (selector, items) => {
    document.querySelectorAll(selector).forEach(element => {
      element.replaceChildren(...items.map(item => {
        const span = document.createElement('span');
        span.textContent = item;
        return span;
      }));
    });
  };

  const configureLink = (selector, value, type) => {
    document.querySelectorAll(selector).forEach(link => {
      const field = link.closest('[data-contact-field]') || link;
      if (!value) {
        field.hidden = true;
        return;
      }
      field.hidden = false;
      link.textContent = type === 'email' ? value : type === 'linkedin' ? 'LINKEDIN ↗' : 'RESUME ↗';
      link.href = type === 'email' ? `mailto:${value}` : value;
      if (type === 'linkedin') {
        link.target = '_blank';
        link.rel = 'noreferrer';
      }
    });
  };

  let contactConfig = null;

  const currentLanguage = () => {
    if (window.BanciI18n?.language) return window.BanciI18n.language;
    return localStorage.getItem('banci-language') === 'en' || document.body.dataset.language === 'en' ? 'en' : 'zh';
  };

  const renderContact = config => {
      const language = currentLanguage();
      setText('[data-contact-location]', language === 'zh' ? config.locationZh : config.location);
      setList('[data-contact-focus]', config.focus || []);
      setList('[data-contact-available]', config.availableFor || []);
      configureLink('[data-contact-email]', config.email, 'email');
      configureLink('[data-contact-linkedin]', config.linkedin, 'linkedin');
      configureLink('[data-contact-resume]', config.resume, 'resume');

      document.querySelectorAll('[data-contact-profiles]').forEach(group => {
        group.hidden = !config.linkedin && !config.resume;
      });
      document.querySelectorAll('[data-contact-primary]').forEach(group => {
        group.hidden = !config.email;
      });
      document.querySelectorAll('[data-home-contact-grid]').forEach(grid => {
        const visible = [...grid.children].filter(item => !item.hidden).length;
        grid.dataset.visibleCount = String(Math.max(visible, 1));
      });
  };

  fetch('/content/contact.json')
    .then(response => {
      if (!response.ok) throw new Error(`Contact config unavailable: ${response.status}`);
      return response.json();
    })
    .then(config => {
      contactConfig = config;
      renderContact(config);
    })
    .catch(error => console.warn('BANCI contact data could not be initialized.', error));

  window.addEventListener('banci:languagechange', () => {
    if (contactConfig) renderContact(contactConfig);
  });
})();
