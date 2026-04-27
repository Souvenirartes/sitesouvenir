document.addEventListener("DOMContentLoaded", async () => {
  const siteConfig = window.SOUVENIR_SITE_CONFIG || {};
  let runtimeConfig = { ...siteConfig };
  let whatsappNumber = runtimeConfig.whatsappNumber || "558487678591";
  const fallbackProductData =
    Array.isArray(window.SOUVENIR_PRODUCT_DATA) && window.SOUVENIR_PRODUCT_DATA.length > 0
      ? window.SOUVENIR_PRODUCT_DATA
      : [
    { name: "Chaveiro placa Mercosul", price: "R$ 29,90", category: "Chaveiros", accent: "#1d4f9c", hasVariants: true },
    { name: "Chaveiro Coracao", price: "R$ 25,90", category: "Chaveiros", accent: "#e57373", hasVariants: true },
    { name: "Chaveiro redondo", price: "R$ 23,90", category: "Chaveiros", accent: "#34a853", hasVariants: false },
    { name: "Chaveiro quadrado", price: "R$ 23,90", category: "Chaveiros", accent: "#ff8a65", hasVariants: false },
    { name: "Chaveiro link quadrado", price: "R$ 27,90", category: "Chaveiros", accent: "#9575cd", hasVariants: true },
    { name: "Chaveiro link redondo", price: "R$ 27,90", category: "Chaveiros", accent: "#4db6ac", hasVariants: true },
    { name: "Chaveiro link coracao", price: "R$ 27,90", category: "Chaveiros", accent: "#f06292", hasVariants: true },
    { name: "Necessaire", price: "R$ 49,90", category: "Acessorios", accent: "#8d6e63", hasVariants: false },
    { name: "Porta-moedas", price: "R$ 19,90", category: "Acessorios", accent: "#198754", hasVariants: false },
    { name: "Necessaire bau", price: "R$ 59,90", category: "Acessorios", accent: "#0f2f6e", hasVariants: true },
    { name: "Necessaire pet", price: "R$ 39,90", category: "Acessorios", accent: "#4fc3f7", hasVariants: true },
    { name: "Estojo", price: "R$ 34,90", category: "Acessorios", accent: "#ffb74d", hasVariants: false },
    { name: "Necessaire link", price: "R$ 44,90", category: "Acessorios", accent: "#81c784", hasVariants: true },
    { name: "Caneca", price: "R$ 39,90", category: "Canecas", accent: "#ff7043", hasVariants: false },
    { name: "Caneca personalizada", price: "R$ 59,90", category: "Canecas", accent: "#1d4f9c", hasVariants: true },
    { name: "Ima placa", price: "R$ 14,90", category: "Imas", accent: "#26a69a", hasVariants: false },
    { name: "Ima abridor retangular", price: "R$ 16,90", category: "Imas", accent: "#66bb6a", hasVariants: false },
    { name: "Chaveiro letra", price: "R$ 24,90", category: "Personalizados", accent: "#7e57c2", hasVariants: true }
  ];
  let productData = [...fallbackProductData];

  const hamburger = document.querySelector(".hamburger");
  const navList = document.querySelector("nav ul");
  const productGrid = document.getElementById("product-grid");
  const featuredGrid = document.getElementById("featured-grid");
  const produtoSelect = document.getElementById("produto");
  const tipoSelect = document.getElementById("tipo");
  const quantidadeInput = document.getElementById("quantidade");
  const quantityContainer = document.getElementById("quantityContainer");
  const openPopupButton = document.getElementById("openPopup");
  const closePopupButton = document.getElementById("closePopup");
  const whatsappPopup = document.getElementById("whatsappPopup");
  const popupOverlay = document.getElementById("popupOverlay");
  const badgeMessage = document.getElementById("badgeMessage");
  const openCartButton = document.getElementById("openCart");
  const openCartMobileButton = document.getElementById("openCartMobile");
  const closeCartButton = document.getElementById("closeCart");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartCount = document.getElementById("cartCount");
  const cartItems = document.getElementById("cartItems");
  const cartEmpty = document.getElementById("cartEmpty");
  const cartSummary = document.getElementById("cartSummary");
  const sendCartWhatsappButton = document.getElementById("sendCartWhatsapp");
  const continueShoppingButton = document.getElementById("continueShopping");
  const cartCustomerName = document.getElementById("cartCustomerName");
  const cartDeliveryType = document.getElementById("cartDeliveryType");
  const cartResidentType = document.getElementById("cartResidentType");
  const cartResidentTypeGroup = document.getElementById("cartResidentTypeGroup");
  const cartAddressInfo = document.getElementById("cartAddressInfo");
  const cartAddressGroup = document.getElementById("cartAddressGroup");
  const cartDepartureDate = document.getElementById("cartDepartureDate");
  const cartDepartureDateGroup = document.getElementById("cartDepartureDateGroup");
  const cartPaymentMethod = document.getElementById("cartPaymentMethod");
  const whatsappForm = document.getElementById("whatsappForm");

  const cart = [];
  let letterContainer = document.getElementById("letterContainer");
  let letterSelect = document.getElementById("letter");
  let productSelectBound = false;
  let siteConfigApplied = false;
  const cartStorageKey = "souvenir_cart_v2";

  const createProductImage = (product) => {
    const initials = product.name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420">
        <defs>
          <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stop-color="${product.accent}" />
            <stop offset="100%" stop-color="#0b4f33" />
          </linearGradient>
        </defs>
        <rect width="600" height="420" rx="36" fill="url(#bg)" />
        <circle cx="490" cy="92" r="74" fill="rgba(255,255,255,0.12)" />
        <circle cx="110" cy="330" r="90" fill="rgba(255,255,255,0.08)" />
        <text x="48" y="95" fill="white" font-size="28" font-family="Arial, Helvetica, sans-serif" opacity="0.82">${product.category}</text>
        <text x="48" y="220" fill="white" font-size="76" font-weight="700" font-family="Arial, Helvetica, sans-serif">${initials}</text>
        <text x="48" y="280" fill="white" font-size="34" font-family="Arial, Helvetica, sans-serif">${product.name}</text>
        <text x="48" y="344" fill="#ffe082" font-size="28" font-family="Arial, Helvetica, sans-serif">Souvenir Brasil</text>
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const getProductDescription = (product) => {
    const descriptions = {
      Chaveiros: "Peca compacta e pratica, ideal para presentear ou revender.",
      Acessorios: "Item funcional com acabamento pensado para o dia a dia.",
      Canecas: "Produto colecionavel com visual marcante e otima apresentacao.",
      Imas: "Lembranca leve e charmosa para destacar destinos e momentos.",
      Personalizados: "Modelo customizavel para deixar o pedido ainda mais especial."
    };

    return descriptions[product.category] || "Lembranca exclusiva com identidade brasileira.";
  };

  const shuffleProducts = (items) => {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }
    return copy;
  };

  const getObservationMeta = (productName) => {
    const product = productData.find((item) => item.name === productName);
    if (product?.hasVariants) {
      return {
        label: "Versao ou modelo",
        placeholder: "Ex.: cor, tamanho, letra, estampa ou versao desejada"
      };
    }

    return {
      label: "Detalhes do item",
      placeholder: "Ex.: frase, observacao, acabamento ou pedido especial"
    };
  };

  const parsePrice = (price) => Number(price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
  const formatPrice = (value) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const setTextIfExists = (selector, value) => {
    if (!value) {
      return;
    }
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = value;
    }
  };

  const applyRuntimeConfig = () => {
    whatsappNumber = runtimeConfig.whatsappNumber || whatsappNumber;

    setTextIfExists("#heroEyebrow", runtimeConfig.heroEyebrow);
    setTextIfExists("#heroTitle", runtimeConfig.heroTitle);
    setTextIfExists("#heroDescription", runtimeConfig.heroDescription);
    setTextIfExists("#ctaTitle", runtimeConfig.ctaTitle);
    setTextIfExists("#ctaDescription", runtimeConfig.ctaDescription);

    const instaUrl = runtimeConfig.instagramUrl;
    if (instaUrl) {
      document.querySelectorAll('a[href*="instagram.com/souvenirbrasil"]').forEach((link) => {
        link.href = instaUrl;
      });
    }

    const supportEmail = runtimeConfig.supportEmail;
    if (supportEmail) {
      document.querySelectorAll("li").forEach((line) => {
        if (line.textContent.trim().startsWith("Email:")) {
          line.textContent = `Email: ${supportEmail}`;
        }
      });
    }

    const supportPhone = runtimeConfig.supportPhone;
    if (supportPhone) {
      document.querySelectorAll("li").forEach((line) => {
        if (line.textContent.trim().startsWith("Telefone:")) {
          line.textContent = `Telefone: ${supportPhone}`;
        }
      });
    }

    if (whatsappNumber) {
      document.querySelectorAll("li").forEach((line) => {
        if (line.textContent.trim().startsWith("WhatsApp:")) {
          line.textContent = `WhatsApp: ${whatsappNumber}`;
        }
      });
    }
  };

  const setBodyLock = () => {
    const popupOpen = whatsappPopup?.classList.contains("show");
    const cartOpen = cartDrawer?.classList.contains("show");
    document.body.style.overflow = popupOpen || cartOpen ? "hidden" : "";
  };

  const loadCartFromStorage = () => {
    try {
      const raw = localStorage.getItem(cartStorageKey);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return;
      }
      parsed.forEach((item) => {
        if (!item || typeof item.name !== "string" || typeof item.price !== "string") {
          return;
        }
        cart.push({
          name: item.name,
          price: item.price,
          quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
          note: typeof item.note === "string" ? item.note : ""
        });
      });
    } catch (error) {
      // Ignora carrinho invalido no storage.
    }
  };

  const saveCartToStorage = () => {
    try {
      localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    } catch (error) {
      // Se storage nao estiver disponivel, segue fluxo normal.
    }
  };

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

  const updateCartUI = () => {
    saveCartToStorage();

    if (!cartCount || !cartItems || !cartEmpty || !cartSummary || !sendCartWhatsappButton) {
      return;
    }

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = cart.reduce((sum, item) => sum + item.quantity * parsePrice(item.price), 0);

    cartCount.textContent = String(totalItems);
    cartSummary.textContent =
      totalItems === 0 ? "0 itens no pedido" : `${totalItems} item${totalItems > 1 ? "s" : ""} no pedido - ${formatPrice(totalValue)}`;
    cartEmpty.style.display = cart.length === 0 ? "block" : "none";
    sendCartWhatsappButton.disabled = cart.length === 0;
      cartItems.innerHTML = "";

    cart.forEach((item, index) => {
      const observationMeta = getObservationMeta(item.name);
      const noteId = `note-${index}`;
      const itemElement = document.createElement("article");
      itemElement.className = "cart-item";
      itemElement.innerHTML = `
        <div class="cart-item-top">
          <div>
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${item.price}</div>
          </div>
          <button class="remove-item-btn" type="button" data-remove="${item.name}">Remover</button>
        </div>
        <div class="cart-item-controls">
          <div class="cart-qty">
            <button type="button" data-decrease="${item.name}">-</button>
            <span>${item.quantity}</span>
            <button type="button" data-increase="${item.name}">+</button>
          </div>
        </div>
        <div class="cart-note-field">
          <label for="${noteId}">${observationMeta.label}</label>
          <textarea id="${noteId}" data-note="${item.name}" placeholder="${observationMeta.placeholder}">${item.note || ""}</textarea>
        </div>
      `;
      cartItems.appendChild(itemElement);
    });
  };

  const openCart = () => {
    if (!cartDrawer) {
      return;
    }

    cartDrawer.classList.add("show");
    cartDrawer.setAttribute("aria-hidden", "false");
    if (openCartButton) {
      openCartButton.setAttribute("aria-expanded", "true");
    }
    if (openCartMobileButton) {
      openCartMobileButton.setAttribute("aria-expanded", "true");
    }

    if (cartOverlay) {
      cartOverlay.hidden = false;
      cartOverlay.classList.add("show");
    }

    setBodyLock();
  };

  const closeCart = () => {
    if (!cartDrawer) {
      return;
    }

    cartDrawer.classList.remove("show");
    cartDrawer.setAttribute("aria-hidden", "true");
    if (openCartButton) {
      openCartButton.setAttribute("aria-expanded", "false");
    }
    if (openCartMobileButton) {
      openCartMobileButton.setAttribute("aria-expanded", "false");
    }

    if (cartOverlay) {
      cartOverlay.classList.remove("show");
      cartOverlay.hidden = true;
    }

    setBodyLock();
  };

  const addToCart = (productName) => {
    const product = productData.find((item) => item.name === productName);
    if (!product) {
      return;
    }

    const existingItem = cart.find((item) => item.name === product.name);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ name: product.name, price: product.price, quantity: 1, note: "" });
    }

    updateCartUI();
    openCart();

    if (badgeMessage) {
      badgeMessage.textContent = `${product.name} adicionado ao carrinho`;
      badgeMessage.style.display = "block";
      setTimeout(() => {
        if (!whatsappPopup?.classList.contains("show")) {
          badgeMessage.textContent = "Atendimento rapido pelo WhatsApp";
        }
      }, 1800);
    }
  };

  const renderProductGrid = () => {
    if (!productGrid) {
      return;
    }

    productGrid.innerHTML = "";
    const pageHeading = document.querySelector("main h2");
    const isLoja = Boolean(pageHeading && pageHeading.textContent.toLowerCase().includes("loja"));

    productData.forEach((product) => {
      const card = document.createElement("article");
      card.className = "product-card";
      card.dataset.productName = product.name;
      card.innerHTML = `
        <div class="product-image">
          <img src="${createProductImage(product)}" alt="${product.name}">
        </div>
        <div class="product-info">
          <div>
            <div class="product-name">${product.name}</div>
            <p class="product-meta">${getProductDescription(product)}</p>
          </div>
          <div class="product-price">${product.price}</div>
          <div class="product-actions">
            <button class="add-cart-btn" type="button" data-add-cart="${product.name}">Adicionar ao carrinho</button>
            <button class="${isLoja ? "buy-btn" : "contact-btn"}" type="button">${isLoja ? "Comprar via WhatsApp" : "Falar via WhatsApp"}</button>
          </div>
        </div>
      `;
      productGrid.appendChild(card);
    });

    const selectedProduct = new URLSearchParams(window.location.search).get("product");
    if (selectedProduct) {
      const decodedProduct = decodeURIComponent(selectedProduct);
      const matchingCard = productGrid.querySelector(`[data-product-name="${decodedProduct}"]`);
      if (matchingCard) {
        matchingCard.classList.add("product-card-featured");
        setTimeout(() => {
          matchingCard.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);
      }
    }
  };

  const renderFeaturedGrid = () => {
    if (!featuredGrid) {
      return;
    }

    featuredGrid.innerHTML = "";
    const featuredProducts = shuffleProducts(productData).slice(0, 3);
    featuredProducts.forEach((product) => {
      const featuredCard = document.createElement("article");
      featuredCard.className = "featured-card";
      featuredCard.innerHTML = `
        <div class="featured-media">
          <img src="${createProductImage(product)}" alt="${product.name}">
        </div>
        <div class="featured-body">
          <strong>${product.name}</strong>
          <span class="featured-price">${product.price}</span>
          <p>${getProductDescription(product)}</p>
          <a href="loja.html?product=${encodeURIComponent(product.name)}" class="featured-link">Ver na loja</a>
        </div>
      `;
      featuredGrid.appendChild(featuredCard);
    });
  };

  const renderProductSelect = () => {
    if (!produtoSelect) {
      return;
    }

    produtoSelect.innerHTML =
      '<option value="">Selecione um produto</option>' +
      productData.map((product) => `<option value="${product.name}">${product.name}</option>`).join("");

    if (!letterContainer) {
      letterContainer = document.createElement("div");
      letterContainer.id = "letterContainer";
      letterContainer.style.display = "none";

      let letterOptions = '<option value="">Selecione uma letra</option>';
      for (let code = 65; code <= 90; code += 1) {
        const letter = String.fromCharCode(code);
        letterOptions += `<option value="${letter}">${letter}</option>`;
      }

      letterContainer.innerHTML = `
        <label for="letter">Escolha a letra</label>
        <select id="letter">${letterOptions}</select>
      `;

      produtoSelect.parentNode.insertBefore(letterContainer, produtoSelect.nextSibling);
      letterSelect = letterContainer.querySelector("#letter");
    }

    if (!productSelectBound) {
      produtoSelect.addEventListener("change", function handleProductChange() {
        const shouldShowLetters = this.value === "Chaveiro letra";
        if (letterContainer) {
          letterContainer.style.display = shouldShowLetters ? "block" : "none";
        }

        if (!shouldShowLetters && letterSelect) {
          letterSelect.value = "";
        }
      });
      productSelectBound = true;
    }
  };

  const hydrateProductViews = () => {
    renderProductGrid();
    renderFeaturedGrid();
    renderProductSelect();
  };

  const formatPriceFromValue = (value) =>
    Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const normalizeApiProduct = (item) => ({
    id: item.id || "",
    slug: item.slug || "",
    name: item.name || "",
    price: item.priceLabel || formatPriceFromValue(item.priceValue || 0),
    priceValue: Number(item.priceValue || 0),
    category: item.category || "",
    accent: item.accent || "#1d4f9c",
    hasVariants: Boolean(item.hasVariants)
  });

  const loadProductsFromApi = async () => {
    const api = runtimeConfig.api || siteConfig.api || {};
    if (!api.baseUrl || !api.productsPath) {
      return;
    }

    const url = `${api.baseUrl}${api.productsPath}?channel=site&activeOnly=1`;
    try {
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      if (!response.ok) {
        return;
      }

      const payload = await response.json();
      if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
        return;
      }

      productData = payload.items.map(normalizeApiProduct).filter((item) => item.name);
    } catch (error) {
      // Mantem fallback local quando API estiver indisponivel.
    }
  };

  const loadSiteConfigFromApi = async () => {
    const api = runtimeConfig.api || siteConfig.api || {};
    if (!api.baseUrl || !api.configPath) {
      applyRuntimeConfig();
      return;
    }

    try {
      const response = await fetch(`${api.baseUrl}${api.configPath}`, { headers: { Accept: "application/json" } });
      if (response.ok) {
        const payload = await response.json();
        if (payload && typeof payload === "object") {
          runtimeConfig = { ...runtimeConfig, ...payload };
        }
      }
    } catch (error) {
      // Mantem configuracao local quando API estiver indisponivel.
    }

    applyRuntimeConfig();
    siteConfigApplied = true;
  };

  const applyCarouselImages = () => {
    const slideshow = document.getElementById("slideshow");
    if (!slideshow) {
      return;
    }

    const images = Array.isArray(runtimeConfig.homeCarouselImages)
      ? runtimeConfig.homeCarouselImages.filter((item) => typeof item === "string" && item.trim() !== "")
      : [];

    if (images.length === 0) {
      return;
    }

    slideshow.innerHTML = images
      .map((src) => `<div class="slide" style="background-image: url('${src.replace(/'/g, "\\'")}');"></div>`)
      .join("");
  };

  const initRevealAnimations = () => {
    const sections = Array.from(document.querySelectorAll("main section, .products > .section-heading, .products > .product-grid"));
    if (sections.length === 0) {
      return;
    }

    sections.forEach((section) => {
      section.classList.add("reveal-on-scroll");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    sections.forEach((section) => observer.observe(section));
  };

  loadCartFromStorage();
  if (!siteConfigApplied) {
    applyRuntimeConfig();
  }
  await loadSiteConfigFromApi();
  applyCarouselImages();
  await loadProductsFromApi();
  hydrateProductViews();
  initRevealAnimations();

  const updateQuantityVisibility = (forceBuyMode = false) => {
    if (!quantityContainer || !tipoSelect) {
      return;
    }

    const shouldShowQuantity = forceBuyMode || tipoSelect.value === "quero comprar";
    quantityContainer.hidden = !shouldShowQuantity;

    if (!shouldShowQuantity && quantidadeInput) {
      quantidadeInput.value = "1";
    }
  };

  if (tipoSelect) {
    tipoSelect.addEventListener("change", () => {
      updateQuantityVisibility(false);
    });
  }

  updateQuantityVisibility(false);

  const updateDeliveryFields = () => {
    if (!cartDeliveryType) {
      return;
    }

    const isDelivery = cartDeliveryType.value === "Entrega em Natal";
    const isPickup = cartDeliveryType.value === "Retirada em Natal";
    const residentType = cartResidentType?.value || "";
    const isGuest = isDelivery && residentType === "Hospede";
    const isResident = isDelivery && residentType === "Morador";

    if (cartResidentTypeGroup) {
      cartResidentTypeGroup.hidden = !isDelivery;
    }

    if (cartAddressGroup) {
      cartAddressGroup.hidden = !(isResident || isGuest);
    }

    if (cartDepartureDateGroup) {
      cartDepartureDateGroup.hidden = !isGuest;
    }

    if (!isDelivery && cartResidentType) {
      cartResidentType.value = "";
    }

    if (!isDelivery && cartAddressInfo) {
      cartAddressInfo.value = "";
    }

    if (!isGuest && cartDepartureDate) {
      cartDepartureDate.value = "";
    }

    if (isPickup && cartAddressInfo) {
      cartAddressInfo.value = "";
    }
  };

  if (cartDeliveryType) {
    cartDeliveryType.addEventListener("change", updateDeliveryFields);
  }

  if (cartResidentType) {
    cartResidentType.addEventListener("change", updateDeliveryFields);
  }

  updateDeliveryFields();

  const syncPopupState = (isOpen) => {
    if (!whatsappPopup || !openPopupButton) {
      return;
    }

    whatsappPopup.classList.toggle("show", isOpen);
    whatsappPopup.setAttribute("aria-hidden", String(!isOpen));
    openPopupButton.style.display = isOpen ? "none" : "flex";

    if (popupOverlay) {
      popupOverlay.hidden = !isOpen;
      popupOverlay.classList.toggle("show", isOpen);
    }

    if (badgeMessage && isOpen) {
      badgeMessage.style.display = "none";
    }

    setBodyLock();
  };

  if (openPopupButton) {
    openPopupButton.addEventListener("click", () => {
      const isShowing = Boolean(whatsappPopup && whatsappPopup.classList.contains("show"));
      syncPopupState(!isShowing);
    });
  }

  if (closePopupButton) {
    closePopupButton.addEventListener("click", () => {
      syncPopupState(false);
    });
  }

  if (popupOverlay) {
    popupOverlay.addEventListener("click", () => {
      syncPopupState(false);
    });
  }

  if (openCartButton) {
    openCartButton.addEventListener("click", openCart);
  }

  if (openCartMobileButton) {
    openCartMobileButton.addEventListener("click", () => {
      if (cartDrawer) {
        openCart();
        return;
      }

      window.location.href = "loja.html?openCart=1";
    });
  }

  if (closeCartButton) {
    closeCartButton.addEventListener("click", closeCart);
  }

  if (continueShoppingButton) {
    continueShoppingButton.addEventListener("click", () => {
      closeCart();
      productGrid?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (cartOverlay) {
    cartOverlay.addEventListener("click", closeCart);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && whatsappPopup?.classList.contains("show")) {
      syncPopupState(false);
    }

    if (event.key === "Escape" && cartDrawer?.classList.contains("show")) {
      closeCart();
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    if (target.matches("[data-add-cart]")) {
      event.preventDefault();
      addToCart(target.getAttribute("data-add-cart"));
      return;
    }

    if (target.matches(".contact-btn") || target.matches(".buy-btn")) {
      event.preventDefault();
      const isBuying = target.matches(".buy-btn");
      const card = target.closest(".product-card");
      const nameElement = card ? card.querySelector(".product-name") : null;
      const productName = nameElement ? nameElement.textContent.trim() : "";

      if (produtoSelect && productName) {
        produtoSelect.value = productName;
        produtoSelect.dispatchEvent(new Event("change"));
      }

      if (tipoSelect) {
        tipoSelect.value = isBuying ? "quero comprar" : "quero mais informacoes";
      }

      updateQuantityVisibility(isBuying);
      syncPopupState(true);
      return;
    }

    const increaseName = target.getAttribute("data-increase");
    const decreaseName = target.getAttribute("data-decrease");
    const removeName = target.getAttribute("data-remove");

    if (increaseName) {
      const item = cart.find((entry) => entry.name === increaseName);
      if (item) {
        item.quantity += 1;
        updateCartUI();
      }
    }

    if (decreaseName) {
      const item = cart.find((entry) => entry.name === decreaseName);
      if (item) {
        item.quantity = Math.max(1, item.quantity - 1);
        updateCartUI();
      }
    }

    if (removeName) {
      const index = cart.findIndex((entry) => entry.name === removeName);
      if (index >= 0) {
        cart.splice(index, 1);
        updateCartUI();
      }
    }
  });

  if (cartItems) {
    cartItems.addEventListener("input", (event) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.matches("[data-note]")) {
        return;
      }

      const item = cart.find((entry) => entry.name === target.getAttribute("data-note"));
      if (item) {
        item.note = target.value;
      }
    });
  }

  if (sendCartWhatsappButton) {
    sendCartWhatsappButton.addEventListener("click", () => {
      if (cart.length === 0) {
        return;
      }

      const lines = cart.map((item) => {
        const observation = item.note ? `\n  Observacao: ${item.note}` : "";
        return `- ${item.quantity}x ${item.name}${observation}`;
      });
      const message = [
        "*NOVO PEDIDO - CARRINHO*",
        "",
        "*Cliente*",
        cartCustomerName?.value.trim() || "-",
        "",
        "*Entrega ou retirada em Natal*",
        cartDeliveryType?.value || "A combinar",
        "",
        "*Itens do pedido*",
        lines.join("\n"),
        "",
        "*Pagamento*",
        cartPaymentMethod?.value || "A combinar",
        "",
        "*Importante*",
        "Pagamento sera alinhado externamente com a equipe de vendas.",
        "",
        "*Atendimento*",
        "Podem me atender por aqui?"
      ];

      if (cartDeliveryType?.value === "Entrega em Natal") {
        message.push("", "*Perfil em Natal*", cartResidentType?.value || "Nao informado");

        if (cartAddressInfo?.value.trim()) {
          message.push("", "*Endereco ou hotel*", cartAddressInfo.value.trim());
        }

        if (cartResidentType?.value === "Hospede" && cartDepartureDate?.value) {
          message.push("", "*Dia que vai embora*", cartDepartureDate.value);
        }
      }

      const finalMessage = message.join("\n");
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(finalMessage)}`, "_blank");
    });
  }

  if (whatsappForm) {
    whatsappForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const nome = document.getElementById("nome")?.value.trim() || "";
      const produto = produtoSelect ? produtoSelect.value : "";
      const tipo = tipoSelect?.value || "";
      const quantidade = quantidadeInput?.value ? Number(quantidadeInput.value) : 1;
      const mensagemExtra = document.getElementById("mensagemExtra")?.value.trim() || "";

      const productLabel =
        produto === "Chaveiro letra" && letterSelect?.value ? `${produto} (letra ${letterSelect.value})` : produto;

      const details = [
        "*NOVO ATENDIMENTO*",
        "",
        "*Cliente*",
        nome || "-",
        "",
        "*Solicitacao*",
        tipo || "-",
        "",
        "*Produto*",
        productLabel || "-"
      ];

      if (tipo === "quero comprar" && quantidade > 0) {
        details.push("", "*Quantidade*", String(quantidade));
      }

      if (mensagemExtra) {
        details.push("", "*Observacoes*", mensagemExtra);
      }

      details.push("", "*Importante*", "Se eu tiver foto de referencia, vou enviar em seguida pelo WhatsApp.");

      const mensagem = details.join("\n");
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensagem)}`, "_blank");
    });
  }

  const slides = document.querySelectorAll(".slide");
  let slideIndex = 0;
  if (slides.length > 0) {
    slides[0].classList.add("active");
    if (slides.length > 1) {
      setInterval(() => {
        slides[slideIndex].classList.remove("active");
        slideIndex = (slideIndex + 1) % slides.length;
        slides[slideIndex].classList.add("active");
      }, 5000);
    }
  }

  if (cartDrawer) {
    const shouldOpenCart = new URLSearchParams(window.location.search).get("openCart") === "1";
    if (shouldOpenCart) {
      openCart();
    }
  }

  updateCartUI();
});
