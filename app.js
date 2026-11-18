import { getRandomText, getAllTexts } from './data/texts.js';

const STORAGE_KEY = 'ketikcepat_history';
const BEST_KEY = 'ketikcepat_best';
const CUSTOM_TEXT_KEY = 'ketikcepat_custom';

const state = {
  config: {
    textType: 'words',
    difficulty: 'easy',
    duration: 30
  },
  test: {
    text: '',
    chars: [],
    currentIndex: 0,
    correctChars: 0,
    incorrectChars: 0,
    typedChars: 0,
    startTime: null,
    endTime: null,
    timerInterval: null,
    timeLeft: 0,
    finished: false,
    consistency: []
  }
};

const els = {
  setup: document.getElementById('setup'),
  test: document.getElementById('test'),
  results: document.getElementById('results'),
  textManager: document.getElementById('textManager'),
  textTypeRadios: document.querySelectorAll('input[name="textType"]'),
  difficultyRadios: document.querySelectorAll('input[name="difficulty"]'),
  durationRadios: document.querySelectorAll('input[name="duration"]'),
  startBtn: document.getElementById('startBtn'),
  restartBtn: document.getElementById('restartBtn'),
  retryBtn: document.getElementById('retryBtn'),
  homeBtn: document.getElementById('homeBtn'),
  quitBtn: document.getElementById('quitBtn'),
  themeToggle: document.getElementById('themeToggle'),
  exitBtn: document.getElementById('exitBtn'),
  manageTextsBtn: document.getElementById('manageTextsBtn'),
  closeManagerBtn: document.getElementById('closeManagerBtn'),
  customTextInput: document.getElementById('customTextInput'),
  importFile: document.getElementById('importFile'),
  exportFileBtn: document.getElementById('exportFileBtn'),
  clearCustomBtn: document.getElementById('clearCustomBtn'),
  saveCustomBtn: document.getElementById('saveCustomBtn'),
  customTextCount: document.getElementById('customTextCount'),
  timer: document.getElementById('timer'),
  progressBar: document.getElementById('progressBar'),
  textDisplay: document.getElementById('textDisplay'),
  inputArea: document.getElementById('inputArea'),
  liveWpm: document.getElementById('liveWpm'),
  liveKpm: document.getElementById('liveKpm'),
  liveAcc: document.getElementById('liveAcc'),
  finalWpm: document.getElementById('finalWpm'),
  finalKpm: document.getElementById('finalKpm'),
  finalAcc: document.getElementById('finalAcc'),
  finalCorrect: document.getElementById('finalCorrect'),
  finalWrong: document.getElementById('finalWrong'),
  finalTime: document.getElementById('finalTime'),
  detailTotal: document.getElementById('detailTotal'),
  detailCorrect: document.getElementById('detailCorrect'),
  detailWrong: document.getElementById('detailWrong'),
  detailConsistency: document.getElementById('detailConsistency'),
  historyList: document.getElementById('historyList'),
  bestWpm: document.getElementById('bestWpm'),
  bestKpm: document.getElementById('bestKpm'),
  bestAcc: document.getElementById('bestAcc'),
  totalTests: document.getElementById('totalTests')
};

function init() {
  applyTheme(localStorage.getItem('ketikcepat_theme') || 'light');
  bindEvents();
  loadCustomTexts();
  loadStats();
  renderPreviewStats();
}

function bindEvents() {
  els.textTypeRadios.forEach(r => r.addEventListener('change', e => {
    state.config.textType = e.target.value;
  }));

  els.difficultyRadios.forEach(r => r.addEventListener('change', e => {
    state.config.difficulty = e.target.value;
  }));

  els.durationRadios.forEach(r => r.addEventListener('change', e => {
    state.config.duration = parseInt(e.target.value, 10);
  }));

  els.startBtn.addEventListener('click', startTest);
  els.restartBtn.addEventListener('click', () => startTest(true));
  els.retryBtn.addEventListener('click', () => startTest(true));
  els.homeBtn.addEventListener('click', showSetup);
  els.quitBtn.addEventListener('click', showSetup);
  els.themeToggle.addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });
  els.exitBtn.addEventListener('click', exitApp);

  els.manageTextsBtn.addEventListener('click', showTextManager);
  els.closeManagerBtn.addEventListener('click', showSetup);
  els.saveCustomBtn.addEventListener('click', saveCustomTexts);
  els.importFile.addEventListener('change', handleImport);
  els.exportFileBtn.addEventListener('click', exportCustomTexts);
  els.clearCustomBtn.addEventListener('click', clearCustomTexts);

  els.inputArea.addEventListener('input', handleInput);
  els.inputArea.addEventListener('keydown', handleKeydown);

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      if (!els.test.classList.contains('hidden')) {
        startTest(true);
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'q') {
      e.preventDefault();
      exitApp();
    }
    if (e.key === 'Escape') {
      if (!els.test.classList.contains('hidden')) {
        showSetup();
      } else if (!els.textManager.classList.contains('hidden')) {
        showSetup();
      }
    }
  });

  els.inputArea.addEventListener('paste', e => e.preventDefault());
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('ketikcepat_theme', theme);
}

