/*
 * lang.js
 *
 * Simple internationalisation helper for the Souvenir site. Defines a set
 * of translation strings for supported languages and applies them to
 * elements annotated with the `data-i18n` attribute. A language selector
 * composed of elements with the `lang-icon` class and a `data-lang` attribute
 * triggers language changes. Selected language persists in localStorage.
 */

(function() {
  'use strict';

  // Translation dictionary keyed by language code. Extend this object to
  // support additional pages and languages. Keys correspond to values of
  // the `data-i18n` attribute used in HTML elements.
  const translations = {
    pt: {
      nav_home: 'Início',
      nav_store: 'Loja Virtual',
      nav_catalogs: 'Catálogos',
      nav_stores: 'Lojas',
      nav_about: 'Sobre',
      nav_login: 'Entrar',
      nav_profile: 'Minha Conta',
      login_title: 'Entrar',
      login_email_label: 'E-mail',
      login_password_label: 'Senha',
      login_button: 'Entrar',
    },
    es: {
      nav_home: 'Inicio',
      nav_store: 'Tienda virtual',
      nav_catalogs: 'Catálogos',
      nav_stores: 'Tiendas',
      nav_about: 'Acerca de',
      nav_login: 'Ingresar',
      nav_profile: 'Mi cuenta',
      login_title: 'Iniciar sesión',
      login_email_label: 'Correo electrónico',
      login_password_label: 'Contraseña',
      login_button: 'Ingresar',
    }
  };

  /**
   * Persists the chosen language and re-applies translations.
   * @param {string} lang Language code (e.g. 'pt' or 'es').
   */
  function setLanguage(lang) {
    localStorage.setItem('lang', lang);
    applyLanguage();
  }

  /**
   * Applies translations to all elements with `data-i18n` attributes. If a
   * placeholder is present on an input element, the placeholder is
   * translated instead of the text content.
   */
  function applyLanguage() {
    const lang = localStorage.getItem('lang') || 'pt';
    const dict = translations[lang] || translations['pt'];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = dict[key];
      if (!value) return;
      const tag = el.tagName.toLowerCase();
      if (tag === 'input' && el.hasAttribute('placeholder')) {
        el.placeholder = value;
      } else {
        el.textContent = value;
      }
    });
  }

  // Set up listeners on language icons and apply initial language on page load
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.lang-icon').forEach(icon => {
      icon.addEventListener('click', () => {
        const lang = icon.getAttribute('data-lang');
        setLanguage(lang);
      });
    });
    applyLanguage();
  });

  // Expose functions globally in read-only manner in case other modules need them
  Object.defineProperty(window, 'setLanguage', { value: setLanguage, writable: false, configurable: false });
  Object.defineProperty(window, 'applyLanguage', { value: applyLanguage, writable: false, configurable: false });
})();