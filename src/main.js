import './style.css'

const RASHAN_ITEMS = {
  "General Items": [
    "Bread", "Chicken", "Eggs", "Butter", "Milk", "Chaach", "Chawal", "Atta", 
    "Oil", "Coffee", "Fynal", "Surf", "Bartan soap", "Namak", "Mirch", "Haldi", 
    "Jeera", "Hing", "Khand", "Garam masala", "Kali mirch", "Sookha dhaniya", 
    "Cheeni", "Rass", "Biscuit", "Desi khand", "Colin", "Panni", "Daliya", 
    "Badaam", "Khishmish", "Oats", "Desi ghee", "Maggi", "Khade masale", "Poha", 
    "Paper foil", "Cheese", "Colgate", "Dove mask", "Ezee", "Dal", "Vermicelli", 
    "Plain soda", "Flavour soda", "Pop corn", "Ajinomoto", "Oregano",
    "All out", "Treaty", "Cells", "Campure", "Pochaa"
  ],
  "Vegetables": [
    "Onion", "Tomato", "Potato", "Vegetable", "Hara dhaniya", "Hari mirchi", 
    "Gajar", "Mooli", "Kheera", "Lasan", "Adrak", "Nimbu"
  ],
  "Fruits": [
    "Anaar", "Papaya", "Apple", "Orange", "Grapes"
  ]
};

const WHATSAPP_NUMBER = "919873112323"; // Added 91 for India

let selectedItems = new Set();

function initApp() {
  const container = document.getElementById('checklist-container');
  const sendBtn = document.getElementById('send-btn');
  const countBadge = document.getElementById('selected-count');

  // Render Items
  for (const [category, items] of Object.entries(RASHAN_ITEMS)) {
    const categorySection = document.createElement('div');
    categorySection.className = 'category';
    
    categorySection.innerHTML = `
      <div class="category-title">
        <span>${getIconForCategory(category)}</span>
        ${category}
      </div>
      <div class="items-grid"></div>
    `;

    const grid = categorySection.querySelector('.items-grid');
    
    items.forEach(item => {
      const chip = document.createElement('div');
      chip.className = 'item-chip';
      chip.innerHTML = `<span>${item}</span>`;
      
      chip.onclick = () => toggleItem(item, chip);
      grid.appendChild(chip);
    });

    container.appendChild(categorySection);
  }

  // Send Action
  sendBtn.onclick = () => {
    if (selectedItems.size === 0) {
      alert("Please select at least one item!");
      return;
    }
    
    // Automatic Visual Feedback
    const btnText = sendBtn.querySelector('.btn-text');
    const btnIcon = sendBtn.querySelector('.btn-icon');
    const badge = sendBtn.querySelector('.count-badge');

    sendToWhatsApp();

    // Trigger Success State
    sendBtn.classList.add('sent');
    btnIcon.style.display = 'inline-block';
    badge.style.display = 'none';

    // Clear list after a short delay
    setTimeout(() => {
      clearAllSelections();
      sendBtn.classList.remove('sent');
      btnIcon.style.display = 'none';
      badge.style.display = 'inline-block';
    }, 3000);
  };

  function clearAllSelections() {
    selectedItems.clear();
    document.querySelectorAll('.item-chip.selected').forEach(chip => {
      chip.classList.remove('selected');
    });
    updateCount();
  }


  function toggleItem(item, element) {
    if (selectedItems.has(item)) {
      selectedItems.delete(item);
      element.classList.remove('selected');
    } else {
      selectedItems.add(item);
      element.classList.add('selected');
    }
    updateCount();
  }

  function updateCount() {
    countBadge.textContent = selectedItems.size;
  }
}

function getIconForCategory(cat) {
  switch(cat) {
    case 'General Items': return '🛒';
    case 'Vegetables': return '🥬';
    case 'Fruits': return '🍎';
    default: return '📦';
  }
}

function sendToWhatsApp() {
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  let message = `🛒 *Rashan List - ${dateStr}*\n\n`;
  message += Array.from(selectedItems).map(item => `• ${item}`).join('\n');
  
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`;
  
  // Directly trigger the app to avoid browser redirection pages
  window.location.assign(whatsappUrl);
}


// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('SW registered:', reg);
    }).catch(err => {
      console.log('SW registration failed:', err);
    });
  });
}

initApp();
