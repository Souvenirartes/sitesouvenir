/*
 * ratings.js
 *
 * This module provides a simple star‑rating interface backed by Firebase.
 * Only authenticated users who have purchased the product may submit a rating.
 * Ratings are stored in a Firestore collection called `ratings` and the
 * average rating is computed on the fly by summing individual ratings.
 *
 * Usage:
 *   Include this file in your HTML after the Firebase SDKs are loaded. Then
 *   call `renderRatingWidget(productId, elementId)` for each product. The
 *   widget will display five stars that the user can click to submit a rating.
 *   The current average rating and vote count are shown below the stars.
 */

// Initialize Firestore references only once.
const db = firebase.firestore();
const auth = firebase.auth();

/**
 * Renders a star rating widget for a product.
 *
 * @param {string} productId The ID of the product being rated.
 * @param {string} containerId The ID of the DOM element where the stars will be inserted.
 */
function renderRatingWidget(productId, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Create star elements
  const starWrapper = document.createElement('div');
  starWrapper.className = 'star-wrapper';
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.className = 'star';
    star.dataset.value = i;
    star.innerHTML = '☆';
    star.addEventListener('click', () => handleStarClick(productId, i));
    stars.push(star);
    starWrapper.appendChild(star);
  }

  // Create average rating display
  const ratingInfo = document.createElement('div');
  ratingInfo.className = 'rating-info';
  ratingInfo.textContent = 'Carregando avaliação…';

  container.appendChild(starWrapper);
  container.appendChild(ratingInfo);

  // Update stars and info when ratings change
  updateRatingDisplay(productId, stars, ratingInfo);
  // Listen to changes in the rating collection for realtime updates
  db.collection('ratings').where('productId', '==', productId)
    .onSnapshot(() => updateRatingDisplay(productId, stars, ratingInfo));
}

/**
 * Handles a click on a star and submits the rating if the user is eligible.
 *
 * @param {string} productId The product ID.
 * @param {number} ratingValue The selected rating (1–5).
 */
async function handleStarClick(productId, ratingValue) {
  const user = auth.currentUser;
  if (!user) {
    // Use toast if available, fall back to alert otherwise
    const msg = 'É necessário estar logado para avaliar um produto.';
    if (typeof showToast === 'function') {
      showToast(msg);
    } else {
      alert(msg);
    }
    return;
  }
  // Check if user has purchased this product.
  const orders = await db.collection('orders')
    .where('userId', '==', user.uid)
    .where('productId', '==', productId)
    .limit(1)
    .get();
  if (orders.empty) {
    const msg = 'Você só pode avaliar produtos que já comprou.';
    if (typeof showToast === 'function') {
      showToast(msg);
    } else {
      alert(msg);
    }
    return;
  }
  // Add rating entry
  await db.collection('ratings').add({
    productId,
    userId: user.uid,
    rating: ratingValue,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Updates the visual representation of stars and the average rating text.
 *
 * @param {string} productId The product ID.
 * @param {Array<HTMLElement>} stars Array of star elements.
 * @param {HTMLElement} infoEl The element displaying rating details.
 */
async function updateRatingDisplay(productId, stars, infoEl) {
  const snapshot = await db.collection('ratings')
    .where('productId', '==', productId)
    .get();
  let sum = 0;
  const total = snapshot.size;
  snapshot.forEach(doc => {
    sum += doc.data().rating;
  });
  const avg = total ? (sum / total) : 0;
  // Highlight stars according to rounded average
  const rounded = Math.round(avg);
  stars.forEach(star => {
    const value = parseInt(star.dataset.value, 10);
    star.innerHTML = value <= rounded ? '★' : '☆';
  });
  // Update text with average and total votes
  if (total === 0) {
    infoEl.textContent = 'Ainda sem avaliações.';
  } else {
    infoEl.textContent = `Média: ${avg.toFixed(1)} (${total} voto${total > 1 ? 's' : ''})`;
  }
}

// Optional: expose functions globally in a non-writable way to discourage tampering
Object.defineProperty(window, 'renderRatingWidget', { value: renderRatingWidget, writable: false, configurable: false });