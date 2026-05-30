import './style.css';

/* ============================================================
   RashanMate — Main Application Logic
   ============================================================ */

// ── Data ──────────────────────────────────────────────────────
const RASHAN_ITEMS = {
  'General Items': {
    icon: '🛒',
    defaultUnit: 'packet',
    items: [
      'Bread', 'Chicken', 'Eggs', 'Butter', 'Milk', 'Chaach', 'Chawal', 'Atta',
      'Oil', 'Coffee', 'Fynal', 'Surf', 'Bartan soap', 'Namak', 'Mirch', 'Haldi',
      'Jeera', 'Hing', 'Khand', 'Garam masala', 'Kali mirch', 'Sookha dhaniya',
      'Cheeni', 'Rass', 'Biscuit', 'Desi khand', 'Colin', 'Panni', 'Daliya',
      'Badaam', 'Khishmish', 'Oats', 'Desi ghee', 'Maggi', 'Khade masale', 'Poha',
      'Paper foil', 'Cheese', 'Colgate', 'Dove mask', 'Ezee', 'Dal', 'Vermicelli',
      'Plain soda', 'Flavour soda', 'Pop corn', 'Ajinomoto', 'Oregano',
      'All out', 'Treaty', 'Cells', 'Campure', 'Pochaa'
    ]
  },
  'Vegetables': {
    icon: '🥬',
    defaultUnit: 'kg',
    items: [
      'Onion', 'Tomato', 'Potato', 'Vegetable', 'Hara dhaniya', 'Hari mirchi',
      'Gajar', 'Mooli', 'Kheera', 'Lasan', 'Adrak', 'Nimbu'
    ]
  },
  'Fruits': {
    icon: '🍎',
    defaultUnit: 'kg',
    items: [
      'Anaar', 'Papaya', 'Apple', 'Orange', 'Grapes'
    ]
  }
};

const UNITS = ['kg', 'g', 'L', 'mL', 'packet', 'piece', 'dozen', 'box'];

const LIQUID_ITEMS = ['Milk', 'Oil', 'Chaach', 'Rass', 'Plain soda', 'Flavour soda', 'Colin'];
const PIECE_ITEMS = ['Eggs', 'Bread', 'Nimbu', 'Biscuit', 'Maggi', 'All out', 'Cells', 'Colgate', 'Dove mask'];

const STORAGE_KEYS = {
  phone: 'rashanmate_phone',
  list: 'rashanmate_list',
  prevList: 'rashanmate_prev_list',
  onboarded: 'rashanmate_onboarded',
  customItems: 'rashanmate_custom_items',
  theme: 'rashanmate_theme'
};

// ── App State ─────────────────────────────────────────────────
const state = {
  phone: '',
  selectedItems: new Map(), // name → { qty, unit }
  customItems: [],          // [{ name, category }]
  currentScreen: 'onboarding',
  editingItem: null         // for qty modal
};

// ── DOM Refs ──────────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ── Init ──────────────────────────────────────────────────────
function init() {
  loadState();
  initTheme();
  bindThemeToggles();
  bindOnboarding();
  bindBuilder();
  bindReview();
  bindModals();

  // Decide initial screen
  const isOnboarded = localStorage.getItem(STORAGE_KEYS.onboarded);
  if (isOnboarded) {
    showScreen('builder');
    checkPreviousList();
  } else {
    showScreen('onboarding');
  }
}

// ── Screen Router ─────────────────────────────────────────────
function showScreen(name) {
  state.currentScreen = name;
  $$('.screen').forEach(s => s.classList.remove('active'));
  $(`#screen-${name}`).classList.add('active');
  window.scrollTo(0, 0);

  if (name === 'builder') {
    renderItems();
    updateFabBadge();
  } else if (name === 'review') {
    renderReview();
  }
}

