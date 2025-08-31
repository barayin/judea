// Hebrew letters matching and sequencing game
// This script loads letter definitions from a JSON file (data/letters.json) or
// falls back to data/lettersData.js when running via the file protocol.
// It provides multiple game modes (ordered match, shuffled match, sequences and typing) and
// supports toggling transliteration tooltips and editing the letter data via a JSON editor.

(function() {
  // Mapping of final Hebrew letter forms to base forms for typing mode
  const FINAL_TO_BASE = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };

  // Data variables
  let LETTERS = [];
  let KID_ORDER = [];
  let byId = {};
  let byChar = {};

  // Game state
  const state = {
    mode: 'ordered_match',      // current mode
    script: 'he',               // 'he' for Hebrew names, 'lat' for transliterations
    matched: new Set(),         // matched letter ids
    selectedLetter: null,       // current selected letter id
    selectedName: null,         // current selected name id
    letterOrder: [],            // ordering of letters for display
    shuffledNameIds: [],        // shuffled order of names
    correct: 0,
    wrong: 0,
    history: [],                // history of attempts
    seqIndex: 0,                // index in sequence modes
    seqDone: new Set()          // sequence done set
  };

  // Tooltip toggle
  let letterTooltipsEnabled = false;

  // Utility functions
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function nowTS() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  function flash(el, cls, ms = 650) {
    if (!el) return;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), ms);
  }
  function fmtPct(n) {
    return isNaN(n) ? '0%' : `${(n * 100).toFixed(0)}%`;
  }
  function isSequenceMode() {
    return ['sequence_names', 'sequence_chars', 'sequence_keyboard'].includes(state.mode);
  }

  // Initialize data structures from a letters array
  function setLetters(data) {
    LETTERS = data;
    KID_ORDER = LETTERS.map(l => l.id);
    byId = Object.fromEntries(LETTERS.map(l => [l.id, l]));
    byChar = Object.fromEntries(LETTERS.map(l => [l.he, l.id]));
    state.letterOrder = [...KID_ORDER];
    state.shuffledNameIds = shuffle(KID_ORDER);
  }

  // Load letter data from JSON or fallback
  function loadLetters(callback) {
    fetch('data/letters.json').then(resp => resp.json()).then(data => {
      if (data && data.letters) {
        callback(data.letters);
      } else {
        callback(data);
      }
    }).catch(() => {
      if (window.lettersData && Array.isArray(window.lettersData.letters)) {
        callback(window.lettersData.letters);
      } else {
        console.error('Failed to load letters data');
      }
    });
  }

  // Render functions
  function renderLayoutByMode() {
    const board = document.getElementById('board');
    const lettersPanel = document.getElementById('lettersPanel');
    const kbdStatus = document.getElementById('kbdStatus');
    if (!board || !lettersPanel) return;
    if (isSequenceMode()) {
      lettersPanel.style.display = 'none';
      board.classList.add('onecol');
      if (kbdStatus) {
        kbdStatus.style.display = state.mode === 'sequence_keyboard' ? 'inline-flex' : 'none';
      }
    } else {
      lettersPanel.style.display = '';
      board.classList.remove('onecol');
      if (kbdStatus) kbdStatus.style.display = 'none';
    }
  }
  function renderModeHeader() {
    const hdr = document.getElementById('namesHdr');
    if (!hdr) return;
    switch (state.mode) {
      case 'sequence_names':
        hdr.textContent = 'Names (click in order)';
        break;
      case 'sequence_chars':
        hdr.textContent = 'Letters (click in order)';
        break;
      case 'sequence_keyboard':
        hdr.textContent = 'Letters (type in order)';
        break;
      default:
        hdr.textContent = 'Names';
    }
  }
  function renderLetters() {
    const root = document.getElementById('lettersGrid');
    if (!root) return;
    root.innerHTML = '';
    if (isSequenceMode()) return;
    const order = state.mode === 'ordered_match' ? KID_ORDER : state.letterOrder;
    order.forEach(id => {
      const item = byId[id];
      const btn = document.createElement('button');
      btn.className = 'cell';
      btn.textContent = item.he;
      btn.dataset.id = id;
      if (letterTooltipsEnabled) {
        btn.title = item.nameLat;
      } else {
        btn.removeAttribute('title');
      }
      if (state.matched.has(id)) {
        btn.classList.add('matched');
        btn.disabled = true;
      } else if (state.selectedLetter === id) {
        btn.classList.add('selected');
      }
      btn.addEventListener('click', () => {
        if (state.matched.has(id)) return;
        state.selectedLetter = state.selectedLetter === id ? null : id;
        if (state.selectedLetter && state.selectedName) {
          evaluateMatch();
        } else {
          renderLetters();
        }
      });
      root.appendChild(btn);
    });
  }
  function renderNames() {
    const root = document.getElementById('namesGrid');
    if (!root) return;
    root.innerHTML = '';
    if (isSequenceMode()) {
      // Sequence modes
      const remaining = KID_ORDER.filter(id => !state.seqDone.has(id));
      state.shuffledNameIds = state.shuffledNameIds.filter(id => remaining.includes(id));
      const missing = remaining.filter(id => !state.shuffledNameIds.includes(id));
      state.shuffledNameIds.push(...shuffle(missing));
      state.shuffledNameIds.forEach(id => {
        const item = byId[id];
        const btn = document.createElement('button');
        btn.className = 'cell';
        btn.dataset.id = id;
        if (state.mode === 'sequence_names') {
          btn.textContent = state.script === 'he' ? item.nameHe : item.nameLat;
        } else {
          // sequence_chars or keyboard
          btn.textContent = item.he;
        }
        if (letterTooltipsEnabled) {
          btn.title = item.nameLat;
        } else {
          btn.removeAttribute('title');
        }
        if (state.seqDone.has(id)) {
          btn.classList.add('matched');
          btn.disabled = true;
        }
        btn.addEventListener('click', () => {
          if (state.seqDone.has(id)) return;
          evaluateSequenceClick(id, btn);
        });
        root.appendChild(btn);
      });
      return;
    }
    // Match modes
    const available = KID_ORDER.filter(id => !state.matched.has(id));
    state.shuffledNameIds = state.shuffledNameIds.filter(id => available.includes(id));
    const missing = available.filter(id => !state.shuffledNameIds.includes(id));
    state.shuffledNameIds.push(...shuffle(missing));
    state.shuffledNameIds.forEach(id => {
      const item = byId[id];
      const btn = document.createElement('button');
      btn.className = 'cell';
      btn.dataset.id = id;
      btn.textContent = state.script === 'he' ? item.nameHe : item.nameLat;
      if (letterTooltipsEnabled) {
        btn.title = item.nameLat;
      } else {
        btn.removeAttribute('title');
      }
      if (state.matched.has(id)) {
        btn.classList.add('matched');
        btn.disabled = true;
      } else if (state.selectedName === id) {
        btn.classList.add('selected');
      }
      btn.addEventListener('click', () => {
        if (state.matched.has(id)) return;
        state.selectedName = state.selectedName === id ? null : id;
        if (state.selectedLetter && state.selectedName) {
          evaluateMatch();
        } else {
          renderNames();
        }
      });
      root.appendChild(btn);
    });
  }
  function renderStats() {
    const total = state.correct + state.wrong;
    const acc = total ? state.correct / total : 0;
    const scoreText = document.getElementById('scoreText');
    const scoreBar = document.getElementById('scoreBar');
    if (scoreText) scoreText.textContent = `${state.correct} / ${total}  (${fmtPct(acc)})`;
    if (scoreBar) scoreBar.style.width = `${acc * 100}%`;
    const list = document.getElementById('historyList');
    if (!list) return;
    list.innerHTML = '';
    const history = state.history.slice(-12).reverse();
    history.forEach(h => {
      const li = document.createElement('div');
      li.className = 'row';
      const mark = document.createElement('div');
      mark.textContent = h.correct ? '✓' : '✗';
      mark.className = h.correct ? 'ok' : 'no';
      const mid = document.createElement('div');
      if (h.mode && h.mode.startsWith('sequence')) {
        if (h.mode === 'sequence_keyboard') {
          const exp = byId[h.expectedId];
          const label = state.mode === 'sequence_names' ? (state.script === 'he' ? exp.nameHe : exp.nameLat) : exp.he;
          mid.textContent = `typed “${h.typedChar}” → expected ${label}`;
        } else {
          const clicked = byId[h.nameId];
          const exp = byId[h.expectedId];
          if (h.mode === 'sequence_names') {
            mid.textContent = `${state.script === 'he' ? clicked.nameHe : clicked.nameLat}  (next was ${state.script === 'he' ? exp.nameHe : exp.nameLat})`;
          } else {
            mid.textContent = `${clicked.he}  (next was ${exp.he})`;
          }
        }
      } else {
        const L = byId[h.letterId];
        const N = byId[h.nameId];
        mid.textContent = `${L.he}  →  ${state.script === 'he' ? N.nameHe : N.nameLat}`;
      }
      const ts = document.createElement('div');
      ts.className = 'ts';
      ts.textContent = h.t;
      li.appendChild(mark);
      li.appendChild(mid);
      li.appendChild(ts);
      list.appendChild(li);
    });
  }
  function renderRemaining() {
    const remainingEl = document.getElementById('remaining');
    if (!remainingEl) return;
    let left;
    if (isSequenceMode()) {
      left = LETTERS.length - state.seqIndex;
    } else {
      left = LETTERS.length - state.matched.size;
    }
    remainingEl.textContent = `${left} remaining`;
  }
  function modeLabel(mode) {
    switch (mode) {
      case 'ordered_match': return 'Ordered Match';
      case 'shuffled_match': return 'Shuffled Match';
      case 'sequence_names': return 'Sequence — Names';
      case 'sequence_chars': return 'Sequence — Letters';
      case 'sequence_keyboard': return 'Sequence — Typing';
      default: return mode;
    }
  }
  function renderNextTarget() {
    const pill = document.getElementById('nextTarget');
    if (!pill) return;
    if (!isSequenceMode()) {
      pill.textContent = `Mode: ${modeLabel(state.mode)}`;
      return;
    }
    const expId = KID_ORDER[state.seqIndex];
    const exp = byId[expId];
    if (state.mode === 'sequence_names') {
      pill.textContent = `Next: ${state.script === 'he' ? exp.nameHe : exp.nameLat}`;
    } else {
      pill.textContent = `Next: ${exp.he}`;
    }
  }
  function renderAll() {
    renderLayoutByMode();
    renderModeHeader();
    renderLetters();
    renderNames();
    renderStats();
    renderRemaining();
    renderNextTarget();
  }

  // Evaluation functions
  function evaluateMatch() {
    const lid = state.selectedLetter;
    const nid = state.selectedName;
    const letterBtn = document.querySelector(`#lettersGrid .cell[data-id="${lid}"]`);
    const nameBtn = document.querySelector(`#namesGrid .cell[data-id="${nid}"]`);
    const isCorrect = lid === nid;
    // Record history
    state.history.push({ mode: state.mode, letterId: lid, nameId: nid, correct: isCorrect, t: nowTS() });
    if (isCorrect) {
      state.correct += 1;
      flash(letterBtn, 'flash-correct');
      flash(nameBtn, 'flash-correct');
      setTimeout(() => {
        state.matched.add(lid);
        state.selectedLetter = null;
        state.selectedName = null;
        renderAll();
      }, 550);
    } else {
      state.wrong += 1;
      flash(letterBtn, 'flash-wrong');
      flash(nameBtn, 'flash-wrong');
      setTimeout(() => {
        state.selectedLetter = null;
        state.selectedName = null;
        renderLetters();
        renderNames();
        renderStats();
      }, 550);
    }
    renderStats();
    renderRemaining();
  }
  function evaluateSequenceClick(nid, btn) {
    const expectedId = KID_ORDER[state.seqIndex];
    const isCorrect = nid === expectedId;
    state.history.push({ mode: state.mode, nameId: nid, expectedId: expectedId, correct: isCorrect, t: nowTS() });
    if (isCorrect) {
      state.correct += 1;
      flash(btn, 'flash-correct');
      setTimeout(() => {
        state.seqDone.add(nid);
        state.seqIndex += 1;
        renderNames();
        renderStats();
        renderRemaining();
        renderNextTarget();
      }, 550);
    } else {
      state.wrong += 1;
      flash(btn, 'flash-wrong');
      setTimeout(() => {
        renderStats();
      }, 350);
    }
    renderStats();
    renderRemaining();
    renderNextTarget();
  }
  function handleKeydown(e) {
    if (state.mode !== 'sequence_keyboard') return;
    if (e.key.length !== 1) return;
    let ch = e.key;
    if (FINAL_TO_BASE[ch]) ch = FINAL_TO_BASE[ch];
    const expectedId = KID_ORDER[state.seqIndex];
    const expectedChar = byId[expectedId].he;
    const inputId = byChar[ch];
    const isCorrect = ch === expectedChar;
    state.history.push({ mode: 'sequence_keyboard', typedChar: ch, expectedId: expectedId, correct: isCorrect, t: nowTS() });
    if (isCorrect) {
      state.correct += 1;
      // flash expected button
      const btn = document.querySelector(`#namesGrid .cell[data-id="${expectedId}"]`);
      flash(btn, 'flash-correct');
      setTimeout(() => {
        state.seqDone.add(expectedId);
        state.seqIndex += 1;
        renderNames();
        renderStats();
        renderRemaining();
        renderNextTarget();
      }, 550);
    } else {
      state.wrong += 1;
      if (inputId) {
        const wrongBtn = document.querySelector(`#namesGrid .cell[data-id="${inputId}"]`);
        flash(wrongBtn, 'flash-wrong');
      }
      setTimeout(() => {
        renderStats();
      }, 350);
    }
    renderStats();
    renderRemaining();
    renderNextTarget();
  }

  // Mode switching
  function setMode(newMode) {
    state.mode = newMode;
    // Reset letter order for shuffled match
    if (newMode === 'shuffled_match') {
      state.letterOrder = shuffle(KID_ORDER);
    } else {
      state.letterOrder = [...KID_ORDER];
    }
    resetRound(true);
  }
  function resetRound(keepMode = false) {
    state.matched.clear();
    state.selectedLetter = null;
    state.selectedName = null;
    state.correct = 0;
    state.wrong = 0;
    state.history = [];
    state.seqIndex = 0;
    state.seqDone.clear();
    // Reset name order
    state.shuffledNameIds = shuffle(KID_ORDER);
    renderAll();
  }

  // Bind event listeners
  function bindControls() {
    // Mode buttons
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setMode(btn.dataset.mode);
      });
    });
    // Script toggle
    const toggleBtn = document.getElementById('toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        state.script = state.script === 'he' ? 'lat' : 'he';
        toggleBtn.textContent = `Script: ${state.script === 'he' ? 'Hebrew' : 'Latin'}`;
        renderNames();
        renderStats();
        renderNextTarget();
      });
    }
    // Shuffle button
    const shuffleBtn = document.getElementById('shuffle');
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', () => {
        if (state.mode === 'shuffled_match') {
          state.letterOrder = shuffle(KID_ORDER);
        }
        state.shuffledNameIds = shuffle(KID_ORDER);
        state.selectedLetter = null;
        state.selectedName = null;
        renderLetters();
        renderNames();
        renderStats();
        renderRemaining();
      });
    }
    // Reset button
    const resetBtn = document.getElementById('reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        resetRound(true);
      });
    }
    // Toggle tooltips
    const ttBtn = document.getElementById('toggleLetterTooltips');
    if (ttBtn) {
      ttBtn.addEventListener('click', () => {
        letterTooltipsEnabled = !letterTooltipsEnabled;
        ttBtn.textContent = `Tooltips: ${letterTooltipsEnabled ? 'On' : 'Off'}`;
        renderLetters();
        renderNames();
      });
    }
    // Edit letters data
    const editBtn = document.getElementById('editLettersData');
    const editor = document.getElementById('lettersEditor');
    const textarea = document.getElementById('lettersEditorTextarea');
    const saveBtn = document.getElementById('saveLettersData');
    const cancelBtn = document.getElementById('cancelLettersEdit');
    if (editBtn && editor && textarea && saveBtn && cancelBtn) {
      editBtn.addEventListener('click', () => {
        // populate textarea with current letter array
        textarea.value = JSON.stringify(LETTERS, null, 2);
        editor.style.display = 'block';
      });
      saveBtn.addEventListener('click', () => {
        try {
          const newData = JSON.parse(textarea.value);
          if (!Array.isArray(newData)) {
            alert('Invalid format: expected an array of letter objects');
            return;
          }
          setLetters(newData);
          editor.style.display = 'none';
          resetRound(true);
        } catch (e) {
          alert('Invalid JSON: ' + e.message);
        }
      });
      cancelBtn.addEventListener('click', () => {
        editor.style.display = 'none';
      });
    }
    // Listen for typing in sequence_keyboard
    document.addEventListener('keydown', handleKeydown);
  }

  // Initialize game once letters are loaded
  function initializeGame() {
    bindControls();
    // Start game
    state.shuffledNameIds = shuffle(KID_ORDER);
    renderAll();
  }

  // Load data and then initialize
  loadLetters(letters => {
    setLetters(letters);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeGame);
    } else {
      initializeGame();
    }
  });
})();