/*
 * cart.js
 *
 * Provides simple client‑side cart functionality using localStorage.
 * Each cart item is stored with id, name, price and quantity. The cart
 * count can be displayed in an element with id 'cart-count'.
 *
 * Functions:
 *   addToCart(product) – Add a product object ({id, name, price}) to the cart.
 *   removeFromCart(productId) – Remove all quantities of a product.
 *   changeQuantity(productId, delta) – Change quantity by ±1.
 *   getCart() – Returns the current cart array.
 *   clearCart() – Empties the cart.
 *   updateCartCount() – Updates the UI counter of items.
 *
 * Example usage:
 *   // Add to cart when clicking a button
 *   document.querySelector('#btn-add-item').addEventListener('click', () => {
 *     addToCart({ id: 'prod123', name: 'Caneca', price: 29.90 });
 *   });
 *   // Call updateCartCount() on page load to show current total
 */

const CART_KEY = 'cartItems';

/**
 * Loads the cart from localStorage.
 * @returns {Array} Array of cart items.
 */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

/**
 * Persists the cart array to localStorage.
 * @param {Array} cart The cart array to store.
 */
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/**
 * Adds a product to the cart. If it already exists, increments quantity.
 * @param {{id: string, name: string, price: number}} product
 */
function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);
  updateCartCount();

  // After adding to cart, check if login prompt is required.
  checkCartForLogin();
}

/**
 * Removes a product entirely from the cart.
 * @param {string} productId
 */
function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
  updateCartCount();
  // Removing items does not trigger login prompts.
}

/**
 * Changes the quantity of a product by delta (can be positive or negative).
 * Quantity will not go below 1; if delta reduces quantity to 0 or less,
 * the item will be removed.
 *
 * @param {string} productId
 * @param {number} delta
 */
function changeQuantity(productId, delta) {
  const cart = getCart();
  const item = cart.find(item => item.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    // Remove item if quantity drops below 1
    removeFromCart(productId);
    return;
  }
  saveCart(cart);
  updateCartCount();
  // Changing quantity may affect login prompt conditions
  checkCartForLogin();
}

/**
 * Clears all items from the cart.
 */
function clearCart() {
  saveCart([]);
  updateCartCount();
  // Clearing cart removes any login requirements.
}

/**
 * Updates the cart count indicator in the DOM.
 * Looks for an element with id 'cart-count' and sets its text content.
 */
function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const el = document.getElementById('cart-count');
  if (el) {
    el.textContent = count;
  }
}

/**
 * Checks whether the cart meets the criteria for requiring a login.
 * If the cart has two or more items and the user is not logged in,
 * a login prompt will be displayed. The login prompt can be customized
 * by replacing the alert with a modal or redirect.
 */
function checkCartForLogin() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  try {
    // If Firebase is available, check current user
    const user = (typeof firebase !== 'undefined') ? firebase.auth().currentUser : null;
    if (totalItems >= 2 && !user) {
      promptLogin();
    }
  } catch (e) {
    // Fallback: always prompt when 2+ items if Firebase not loaded
    if (totalItems >= 2) {
      promptLogin();
    }
  }
}

/**
 * Shows a login prompt to the user. Replace the alert implementation
 * with a custom modal or redirect to your login page as needed.
 */
function promptLogin() {
  // Use a toast notification instead of a blocking alert
  showToast('Para concluir a compra de vários itens, é necessário fazer login na sua conta.');
  // Redirect to login page after a short delay
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 3000);
}

/**
 * Displays a toast notification on the page. Creates a container if
 * necessary and automatically fades out the toast after a few seconds.
 * This utility is duplicated here so cart.js can show messages without
 * relying on other modules. If showToast already exists globally, this
 * definition will not override it due to Object.defineProperty below.
 *
 * @param {string} message The message to display in the toast.
 */
function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    Object.assign(container.style, {
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: '2000',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    });
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.textContent = message;
  Object.assign(toast.style, {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: '#fff',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    opacity: '1',
    transition: 'opacity 0.5s ease'
  });
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 3000);
}

// Expose showToast globally only if not already defined. This allows
// other scripts to reuse the toast utility without redefining it.
if (!window.showToast) {
  Object.defineProperty(window, 'showToast', { value: showToast, writable: false, configurable: false });
}

// Export promptLogin for external customization if needed
Object.defineProperty(window, 'promptLogin', { value: promptLogin, writable: false, configurable: false });
Object.defineProperty(window, 'checkCartForLogin', { value: checkCartForLogin, writable: false, configurable: false });

// Expose functions globally for easy use in HTML. Use non-writable properties to
// make it harder to override these functions in the browser console.
Object.defineProperty(window, 'addToCart', { value: addToCart, writable: false, configurable: false });
Object.defineProperty(window, 'removeFromCart', { value: removeFromCart, writable: false, configurable: false });
Object.defineProperty(window, 'changeQuantity', { value: changeQuantity, writable: false, configurable: false });
Object.defineProperty(window, 'getCart', { value: getCart, writable: false, configurable: false });
Object.defineProperty(window, 'clearCart', { value: clearCart, writable: false, configurable: false });
Object.defineProperty(window, 'updateCartCount', { value: updateCartCount, writable: false, configurable: false });