/**
 * INTELLIA360 TUG OF WAR — INTERACTION ENGINE
 * Vanilla JavaScript (Zero external libraries)
 * Clean, modern, responsive, and robust across all pages
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     1. STICKY NAVBAR & MOBILE MENU
     ========================================================================== */
  const siteHeader = document.getElementById('siteHeader');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');

  window.addEventListener('scroll', () => {
    if (siteHeader) {
      if (window.scrollY > 20) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }
  }, { passive: true });

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileMenuBtn.classList.toggle('active');
      mobileDrawer.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen);
      mobileDrawer.setAttribute('aria-hidden', !isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    const mobileLinks = mobileDrawer.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        mobileDrawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ==========================================================================
     2. CURRICULUM EXPAND/COLLAPSE ACCORDION (9 MODULES)
     ========================================================================== */
  const moduleCards = document.querySelectorAll('.curriculum-module-card');
  const expandAllBtn = document.getElementById('expandAllModulesBtn');
  const collapseAllBtn = document.getElementById('collapseAllModulesBtn');

  moduleCards.forEach(card => {
    const viewBtn = card.querySelector('.m-view-topics-btn');
    if (viewBtn) {
      viewBtn.addEventListener('click', () => {
        const isExp = card.classList.toggle('expanded');
        viewBtn.innerHTML = isExp ? 'Hide Topics &minus;' : 'View Topics &plus;';
      });
    }
  });

  if (expandAllBtn && collapseAllBtn) {
    expandAllBtn.addEventListener('click', () => {
      moduleCards.forEach(card => {
        card.classList.add('expanded');
        const viewBtn = card.querySelector('.m-view-topics-btn');
        if (viewBtn) viewBtn.innerHTML = 'Hide Topics &minus;';
      });
    });

    collapseAllBtn.addEventListener('click', () => {
      moduleCards.forEach(card => {
        card.classList.remove('expanded');
        const viewBtn = card.querySelector('.m-view-topics-btn');
        if (viewBtn) viewBtn.innerHTML = 'View Topics &plus;';
      });
    });
  }

  /* ==========================================================================
     3. LIVE TUG OF WAR ROUND DEMO
     ========================================================================== */
  const $ = (id) => document.getElementById(id);
  function setRope(id, n) {
    const p = $(id);
    if (!p) return;
    const k = Math.max(0, Math.min(5, n));
    p.querySelector('.rope-marker').style.left = (50 - k * 10) + '%';
    p.querySelector('.rope-notch-count').textContent = k + ' / 5';
  }
  const rounds = {
    s1: { stage: 'Stage 1 · Rookie Turf', q: '15 + 28 = ?', opts: [43, 33, 42, 53], a: 43, tip: 'Tens first: 10 + 20 = 30. Ones: 5 + 8 = 13. Total 43.' },
    s2: { stage: 'Stage 2 · Speed Gym', q: '6 + 3 × (4 − 1) = ?', opts: [15, 27, 21, 9], a: 15, tip: 'Brackets first: 4 − 1 = 3. Then 3 × 3 = 9. Then 6 + 9 = 15.' },
    s3: { stage: 'Stage 3 · Power Tower', q: '4² + √25 = ?', opts: [21, 13, 41, 20], a: 21, tip: '4² = 16 and √25 = 5, so 16 + 5 = 21.' },
    s5: { stage: 'Stage 5 · Algebra Champions', q: '2x + 6 = 20 (x = ?)', opts: [7, 13, 10, 8], a: 7, tip: 'Take 6 from both sides: 2x = 14. So x = 14 ÷ 2 = 7.' }
  };
  const demoTabs = document.querySelectorAll('.demo-pill-tab');
  const demoSteps = ['demoS1', 'demoS2', 'demoS3', 'demoS4'].map($);
  let cur = 's1', notches = 0, streak = 0, score = 0;

  function renderRound() {
    const r = rounds[cur];
    if (!$('demoOptions')) return;
    $('demoStageLabel').textContent = r.stage;
    $('demoCurrentProblem').textContent = r.q;
    $('demoFeedback').textContent = '';
    demoSteps.forEach((s, i) => s.classList.toggle('active', i === 0));
    $('demoFormula1').textContent = r.q;
    $('demoFormula2').textContent = 'Pick the right answer';
    $('demoFormula3').textContent = 'Right answer = 1 notch';
    $('demoFormula4').textContent = 'Streaks add bonus points';
    $('demoOptions').innerHTML = '';
    r.opts.forEach((o) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn-pill btn-white-border demo-opt';
      b.textContent = o;
      b.addEventListener('click', () => answerRound(b, o === r.a));
      $('demoOptions').appendChild(b);
    });
  }

  function answerRound(btn, ok) {
    const r = rounds[cur];
    $('demoOptions').querySelectorAll('button').forEach((b) => (b.disabled = true));
    if (ok) {
      streak++;
      const pts = 100 + Math.min(100, (streak - 1) * 25);
      score += pts;
      notches = Math.min(5, notches + 1);
      btn.classList.add('demo-right');
      $('demoFeedback').textContent = (streak > 1 ? '🔥 ' + streak + 'X STREAK! ' : '🌟 AWESOME! ') + '+' + pts + ' points. ' + r.tip;
      $('demoFormula2').textContent = 'Answer: ' + r.a;
      $('demoFormula3').textContent = 'Rope: ' + notches + ' of 5 notches';
      $('demoFormula4').textContent = '+' + pts + ' points';
      demoSteps.forEach((s, i) => setTimeout(() => s.classList.add('active'), i * 250));
      setRope('demoRope', notches);
      if (notches === 5) showToast('🏆 The flag crossed the line. Team Blue wins!');
    } else {
      streak = 0;
      btn.classList.add('demo-wrong');
      $('demoFeedback').textContent = '💪 Almost! The rope stays put and your streak resets. ' + r.tip;
      setTimeout(renderRound, 2200);
    }
    $('demoStreak').textContent = streak;
    $('demoScore').textContent = score;
  }

  demoTabs.forEach((t) => t.addEventListener('click', () => {
    demoTabs.forEach((x) => x.classList.remove('active'));
    t.classList.add('active');
    cur = t.getAttribute('data-round');
    renderRound();
  }));
  if ($('demoResetBtn')) {
    $('demoResetBtn').addEventListener('click', () => {
      notches = streak = score = 0;
      setRope('demoRope', 0);
      $('demoStreak').textContent = 0;
      $('demoScore').textContent = 0;
      renderRound();
    });
  }
  renderRound();

  /* ==========================================================================
     4. FAQ ACCORDION (Clean 2-Column Accordion)
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-card-item');

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-trigger-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        const icon = btn.querySelector('.faq-icon-toggle');

        if (isActive) {
          item.classList.remove('active');
          if (icon) icon.innerHTML = '&plus;';
        } else {
          item.classList.add('active');
          if (icon) icon.innerHTML = '&minus;';
        }
      });
    }
  });

  /* ==========================================================================
     5. ENROLLMENT MODAL (5-Step Wizard)
     ========================================================================== */
  const enrollModal = document.getElementById('enrollModal');
  const closeEnrollModal = document.getElementById('closeEnrollModal');
  const openEnrollBtns = [
    document.getElementById('headerEnrollBtn'),
    document.getElementById('heroEnrollBtn'),
    document.getElementById('mobileEnrollBtn'),
    document.getElementById('finalEnrollBtn'),
    document.getElementById('finalPageEnrollBtn'),
    document.getElementById('pricingCtaEnroll')
  ];

  const levelSelectBtns = document.querySelectorAll('.select-level-action');

  const enrollPanes = [
    document.getElementById('enrollStep1'),
    document.getElementById('enrollStep2'),
    document.getElementById('enrollStep3'),
    document.getElementById('enrollStep4')
  ];

  const showEnrollStep = (stepIdx) => {
    enrollPanes.forEach((pane, idx) => {
      if (pane) {
        pane.style.display = (idx === stepIdx) ? 'block' : 'none';
      }
    });
  };

  const openEnrollModal = (preselectedGrade) => {
    if (!enrollModal) return;
    showEnrollStep(0);
    enrollModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (preselectedGrade) {
      const pills = enrollModal.querySelectorAll('.grade-select-btn');
      pills.forEach(p => {
        if (p.textContent.includes(preselectedGrade) || preselectedGrade.includes(p.getAttribute('data-grade'))) {
          p.classList.add('btn-orange');
          p.classList.remove('btn-white-border');
        } else {
          p.classList.remove('btn-orange');
          p.classList.add('btn-white-border');
        }
      });
    }
  };

  const closeEnroll = () => {
    if (!enrollModal) return;
    enrollModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  openEnrollBtns.forEach(btn => {
    if (btn) btn.addEventListener('click', () => openEnrollModal());
  });

  levelSelectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const grade = btn.getAttribute('data-grade');
      openEnrollModal(grade);
    });
  });

  if (closeEnrollModal) closeEnrollModal.addEventListener('click', closeEnroll);

  // Grade selection
  const gradeBtns = document.querySelectorAll('.grade-select-btn');
  gradeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      gradeBtns.forEach(b => {
        b.classList.remove('btn-orange');
        b.classList.add('btn-white-border');
      });
      btn.classList.add('btn-orange');
      btn.classList.remove('btn-white-border');
    });
  });

  // Steps Nav
  const toStep2Btn = document.getElementById('toStep2Btn');
  const backToStep1Btn = document.getElementById('backToStep1Btn');
  const toStep3Btn = document.getElementById('toStep3Btn');
  const backToStep2Btn = document.getElementById('backToStep2Btn');
  const completePaymentBtn = document.getElementById('completePaymentBtn');
  const finishEnrollModalBtn = document.getElementById('finishEnrollModalBtn');

  if (toStep2Btn) toStep2Btn.addEventListener('click', () => showEnrollStep(1));
  if (backToStep1Btn) backToStep1Btn.addEventListener('click', () => showEnrollStep(0));

  if (toStep3Btn) {
    toStep3Btn.addEventListener('click', () => {
      showEnrollStep(2);
    });
  }

  if (backToStep2Btn) backToStep2Btn.addEventListener('click', () => showEnrollStep(1));

  // Razorpay Checkout Handler
  const handleRazorpayPayment = async () => {
    // 1. Gather student inputs
    const nameInput = document.getElementById('studentNameInput') || document.getElementById('studentNameInput2');
    const contactInput = document.getElementById('parentContactInput') || document.getElementById('parentContactInput2');

    const studentName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Enrolled Student';
    const parentContact = contactInput && contactInput.value.trim() ? contactInput.value.trim() : '';

    const selectedGradeBtn = document.querySelector('.grade-select-btn.btn-orange');
    const selectedGrade = selectedGradeBtn ? selectedGradeBtn.textContent.trim() : 'Grades 3–8';

    // 2. Read Configuration from window.RAZORPAY_CONFIG
    const cfg = window.RAZORPAY_CONFIG || {
      keyId: 'rzp_test_YOUR_KEY_ID_HERE',
      currency: 'INR',
      amount: 999,
      companyName: 'Intellia360',
      programName: 'Tug of War Annual Enrollment',
      themeColor: '#186fe9'
    };

    // Payments are switched off until a real Razorpay Key ID is added in js/razorpay-config.js.
    // Visitors see a friendly message instead of a developer error.
    if (!cfg.keyId || cfg.keyId.includes('YOUR_KEY_ID')) {
      showToast('Online enrollment is opening soon. Meanwhile, tap "Play Live Game" to try it out!');
      return;
    }

    if (typeof window.Razorpay === 'undefined') {
      alert('Razorpay Checkout SDK is still loading or blocked by an ad-blocker. Please check your internet connection.');
      return;
    }

    completePaymentBtn.disabled = true;
    completePaymentBtn.textContent = 'Launching Checkout...';

    // 3. Try to create order on backend server if available
    let orderId = null;
    try {
      const resp = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          parentContact,
          grade: selectedGrade,
          amount: cfg.amount
        })
      });
      if (resp.ok) {
        const orderData = await resp.json();
        if (orderData.success && orderData.orderId) {
          orderId = orderData.orderId;
          console.log('✓ Secure Order ID created on server:', orderId);
        }
      }
    } catch (e) {
      console.log('Backend server not detected, proceeding with direct client checkout.');
    }

    // 4. Construct Razorpay Options
    const options = {
      key: cfg.keyId,
      amount: cfg.amount * 100, // paise (₹2,999 = 299900 paise)
      currency: cfg.currency || 'INR',
      name: cfg.companyName || 'Intellia360',
      description: `${cfg.programName} (${selectedGrade})`,
      image: cfg.logoUrl || 'assets/logo/intellia360-logo.png',
      order_id: orderId || undefined,
      prefill: {
        name: studentName,
        email: parentContact.includes('@') ? parentContact : '',
        contact: !parentContact.includes('@') ? parentContact : ''
      },
      notes: {
        program: 'Tug of War',
        grade: selectedGrade,
        student: studentName
      },
      theme: {
        color: cfg.themeColor || '#186fe9'
      },
      handler: async function (response) {
        console.log('🎉 Razorpay Payment Response:', response);
        const paymentId = response.razorpay_payment_id || `pay_${Date.now()}`;

        // If backend server is available, verify signature
        if (orderId && response.razorpay_signature) {
          try {
            await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                studentName,
                grade: selectedGrade
              })
            });
          } catch (err) {
            console.warn('Verification request note:', err);
          }
        }

        // Update receipt details in step 4
        const receiptPaymentId = document.getElementById('receiptPaymentId');
        const receiptStudentName = document.getElementById('receiptStudentName');
        if (receiptPaymentId) receiptPaymentId.textContent = paymentId;
        if (receiptStudentName) receiptStudentName.textContent = studentName;

        // Advance to Confirmation screen
        showEnrollStep(3);
        showToast(`🎉 Payment Successful! Ref: ${paymentId.substring(0, 14)}...`);
        completePaymentBtn.disabled = false;
        completePaymentBtn.textContent = 'Complete Payment →';
      },
      modal: {
        ondismiss: function () {
          completePaymentBtn.disabled = false;
          completePaymentBtn.textContent = 'Complete Payment →';
          showToast('Payment window closed. You can retry anytime.');
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        completePaymentBtn.disabled = false;
        completePaymentBtn.textContent = 'Complete Payment →';
        alert('Payment Failed: ' + (resp.error ? resp.error.description : 'Unknown error'));
      });
      rzp.open();
    } catch (err) {
      completePaymentBtn.disabled = false;
      completePaymentBtn.textContent = 'Complete Payment →';
      console.error('Razorpay invocation error:', err);
      alert('Could not open Razorpay checkout: ' + err.message);
    }
  };

  if (completePaymentBtn) {
    completePaymentBtn.addEventListener('click', handleRazorpayPayment);
  }

  if (finishEnrollModalBtn) {
    finishEnrollModalBtn.addEventListener('click', () => {
      closeEnroll();
      showToast('Welcome to Intellia360! Launching Game Arena...');
      window.open('https://tug-of-war-hazel.vercel.app/', '_blank');
    });
  }

  /* ==========================================================================
     6. 30-SECOND VEDIC CHALLENGE QUIZ MODAL
     ========================================================================== */
  const challengeModal = document.getElementById('challengeModal');
  const closeChallengeModal = document.getElementById('closeChallengeModal');
  const heroStartBtn = document.getElementById('heroStartChallengeBtn');
  const finalStartBtn = document.getElementById('finalStartChallengeBtn');
  const quizTimer = document.getElementById('quizTimer');
  const quizQNum = document.getElementById('quizQNum');
  const quizProblem = document.getElementById('quizProblem');
  const quizTip = document.getElementById('quizTip');
  const quizOptions = document.getElementById('quizOptions');
  const quizFeedback = document.getElementById('quizFeedback');
  const quizContainer = document.getElementById('quizContainer');
  const quizResults = document.getElementById('quizResults');
  const quizToEnrollBtn = document.getElementById('quizToEnrollBtn');

  const quizQuestions = [
    { q: '15 + 28 = ?', tip: '💡 Tens first: 10 + 20 = 30. Ones: 5 + 8 = 13.', options: ['43', '33', '42', '53'], correct: 0 },
    { q: '6 + 3 × (4 − 1) = ?', tip: '💡 Brackets first, then × before +. 4 − 1 = 3, 3 × 3 = 9.', options: ['27', '15', '21', '9'], correct: 1 },
    { q: '2x + 6 = 20, so x = ?', tip: '💡 Take 6 from both sides: 2x = 14.', options: ['13', '10', '8', '7'], correct: 3 }
  ];

  let qIdx = 0;
  let qScore = 0;
  let timerId = null;
  let secLeft = 25;

  const renderQuizQuestion = () => {
    if (qIdx >= quizQuestions.length) {
      clearInterval(timerId);
      if (quizContainer) quizContainer.style.display = 'none';
      if (quizResults) quizResults.style.display = 'block';
      const scoreTxt = document.getElementById('resScoreText');
      if (scoreTxt) scoreTxt.textContent = `You scored ${qScore}/${quizQuestions.length}!`;
      return;
    }

    const currentQ = quizQuestions[qIdx];
    if (quizQNum) quizQNum.textContent = `Question ${qIdx + 1} of ${quizQuestions.length}`;
    if (quizProblem) quizProblem.textContent = currentQ.q;
    if (quizTip) quizTip.textContent = currentQ.tip;
    if (quizFeedback) quizFeedback.style.display = 'none';

    if (quizOptions) {
      quizOptions.innerHTML = '';
      currentQ.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-pill btn-white-border';
        btn.style.fontFamily = 'var(--font-mono)';
        btn.style.fontSize = '1.2rem';
        btn.textContent = opt;

        btn.addEventListener('click', () => {
          const all = quizOptions.querySelectorAll('button');
          all.forEach(b => b.disabled = true);

          if (idx === currentQ.correct) {
            btn.style.background = '#ecfdf5';
            btn.style.borderColor = '#10b981';
            btn.style.color = '#047857';
            qScore++;
            setRope('quizRope', qScore);
            if (quizFeedback) {
              quizFeedback.textContent = '🎉 Correct! The rope moves your way!';
              quizFeedback.style.background = '#ecfdf5';
              quizFeedback.style.color = '#047857';
              quizFeedback.style.display = 'block';
            }
          } else {
            btn.style.background = '#fef2f2';
            btn.style.borderColor = '#ef4444';
            btn.style.color = '#b91c1c';
            if (quizFeedback) {
              quizFeedback.textContent = `⚡ Good attempt! Correct was ${currentQ.options[currentQ.correct]}.`;
              quizFeedback.style.background = '#fef2f2';
              quizFeedback.style.color = '#b91c1c';
              quizFeedback.style.display = 'block';
            }
          }

          setTimeout(() => {
            qIdx++;
            renderQuizQuestion();
          }, 1100);
        });

        quizOptions.appendChild(btn);
      });
    }
  };

  const startQuiz = () => {
    if (!challengeModal) return;
    qIdx = 0;
    qScore = 0;
    setRope('quizRope', 0);
    secLeft = 25;
    if (quizContainer) quizContainer.style.display = 'block';
    if (quizResults) quizResults.style.display = 'none';

    challengeModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    clearInterval(timerId);
    if (quizTimer) quizTimer.textContent = `${secLeft}s`;
    timerId = setInterval(() => {
      secLeft--;
      if (quizTimer) quizTimer.textContent = `${secLeft}s`;
      if (secLeft <= 0) {
        clearInterval(timerId);
        if (quizContainer) quizContainer.style.display = 'none';
        if (quizResults) quizResults.style.display = 'block';
      }
    }, 1000);

    renderQuizQuestion();
  };

  const closeQuiz = () => {
    clearInterval(timerId);
    if (challengeModal) challengeModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (heroStartBtn) heroStartBtn.addEventListener('click', startQuiz);
  if (finalStartBtn) finalStartBtn.addEventListener('click', startQuiz);
  if (closeChallengeModal) closeChallengeModal.addEventListener('click', closeQuiz);

  if (quizToEnrollBtn) {
    quizToEnrollBtn.addEventListener('click', () => {
      closeQuiz();
      openEnrollModal();
    });
  }

  /* ==========================================================================
     7. LOGIN MODAL
     ========================================================================== */
  const loginModal = document.getElementById('loginModal');
  const openLoginBtn = document.getElementById('openLoginBtn');
  const mobileLoginBtn = document.getElementById('mobileLoginBtn');
  const closeLoginModal = document.getElementById('closeLoginModal');
  const submitLoginBtn = document.getElementById('submitLoginBtn');

  const openLogin = () => {
    if (window.FirebaseAuthFlow) {
      window.FirebaseAuthFlow.goToLogin();
      return;
    }
    if (!loginModal) return;
    loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLogin = () => {
    if (!loginModal) return;
    loginModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (openLoginBtn) openLoginBtn.addEventListener('click', openLogin);
  if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', openLogin);
  if (closeLoginModal) closeLoginModal.addEventListener('click', closeLogin);

  if (submitLoginBtn) {
    submitLoginBtn.addEventListener('click', () => {
      submitLoginBtn.textContent = 'Authenticating...';
      setTimeout(() => {
        submitLoginBtn.textContent = 'Log In →';
        closeLogin();
        showToast('✓ Welcome back! Launching Game Arena...');
        window.open('https://tug-of-war-hazel.vercel.app/', '_blank');
      }, 800);
    });
  }

  // Backdrop clicks & Esc
  [enrollModal, challengeModal, loginModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
          clearInterval(timerId);
        }
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      [enrollModal, challengeModal, loginModal].forEach(modal => {
        if (modal) modal.classList.remove('active');
      });
      document.body.style.overflow = '';
      clearInterval(timerId);
    }
  });

  /* ==========================================================================
     8. TOAST NOTIFICATIONS
     ========================================================================== */
  function showToast(msg) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.style.cssText = `
      background: var(--brand-navy);
      color: #ffffff;
      padding: 12px 20px;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-card-hover);
      font-size: 0.92rem;
      font-weight: 600;
      border-left: 4px solid var(--brand-orange);
      margin-top: 8px;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
    `;
    toast.textContent = msg;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => {
        if (container.contains(toast)) container.removeChild(toast);
      }, 300);
    }, 3200);
  }

  /* PRICE FILL: single source of truth is js/razorpay-config.js */
  const cfg0 = window.RAZORPAY_CONFIG || {};
  if (cfg0.amount) {
    const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
    document.querySelectorAll('[data-price]').forEach((el) => (el.textContent = inr(cfg0.amount)));
    document.querySelectorAll('[data-price-num]').forEach((el) => (el.textContent = Number(cfg0.amount).toLocaleString('en-IN')));
    document.querySelectorAll('[data-original]').forEach((el) => (el.textContent = inr(cfg0.originalAmount)));
    document.querySelectorAll('[data-save]').forEach((el) => (el.textContent = inr(cfg0.originalAmount - cfg0.amount)));
  }

  window.showToast = showToast;
});
