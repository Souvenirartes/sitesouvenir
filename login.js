/*
 * login.js
 *
 * Implements the login functionality for the Souvenir site using Firebase
 * Authentication. Handles form submission, signs the user in, and
 * redirects to the default catalog page upon successful login. If
 * authentication fails, a toast notification is displayed. Uses
 * strict mode to avoid accidental globals and enforce safer coding.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');

  /**
   * Display a toast notification with the given message. Toasts fade
   * out automatically after a few seconds.
   * @param {string} message
   */
  function showToast(message) {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      Object.assign(container.style, {
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: '2000',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      });
      document.body.appendChild(container);
    }
    // Create toast element
    const toast = document.createElement('div');
    toast.textContent = message;
    Object.assign(toast.style, {
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      color: '#fff',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      fontSize: '0.9rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      opacity: '1',
      transition: 'opacity 0.5s ease'
    });
    container.appendChild(toast);
    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, 3000);
  }

  // Handle form submission
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) {
      showToast('Por favor, preencha todos os campos.');
      return;
    }
    // Disable submit button to prevent multiple clicks
    const submitBtn = loginForm.querySelector('.btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Entrando...';
    // Sign in with Firebase Auth
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        // Redirect to catalogos.html after successful login
        window.location.href = 'catalogos.html';
      })
      .catch((error) => {
        // Show error message via toast
        let message;
        switch (error.code) {
          case 'auth/user-not-found':
            message = 'Usuário não encontrado.';
            break;
          case 'auth/wrong-password':
            message = 'Senha incorreta.';
            break;
          case 'auth/invalid-email':
            message = 'E-mail inválido.';
            break;
          default:
            message = 'Erro ao fazer login. Tente novamente.';
        }
        showToast(message);
      })
      .finally(() => {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Entrar';
      });
  });
});