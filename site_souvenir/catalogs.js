document.addEventListener("DOMContentLoaded", async () => {
  const config = window.SOUVENIR_SITE_CONFIG || {};
  const api = config.api || {};
  const searchInput = document.getElementById("catalogSearch");
  const grid = document.getElementById("catalogGrid");
  const count = document.getElementById("catalogResultCount");
  const hamburger = document.querySelector(".hamburger");
  const navList = document.querySelector("nav ul");

  if (hamburger && navList) {
    if (!navList.id) {
      navList.id = "menu-principal";
    }
    hamburger.setAttribute("aria-controls", navList.id);
    hamburger.addEventListener("click", () => {
      const isOpen = navList.classList.toggle("show");
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const render = (items) => {
    if (!grid || !count) {
      return;
    }

    grid.innerHTML = "";
    count.textContent = `${items.length} catalogo(s) encontrado(s).`;

    if (items.length === 0) {
      count.textContent = "Nenhum catalogo encontrado para esse termo.";
      return;
    }

    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "featured-card";
      card.innerHTML = `
        <div class="featured-body">
          <strong>${item.name}</strong>
          <p>${item.description || "Catalogo oficial da Souvenir Brasil."}</p>
          <a class="btn" href="${item.catalogUrl}" target="_blank" rel="noopener noreferrer">Abrir catalogo</a>
        </div>
      `;
      grid.appendChild(card);
    });
  };

  const loadCatalogs = async (searchTerm = "") => {
    if (!api.baseUrl || !api.catalogsPath) {
      render([]);
      return;
    }

    const search = searchTerm.trim();
    const url = `${api.baseUrl}${api.catalogsPath}?activeOnly=1${search ? `&search=${encodeURIComponent(search)}` : ""}`;

    try {
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      if (!response.ok) {
        render([]);
        return;
      }
      const payload = await response.json();
      const items = Array.isArray(payload.items) ? payload.items : [];
      render(items);
    } catch (error) {
      render([]);
    }
  };

  await loadCatalogs("");

  if (searchInput) {
    let timer = null;
    searchInput.addEventListener("input", () => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        loadCatalogs(searchInput.value);
      }, 200);
    });
  }
});