// ── State Persistence ─────────────────────────────────────────
function loadState() {
  state.phone = localStorage.getItem(STORAGE_KEYS.phone) || '';

  const savedList = localStorage.getItem(STORAGE_KEYS.list);
  if (savedList) {
    try {
      const parsed = JSON.parse(savedList);
      state.selectedItems = new Map(parsed);
    } catch (e) { /* ignore */ }
  }

  const savedCustom = localStorage.getItem(STORAGE_KEYS.customItems);
  if (savedCustom) {
    try {
      state.customItems = JSON.parse(savedCustom);
    } catch (e) { /* ignore */ }
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEYS.list, JSON.stringify([...state.selectedItems]));
  localStorage.setItem(STORAGE_KEYS.customItems, JSON.stringify(state.customItems));
  if (state.phone) {
    localStorage.setItem(STORAGE_KEYS.phone, state.phone);
  }
}

function checkPreviousList() {
  // If we have items in state from a previous session, show the banner
  if (state.selectedItems.size > 0) {
    const banner = $('#prev-list-banner');
    banner.classList.remove('hidden');

    // Re-apply selections to chips
    reapplySelections();
    updateFabBadge();
  }
}

function reapplySelections() {
  state.selectedItems.forEach((data, itemName) => {
    const chip = document.querySelector(`.item-chip[data-name="${CSS.escape(itemName)}"]`);
    if (chip) {
      chip.classList.add('selected');
      const qtyEl = chip.querySelector('.item-chip__qty');
      if (qtyEl) qtyEl.textContent = `${data.qty} ${data.unit}`;
    }
  });
}

// ── ONBOARDING ────────────────────────────────────────────────
function bindOnboarding() {
  const form = $('#onboarding-form');
  const phoneInput = $('#onboarding-phone');
  const skipBtn = $('#onboarding-skip');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = phoneInput.value.trim();
    if (val.length === 10 && /^[0-9]{10}$/.test(val)) {
      state.phone = val;
      localStorage.setItem(STORAGE_KEYS.phone, val);
      localStorage.setItem(STORAGE_KEYS.onboarded, 'true');
      showScreen('builder');
      showToast('✅', 'Number saved! Let\'s build your list.');
    } else {
      phoneInput.focus();
      showToast('⚠️', 'Please enter a valid 10-digit number');
    }
  });

  skipBtn.addEventListener('click', () => {
    localStorage.setItem(STORAGE_KEYS.onboarded, 'true');
    showScreen('builder');
  });
}

// ── BUILDER ───────────────────────────────────────────────────
function bindBuilder() {
  const searchInput = $('#search-input');
  const searchClear = $('#search-clear');
  const reviewBtn = $('#review-btn');
  const settingsBtn = $('#settings-btn');
  const loadPrevBtn = $('#load-prev-btn');
  const dismissPrevBtn = $('#dismiss-prev-btn');

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    filterItems(q);
    searchClear.classList.toggle('visible', q.length > 0);
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    filterItems('');
    searchClear.classList.remove('visible');
    searchInput.focus();
  });

  reviewBtn.addEventListener('click', () => {
    if (state.selectedItems.size === 0) {
      showToast('⚠️', 'Select at least one item');
      return;
    }
    if (!state.phone) {
      openWaModal();
      showToast('📱', 'Add a WhatsApp number first');
      return;
    }
    showScreen('review');
  });

  settingsBtn.addEventListener('click', () => {
    openWaModal();
  });

  loadPrevBtn.addEventListener('click', () => {
    $('#prev-list-banner').classList.add('hidden');
    // items already loaded from state
  });

  dismissPrevBtn.addEventListener('click', () => {
    $('#prev-list-banner').classList.add('hidden');
    state.selectedItems.clear();
    saveState();
    renderItems();
    updateFabBadge();
  });
}

