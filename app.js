/* ============================================
   PROJECT MAYHEM — Core Application Logic
   ============================================ */

(function () {
  'use strict';

  // ── State ──
  const STATE_KEY = 'projectMayhem';
  const DEFAULT_STATE = {
    goals: [],
    settings: {
      alterEgoName: 'Tyler Durden',
      frequency: 4,
      wakeTime: '07:00',
      bedTime: '23:00',
      notificationsEnabled: false,
    },
  };

  let state = loadState();
  let notifTimers = [];
  let deferredInstallPrompt = null;

  // ── PWA Install Prompt ──
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const installBtn = document.getElementById('installBtn');
    if (installBtn) installBtn.classList.remove('hidden');
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    const installBtn = document.getElementById('installBtn');
    if (installBtn) installBtn.classList.add('hidden');
    showToast('Project Mayhem installed. There is no escape now.');
  });

  // ── DOM Elements ──
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const goalInput = $('#goalInput');
  const addGoalBtn = $('#addGoalBtn');
  const goalsList = $('#goalsList');
  const goalCount = $('.goal-count');
  const emptyState = $('#emptyState');
  const settingsBtn = $('#settingsBtn');
  const settingsModal = $('#settingsModal');
  const modalOverlay = $('#modalOverlay');
  const closeSettings = $('#closeSettings');
  const alterEgoNameInput = $('#alterEgoName');
  const wakeTimeInput = $('#wakeTime');
  const bedTimeInput = $('#bedTime');
  const schedulePreview = $('#schedulePreview');
  const enableNotifBtn = $('#enableNotifBtn');
  const notifStatus = $('#notifStatus');
  const saveSettingsBtn = $('#saveSettings');
  const alterEgoBanner = $('#alterEgoBanner');
  const dismissBanner = $('#dismissBanner');
  const toast = $('#toast');
  const installBtn = $('#installBtn');
  const aboutBtn = $('#aboutBtn');
  const aboutModal = $('#aboutModal');
  const aboutOverlay = $('#aboutOverlay');
  const closeAbout = $('#closeAbout');

  // About modal
  if (aboutBtn) {
    aboutBtn.addEventListener('click', () => aboutModal.classList.remove('hidden'));
  }
  if (closeAbout) {
    closeAbout.addEventListener('click', () => aboutModal.classList.add('hidden'));
  }
  if (aboutOverlay) {
    aboutOverlay.addEventListener('click', () => aboutModal.classList.add('hidden'));
  }

  // Install button click
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('Welcome to Project Mayhem.');
      }
      deferredInstallPrompt = null;
      installBtn.classList.add('hidden');
    });
  }

  // ── Alter Ego Messages ──
  // Ruthless, confrontational messages organized by type
  const ALTER_EGO_MESSAGES = {
    // Generic check-in prompts (no specific goal referenced)
    checkIn: [
      "You're not your comfort zone. What did you do TODAY to break out of it?",
      "I asked you a question. What have you done since the last time we talked?",
      "You said you wanted to change. Was that just words? Prove it. NOW.",
      "Every second you waste is a second you chose mediocrity. What's your move?",
      "Stop scrolling. Stop hiding. What did you DO?",
      "You think this life is going to build itself? WRONG. What step did you take?",
      "I don't want to hear excuses. I want to hear ACTIONS. What did you do?",
      "Your old self is comfortable. Your old self is weak. Are you still that person?",
      "The clock doesn't stop for your feelings. What did you accomplish?",
      "You either moved forward today or you moved backward. There is no standing still.",
      "I see you. Don't pretend you forgot. What did you commit to? DID YOU DO IT?",
      "Your future self is watching you right now through your memories. Make them proud.",
      "Pain is temporary. Regret is forever. Which one are you choosing right now?",
      "You made promises. To yourself. Those are the ones that matter most. Did you keep them?",
      "Comfort is a slow death. Are you ALIVE today or just existing?",
    ],

    // Goal-specific confrontation
    goalCheck: [
      "You said '{goal}' matters to you. Did you act like it today?",
      "'{goal}' — remember writing that? That wasn't a suggestion. It was a COMMAND. Did you follow it?",
      "Let's talk about '{goal}'. What exactly did you do for it in the last few hours?",
      "'{goal}' is slipping. I can feel it. Prove me wrong.",
      "You set this rule: '{goal}'. Rules aren't optional. Did you follow it?",
      "'{goal}' — this is your standard. Did you meet it today or did you let yourself down?",
      "Remember '{goal}'? That was the version of you that had CLARITY. Are you honoring that?",
      "'{goal}' — three words that separate you from the person you don't want to be. Did you earn them today?",
      "I'm going to keep asking until you can look me in the eye and say you did '{goal}'.",
      "'{goal}' isn't a wish. It's a rule you wrote in blood. Act like it.",
    ],

    // Morning motivation
    morning: [
      "Rise. The war against mediocrity begins NOW.",
      "Your eyes are open. Good. Now KEEP THEM OPEN. Today you fight.",
      "Another day. Another chance to be dangerous. Don't waste it.",
      "The sun is up and so are your excuses. Kill them both.",
      "Morning. Your rules are waiting. You wrote them for a reason. HONOR THEM.",
    ],

    // Evening reflection
    evening: [
      "Day's almost over. Can you honestly say you gave it everything?",
      "Before you close your eyes — did you earn your sleep tonight?",
      "The day is dying. Did you LIVE it or just survive it?",
      "Night's coming. Did today's version of you make tomorrow's version stronger?",
      "Lights out soon. One question: did you follow your rules today?",
    ],

    // When goals are completed
    completion: [
      "One down. Don't get comfortable. The work never stops.",
      "Good. You did what you said you'd do. That's rare. That's POWER. Keep going.",
      "Checked it off? Fine. But the second you slow down, I'll be here.",
      "That's what discipline looks like. Remember this feeling. It's why you fight.",
    ],
  };

  // ── Persistence ──
  function loadState() {
    try {
      const saved = localStorage.getItem(STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_STATE, ...parsed, settings: { ...DEFAULT_STATE.settings, ...parsed.settings } };
      }
    } catch (e) {
      console.warn('Failed to load state:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  function saveState() {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }

  // ── ID Generator ──
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  // ── Toast ──
  function showToast(message, duration = 2500) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.add('hidden'), duration);
  }

  // ── Render Goals ──
  function renderGoals() {
    goalsList.innerHTML = '';
    const activeGoals = state.goals.filter((g) => !g.deleted);

    // Update count
    const incomplete = activeGoals.filter((g) => !g.completed).length;
    goalCount.textContent = incomplete;

    // Empty state
    if (activeGoals.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }
    emptyState.classList.add('hidden');

    // Sort: incomplete first, then completed
    const sorted = [...activeGoals].sort((a, b) => {
      if (a.completed === b.completed) return b.createdAt - a.createdAt;
      return a.completed ? 1 : -1;
    });

    sorted.forEach((goal) => {
      const li = document.createElement('li');
      li.className = `goal-item${goal.completed ? ' completed' : ''}`;
      li.dataset.id = goal.id;

      li.innerHTML = `
        <div class="goal-check" data-action="toggle" title="${goal.completed ? 'Mark incomplete' : 'Mark complete'}"></div>
        <span class="goal-text">${escapeHtml(goal.text)}</span>
        <button class="goal-delete" data-action="delete" title="Remove">×</button>
      `;

      goalsList.appendChild(li);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Goal Actions ──
  function addGoal(text) {
    text = text.trim();
    if (!text) return;

    state.goals.push({
      id: generateId(),
      text,
      completed: false,
      deleted: false,
      createdAt: Date.now(),
    });

    saveState();
    renderGoals();
    showToast('Rule added. No turning back.');
  }

  function toggleGoal(id) {
    const goal = state.goals.find((g) => g.id === id);
    if (!goal) return;

    goal.completed = !goal.completed;
    saveState();
    renderGoals();

    if (goal.completed) {
      const msg = pickRandom(ALTER_EGO_MESSAGES.completion);
      showAlterEgoBanner(msg);
      showToast('Rule fulfilled.');
    }
  }

  function deleteGoal(id) {
    const goal = state.goals.find((g) => g.id === id);
    if (!goal) return;

    goal.deleted = true;
    saveState();
    renderGoals();
    showToast('Rule erased.');
  }

  // ── Event Delegation for Goals ──
  goalsList.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const item = target.closest('.goal-item');
    const id = item?.dataset.id;
    if (!id) return;

    const action = target.dataset.action;
    if (action === 'toggle') toggleGoal(id);
    else if (action === 'delete') deleteGoal(id);
  });

  // ── Add Goal ──
  addGoalBtn.addEventListener('click', () => {
    addGoal(goalInput.value);
    goalInput.value = '';
    goalInput.focus();
  });

  goalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addGoal(goalInput.value);
      goalInput.value = '';
    }
  });

  // ── Settings Modal ──
  settingsBtn.addEventListener('click', openSettings);
  closeSettings.addEventListener('click', closeSettingsModal);
  modalOverlay.addEventListener('click', closeSettingsModal);

  function openSettings() {
    // Populate current values
    alterEgoNameInput.value = state.settings.alterEgoName;
    wakeTimeInput.value = state.settings.wakeTime;
    bedTimeInput.value = state.settings.bedTime;

    // Set active frequency
    $$('.freq-btn').forEach((btn) => {
      btn.classList.toggle('active', parseInt(btn.dataset.freq) === state.settings.frequency);
    });

    updateAlterEgoSettingName();
    updateSchedulePreview();
    updateNotifStatus();

    settingsModal.classList.remove('hidden');
  }

  function closeSettingsModal() {
    settingsModal.classList.add('hidden');
  }

  // Frequency buttons
  $$('.freq-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.freq-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      updateSchedulePreview();
    });
  });

  // Update schedule preview on time change
  wakeTimeInput.addEventListener('change', updateSchedulePreview);
  bedTimeInput.addEventListener('change', updateSchedulePreview);
  alterEgoNameInput.addEventListener('input', updateAlterEgoSettingName);

  function updateAlterEgoSettingName() {
    const name = alterEgoNameInput.value.trim() || 'your alter ego';
    $$('.alter-ego-setting-name').forEach((el) => (el.textContent = name));
  }

  function getSelectedFrequency() {
    const active = document.querySelector('.freq-btn.active');
    return active ? parseInt(active.dataset.freq) : 4;
  }

  function computeScheduleTimes(wake, bed, freq) {
    const wakeMinutes = timeToMinutes(wake);
    let bedMinutes = timeToMinutes(bed);
    if (bedMinutes <= wakeMinutes) bedMinutes += 24 * 60; // next day

    const totalMinutes = bedMinutes - wakeMinutes;
    const interval = totalMinutes / (freq + 1); // +1 so we don't notify exactly at wake/bed

    const times = [];
    for (let i = 1; i <= freq; i++) {
      const mins = wakeMinutes + Math.round(interval * i);
      times.push(minutesToTime(mins % (24 * 60)));
    }
    return times;
  }

  function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  function minutesToTime(totalMins) {
    const h = Math.floor(totalMins / 60) % 24;
    const m = totalMins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  function formatTimeDisplay(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
  }

  function updateSchedulePreview() {
    const freq = getSelectedFrequency();
    const wake = wakeTimeInput.value || '07:00';
    const bed = bedTimeInput.value || '23:00';
    const times = computeScheduleTimes(wake, bed, freq);

    schedulePreview.innerHTML = times
      .map((t) => `<span class="schedule-chip">${formatTimeDisplay(t)}</span>`)
      .join('');
  }

  function updateNotifStatus() {
    if (!('Notification' in window)) {
      notifStatus.textContent = 'Notifications not supported in this browser.';
      enableNotifBtn.disabled = true;
      return;
    }

    if (Notification.permission === 'granted') {
      notifStatus.textContent = '✓ Notifications are enabled.';
      notifStatus.style.color = '#39ff14';
      enableNotifBtn.textContent = 'NOTIFICATIONS ACTIVE';
      enableNotifBtn.style.borderColor = '#39ff14';
      enableNotifBtn.style.color = '#39ff14';
    } else if (Notification.permission === 'denied') {
      notifStatus.textContent = 'Notifications blocked. Enable them in browser settings.';
      notifStatus.style.color = '#ff003c';
    } else {
      notifStatus.textContent = 'Click to enable browser notifications.';
      notifStatus.style.color = '';
    }
  }

  // Enable notifications
  enableNotifBtn.addEventListener('click', async () => {
    if (!('Notification' in window)) {
      showToast('Notifications not supported.');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      state.settings.notificationsEnabled = true;
      saveState();
      showToast('Notifications enabled. There is no escape.');
      registerServiceWorker();
    } else {
      showToast('Permission denied. Your alter ego is disappointed.');
    }
    updateNotifStatus();
  });

  // Save settings
  saveSettingsBtn.addEventListener('click', () => {
    state.settings.alterEgoName = alterEgoNameInput.value.trim() || 'Tyler Durden';
    state.settings.frequency = getSelectedFrequency();
    state.settings.wakeTime = wakeTimeInput.value || '07:00';
    state.settings.bedTime = bedTimeInput.value || '23:00';

    saveState();
    scheduleNotifications();
    closeSettingsModal();
    showToast(`${state.settings.alterEgoName} is watching.`);
  });

  // ── Alter Ego Banner ──
  function showAlterEgoBanner(message) {
    const nameEl = alterEgoBanner.querySelector('.alter-ego-name');
    const textEl = alterEgoBanner.querySelector('.alter-ego-text');

    nameEl.textContent = state.settings.alterEgoName;
    textEl.textContent = message;
    alterEgoBanner.classList.remove('hidden');
  }

  dismissBanner.addEventListener('click', () => {
    alterEgoBanner.classList.add('hidden');
  });

  // ── Message Generator ──
  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function generateAlterEgoMessage() {
    const activeGoals = state.goals.filter((g) => !g.deleted && !g.completed);
    const now = new Date();
    const hour = now.getHours();

    // Morning messages (before 9am)
    if (hour < 9) {
      return pickRandom(ALTER_EGO_MESSAGES.morning);
    }

    // Evening messages (after 9pm)
    if (hour >= 21) {
      return pickRandom(ALTER_EGO_MESSAGES.evening);
    }

    // During the day: mix of check-ins and goal-specific
    if (activeGoals.length > 0 && Math.random() > 0.35) {
      const goal = pickRandom(activeGoals);
      const template = pickRandom(ALTER_EGO_MESSAGES.goalCheck);
      return template.replace(/\{goal\}/g, goal.text);
    }

    return pickRandom(ALTER_EGO_MESSAGES.checkIn);
  }

  // ── Notification Scheduling ──
  function scheduleNotifications() {
    // Clear existing timers
    notifTimers.forEach(clearTimeout);
    notifTimers = [];

    if (!state.settings.notificationsEnabled) return;
    if (Notification.permission !== 'granted') return;

    const { frequency, wakeTime, bedTime } = state.settings;
    const times = computeScheduleTimes(wakeTime, bedTime, frequency);

    const now = new Date();
    const today = now.toDateString();

    times.forEach((timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      const target = new Date(today);
      target.setHours(h, m, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }

      const delay = target.getTime() - now.getTime();

      const timer = setTimeout(() => {
        fireNotification();
        // Reschedule for next day
        scheduleNotifications();
      }, delay);

      notifTimers.push(timer);
    });

    console.log(
      `[Project Mayhem] Scheduled ${times.length} notifications:`,
      times.map(formatTimeDisplay)
    );
  }

  function fireNotification() {
    const message = generateAlterEgoMessage();
    const name = state.settings.alterEgoName;

    // Show browser notification
    if (Notification.permission === 'granted') {
      const notif = new Notification(name, {
        body: message,
        icon: 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#000" width="100" height="100"/><text x="50" y="60" text-anchor="middle" fill="#00fff0" font-size="50" font-family="monospace">M</text></svg>`),
        badge: 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#000" width="100" height="100"/><text x="50" y="60" text-anchor="middle" fill="#ff00aa" font-size="50" font-family="monospace">!</text></svg>`),
        tag: 'project-mayhem-' + Date.now(),
        requireInteraction: true,
        silent: false,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
        showAlterEgoBanner(message);
      };
    }

    // Also show in-app banner
    showAlterEgoBanner(message);
  }

  // ── Service Worker Registration ──
  async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('sw.js');
        console.log('[Project Mayhem] Service Worker registered:', registration.scope);
      } catch (error) {
        console.error('[Project Mayhem] Service Worker registration failed:', error);
      }
    }
  }

  // ── Demo / Test notification ──
  // Show a random alter ego message on first load if goals exist
  function maybeShowWelcomeMessage() {
    const activeGoals = state.goals.filter((g) => !g.deleted && !g.completed);
    if (activeGoals.length > 0) {
      // Small delay for dramatic effect
      setTimeout(() => {
        const message = generateAlterEgoMessage();
        showAlterEgoBanner(message);
      }, 1500);
    }
  }

  // ── Initialize ──
  function init() {
    renderGoals();
    registerServiceWorker(); // Always register for PWA install capability
    scheduleNotifications();
    maybeShowWelcomeMessage();
  }

  init();
})();
