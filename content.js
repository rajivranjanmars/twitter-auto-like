/**
 * X Auto Like - Dynamic Mode with Debug Support
 */

let settings = {
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

let ownUsername = '';
let likesThisHour = 0;
let isProcessing = false;
let hoveredTweets = new WeakSet();
let autoScrollInterval = null;

const scrollSpeeds = { off: 0, slow: 1, medium: 3, fast: 6 };

// Debug logger
function log(...args) {
  if (settings.debugMode === 'on') {
    console.log(...args);
  }
}

// Initialize
async function init() {
  await loadSettings();
  setupMessageListener();
  setupHoverListener();
  setupAutoMode();
  startAutoScroll();
  
  setInterval(() => { likesThisHour = 0; }, 60 * 60 * 1000);
  
  log('🔥 X Auto Like loaded');
  if (settings.enabled) {
    log(`✅ Enabled - Mode: ${settings.likeMode}, Scroll: ${settings.autoScroll}`);
  }
}

// Load settings
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get('settings');
    if (result.settings) settings = { ...settings, ...result.settings };
    
    const profileResult = await chrome.storage.sync.get('userProfile');
    if (profileResult.userProfile?.username) {
      ownUsername = profileResult.userProfile.username.toLowerCase();
      log(`👤 Username: @${ownUsername}`);
    }
  } catch (e) {}
}

// Save settings
async function saveSettings() {
  try { await chrome.storage.local.set({ settings }); } catch (e) {}
}

// Listen for popup messages
function setupMessageListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SETTINGS_UPDATED') {
      settings = { ...settings, ...message.settings };
      if (message.username !== undefined) {
        ownUsername = message.username.toLowerCase().trim();
      }
      log(`📝 Updated - Mode: ${settings.likeMode}, Scroll: ${settings.autoScroll}, Debug: ${settings.debugMode}`);
      
      startAutoScroll();
      
      if (settings.enabled && settings.likeMode === 'auto') {
        likeAllVisible();
      }
    }
    sendResponse({ success: true });
  });
}

// ============================================
// HOVER MODE
// ============================================
function setupHoverListener() {
  document.addEventListener('mouseover', async (event) => {
    if (!settings.enabled) return;
    if (settings.likeMode !== 'hover') return;
    if (!isAllowedPage()) return;
    if (likesThisHour >= settings.maxLikesPerHour) return;
    
    const article = event.target.closest('article[data-testid="tweet"]');
    if (!article || hoveredTweets.has(article)) return;
    hoveredTweets.add(article);
    
    const likeButton = article.querySelector('button[data-testid="like"]');
    if (!likeButton) return;
    
    if (isOwnTweet(article)) {
      log('⏭️ Skipped own tweet');
      return;
    }
    
    await sleep(settings.minDelay * 1000);
    
    if (article.querySelector('button[data-testid="like"]')) {
      likeButton.click();
      likesThisHour++;
      settings.likesToday++;
      settings.sessionLikes++;
      await saveSettings();
      log(`❤️ Hover like (${likesThisHour}/${settings.maxLikesPerHour}/hr)`);
      notifyPopup();
    }
  });
}

// ============================================
// AUTO MODE
// ============================================
function setupAutoMode() {
  const observer = new MutationObserver(() => {
    if (settings.enabled && settings.likeMode === 'auto' && !isProcessing) {
      likeAllVisible();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

async function likeAllVisible() {
  if (!settings.enabled || settings.likeMode !== 'auto') return;
  if (!isAllowedPage()) return;
  if (isProcessing) return;
  
  isProcessing = true;
  
  const buttons = document.querySelectorAll('button[data-testid="like"]');
  
  for (const button of buttons) {
    if (!settings.enabled || settings.likeMode !== 'auto') break;
    if (likesThisHour >= settings.maxLikesPerHour) {
      log('⚠️ Hourly limit reached');
      break;
    }
    
    const article = button.closest('article[data-testid="tweet"]');
    if (article && isOwnTweet(article)) continue;
    
    button.click();
    likesThisHour++;
    settings.likesToday++;
    settings.sessionLikes++;
    await saveSettings();
    log(`❤️ Auto like (${likesThisHour}/${settings.maxLikesPerHour}/hr)`);
    notifyPopup();
    
    const delay = settings.minDelay * 1000 + Math.random() * (settings.maxDelay - settings.minDelay) * 1000;
    await sleep(delay);
  }
  
  isProcessing = false;
}

// ============================================
// AUTO SCROLL
// ============================================
function startAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
  
  if (!settings.enabled || settings.autoScroll === 'off') return;
  
  const speed = scrollSpeeds[settings.autoScroll] || 0;
  if (speed === 0) return;
  
  log(`📜 Auto-scroll: ${settings.autoScroll}`);
  
  autoScrollInterval = setInterval(() => {
    if (!settings.enabled || settings.autoScroll === 'off') {
      clearInterval(autoScrollInterval);
      autoScrollInterval = null;
      return;
    }
    window.scrollBy(0, speed);
  }, 50);
}

// ============================================
// PAGE & TAB DETECTION
// ============================================
function isAllowedPage() {
  const path = window.location.pathname;
  const mode = settings.pageMode || 'all';
  
  if (mode === 'all') return true;
  
  const isHomePath = path === '/home' || path === '/';
  
  if (isHomePath) {
    const activeTab = getActiveHomeTab();
    
    if (mode === 'home') return activeTab === 'foryou';
    if (mode === 'following') return activeTab === 'following';
    if (mode === 'both') return true;
  }
  
  return mode === 'all';
}

function getActiveHomeTab() {
  try {
    const tabs = document.querySelectorAll('[role="tab"]');
    
    for (const tab of tabs) {
      const isSelected = tab.getAttribute('aria-selected') === 'true';
      if (!isSelected) continue;
      
      const text = tab.textContent.toLowerCase();
      if (text.includes('following')) return 'following';
      if (text.includes('for you') || text.includes('foryou')) return 'foryou';
    }
  } catch (e) {}
  
  return 'foryou';
}

// ============================================
// HELPERS
// ============================================
function isOwnTweet(article) {
  if (!ownUsername) return false;
  try {
    const userArea = article.querySelector('[data-testid="User-Name"]');
    if (userArea && userArea.textContent.toLowerCase().includes('@' + ownUsername)) return true;
  } catch (e) {}
  return false;
}

function notifyPopup() {
  chrome.runtime.sendMessage({
    type: 'STATS_UPDATED',
    likesToday: settings.likesToday,
    sessionLikes: settings.sessionLikes
  }).catch(() => {});
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

init();
