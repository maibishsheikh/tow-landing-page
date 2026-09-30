/* global firebase */

(() => {
  'use strict';

  const LOGIN_PATH = '/login';
  const GAME_PATH = '/game';
  const LEGACY_GAME_PATH = '/tug-of-war.html';
  const EXTERNAL_GAME_HOST = 'tug-of-war-hazel.vercel.app';
  const config = window.FIREBASE_CONFIG || {};
  const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const hasConfig = requiredConfig.every((key) => {
    const value = config[key];
    return typeof value === 'string' && value.length > 0 && !value.includes('YOUR_');
  });

  let auth = null;
  let firebaseError = '';

  if (hasConfig && window.firebase) {
    try {
      if (!firebase.apps.length) firebase.initializeApp(config);
      auth = firebase.auth();
    } catch (error) {
      firebaseError = error.message || 'Firebase could not be initialized.';
    }
  }

  const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
  const isProtectedGamePage = currentPath === GAME_PATH ||
    currentPath === LEGACY_GAME_PATH ||
    document.body.dataset.protectedGame === 'true';

  const getSafeNext = () => {
    const requested = new URLSearchParams(window.location.search).get('next');
    return requested === GAME_PATH ? requested : GAME_PATH;
  };

  const goToLogin = () => {
    const loginUrl = new URL(LOGIN_PATH, window.location.origin);
    loginUrl.searchParams.set('next', GAME_PATH);
    window.location.assign(loginUrl.href);
  };

  const goToGame = () => window.location.assign(GAME_PATH);

  const waitForUser = () => new Promise((resolve) => {
    if (!auth) {
      resolve(null);
      return;
    }

    let unsubscribe = () => {};
    unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });

  const requestGameAccess = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!auth) {
      goToLogin();
      return;
    }

    const user = auth.currentUser || await waitForUser();
    if (user) goToGame();
    else goToLogin();
  };

  const isGameLink = (anchor) => {
    try {
      const url = new URL(anchor.href, window.location.href);
      return url.pathname === GAME_PATH ||
        url.pathname === LEGACY_GAME_PATH ||
        url.hostname === EXTERNAL_GAME_HOST;
    } catch {
      return false;
    }
  };

  const renderLoginState = ({ message, tone = 'info', busy = false } = {}) => {
    const status = document.querySelector('[data-auth-status]');
    const button = document.querySelector('[data-firebase-login]');
    if (status && message) {
      status.textContent = message;
      status.dataset.tone = tone;
    }
    if (button) {
      button.disabled = busy || !auth;
      button.textContent = busy ? 'Connecting...' : 'Continue with Google';
    }
  };

  const setupLoginPage = () => {
    const button = document.querySelector('[data-firebase-login]');
    if (!button) return;

    if (!auth) {
      renderLoginState({
        message: firebaseError || 'Firebase is not configured yet. Add your project values in js/firebase-config.js.',
        tone: 'error'
      });
      return;
    }

    renderLoginState({ message: 'Checking your Firebase session...' });
    auth.onAuthStateChanged((user) => {
      if (user) {
        window.location.assign(getSafeNext());
        return;
      }
      renderLoginState({ message: 'Sign in to continue to the game.' });
    });

    button.addEventListener('click', async () => {
      renderLoginState({ busy: true });
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithRedirect(provider);
      } catch (error) {
        renderLoginState({
          message: error.message || 'Sign-in could not start. Please try again.',
          tone: 'error'
        });
      }
    });
  };

  const setupGameGuard = () => {
    if (!isProtectedGamePage) return;

    if (!auth) {
      goToLogin();
      return;
    }

    auth.onAuthStateChanged((user) => {
      if (!user) {
        goToLogin();
        return;
      }

      document.documentElement.classList.add('auth-ready');
      if (currentPath === LEGACY_GAME_PATH) {
        window.history.replaceState({}, '', GAME_PATH);
      }
    });
  };

  const bindNavigation = () => {
    document.addEventListener('click', (event) => {
      const control = event.target.closest('a, button');
      if (!control) return;

      if (control.id === 'openLoginBtn' || control.id === 'mobileLoginBtn') {
        event.preventDefault();
        goToLogin();
        return;
      }

      if (control.matches('a') && isGameLink(control)) {
        requestGameAccess(event);
      }
    });
  };

  window.FirebaseAuthFlow = { goToLogin, requestGameAccess };
  bindNavigation();
  setupLoginPage();
  setupGameGuard();
})();