function renderItems(filter = '') {
  const container = $('#items-container');
  container.innerHTML = '';

  let anyVisible = false;

  for (const [catName, catData] of Object.entries(RASHAN_ITEMS)) {
    // Combine preset + custom items for this category
    const customForCat = state.customItems
      .filter(ci => ci.category === catName)
      .map(ci => ci.name);
    const allItems = [...catData.items, ...customForCat];

    const filtered = filter
      ? allItems.filter(item => item.toLowerCase().includes(filter))
      : allItems;

    if (filtered.length === 0 && filter) continue;

    anyVisible = true;

    const section = document.createElement('div');
    section.className = 'category';

    const selectedInCat = filtered.filter(i => state.selectedItems.has(i)).length;

    section.innerHTML = `
      <div class="category__header" data-cat="${catName}">
        <span class="category__icon">${catData.icon}</span>
        <span class="category__name">${catName}</span>
        ${selectedInCat > 0 ? `<span class="category__count">${selectedInCat} selected</span>` : ''}
        <span class="category__toggle">▼</span>
      </div>
      <div class="items-grid"></div>
    `;

    const grid = section.querySelector('.items-grid');

    filtered.forEach(itemName => {
      const chip = createChip(itemName, catData);
      grid.appendChild(chip);
    });

    // Add custom item button
    if (!filter) {
      const addBtn = document.createElement('button');
      addBtn.className = 'add-custom';
      addBtn.innerHTML = `<span class="add-custom__icon">+</span><span class="add-custom__text">Add item</span>`;
      addBtn.addEventListener('click', () => openCustomModal(catName));
      grid.appendChild(addBtn);
    }

    // Collapse toggle
    const header = section.querySelector('.category__header');
    header.addEventListener('click', () => {
      section.classList.toggle('collapsed');
    });

    container.appendChild(section);
  }

  // Also show custom items that have no category
  const uncategorized = state.customItems.filter(ci => !ci.category);
  if (uncategorized.length > 0) {
    // handled within General Items
  }

  // Empty state
  if (!anyVisible && filter) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🔍</div>
        <p class="empty-state__text">No items found for "<strong>${filter}</strong>"</p>
        <button class="btn-primary" onclick="document.getElementById('search-input').value=''; document.getElementById('search-input').dispatchEvent(new Event('input'));">Clear search</button>
      </div>
    `;
  }
}

function createChip(itemName, catData) {
  const chip = document.createElement('div');
  chip.className = 'item-chip';
  chip.dataset.name = itemName;

  const isSelected = state.selectedItems.has(itemName);
  const data = state.selectedItems.get(itemName);

  if (isSelected) chip.classList.add('selected');

  chip.innerHTML = `
    <span class="item-chip__check">✓</span>
    <span class="item-chip__name">${itemName}</span>
    <span class="item-chip__qty">${isSelected ? `${data.qty} ${data.unit}` : ''}</span>
  `;

  chip.addEventListener('click', () => {
    if (state.selectedItems.has(itemName)) {
      // Open qty editor
      openQtyModal(itemName, catData);
    } else {
      // Select with defaults
      const unit = getDefaultUnit(itemName, catData);
      state.selectedItems.set(itemName, { qty: 1, unit });
      chip.classList.add('selected');
      chip.querySelector('.item-chip__qty').textContent = `1 ${unit}`;
      updateFabBadge();
      saveState();
    }
  });

  return chip;
}

function getDefaultUnit(itemName, catData) {
  if (LIQUID_ITEMS.includes(itemName)) return 'L';
  if (PIECE_ITEMS.includes(itemName)) return 'piece';
  return catData.defaultUnit || 'packet';
}

function filterItems(query) {
  renderItems(query);
}

function updateFabBadge() {
  const badge = $('#fab-badge');
  const btn = $('#review-btn');
  const count = state.selectedItems.size;
  badge.textContent = count;
  btn.disabled = count === 0;
}

// ── REVIEW SCREEN ─────────────────────────────────────────────
function bindReview() {
  const backBtn = $('#back-btn');
  const sendBtn = $('#send-btn');
  const editWaBtn = $('#edit-wa-btn');

  backBtn.addEventListener('click', () => {
    showScreen('builder');
  });

  editWaBtn.addEventListener('click', () => {
    openWaModal();
  });

  sendBtn.addEventListener('click', () => {
    if (state.selectedItems.size === 0) {
      showToast('⚠️', 'Your list is empty!');
      return;
    }
    if (!state.phone) {
      openWaModal();
      showToast('📱', 'Add a WhatsApp number first');
      return;
    }

    sendToWhatsApp();

    // Visual feedback
    sendBtn.classList.add('sent');
    $('#send-btn-text').textContent = '✓ Sent!';

    // Archive the list
    localStorage.setItem(STORAGE_KEYS.prevList, JSON.stringify([...state.selectedItems]));

    setTimeout(() => {
      sendBtn.classList.remove('sent');
      $('#send-btn-text').textContent = 'Send to WhatsApp';
      state.selectedItems.clear();
      saveState();
      showScreen('builder');
      showToast('🎉', 'List sent! Starting fresh.');
    }, 2500);
  });
}

function renderReview() {
  const list = $('#review-list');
  const countEl = $('#review-count');
  const dateEl = $('#review-date');
  const waNumber = $('#review-wa-number');

  // Date
  const now = new Date();
  dateEl.textContent = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Count
  countEl.textContent = `${state.selectedItems.size} items`;

  // Phone
  waNumber.textContent = state.phone ? `+91 ${state.phone}` : 'Not set';

  // Items
  list.innerHTML = '';
  let index = 1;

  state.selectedItems.forEach((data, itemName) => {
    const item = document.createElement('div');
    item.className = 'review-item';
    item.style.animationDelay = `${(index - 1) * 0.05}s`;

    item.innerHTML = `
      <span class="review-item__index">${index}</span>
      <span class="review-item__name">${itemName}</span>
      <div class="review-item__qty-group">
        <button class="review-item__qty-btn" data-action="dec" aria-label="Decrease quantity">−</button>
        <span class="review-item__qty-display" data-item="${itemName}">${data.qty} ${data.unit}</span>
        <button class="review-item__qty-btn" data-action="inc" aria-label="Increase quantity">+</button>
      </div>
      <button class="review-item__delete" data-item="${itemName}" aria-label="Remove ${itemName}">🗑️</button>
    `;

    // Quantity buttons
    const decBtn = item.querySelector('[data-action="dec"]');
    const incBtn = item.querySelector('[data-action="inc"]');
    const qtyDisplay = item.querySelector('.review-item__qty-display');
    const deleteBtn = item.querySelector('.review-item__delete');

    decBtn.addEventListener('click', () => {
      if (data.qty > 0.5) {
        data.qty = Math.round((data.qty - getStep(data.unit)) * 10) / 10;
        if (data.qty < 0.1) data.qty = 0.5;
        qtyDisplay.textContent = `${data.qty} ${data.unit}`;
        state.selectedItems.set(itemName, data);
        saveState();
      }
    });

    incBtn.addEventListener('click', () => {
      data.qty = Math.round((data.qty + getStep(data.unit)) * 10) / 10;
      qtyDisplay.textContent = `${data.qty} ${data.unit}`;
      state.selectedItems.set(itemName, data);
      saveState();
    });

    qtyDisplay.addEventListener('click', () => {
      openQtyModal(itemName, null, true);
    });

    deleteBtn.addEventListener('click', () => {
      item.classList.add('removing');
      setTimeout(() => {
        state.selectedItems.delete(itemName);
        saveState();
        renderReview();
        if (state.selectedItems.size === 0) {
          showScreen('builder');
          showToast('📋', 'List cleared. Start adding items!');
        }
      }, 300);
    });

    list.appendChild(item);
    index++;
  });
}

function getStep(unit) {
  switch (unit) {
    case 'g': return 100;
    case 'mL': return 100;
    case 'kg': return 0.5;
    case 'L': return 0.5;
    default: return 1;
  }
}

// ── WHATSAPP ──────────────────────────────────────────────────
function sendToWhatsApp() {
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  let message = `🛒 *Rashan List — ${dateStr}*\n\n`;

  let idx = 1;
  state.selectedItems.forEach((data, itemName) => {
    message += `${idx}. ${itemName} — ${data.qty} ${data.unit}\n`;
    idx++;
  });

  message += `\n📦 *Total: ${state.selectedItems.size} items*`;
  message += `\n\n_Sent via RashanMate_`;

  const phone = `91${state.phone}`;
  const encoded = encodeURIComponent(message);
  const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`;

  window.open(url, '_blank');
}

