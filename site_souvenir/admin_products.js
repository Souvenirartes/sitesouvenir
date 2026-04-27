/*
 * admin_products.js
 *
 * Provides functionality for the admin page to manage products.
 * Administrators can create new products and remove existing ones.
 * The products are stored in a Firestore collection named `products`.
 */

document.addEventListener('DOMContentLoaded', () => {
  const db = firebase.firestore();
  const form = document.getElementById('product-form');
  const list = document.getElementById('product-list');

  if (!form || !list) {
    console.warn('Produto form or list element not found.');
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('prod-name').value.trim();
    const category = document.getElementById('prod-category').value.trim();
    const price = parseFloat(document.getElementById('prod-price').value);
    const image = document.getElementById('prod-image').value.trim();
    const desc = document.getElementById('prod-desc').value.trim();
    // new: read comma‑separated cities and convert to array of trimmed names
    const citiesRaw = document.getElementById('prod-cities')?.value || '';
    // Convert a comma‑separated string into an array, removing empty values
    const cities = citiesRaw
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);
    if (!name || !category || isNaN(price)) {
      alert('Nome, categoria e preço são obrigatórios.');
      return;
    }
    try {
      await db.collection('products').add({
        name,
        category,
        price,
        imageUrl: image,
        description: desc,
        // Save the cities array if provided. If empty, omit to avoid storing empty arrays.
        ...(cities.length ? { cities } : {}),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      form.reset();
      loadProducts();
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
    }
  });

  async function loadProducts() {
    try {
      const snap = await db.collection('products').orderBy('name').get();
      list.innerHTML = '';
      if (snap.empty) {
        const li = document.createElement('li');
        li.textContent = 'Nenhum produto cadastrado.';
        list.appendChild(li);
        return;
      }
      snap.forEach(doc => {
        const data = doc.data();
        const li = document.createElement('li');
        const info = document.createElement('span');
        info.textContent = `${data.name} – R$${data.price.toFixed(2)} (${data.category})`;
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Excluir';
        delBtn.addEventListener('click', async () => {
          if (confirm(`Deseja excluir o produto "${data.name}"?`)) {
            await db.collection('products').doc(doc.id).delete();
            loadProducts();
          }
        });
        li.appendChild(info);
        li.appendChild(delBtn);
        list.appendChild(li);
      });
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  }

  loadProducts();
});