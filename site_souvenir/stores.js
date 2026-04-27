/*
 * stores.js
 *
 * Fetches store data from a Firestore collection called `stores` and
 * renders them as cards on the stores page.
 * Assumes Firebase has been initialized.
 */

document.addEventListener('DOMContentLoaded', () => {
  const db = firebase.firestore();
  const container = document.getElementById('stores-container');
  if (!container) return;

  async function fetchStores() {
    try {
      const snap = await db.collection('stores').orderBy('name').get();
      if (snap.empty) {
        container.textContent = 'Nenhuma loja cadastrada.';
        return;
      }
      snap.forEach(doc => {
        const data = doc.data();
        const card = document.createElement('div');
        card.className = 'store-card';
        card.innerHTML = `
          <img src="${data.imageUrl || 'https://via.placeholder.com/400x200?text=Loja'}" alt="${data.name}" loading="lazy">
          <h3>${data.name}</h3>
          <p>${data.description || ''}</p>
        `;
        container.appendChild(card);
      });
    } catch (error) {
      console.error('Erro ao carregar lojas:', error);
    }
  }

  fetchStores();
});