// Clothing Co E‑commerce MVP JavaScript
// Product catalogue. Each product contains an id, name, price, image path,
// category and a placeholder description. You can add more products here later.
const products = [
  {
    id: 'tshirt',
    name: 'Classic T‑Shirt',
    price: 24.99,
    image: 'images/tshirt.png',
    category: 'tops',
    description:
      'A versatile crew‑neck tee crafted from soft cotton, perfect for everyday wear.'
  },
  {
    id: 'hoodie',
    name: 'Comfy Hoodie',
    price: 39.99,
    image: 'images/hoodie.png',
    category: 'outerwear',
    description:
      'Our warm and plush hoodie is ideal for layering on cooler days or lounging at home.'
  },
  {
    id: 'jeans',
    name: 'Denim Jeans',
    price: 49.99,
    image: 'images/jeans.png',
    category: 'bottoms',
    description:
      'Classic straight‑leg denim jeans featuring a comfortable fit and timeless wash.'
  },
  {
    id: 'jacket',
    name: 'Casual Jacket',
    price: 59.99,
    image: 'images/jacket.png',
    category: 'outerwear',
    description:
      'A lightweight jacket with subtle detailing, designed to complement any outfit.'
  }
];

// State management for cart and dark mode
let cart = {};

// Utility to format numbers as currency
const formatCurrency = (value) => {
  return value.toFixed(2);
};

// Initialize the UI. Based on the current page, we render different content.
function init() {
  // Always update the year in the footer
  updateYear();
  // Load persisted states
  loadCartFromStorage();
  loadDarkModeFromStorage();
  // Set up common event listeners (dark mode, cart, parallax)
  setupEventListeners();
  // Conditionally render page-specific content
  if (document.getElementById('productScroll')) {
    renderProductsScroll();
  }
  if (document.getElementById('shopGrid')) {
    renderShopPage();
  }
  if (document.getElementById('productDetail')) {
    renderProductDetailPage();
  }
  if (document.getElementById('contactForm')) {
    setupContactForm();
  }
}

