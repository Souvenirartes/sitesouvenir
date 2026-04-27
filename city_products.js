/*
 * city_products.js
 *
 * This script renders products for a specific city. It reads the `city` query
 * parameter from the URL and queries the Firestore `products` collection for
 * documents whose `cities` array contains the given city identifier. Products
 * are displayed as cards with their image, name, price and an add‑to‑cart
 * button. A search field allows filtering products by name on the client side.
 *
 * Assumes Firebase has been initialized and the cart.js helper is loaded.
 */

document.addEventListener('DOMContentLoaded', () => {
  const db = firebase.firestore();
  const params = new URLSearchParams(window.location.search);
  const cityId = params.get('city');
  const titleEl = document.getElementById('city-title');
  const listEl = document.getElementById('city-product-list');
  const searchInput = document.getElementById('product-search');
  const categorySelect = document.getElementById('category-filter');
  const minPriceInput = document.getElementById('min-price');
  const maxPriceInput = document.getElementById('max-price');
  let allProducts = [];

  if (!cityId) {
    titleEl.textContent = 'Cidade não especificada';
    return;
  }

  // Display city name nicely – you can customize mapping of id to human‑readable name.
  titleEl.textContent = `Produtos em ${cityId.replace(/-/g, ' ')}`;

  // Fetch products for the given city
  async function fetchProducts() {
    try {
      // Query for products where the cities array contains this city
      const snap = await db.collection('products').where('cities', 'array-contains', cityId).orderBy('name').get();
      allProducts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Populate category options based on the fetched products
      populateCategories();
      applyFilters();
    } catch (err) {
      console.error('Erro ao carregar produtos da cidade:', err);
    }
  }

  function renderProducts(data) {
    listEl.innerHTML = '';
    if (data.length === 0) {
      const p = document.createElement('p');
      p.textContent = 'Nenhum produto disponível para esta cidade.';
      listEl.appendChild(p);
      return;
    }
    data.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
         <img src="${prod.imageUrl || 'https://via.placeholder.com/400x300?text=Produto'}" alt="${prod.name}" loading="lazy">
         <h3>${prod.name}</h3>
         <p class="price">R$${prod.price.toFixed(2)}</p>
         <button class="btn add-to-cart">Adicionar ao carrinho</button>
       `;
      card.querySelector('.add-to-cart').addEventListener('click', () => {
        if (typeof addToCart === 'function') {
          addToCart({
            id: prod.id,
            name: prod.name,
            price: prod.price,
            imageUrl: prod.imageUrl
          });
        }
      });
      listEl.appendChild(card);
    });
  }

  // Search filtering
  function applyFilters() {
    // Determine filters
    const term = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedCategory = categorySelect ? categorySelect.value : '';
    const minPrice = minPriceInput && minPriceInput.value ? parseFloat(minPriceInput.value) : null;
    const maxPrice = maxPriceInput && maxPriceInput.value ? parseFloat(maxPriceInput.value) : null;
    const filtered = allProducts.filter(p => {
      const matchesName = p.name.toLowerCase().includes(term);
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      const matchesMin = minPrice == null || p.price >= minPrice;
      const matchesMax = maxPrice == null || p.price <= maxPrice;
      return matchesName && matchesCategory && matchesMin && matchesMax;
    });
    renderProducts(filtered);
  }

  function populateCategories() {
    if (!categorySelect) return;
    // Extract unique categories from allProducts
    const categories = Array.from(new Set(allProducts.map(p => p.category).filter(Boolean)));
    // Clear existing options (except the first)
    categorySelect.innerHTML = '<option value="">Todas as categorias</option>';
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      categorySelect.appendChild(opt);
    });
  }

  // Attach input listeners for filters
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
  if (categorySelect) {
    categorySelect.addEventListener('change', applyFilters);
  }
  if (minPriceInput) {
    minPriceInput.addEventListener('input', applyFilters);
  }
  if (maxPriceInput) {
    maxPriceInput.addEventListener('input', applyFilters);
  }

  fetchProducts();
});