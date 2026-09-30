/* global firebase */

(() => {
  'use strict';

  const LOGIN_PATH = '/login';
  const GAME_PATH = '/game';
  const GAME_URL = 'https://tug-of-war-hazel.vercel.app/';
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
  let persistenceReady = Promise.resolve();

  if (hasConfig && window.firebase) {
    try {
      if (!firebase.apps.length) firebase.initializeApp(config);
      auth = firebase.auth();
      persistenceReady = auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
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
    return requested === GAME_PATH ? GAME_PATH : '/';
  };

  const goToLogin = ({ next = '/' } = {}) => {
    const loginUrl = new URL(LOGIN_PATH, window.location.origin);
    if (next === GAME_PATH) loginUrl.searchParams.set('next', GAME_PATH);
    window.location.assign(loginUrl.href);
  };

  const goToGame = () => window.location.assign(GAME_URL);

  const redirectAfterAuth = () => {
    if (getSafeNext() === GAME_PATH) goToGame();
    else window.location.assign('/');
  };

  const updateAuthControls = (user) => {
    document.querySelectorAll('#openLoginBtn, #mobileLoginBtn').forEach((control) => {
      control.textContent = user ? 'Logout' : 'Login';
      control.dataset.authAction = user ? 'logout' : 'login';
      control.setAttribute('aria-label', user ? 'Log out' : 'Log in');
    });
  };

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
      goToLogin({ next: GAME_PATH });
      return;
    }

    const user = auth.currentUser || await waitForUser();
    if (user) goToGame();
    else goToLogin({ next: GAME_PATH });
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

  const getAuthErrorMessage = (error) => {
    const messages = {
      'auth/email-already-in-use': 'That email already has an account. Switch to Log in.',
      'auth/invalid-credential': 'The email or password is incorrect.',
      'auth/invalid-email': 'Enter a valid email address.',
      'auth/weak-password': 'Use a password with at least 6 characters.',
      'auth/popup-closed-by-user': 'The Google sign-in window was closed before it finished.',
      'auth/popup-blocked': 'Your browser blocked the Google sign-in window. Allow popups and try again.',
      'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase Console yet.',
      'auth/network-request-failed': 'Firebase could not connect. Check your internet connection and try again.',
      'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.'
    };
    return messages[error.code] || error.message || 'Authentication failed. Please try again.';
  };

  const renderLoginState = ({ message, tone = 'info', busy = false } = {}) => {
    const status = document.querySelector('[data-auth-status]');
    const googleButton = document.querySelector('[data-firebase-google]');
    const submitButton = document.querySelector('[data-email-submit]');
    if (status && message) {
      status.textContent = message;
      status.dataset.tone = tone;
    }
    if (googleButton) googleButton.disabled = busy || !auth;
    if (submitButton) {
      submitButton.disabled = busy || !auth;
      submitButton.textContent = busy ? 'Connecting...' :
        (document.body.dataset.authMode === 'signup' ? 'Create account' : 'Log in');
    }
  };

  const setupLoginPage = () => {
    const googleButton = document.querySelector('[data-firebase-google]');
    const emailForm = document.querySelector('[data-email-form]');
    const modeButtons = document.querySelectorAll('[data-auth-mode]');
    if (!googleButton && !emailForm) return;

    if (!auth) {
      renderLoginState({
        message: firebaseError || 'Firebase is not configured yet. Add your project values in js/firebase-config.js.',
        tone: 'error'
      });
      return;
    }

    const setMode = (mode) => {
      document.body.dataset.authMode = mode;
      modeButtons.forEach((button) => {
        const isActive = button.dataset.authMode === mode;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-selected', String(isActive));
      });
      const submitButton = document.querySelector('[data-email-submit]');
      const passwordHint = document.querySelector('[data-password-hint]');
      if (submitButton) submitButton.textContent = mode === 'signup' ? 'Create account' : 'Log in';
      if (passwordHint) passwordHint.textContent = mode === 'signup' ? 'At least 6 characters' : '';
      renderLoginState({ message: mode === 'signup' ? 'Create your account to enter the game.' : 'Log in to continue to the game.' });
    };

    setMode('login');
    renderLoginState({ message: 'Checking your Firebase session...' });
    auth.onAuthStateChanged((user) => {
      if (user) {
        redirectAfterAuth();
        return;
      }
      renderLoginState({ message: document.body.dataset.authMode === 'signup' ? 'Create your account to enter the game.' : 'Log in to continue to the game.' });
    });

    modeButtons.forEach((button) => {
      button.addEventListener('click', () => setMode(button.dataset.authMode));
    });

    if (googleButton) googleButton.addEventListener('click', async () => {
      renderLoginState({ busy: true });
      try {
        await persistenceReady;
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
        renderLoginState({ message: 'Google account verified. Opening the game...' });
      } catch (error) {
        renderLoginState({
          message: getAuthErrorMessage(error),
          tone: 'error'
        });
      }
    });

    if (emailForm) emailForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const emailInput = emailForm.querySelector('[name="email"]');
      const passwordInput = emailForm.querySelector('[name="password"]');
      if (!emailInput || !passwordInput || !emailForm.reportValidity()) return;

      renderLoginState({ busy: true });
      try {
        await persistenceReady;
        if (document.body.dataset.authMode === 'signup') {
          await auth.createUserWithEmailAndPassword(emailInput.value.trim(), passwordInput.value);
          renderLoginState({ message: 'Account created and verified. Opening the game...' });
        } else {
          await auth.signInWithEmailAndPassword(emailInput.value.trim(), passwordInput.value);
          renderLoginState({ message: 'Login verified. Opening the game...' });
        }
      } catch (error) {
        renderLoginState({
          message: getAuthErrorMessage(error),
          tone: 'error'
        });
      }
    });
  };

  const setupGameGuard = () => {
    if (!isProtectedGamePage) return;

    if (!auth) {
      goToLogin({ next: GAME_PATH });
      return;
    }

    auth.onAuthStateChanged((user) => {
      if (!user) {
        goToLogin({ next: GAME_PATH });
        return;
      }

      document.documentElement.classList.add('auth-ready');
      if (currentPath === LEGACY_GAME_PATH) {
        window.history.replaceState({}, '', GAME_PATH);
      }
    });
  };

  const setupSessionControls = () => {
    if (!auth) return;
    auth.onAuthStateChanged(updateAuthControls);
  };

  const bindNavigation = () => {
    document.addEventListener('click', (event) => {
      const control = event.target.closest('a, button');
      if (!control) return;

      if (control.id === 'openLoginBtn' || control.id === 'mobileLoginBtn') {
        event.preventDefault();
        if (control.dataset.authAction === 'logout') {
          auth.signOut().then(() => window.location.assign('/'));
        } else {
          goToLogin();
        }
        return;
      }

      if (control.matches('a') && isGameLink(control)) {
        requestGameAccess(event);
      }
    });
  };

  window.FirebaseAuthFlow = { goToLogin, requestGameAccess };
  bindNavigation();
  setupSessionControls();
  setupLoginPage();
  setupGameGuard();
})();