function exitApp() {
  stopTimer();
  window.close();
  setTimeout(() => {
    if (!window.closed) showSetup();
  }, 100);
}

function showSetup() {
  stopTimer();
  els.test.classList.add('hidden');
  els.results.classList.add('hidden');
  els.textManager.classList.add('hidden');
  els.setup.classList.remove('hidden');
  renderPreviewStats();
}

function showTextManager() {
  stopTimer();
  els.setup.classList.add('hidden');
  els.results.classList.add('hidden');
  els.test.classList.add('hidden');
  els.textManager.classList.remove('hidden');
  renderCustomTextInput();
}

function startTest(restart = false) {
  if (!restart) {
    state.config.textType = document.querySelector('input[name="textType"]:checked').value;
    state.config.difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    state.config.duration = parseInt(document.querySelector('input[name="duration"]:checked').value, 10);
  }

  state.test.text = getRandomTextCustom(state.config.textType, state.config.difficulty);
  state.test.chars = state.test.text.split('');
  state.test.currentIndex = 0;
  state.test.correctChars = 0;
  state.test.incorrectChars = 0;
  state.test.typedChars = 0;
  state.test.startTime = null;
  state.test.endTime = null;
  state.test.timeLeft = state.config.duration;
  state.test.finished = false;
  state.test.consistency = [];

  els.setup.classList.add('hidden');
  els.results.classList.add('hidden');
  els.textManager.classList.add('hidden');
  els.test.classList.remove('hidden');

  renderTextDisplay();
  els.inputArea.value = '';
  els.inputArea.classList.remove('hidden');
  els.inputArea.focus();
  els.timer.textContent = state.test.timeLeft;
  els.timer.classList.remove('warning', 'danger');
  els.progressBar.style.width = '0%';
  updateLiveStats();

  startTimer();
}

function startTimer() {
  state.test.startTime = Date.now();
  state.test.timerInterval = setInterval(() => {
    state.test.timeLeft--;
    els.timer.textContent = state.test.timeLeft;

    if (state.test.timeLeft <= 10 && state.test.timeLeft > 5) {
      els.timer.classList.add('warning');
      els.timer.classList.remove('danger');
    } else if (state.test.timeLeft <= 5) {
      els.timer.classList.add('danger');
      els.timer.classList.remove('warning');
    }

    const elapsed = (state.config.duration - state.test.timeLeft) / 60;
    if (elapsed > 0) {
      const wpm = Math.round(state.test.correctChars / 5 / elapsed);
      const kpm = Math.round(state.test.correctChars / elapsed);
      state.test.consistency.push({ wpm, kpm, time: state.config.duration - state.test.timeLeft });
    }

    updateLiveStats();
    updateProgressBar();

    if (state.test.timeLeft <= 0) {
      finishTest();
    }
  }, 1000);
}

function stopTimer() {
  if (state.test.timerInterval) {
    clearInterval(state.test.timerInterval);
    state.test.timerInterval = null;
  }
}

function handleInput(e) {
  if (state.test.finished) return;

  const value = e.target.value;
  const len = value.length;

  if (!state.test.startTime) {
    state.test.startTime = Date.now();
  }

  if (len > state.test.chars.length) {
    e.target.value = value.slice(0, state.test.chars.length);
    return;
  }

  state.test.typedChars = len;

  for (let i = 0; i < state.test.chars.length; i++) {
    const charEl = els.textDisplay.querySelector(`[data-index="${i}"]`);
    if (!charEl) continue;

    charEl.classList.remove('correct', 'incorrect', 'current', 'pending');

    if (i < len) {
      const typed = value[i];
      const expected = state.test.chars[i];
      if (typed === expected) {
        charEl.classList.add('correct');
      } else {
        charEl.classList.add('incorrect');
      }
    } else if (i === len) {
      charEl.classList.add('current');
    } else {
      charEl.classList.add('pending');
    }
  }

  calculateStats();
  updateLiveStats();

  if (len === state.test.chars.length) {
    finishTest();
  }
}

