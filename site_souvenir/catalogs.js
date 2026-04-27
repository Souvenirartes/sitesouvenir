/*
 * catalogs.js
 *
 * Fetches catalog data from a Firestore collection called `catalogs` and
 * renders them as cards on the catalog page. Includes a search field
 * that filters catalogs by name.
 *
 * Assumes Firebase SDKs have already been loaded and initialized.
 * Requires an element with id `catalog-container` to render the cards and
 * an input with id `catalog-search` for searching.
 */

// Enable strict mode to avoid accidental global variables and silent errors.
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const db = firebase.firestore();
  const container = document.getElementById('catalog-container');
  const searchInput = document.getElementById('catalog-search');

  if (!container || !searchInput) {
    console.warn('catalog-container or catalog-search element not found.');
    return;
  }

  let catalogsData = [];

  async function fetchCatalogs() {
    try {
      const snap = await db.collection('catalogs').orderBy('name').get();
      catalogsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderCatalogs(catalogsData);
    } catch (error) {
      console.error('Erro ao carregar catálogos:', error);
    }
  }

  function renderCatalogs(data) {
    container.innerHTML = '';
    if (data.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = 'Nenhum catálogo encontrado.';
      container.appendChild(empty);
      return;
    }
    data.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'catalog-card';
      card.innerHTML = `
        <img src="${cat.imageUrl || 'https://via.placeholder.com/400x200?text=Catálogo'}" alt="${cat.name}" loading="lazy">
        <h3>${cat.name}</h3>
        <p>${cat.description || ''}</p>
      `;
      // When clicking on the card, navigate to the city‑specific product page.
      card.addEventListener('click', () => {
        // Use the catalog slug if available, otherwise fall back to document ID
        const cityParam = encodeURIComponent(cat.slug || cat.id);
        window.location.href = `city_products.html?city=${cityParam}`;
      });
      container.appendChild(card);
    });
  }

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = catalogsData.filter(c => c.name.toLowerCase().includes(term));
    renderCatalogs(filtered);
  });

  fetchCatalogs();
});