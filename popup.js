// DOM Elements
const enableToggle = document.getElementById('enableToggle');
const usernameInput = document.getElementById('username');
const likeModeSelect = document.getElementById('likeMode');
const pageModeSelect = document.getElementById('pageMode');
const autoScrollSelect = document.getElementById('autoScroll');
const minDelayInput = document.getElementById('minDelay');
const maxDelayInput = document.getElementById('maxDelay');
const maxLikesInput = document.getElementById('maxLikes');
const debugModeSelect = document.getElementById('debugMode');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const likesCountEl = document.getElementById('likesCount');
const sessionCountEl = document.getElementById('sessionCount');
const statusEl = document.getElementById('status');

const defaultSettings = {
  enabled: false,
  likeMode: 'hover',
  pageMode: 'all',
  autoScroll: 'off',
  debugMode: 'off',
  minDelay: 1,
  maxDelay: 3,
  maxLikesPerHour: 60,
  likesToday: 0,
  sessionLikes: 0,
  lastResetDate: new Date().toDateString()
};

async function loadSettings() {
  try {
    const result = await chrome.storage.local.get('settings');
    const settings = { ...defaultSettings, ...result.settings };
    if (settings.lastResetDate !== new Date().toDateString()) {
      settings.likesToday = 0;
      settings.lastResetDate = new Date().toDateString();
      await saveSettings(settings);
    }
    return settings;
  } catch (e) {
    return defaultSettings;
  }
}

async function loadUsername() {
  try {
    const result = await chrome.storage.sync.get('userProfile');
    return result.userProfile?.username || '';
  } catch (e) {
    return '';
  }
}

async function saveUsername(username) {
  try {
    await chrome.storage.sync.set({ 
      userProfile: { username: username.toLowerCase().trim().replace('@', '') } 
    });
  } catch (e) {}
}

async function saveSettings(settings) {
  try {
    await chrome.storage.local.set({ settings });
    return true;
  } catch (e) {
    return false;
  }
}

function updateUI(settings, username) {
  enableToggle.checked = settings.enabled;
  usernameInput.value = username;
  likeModeSelect.value = settings.likeMode || 'hover';
  pageModeSelect.value = settings.pageMode || 'all';
  autoScrollSelect.value = settings.autoScroll || 'off';
  debugModeSelect.value = settings.debugMode || 'off';
  minDelayInput.value = settings.minDelay;
  maxDelayInput.value = settings.maxDelay;
  maxLikesInput.value = settings.maxLikesPerHour;
  likesCountEl.textContent = settings.likesToday;
  sessionCountEl.textContent = settings.sessionLikes;
  updateStatus(settings.enabled);
}

function updateStatus(enabled) {
  statusEl.textContent = enabled ? '🟢 Active' : '⏸️ Paused';
  statusEl.className = enabled ? 'status active' : 'status paused';
}

async function init() {
  const settings = await loadSettings();
  const username = await loadUsername();
  updateUI(settings, username);
}

enableToggle.addEventListener('change', async () => {
  const settings = await loadSettings();
  settings.enabled = enableToggle.checked;
  await saveSettings(settings);
  updateStatus(settings.enabled);
  const username = await loadUsername();
  notifyContentScript(settings, username);
});

saveBtn.addEventListener('click', async () => {
  const settings = await loadSettings();
  const username = usernameInput.value.trim();
  await saveUsername(username);
  
  settings.likeMode = likeModeSelect.value;
  settings.pageMode = pageModeSelect.value;
  settings.autoScroll = autoScrollSelect.value;
  settings.debugMode = debugModeSelect.value;
  settings.minDelay = Math.max(0.5, parseFloat(minDelayInput.value) || 1);
  settings.maxDelay = Math.max(1, parseFloat(maxDelayInput.value) || 3);
  settings.maxLikesPerHour = Math.max(10, parseInt(maxLikesInput.value) || 60);
  
  await saveSettings(settings);
  showToast('Saved!');
  notifyContentScript(settings, username);
});

resetBtn.addEventListener('click', async () => {
  const settings = await loadSettings();
  settings.likesToday = 0;
  settings.sessionLikes = 0;
  await saveSettings(settings);
  const username = await loadUsername();
  updateUI(settings, username);
  showToast('Reset!');
});

async function notifyContentScript(settings, username) {
  try {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'SETTINGS_UPDATED',
          settings: settings,
          username: username
        }).catch(() => {});
      }
    });
  } catch (e) {}
}

function showToast(msg) {
  statusEl.textContent = msg;
  setTimeout(async () => {
    const settings = await loadSettings();
    updateStatus(settings.enabled);
  }, 1500);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'STATS_UPDATED') {
    likesCountEl.textContent = message.likesToday;
    sessionCountEl.textContent = message.sessionLikes;
  }
});

init();
