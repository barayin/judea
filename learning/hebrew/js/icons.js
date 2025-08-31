// Icons matching game with category filtering and JSON data
(function() {
  // Data loaded from JSON
  let categoriesData = [];
  let itemsById = {};
  let currentItems = [];

  // Game state
  const state = {
    script: 'he',
    matched: new Set(),
    selectedIcon: null,
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

  // Render category checkboxes
  function renderCategoryControls() {
    const container = document.getElementById('iconCategories');
    if (!container) return;
    container.innerHTML = '';
    categoriesData.forEach(cat => {
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'icon-category';
      checkbox.value = cat.category;
      checkbox.checked = true;
      checkbox.addEventListener('change', loadIconsFromSelectedCategories);
      label.appendChild(checkbox);
      label.append(' ' + cat.category);
      container.appendChild(label);
    });
  }

  // Helper to get the maximum number of icons from input (default 18)
  function getMaxIcons() {
    const input = document.getElementById('iconMax');
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

  // Load icons based on selected categories and current max setting
  function loadIconsFromSelectedCategories() {
    const checkboxes = document.querySelectorAll('.icon-category');
    let selectedCats = [];
    checkboxes.forEach(cb => {
      if (cb.checked) selectedCats.push(cb.value);
    });
    // If none selected, include all categories
    if (selectedCats.length === 0) {
      selectedCats = categoriesData.map(c => c.category);
    }
    // Gather all items from selected categories
    const allItems = [];
    selectedCats.forEach(catName => {
      const cat = categoriesData.find(c => c.category === catName);
      if (cat) {
        cat.items.forEach(item => {
          allItems.push(item);
        });
      }
    });
    // Sample up to max icons from allItems
    const maxCount = getMaxIcons();
    const sampledItems = sampleItems(allItems, maxCount);
    // Build currentItems and itemsById from sampled items
    currentItems = sampledItems;
    itemsById = {};
    currentItems.forEach(item => {
      itemsById[item.id] = item;
    });
    // Shuffle the order of currentItems and names
    currentItems = shuffle(currentItems);
    state.shuffledNameIds = shuffle(currentItems.map(item => item.id));
    // Reset state
    state.matched.clear();
    state.selectedIcon = null;
    state.selectedName = null;
    state.correct = 0;
    state.wrong = 0;
    state.history = [];
    renderAll();
  }

  // Rendering functions
  function renderIcons() {
    const root = document.getElementById('iconsGrid');
    if (!root) return;
    root.innerHTML = '';
    currentItems.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'cell';
      btn.dataset.id = item.id;
      // Render icon with optional tooltip
      if (tooltipsEnabled) {
        // Determine English label based on id (capitalize and replace hyphens)
        const english = item.id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        btn.innerHTML = `<i class="fa-solid ${item.icon}" title="${english}"></i>`;
      } else {
        btn.innerHTML = `<i class="fa-solid ${item.icon}"></i>`;
      }
      if (state.matched.has(item.id)) {
        btn.classList.add('matched');
        btn.disabled = true;
      } else if (state.selectedIcon === item.id) {
        btn.classList.add('selected');
      }
      btn.addEventListener('click', () => {
        if (state.matched.has(item.id)) return;
        state.selectedIcon = state.selectedIcon === item.id ? null : item.id;
        if (state.selectedIcon && state.selectedName) {
          evaluateMatch();
        } else {
          renderIcons();
        }
      });
      root.appendChild(btn);
    });
  }
  function renderNames() {
    const root = document.getElementById('iconsNamesGrid');
    if (!root) return;
    root.innerHTML = '';
    // Determine available ids that are not matched
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
      // Tooltip: show English translation on names when enabled
      if (tooltipsEnabled) {
        const english = item.id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        btn.title = english;
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
        if (state.selectedIcon && state.selectedName) {
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
    const scoreText = document.getElementById('scoreIconsText');
    const scoreBar = document.getElementById('scoreIconsBar');
    if (scoreText) scoreText.textContent = `${state.correct} / ${total}  (${fmtPct(acc)})`;
    if (scoreBar) scoreBar.style.width = `${acc * 100}%`;
    // History
    const list = document.getElementById('historyIconsList');
    if (!list) return;
    list.innerHTML = '';
    state.history.slice(-12).reverse().forEach(h => {
      const row = document.createElement('div');
      row.className = 'row';
      const mark = document.createElement('div');
      mark.textContent = h.correct ? '✓' : '✗';
      mark.className = h.correct ? 'ok' : 'no';
      const mid = document.createElement('div');
      const iconItem = itemsById[h.iconId];
      const nameItem = itemsById[h.nameId];
      mid.textContent = `${iconItem.nameHe}  →  ${state.script === 'he' ? nameItem.nameHe : nameItem.nameLat}`;
      const ts = document.createElement('div');
      ts.className = 'ts';
      ts.textContent = h.t;
      row.appendChild(mark);
      row.appendChild(mid);
      row.appendChild(ts);
      list.appendChild(row);
    });
  }
  function renderRemaining() {
    const left = currentItems.length - state.matched.size;
    const rem = document.getElementById('remainingIcons');
    if (rem) rem.textContent = `${left} remaining`;
  }
  function renderAll() {
    renderIcons();
    renderNames();
    renderStats();
    renderRemaining();
  }

  // Evaluation
  function evaluateMatch() {
    const iid = state.selectedIcon;
    const nid = state.selectedName;
    const iconBtn = document.querySelector(`#iconsGrid .cell[data-id="${iid}"]`);
    const nameBtn   = document.querySelector(`#iconsNamesGrid .cell[data-id="${nid}"]`);
    const isCorrect = iid === nid;
    state.history.push({ iconId: iid, nameId: nid, correct: isCorrect, t: nowTS() });
    if (isCorrect) {
      state.correct += 1;
      flash(iconBtn, 'flash-correct');
      flash(nameBtn, 'flash-correct');
      setTimeout(() => {
        state.matched.add(iid);
        state.selectedIcon = null;
        state.selectedName = null;
        renderAll();
      }, 550);
    } else {
      state.wrong += 1;
      flash(iconBtn, 'flash-wrong');
      flash(nameBtn, 'flash-wrong');
      setTimeout(() => {
        state.selectedIcon = null;
        state.selectedName = null;
        renderIcons();
        renderNames();
        renderStats();
      }, 550);
    }
    renderStats();
    renderRemaining();
  }

  // Reset and shuffle: re-sample items and reset game state
  function resetGame() {
    // Re-sample based on current selected categories and max setting
    loadIconsFromSelectedCategories();
  }

  // Bind controls
  function bindControls() {
    const toggleBtn = document.getElementById('toggleIcons');
    const shuffleBtn = document.getElementById('shuffleIcons');
    const resetBtn = document.getElementById('resetIcons');
    const maxInput = document.getElementById('iconMax');
    const tooltipBtn = document.getElementById('toggleTooltips');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        state.script = state.script === 'he' ? 'lat' : 'he';
        toggleBtn.textContent = `Script: ${state.script === 'he' ? 'Hebrew' : 'Latin'}`;
        renderNames();
        renderStats();
      });
    }
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', () => {
        // Shuffle by reloading and re-sampling items
        resetGame();
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        // Reset round: re-sample items and reset state
        resetGame();
      });
    }
    if (maxInput) {
      // When the max icons value changes, re-sample icons
      maxInput.addEventListener('change', () => {
        resetGame();
      });
    }
    if (tooltipBtn) {
      tooltipBtn.addEventListener('click', () => {
        tooltipsEnabled = !tooltipsEnabled;
        tooltipBtn.textContent = `Tooltips: ${tooltipsEnabled ? 'On' : 'Off'}`;
        renderIcons();
        renderNames();
      });
      // Set initial button label
      tooltipBtn.textContent = `Tooltips: ${tooltipsEnabled ? 'On' : 'Off'}`;
    }

    // Edit icons data
    const editBtn = document.getElementById('editIconsData');
    const editor = document.getElementById('iconsEditor');
    const textarea = document.getElementById('iconsEditorTextarea');
    const saveBtn = document.getElementById('saveIconsData');
    const cancelBtn = document.getElementById('cancelIconsEdit');
    if (editBtn && editor && textarea && saveBtn && cancelBtn) {
      editBtn.addEventListener('click', () => {
        // Populate editor with current categories data
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
          // Re-render category controls and reload items
          renderCategoryControls();
          loadIconsFromSelectedCategories();
        } catch (e) {
          alert('Invalid JSON: ' + e.message);
        }
      });
      cancelBtn.addEventListener('click', () => {
        editor.style.display = 'none';
      });
    }
  }

  // Initialize: fetch JSON and setup
  document.addEventListener('DOMContentLoaded', () => {
    fetch('data/icons.json')
      .then(res => res.json())
      .then(data => {
        categoriesData = data.categories;
        renderCategoryControls();
        bindControls();
        loadIconsFromSelectedCategories();
      })
      .catch(err => {
        // If fetch fails (e.g., file protocol), fallback to global iconsData if available
        if (typeof window !== 'undefined' && window.iconsData && window.iconsData.categories) {
          categoriesData = window.iconsData.categories;
          renderCategoryControls();
          bindControls();
          loadIconsFromSelectedCategories();
        } else {
          console.error('Failed to load icons data:', err);
        }
      });
  });
})();