// Render product cards in the horizontal scroll on the home page
function renderProductsScroll() {
  const scrollContainer = document.getElementById('productScroll');
  products.forEach((product) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-id', product.id);
    card.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" />
      </div>
      <div class="product-info">
        <span class="product-name">${product.name}</span>
        <span class="product-price">$${formatCurrency(product.price)}</span>
        <button class="add-to-cart">Add to Cart</button>
      </div>
    `;
    // 3D tilt effect
    card.addEventListener('mousemove', handleCardMouseMove);
    card.addEventListener('mouseleave', resetCardTransform);
    card.querySelector('.add-to-cart').addEventListener('click', () => addToCart(product.id));
    scrollContainer.appendChild(card);
  });
}

// Render products on the shop page with filtering and search
function renderShopPage() {
  const grid = document.getElementById('shopGrid');
  const searchInput = document.getElementById('searchInput');
  const categorySelect = document.getElementById('categorySelect');

  function updateGrid() {
    const term = searchInput.value.toLowerCase().trim();
    const category = categorySelect.value;
    grid.innerHTML = '';
    products
      .filter((p) => {
        const matchesTerm = p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term);
        const matchesCat = category === 'all' || p.category === category;
        return matchesTerm && matchesCat;
      })
      .forEach((product) => {
        const card = document.createElement('div');
        card.className = 'shop-card';
        card.innerHTML = `
          <div class="shop-card-image">
            <img src="${product.image}" alt="${product.name}" />
          </div>
          <div class="shop-card-body">
            <h3 class="shop-card-title">${product.name}</h3>
            <p class="shop-card-price">$${formatCurrency(product.price)}</p>
            <div class="shop-card-actions">
              <a href="product.html?id=${product.id}" class="details-link">View Details</a>
              <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
          </div>
        `;
        card.querySelector('.add-to-cart').addEventListener('click', () => addToCart(product.id));
        grid.appendChild(card);
      });
  }
  // Initial render
  updateGrid();
  // Event listeners
  searchInput.addEventListener('input', updateGrid);
  categorySelect.addEventListener('change', updateGrid);
}

// Render single product detail page
function renderProductDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const detailContainer = document.getElementById('productDetail');
  const product = products.find((p) => p.id === id);
  if (!product) {
    detailContainer.innerHTML = '<p>Product not found.</p>';
    return;
  }
  detailContainer.innerHTML = `
    <div class="product-detail-wrapper">
      <div class="product-detail-image">
        <img src="${product.image}" alt="${product.name}" />
      </div>
      <div class="product-detail-info">
        <h2>${product.name}</h2>
        <p class="product-detail-price">$${formatCurrency(product.price)}</p>
        <p class="product-detail-description">${product.description}</p>
        <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
      </div>
    </div>
  `;
  detailContainer.querySelector('.add-to-cart').addEventListener('click', () => addToCart(product.id));
}

// Setup simple contact form handling
function setupContactForm() {
  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('formStatus');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    statusEl.textContent = 'Thank you for your message! We will reply shortly.';
    form.reset();
  });
}

// Handle 3D tilt effect
function handleCardMouseMove(e) {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const rotateX = (y - centerY) / 20; // invert rotation for natural effect
  const rotateY = (x - centerX) / 20;
  card.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
}

function resetCardTransform(e) {
  const card = e.currentTarget;
  card.style.transform = 'rotateX(0) rotateY(0)';
}

// Add item to cart
function addToCart(productId) {
  cart[productId] = (cart[productId] || 0) + 1;
  saveCartToStorage();
  updateCartUI();
}

// Remove item entirely from cart
function removeFromCart(productId) {
  delete cart[productId];
  saveCartToStorage();
  updateCartUI();
}

// Change quantity (increment or decrement)
function changeQuantity(productId, delta) {
  const newQty = (cart[productId] || 0) + delta;
  if (newQty <= 0) {
    removeFromCart(productId);
  } else {
    cart[productId] = newQty;
  }
  saveCartToStorage();
  updateCartUI();
}

// Save cart to localStorage
function saveCartToStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromStorage() {
  const storedCart = localStorage.getItem('cart');
  if (storedCart) {
    try {
      cart = JSON.parse(storedCart);
    } catch (e) {
      cart = {};
    }
  }
  updateCartUI();
}

// Update cart UI and counter
function updateCartUI() {
  const countSpan = document.getElementById('cartCount');
  const itemsContainer = document.getElementById('cartItems');
  const totalSpan = document.getElementById('cartTotal');
  const entries = Object.entries(cart);
  // Update count
  const totalCount = entries.reduce((sum, [id, qty]) => sum + qty, 0);
  countSpan.textContent = totalCount;
  // Clear items
  itemsContainer.innerHTML = '';
  let totalPrice = 0;
  entries.forEach(([id, qty]) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    totalPrice += product.price * qty;
    // Create cart item element
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <span class="cart-item-name">${product.name}</span>
      <div class="cart-item-qty">
        <button class="qty-btn" aria-label="Decrease quantity">−</button>
        <span>${qty}</span>
        <button class="qty-btn" aria-label="Increase quantity">+</button>
      </div>
      <span>$${formatCurrency(product.price * qty)}</span>
      <button class="remove-item" aria-label="Remove item">×</button>
    `;
    const [decBtn, incBtn] = item.querySelectorAll('.qty-btn');
    const removeBtn = item.querySelector('.remove-item');
    decBtn.addEventListener('click', () => changeQuantity(id, -1));
    incBtn.addEventListener('click', () => changeQuantity(id, 1));
    removeBtn.addEventListener('click', () => removeFromCart(id));
    itemsContainer.appendChild(item);
  });
  totalSpan.textContent = formatCurrency(totalPrice);
}

// Toggle dark mode
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('dark', isDark ? '1' : '0');
  // Update icon
  const iconSpan = document.querySelector('#darkToggle .icon');
  iconSpan.textContent = isDark ? '☀️' : '🌙';
}

// Load dark mode preference
function loadDarkModeFromStorage() {
  const darkPref = localStorage.getItem('dark');
  const shouldBeDark = darkPref === '1';
  if (shouldBeDark) {
    document.body.classList.add('dark');
  }
  const iconSpan = document.querySelector('#darkToggle .icon');
  iconSpan.textContent = shouldBeDark ? '☀️' : '🌙';
}

// Event listeners setup
function setupEventListeners() {
  // Dark mode toggle
  document.getElementById('darkToggle').addEventListener('click', toggleDarkMode);
  // Cart toggle
  const cartOverlay = document.getElementById('cartOverlay');
  document.getElementById('cartToggle').addEventListener('click', () => {
    cartOverlay.classList.add('show');
  });
  document.getElementById('closeCart').addEventListener('click', () => {
    cartOverlay.classList.remove('show');
  });
  // Clicking outside cart closes overlay
  cartOverlay.addEventListener('click', (e) => {
    if (e.target === cartOverlay) {
      cartOverlay.classList.remove('show');
    }
  });
  // Checkout button
  document.getElementById('checkoutButton').addEventListener('click', () => {
    alert('Checkout is not implemented in this MVP.');
  });
  // Parallax hero scroll effect
  window.addEventListener('scroll', handleParallax);
}

// Parallax effect on hero section
function handleParallax() {
  const hero = document.querySelector('.hero');
  const scrollY = window.scrollY;
  // Move background slower than scroll position
  hero.style.backgroundPositionY = `${scrollY * 0.5}px`;
}

// Update footer year
function updateYear() {
  document.getElementById('year').textContent = new Date().getFullYear();
}

// Wait for DOM content loaded before initializing
document.addEventListener('DOMContentLoaded', init);