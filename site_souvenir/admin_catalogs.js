/*
 * admin_catalogs.js
 *
 * Provides functionality for the admin page to manage catalogs.
 * Administrators can create new catalogs and remove existing ones.
 * The catalogs are stored in a Firestore collection named `catalogs`.
 */

// Enable strict mode to prevent accidental globals and other silent errors.
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const db = firebase.firestore();
  const form = document.getElementById('catalog-form');
  const list = document.getElementById('catalog-list');

  if (!form || !list) {
    console.warn('Catálogo form or list element not found.');
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('cat-name').value.trim();
    const image = document.getElementById('cat-image').value.trim();
    const desc = document.getElementById('cat-desc').value.trim();
    if (!name) {
      alert('O nome do catálogo é obrigatório.');
      return;
    }
    try {
      // Generate a slug based on the catalog name (lowercase, hyphens, no accents)
      const slug = name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, '-');
      await db.collection('catalogs').add({
        name,
        slug,
        imageUrl: image,
        description: desc,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      form.reset();
      loadCatalogs();
    } catch (error) {
      console.error('Erro ao adicionar catálogo:', error);
    }
  });

  async function loadCatalogs() {
    try {
      const snap = await db.collection('catalogs').orderBy('name').get();
      list.innerHTML = '';
      if (snap.empty) {
        const li = document.createElement('li');
        li.textContent = 'Nenhum catálogo cadastrado.';
        list.appendChild(li);
        return;
      }
      snap.forEach(doc => {
        const data = doc.data();
        const li = document.createElement('li');
        const nameSpan = document.createElement('span');
        // Show catalog name and slug to help admin reference the slug when assigning products to cities
        nameSpan.innerHTML = `<strong>${data.name}</strong> <small>(${data.slug || doc.id})</small>`;
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Excluir';
        delBtn.addEventListener('click', async () => {
          if (confirm(`Deseja excluir o catálogo "${data.name}"?`)) {
            await db.collection('catalogs').doc(doc.id).delete();
            loadCatalogs();
          }
        });
        li.appendChild(nameSpan);
        li.appendChild(delBtn);
        list.appendChild(li);
      });
    } catch (error) {
      console.error('Erro ao carregar catálogos:', error);
    }
  }

  loadCatalogs();
});