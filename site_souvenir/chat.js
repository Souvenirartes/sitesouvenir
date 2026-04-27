/*
 * chat.js
 *
 * Toggles the display of the chat panel and handles form submission. The
 * chat button opens and closes the panel. Form submission can be
 * customized to send data to WhatsApp or another service.
 */

document.addEventListener('DOMContentLoaded', () => {
  const chatButton = document.getElementById('chat-button');
  const chatPanel = document.getElementById('chat-panel');
  const chatForm = document.getElementById('chat-form');

  if (!chatButton || !chatPanel || !chatForm) return;

  chatButton.addEventListener('click', () => {
    chatPanel.classList.toggle('open');
  });

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('chat-name').value.trim();
    const product = document.getElementById('chat-product').value;
    const topic = document.getElementById('chat-topic').value;
    const message = document.getElementById('chat-message').value.trim();
    if (!name || !message) {
      alert('Nome e mensagem são obrigatórios.');
      return;
    }
    // Monta a mensagem para enviar via WhatsApp (ou outra API)
    const text = `Cliente: ${name}\nProduto: ${product}\nAssunto: ${topic}\nMensagem: ${message}`;
    // Substitua o número abaixo pelo número do atendimento da sua empresa
    const phone = '5581000000000';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    chatForm.reset();
    chatPanel.classList.remove('open');
  });
  // Optionally close panel by clicking the close button
  const closeBtn = document.querySelector('.chat-panel .close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      chatPanel.classList.remove('open');
    });
  }
});