function handleKeydown(e) {
  if (state.test.finished) return;

  if (e.key === 'Backspace') {
    const value = e.target.value;
    if (value.length > 0) {
      const lastChar = value[value.length - 1];
      const expected = state.test.chars[value.length - 1];
      if (lastChar === expected) {
        state.test.correctChars--;
      } else {
        state.test.incorrectChars--;
      }
    }
  }
}

function calculateStats() {
  let correct = 0;
  let incorrect = 0;

  for (let i = 0; i < state.test.typedChars; i++) {
    if (state.test.chars[i] === els.inputArea.value[i]) {
      correct++;
    } else {
      incorrect++;
    }
  }

  state.test.correctChars = correct;
  state.test.incorrectChars = incorrect;
}

function updateLiveStats() {
  const elapsed = state.test.startTime ? (Date.now() - state.test.startTime) / 1000 : 0;
  const minutes = Math.max(elapsed / 60, 1/60);

  const wpm = Math.round(state.test.correctChars / 5 / minutes);
  const kpm = Math.round(state.test.correctChars / minutes);
  const accuracy = state.test.typedChars > 0
    ? Math.round((state.test.correctChars / state.test.typedChars) * 100)
    : 100;

  els.liveWpm.textContent = wpm;
  els.liveKpm.textContent = kpm;
  els.liveAcc.textContent = accuracy;
}

function updateProgressBar() {
  const progress = ((state.config.duration - state.test.timeLeft) / state.config.duration) * 100;
  els.progressBar.style.width = `${progress}%`;
}

function renderTextDisplay() {
  els.textDisplay.innerHTML = state.test.chars
    .map((char, i) => {
      const displayChar = char === ' ' ? '<span class="space-indicator" aria-hidden="true">·</span>' : char;
      return `<span class="char pending" data-index="${i}">${displayChar}</span>`;
    })
    .join('');
}

function finishTest() {
  if (state.test.finished) return;
  state.test.finished = true;
  state.test.endTime = Date.now();
  stopTimer();

  els.inputArea.classList.add('hidden');
  els.timer.classList.remove('warning', 'danger');

  const elapsed = (state.test.endTime - state.test.startTime) / 1000;
  const minutes = Math.max(elapsed / 60, 1/60);

  const wpm = Math.round(state.test.correctChars / 5 / minutes);
  const kpm = Math.round(state.test.correctChars / minutes);
  const accuracy = state.test.typedChars > 0
    ? Math.round((state.test.correctChars / state.test.typedChars) * 100)
    : 100;

  const consistency = calculateConsistency();

  els.finalWpm.textContent = wpm;
  els.finalKpm.textContent = kpm;
  els.finalAcc.textContent = `${accuracy}%`;
  els.finalCorrect.textContent = state.test.correctChars;
  els.finalWrong.textContent = state.test.incorrectChars;
  els.finalTime.textContent = `${Math.round(elapsed)}s`;
  els.detailTotal.textContent = state.test.typedChars;
  els.detailCorrect.textContent = state.test.correctChars;
  els.detailWrong.textContent = state.test.incorrectChars;
  els.detailConsistency.textContent = `${consistency}%`;

  saveResult({
    wpm,
    kpm,
    accuracy,
    correct: state.test.correctChars,
    incorrect: state.test.incorrectChars,
    time: Math.round(elapsed),
    textType: state.config.textType,
    difficulty: state.config.difficulty,
    duration: state.config.duration,
    timestamp: Date.now()
  });

  renderPreviewStats();
  renderHistory();

  setTimeout(() => {
    els.test.classList.add('hidden');
    els.results.classList.remove('hidden');
  }, 300);
}

function calculateConsistency() {
  if (state.test.consistency.length < 2) return 100;
  const wpms = state.test.consistency.map(c => c.wpm);
  const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
  const variance = wpms.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / wpms.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? (stdDev / mean) * 100 : 0;
  return Math.max(0, Math.round(100 - cv));
}

function saveResult(result) {
  const history = getHistory();
  history.unshift(result);
  if (history.length > 50) history.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

  const best = getBest();
  if (result.wpm > best.wpm) best.wpm = result.wpm;
  if (result.kpm > best.kpm) best.kpm = result.kpm;
  if (result.accuracy > best.accuracy) best.accuracy = result.accuracy;
  best.totalTests = (best.totalTests || 0) + 1;
  localStorage.setItem(BEST_KEY, JSON.stringify(best));
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function getBest() {
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY) || '{}');
  } catch {
    return { wpm: 0, kpm: 0, accuracy: 0, totalTests: 0 };
  }
}

