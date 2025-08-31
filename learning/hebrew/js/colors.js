// Colors matching game with category filtering and JSON data
// This script loads color definitions from a JSON file (data/colors.json) or
// falls back to data/colorsData.js when running via the file protocol.
// It provides a matching game where players match colored swatches with their
// Hebrew names (or transliterations). Players can select categories,
// specify a maximum number of colors to play with, shuffle the items,
// reset the round, toggle transliteration script, and enable/disable tooltips
// that display the English color name on hover.

(function() {
  // Data loaded from JSON or fallback
  let categoriesData = [];
  let itemsById = {};
  let currentItems = [];

  // Game state
  const state = {
    script: 'he',        // 'he' for Hebrew names, 'lat' for Latin transliterations
    matched: new Set(),
    selectedColor: null,
    selectedName: null,
    shuffledNameIds: [],
    correct: 0,
    wrong: 0,
    history: []
  };

  // Tooltip state
  let tooltipsEnabled = false;

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
  // Convert id like 'lightblue' or 'dark-red' into capitalized English name
  function toEnglish(id) {
    return id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  // Render category checkboxes
  function renderCategoryControls() {
    const container = document.getElementById('colorCategories');
    if (!container) return;
    container.innerHTML = '';
    categoriesData.forEach(cat => {
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'color-category';
      checkbox.value = cat.category;
      checkbox.checked = true;
      checkbox.addEventListener('change', loadColorsFromSelectedCategories);
      label.appendChild(checkbox);
      label.append(' ' + cat.category);
      container.appendChild(label);
    });
  }

  // Read maximum number of colors from input (default 18)
  function getMaxColors() {
    const input = document.getElementById('colorMax');
    let maxCount = 18;
    if (input) {
      const v = parseInt(input.value, 10);
      if (!isNaN(v) && v > 0) maxCount = v;
    }
    return maxCount;
  }

  // Randomly sample up to count items from an array
  function sampleItems(arr, count) {
    const result = [];
    const pool = [...arr];
    const n = Math.min(count, pool.length);
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      result.push(pool.splice(idx, 1)[0]);
    }
    return result;
  }

  // Load colors based on selected categories and max count
  function loadColorsFromSelectedCategories() {
    const checkboxes = document.querySelectorAll('.color-category');
    let selectedCats = [];
    checkboxes.forEach(cb => {
      if (cb.checked) selectedCats.push(cb.value);
    });
    if (selectedCats.length === 0) {
      selectedCats = categoriesData.map(c => c.category);
    }
    // Gather items from selected categories
    const allItems = [];
    selectedCats.forEach(catName => {
      const cat = categoriesData.find(c => c.category === catName);
      if (cat) {
        cat.items.forEach(item => {
          allItems.push(item);
        });
      }
    });
    // Sample up to max colors
    const maxCount = getMaxColors();
    const sampled = sampleItems(allItems, maxCount);
    currentItems = sampled;
    itemsById = {};
    currentItems.forEach(item => {
      itemsById[item.id] = item;
    });
    // Shuffle items and names
    currentItems = shuffle(currentItems);
    state.shuffledNameIds = shuffle(currentItems.map(item => item.id));
    // Reset game state
    state.matched.clear();
    state.selectedColor = null;
    state.selectedName = null;
    state.correct = 0;
    state.wrong = 0;
    state.history = [];
    renderAll();
  }

  // Render color swatches
  function renderColors() {
    const root = document.getElementById('colorsGrid');
    if (!root) return;
    root.innerHTML = '';
    currentItems.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'cell';
      btn.dataset.id = item.id;
      // Set the swatch color as background
      btn.style.backgroundColor = item.color;
      // Use a unicode square as content to ensure height if no text
      btn.textContent = '';
      // Tooltip: English name on hover
      if (tooltipsEnabled) {
        const eng = toEnglish(item.id);
        btn.title = eng;
      } else {
        btn.removeAttribute('title');
      }
      if (state.matched.has(item.id)) {
        btn.classList.add('matched');
        btn.disabled = true;
      } else if (state.selectedColor === item.id) {
        btn.classList.add('selected');
      }
      btn.addEventListener('click', () => {
        if (state.matched.has(item.id)) return;
        state.selectedColor = state.selectedColor === item.id ? null : item.id;
        if (state.selectedColor && state.selectedName) {
          evaluateMatch();
        } else {
          renderColors();
        }
      });
      root.appendChild(btn);
    });
  }

  // Render names for colors
  function renderNames() {
    const root = document.getElementById('colorsNamesGrid');
    if (!root) return;
    root.innerHTML = '';
    const available = currentItems.map(item => item.id).filter(id => !state.matched.has(id));
    state.shuffledNameIds = state.shuffledNameIds.filter(id => available.includes(id));
    const missing = available.filter(id => !state.shuffledNameIds.includes(id));
    state.shuffledNameIds.push(...shuffle(missing));
    state.shuffledNameIds.forEach(id => {
      const item = itemsById[id];
      const btn = document.createElement('button');
      btn.className = 'cell';
      btn.dataset.id = id;
      btn.textContent = state.script === 'he' ? item.nameHe : item.nameLat;
      if (tooltipsEnabled) {
        const eng = toEnglish(item.id);
        btn.title = eng;
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
        if (state.selectedColor && state.selectedName) {
          evaluateMatch();
        } else {
          renderNames();
        }
      });
      root.appendChild(btn);
    });
  }

  // Render stats and history
  function renderStats() {
    const total = state.correct + state.wrong;
    const acc = total ? state.correct / total : 0;
    const scoreTextEl = document.getElementById('scoreColorsText');
    const scoreBarEl = document.getElementById('scoreColorsBar');
    if (scoreTextEl) scoreTextEl.textContent = `${state.correct} / ${total}  (${fmtPct(acc)})`;
    if (scoreBarEl) scoreBarEl.style.width = `${acc * 100}%`;
    const list = document.getElementById('historyColorsList');
    if (!list) return;
    list.innerHTML = '';
    state.history.slice(-12).reverse().forEach(h => {
      const li = document.createElement('div');
      li.className = 'row';
      const mark = document.createElement('div');
      mark.textContent = h.correct ? '✓' : '✗';
      mark.className = h.correct ? 'ok' : 'no';
      const mid = document.createElement('div');
      const item = itemsById[h.colorId];
      // Display matched color or mismatched attempt
      if (h.correct) {
        mid.textContent = `${item.nameHe} → ${state.script === 'he' ? item.nameHe : item.nameLat}`;
      } else {
        const clicked = itemsById[h.colorId];
        const expected = itemsById[h.nameId];
        mid.textContent = `${state.script === 'he' ? clicked.nameHe : clicked.nameLat} → expected ${state.script === 'he' ? expected.nameHe : expected.nameLat}`;
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

  // Render remaining pill
  function renderRemaining() {
    const pill = document.getElementById('remainingColors');
    if (!pill) return;
    const left = currentItems.length - state.matched.size;
    pill.textContent = `${left} remaining`;
  }

  function renderAll() {
    renderColors();
    renderNames();
    renderStats();
    renderRemaining();
  }

  // Evaluate a match attempt
  function evaluateMatch() {
    const cid = state.selectedColor;
    const nid = state.selectedName;
    const colorBtn = document.querySelector(`#colorsGrid .cell[data-id="${cid}"]`);
    const nameBtn = document.querySelector(`#colorsNamesGrid .cell[data-id="${nid}"]`);
    const isCorrect = cid === nid;
    // Record history (store colorId as clicked, nameId as expected for incorrect)
    state.history.push({ colorId: cid, nameId: nid, correct: isCorrect, t: nowTS() });
    if (isCorrect) {
      state.correct += 1;
      flash(colorBtn, 'flash-correct');
      flash(nameBtn, 'flash-correct');
      setTimeout(() => {
        state.matched.add(cid);
        state.selectedColor = null;
        state.selectedName = null;
        renderAll();
      }, 550);
    } else {
      state.wrong += 1;
      flash(colorBtn, 'flash-wrong');
      flash(nameBtn, 'flash-wrong');
      setTimeout(() => {
        state.selectedColor = null;
        state.selectedName = null;
        renderColors();
        renderNames();
        renderStats();
      }, 550);
    }
    renderStats();
    renderRemaining();
  }

  // Bind UI controls
  function bindControls() {
    // Script toggle
    const toggleBtn = document.getElementById('toggleColors');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        state.script = state.script === 'he' ? 'lat' : 'he';
        toggleBtn.textContent = `Script: ${state.script === 'he' ? 'Hebrew' : 'Latin'}`;
        renderNames();
        renderStats();
      });
    }
    // Shuffle button
    const shuffleBtn = document.getElementById('shuffleColors');
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', () => {
        loadColorsFromSelectedCategories();
      });
    }
    // Reset button
    const resetBtn = document.getElementById('resetColors');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        loadColorsFromSelectedCategories();
      });
    }
    // Tooltip toggle
    const ttBtn = document.getElementById('toggleColorTooltips');
    if (ttBtn) {
      ttBtn.addEventListener('click', () => {
        tooltipsEnabled = !tooltipsEnabled;
        ttBtn.textContent = `Tooltips: ${tooltipsEnabled ? 'On' : 'Off'}`;
        renderColors();
        renderNames();
      });
    }
    // Max colors input: resample on change
    const maxInput = document.getElementById('colorMax');
    if (maxInput) {
      maxInput.addEventListener('change', () => {
        loadColorsFromSelectedCategories();
      });
    }

    // Edit colors data
    const editBtn = document.getElementById('editColorsData');
    const editor = document.getElementById('colorsEditor');
    const textarea = document.getElementById('colorsEditorTextarea');
    const saveBtn = document.getElementById('saveColorsData');
    const cancelBtn = document.getElementById('cancelColorsEdit');
    if (editBtn && editor && textarea && saveBtn && cancelBtn) {
      editBtn.addEventListener('click', () => {
        // Populate textarea with current categoriesData
        textarea.value = JSON.stringify(categoriesData, null, 2);
        editor.style.display = 'block';
      });
      saveBtn.addEventListener('click', () => {
        try {
          const newData = JSON.parse(textarea.value);
          if (Array.isArray(newData)) {
            categoriesData = newData;
          } else if (newData.categories) {
            categoriesData = newData.categories;
          } else {
            alert('Invalid format: expected an array or object with categories');
            return;
          }
          editor.style.display = 'none';
          loadColorsFromSelectedCategories();
        } catch (e) {
          alert('Invalid JSON: ' + e.message);
        }
      });
      cancelBtn.addEventListener('click', () => {
        editor.style.display = 'none';
      });
    }
  }

  // Fetch data or fallback to global
  function loadData() {
    fetch('data/colors.json')
      .then(resp => resp.ok ? resp.json() : Promise.reject(new Error('Failed to load')))
      .then(data => {
        categoriesData = data.categories;
        renderCategoryControls();
        loadColorsFromSelectedCategories();
      })
      .catch(() => {
        // Use fallback defined in colorsData.js
        if (window.colorsData && Array.isArray(window.colorsData.categories)) {
          categoriesData = window.colorsData.categories;
          renderCategoryControls();
          loadColorsFromSelectedCategories();
        } else {
          console.error('Failed to load colors data');
        }
      });
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    loadData();
    bindControls();
  });
})();