// ── MODALS ────────────────────────────────────────────────────
function bindModals() {
  // Quantity modal
  $('#qty-cancel').addEventListener('click', closeQtyModal);
  $('#qty-confirm').addEventListener('click', confirmQtyModal);
  $('#qty-remove').addEventListener('click', removeFromQtyModal);
  $('#qty-modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeQtyModal();
  });

  // Custom item modal
  $('#custom-cancel').addEventListener('click', closeCustomModal);
  $('#custom-confirm').addEventListener('click', confirmCustomModal);
  $('#custom-modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeCustomModal();
  });

  // WhatsApp number modal
  $('#wa-edit-cancel').addEventListener('click', closeWaModal);
  $('#wa-edit-confirm').addEventListener('click', confirmWaModal);
  $('#wa-modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeWaModal();
  });
}

// Quantity Modal
function openQtyModal(itemName, catData, fromReview = false) {
  state.editingItem = { name: itemName, fromReview };
  const overlay = $('#qty-modal-overlay');
  const title = $('#qty-modal-title');
  const input = $('#qty-input');
  const unitSelector = $('#unit-selector');

  title.textContent = itemName;

  const existing = state.selectedItems.get(itemName);
  input.value = existing ? existing.qty : 1;

  // Render unit buttons
  const currentUnit = existing ? existing.unit : (catData ? getDefaultUnit(itemName, catData) : 'packet');
  unitSelector.innerHTML = UNITS.map(u =>
    `<button class="unit-btn ${u === currentUnit ? 'active' : ''}" data-unit="${u}">${u}</button>`
  ).join('');

  unitSelector.querySelectorAll('.unit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      unitSelector.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  overlay.classList.add('active');
  setTimeout(() => input.focus(), 300);
}

function closeQtyModal() {
  $('#qty-modal-overlay').classList.remove('active');
  state.editingItem = null;
}

function confirmQtyModal() {
  const input = $('#qty-input');
  const activeUnit = $('#unit-selector .unit-btn.active');
  const qty = parseFloat(input.value) || 1;
  const unit = activeUnit ? activeUnit.dataset.unit : 'packet';
  const itemName = state.editingItem.name;

  state.selectedItems.set(itemName, { qty, unit });
  saveState();

  closeQtyModal();

  if (state.editingItem?.fromReview) {
    renderReview();
  } else {
    renderItems($('#search-input').value.trim().toLowerCase());
    updateFabBadge();
  }
}

function removeFromQtyModal() {
  const itemName = state.editingItem.name;
  const fromReview = state.editingItem?.fromReview;

  state.selectedItems.delete(itemName);
  saveState();

  closeQtyModal();

  if (fromReview) {
    renderReview();
    if (state.selectedItems.size === 0) {
      showScreen('builder');
    }
  } else {
    renderItems($('#search-input').value.trim().toLowerCase());
    updateFabBadge();
  }
}

// Custom Item Modal
let currentCustomCategory = 'General Items';

function openCustomModal(category) {
  currentCustomCategory = category;
  const overlay = $('#custom-modal-overlay');
  const nameInput = $('#custom-name');
  const qtyInput = $('#custom-qty');
  const unitSelector = $('#custom-unit-selector');

  nameInput.value = '';
  qtyInput.value = 1;

  const defaultUnit = RASHAN_ITEMS[category]?.defaultUnit || 'packet';
  unitSelector.innerHTML = UNITS.map(u =>
    `<button class="unit-btn ${u === defaultUnit ? 'active' : ''}" data-unit="${u}">${u}</button>`
  ).join('');

  unitSelector.querySelectorAll('.unit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      unitSelector.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  overlay.classList.add('active');
  setTimeout(() => nameInput.focus(), 300);
}

function closeCustomModal() {
  $('#custom-modal-overlay').classList.remove('active');
}

function confirmCustomModal() {
  const name = $('#custom-name').value.trim();
  const qty = parseFloat($('#custom-qty').value) || 1;
  const activeUnit = $('#custom-unit-selector .unit-btn.active');
  const unit = activeUnit ? activeUnit.dataset.unit : 'packet';

  if (!name) {
    showToast('⚠️', 'Please enter an item name');
    return;
  }

  // Check duplicates
  const allItems = getAllItemNames();
  if (allItems.includes(name.toLowerCase())) {
    showToast('⚠️', 'This item already exists');
    return;
  }

  // Add to custom items
  state.customItems.push({ name, category: currentCustomCategory });

  // Auto-select it
  state.selectedItems.set(name, { qty, unit });

  saveState();
  closeCustomModal();

  renderItems($('#search-input').value.trim().toLowerCase());
  updateFabBadge();
  showToast('✅', `${name} added!`);
}

function getAllItemNames() {
  const names = [];
  for (const catData of Object.values(RASHAN_ITEMS)) {
    catData.items.forEach(i => names.push(i.toLowerCase()));
  }
  state.customItems.forEach(ci => names.push(ci.name.toLowerCase()));
  return names;
}

// WhatsApp Number Modal
function openWaModal() {
  const overlay = $('#wa-modal-overlay');
  const input = $('#wa-edit-input');
  input.value = state.phone || '';
  overlay.classList.add('active');
  setTimeout(() => input.focus(), 300);
}

function closeWaModal() {
  $('#wa-modal-overlay').classList.remove('active');
}

function confirmWaModal() {
  const input = $('#wa-edit-input');
  const val = input.value.trim();

  if (val.length === 10 && /^[0-9]{10}$/.test(val)) {
    state.phone = val;
    localStorage.setItem(STORAGE_KEYS.phone, val);
    closeWaModal();
    showToast('✅', 'Number saved!');

    // Update review screen if visible
    const waDisplay = $('#review-wa-number');
    if (waDisplay) waDisplay.textContent = `+91 ${val}`;
  } else {
    showToast('⚠️', 'Enter a valid 10-digit number');
    input.focus();
  }
}

// ── TOAST ─────────────────────────────────────────────────────
let toastTimer = null;

function showToast(icon, message) {
  const toast = $('#toast');
  toast.querySelector('.toast__icon').textContent = icon;
  toast.querySelector('.toast__text').textContent = message;

  if (toastTimer) clearTimeout(toastTimer);

  toast.classList.add('visible');
  toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
  }, 2500);
}

// ── Service Worker ────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.log('SW registration failed:', err));
  });
}

// ── Theme Toggle ──────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.theme);
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  } else {
    // Default to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
  updateToggleIcons();
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(STORAGE_KEYS.theme, next);
  updateToggleIcons();
}

function updateToggleIcons() {
  const theme = document.documentElement.getAttribute('data-theme');
  const icon = theme === 'light' ? '☀️' : '🌙';
  $$('.theme-toggle__icon').forEach(el => {
    el.textContent = icon;
  });
}

function bindThemeToggles() {
  const toggleOnboarding = $('#theme-toggle-onboarding');
  const toggleBuilder = $('#theme-toggle-builder');

  if (toggleOnboarding) {
    toggleOnboarding.addEventListener('click', toggleTheme);
  }
  if (toggleBuilder) {
    toggleBuilder.addEventListener('click', toggleTheme);
  }

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEYS.theme)) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      updateToggleIcons();
    }
  });
}

// ── Boot ──────────────────────────────────────────────────────
init();