function loadStats() {
  const best = getBest();
  els.bestWpm.textContent = best.wpm || 0;
  els.bestKpm.textContent = best.kpm || 0;
  els.bestAcc.textContent = `${best.accuracy || 0}%`;
  els.totalTests.textContent = best.totalTests || 0;
}

function renderPreviewStats() {
  loadStats();
}

function renderHistory() {
  const history = getHistory();
  if (history.length === 0) {
    els.historyList.innerHTML = '<div class="history-empty">Belum ada riwayat tes</div>';
    return;
  }

  els.historyList.innerHTML = history.slice(0, 10).map((h, i) => `
    <div class="history-item">
      <div class="history-info">
        <span class="history-mode">${h.textType} · ${h.difficulty} · ${h.duration}s</span>
        <span class="history-meta">${new Date(h.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div class="history-stats">
        <span class="wpm">${h.wpm} WPM</span>
        <span class="acc">${h.accuracy}% acc</span>
        <span class="kpm">${h.kpm} KPM</span>
      </div>
    </div>
  `).join('');
}

function loadCustomTexts() {
  try {
    const data = JSON.parse(localStorage.getItem(CUSTOM_TEXT_KEY) || '{}');
    return data;
  } catch {
    return {};
  }
}

function saveCustomTexts() {
  const raw = els.customTextInput.value.trim();
  if (!raw) {
    clearCustomTexts();
    return;
  }
  const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const existing = loadCustomTexts();
  const type = state.config.textType;
  const diff = state.config.difficulty;
  if (!existing[type]) existing[type] = {};
  if (!existing[type][diff]) existing[type][diff] = [];
  existing[type][diff] = [...existing[type][diff], ...lines];
  localStorage.setItem(CUSTOM_TEXT_KEY, JSON.stringify(existing));
  renderCustomTextInput();
  alert(`Tersimpan ${lines.length} teks untuk ${type} / ${diff}`);
}

function renderCustomTextInput() {
  const existing = loadCustomTexts();
  const type = state.config.textType;
  const diff = state.config.difficulty;
  const texts = existing[type]?.[diff] || [];
  els.customTextInput.value = texts.join('\n');
  els.customTextCount.textContent = `${texts.length} teks tambahan (${type} / ${diff})`;
}

function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    const text = evt.target.result;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const existing = loadCustomTexts();
    const type = state.config.textType;
    const diff = state.config.difficulty;
    if (!existing[type]) existing[type] = {};
    if (!existing[type][diff]) existing[type][diff] = [];
    existing[type][diff] = [...existing[type][diff], ...lines];
    localStorage.setItem(CUSTOM_TEXT_KEY, JSON.stringify(existing));
    renderCustomTextInput();
    alert(`Imported ${lines.length} teks untuk ${type} / ${diff}`);
    e.target.value = '';
  };
  reader.readAsText(file);
}

function exportCustomTexts() {
  const existing = loadCustomTexts();
  const type = state.config.textType;
  const diff = state.config.difficulty;
  const texts = existing[type]?.[diff] || [];
  if (texts.length === 0) {
    alert('Tidak ada teks tambahan untuk diekspor');
    return;
  }
  const blob = new Blob([texts.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `custom-${type}-${diff}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function clearCustomTexts() {
  if (!confirm('Hapus semua teks tambahan untuk mode ini?')) return;
  const existing = loadCustomTexts();
  const type = state.config.textType;
  const diff = state.config.difficulty;
  if (existing[type]?.[diff]) {
    delete existing[type][diff];
    if (Object.keys(existing[type]).length === 0) delete existing[type];
    localStorage.setItem(CUSTOM_TEXT_KEY, JSON.stringify(existing));
    renderCustomTextInput();
    alert('Teks tambahan dihapus');
  }
}

function getCustomTexts(type, difficulty) {
  const existing = loadCustomTexts();
  return existing[type]?.[difficulty] || [];
}

function getRandomTextCustom(type, difficulty) {
  const builtIn = getRandomText(type, difficulty);
  const custom = getCustomTexts(type, difficulty);
  if (custom.length === 0) return builtIn;
  const all = [builtIn, ...custom];
  return all[Math.floor(Math.random() * all.length)];
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}