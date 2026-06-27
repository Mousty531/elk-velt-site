const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const whatsappNumber = "15818996665";
const salesEmail = "lalogistique@elkvelt.com";

function cleanValue(value) {
  return String(value || "").trim();
}

function buildFormMessage(title, form, fields) {
  const formData = new FormData(form);
  const lines = [title];

  fields.forEach(([name, label]) => {
    const value = cleanValue(formData.get(name));
    if (value) {
      lines.push(`${label}: ${value}`);
    }
  });

  return lines.join("\n");
}

function sendSalesInquiry(message, noteElement, form) {
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  const mailtoUrl = `mailto:${salesEmail}?subject=${encodeURIComponent("Nouvelle demande - Site web")}&body=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, "_blank", "noopener");

  if (noteElement) {
    noteElement.innerHTML = `Votre message est prêt dans WhatsApp. <a href="${mailtoUrl}">Envoyer aussi par courriel</a>.`;
  }

  form?.reset();
}

const vehicleSearch = document.querySelector("#vehicleSearch");
const vehicleType = document.querySelector("#vehicleType");
const vehicleStatus = document.querySelector("#vehicleStatus");
const vehicleCards = Array.from(document.querySelectorAll(".vehicle-card"));

function filterVehicles() {
  const term = (vehicleSearch?.value || "").trim().toLowerCase();
  const type = vehicleType?.value || "all";
  const status = vehicleStatus?.value || "available";

  vehicleCards.forEach((card) => {
    const matchesType = type === "all" || card.dataset.type === type;
    const isPinnedSoldVehicle = card.dataset.status === "sold" && card.dataset.showDefault === "true";
    const matchesStatus =
      status === "available"
        ? card.dataset.status !== "sold" || isPinnedSoldVehicle
        : card.dataset.status === status;
    const text = `${card.textContent} ${card.dataset.keywords || ""}`.toLowerCase();
    const matchesTerm = !term || text.includes(term);
    card.classList.toggle("is-hidden", !(matchesType && matchesStatus && matchesTerm));
  });
}

if (vehicleSearch && vehicleType) {
  vehicleSearch.addEventListener("input", filterVehicles);
  vehicleType.addEventListener("change", filterVehicles);
  vehicleStatus?.addEventListener("change", filterVehicles);
  filterVehicles();
}

const contactForm = document.querySelector("#contactForm");
const formNote = document.querySelector("#formNote");

if (contactForm && formNote) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = buildFormMessage("Nouvelle demande de contact", contactForm, [
      ["name", "Nom"],
      ["company", "Entreprise"],
      ["email", "Courriel"],
      ["phone", "Téléphone"],
      ["request", "Type de demande"],
      ["message", "Message"]
    ]);

    sendSalesInquiry(message, formNote, contactForm);
  });
}

const partsRequestForm = document.querySelector("#partsRequestForm");
const partsFormNote = document.querySelector("#partsFormNote");
const partsInventoryRoot = document.querySelector("#partsInventory");
const partsSearch = document.querySelector("#partsSearch");
const partsEmptyState = document.querySelector("#partsEmptyState");

const partCategories = [
  "Phares",
  "Pare-chocs avant",
  "Pare-chocs arrière",
  "Grilles",
  "Supports",
  "Moulures et carrosserie"
];

function getStockOverrides() {
  try {
    return JSON.parse(localStorage.getItem("elkVeltPartsStock") || "{}");
  } catch {
    return {};
  }
}

function saveStockOverrides(overrides) {
  localStorage.setItem("elkVeltPartsStock", JSON.stringify(overrides));
}

function getPartQuantitySold(part) {
  const overrides = getStockOverrides();
  return Number(overrides[part.id]?.quantitySold ?? part.quantitySold ?? 0);
}

function getPartQuantityAvailable(part) {
  if (part.specialOrder) return null;
  return Math.max(0, Number(part.quantityReceived || 0) - getPartQuantitySold(part));
}

function getPartStatus(part) {
  if (part.specialOrder) return "Disponible sur commande";
  return getPartQuantityAvailable(part) > 0 ? part.status || "En stock" : "Rupture de stock";
}

function updatePartSale(partId, soldQuantity = 1) {
  const inventory = window.ElkVeltPartsInventory || [];
  const part = inventory.find((item) => item.id === partId);

  if (!part) return null;

  const overrides = getStockOverrides();
  const currentSold = Number(overrides[part.id]?.quantitySold ?? part.quantitySold ?? 0);
  const quantitySold = Math.min(Number(part.quantityReceived || 0), currentSold + soldQuantity);
  overrides[part.id] = { quantitySold };
  saveStockOverrides(overrides);

  return {
    ...part,
    quantitySold,
    quantityAvailable: Math.max(0, Number(part.quantityReceived || 0) - quantitySold),
    status: quantitySold >= Number(part.quantityReceived || 0) ? "Rupture de stock" : "En stock"
  };
}

window.ElkVeltPartsStock = {
  recordSale: updatePartSale,
  getAvailable: (partId) => {
    const part = (window.ElkVeltPartsInventory || []).find((item) => item.id === partId);
    return part ? getPartQuantityAvailable(part) : null;
  }
};

function normalizePartSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function partMatchesSearch(part, term) {
  if (!term) return true;

  const searchable = [
    part.oem,
    part.description,
    part.brand,
    part.model,
    part.year,
    part.compatibility,
    part.category,
    part.inventoryCategory
  ].join(" ");

  return normalizePartSearch(searchable).includes(term);
}

function statusClass(status) {
  if (status === "En stock") return "available";
  if (status.includes("transit")) return "ordered";
  if (status === "Rupture de stock") return "out";
  return "special-order";
}

function formatCad(value) {
  return `${Number(value).toLocaleString("fr-CA")} $ CAD`;
}

function createPartCard(part) {
  const quantitySold = getPartQuantitySold(part);
  const quantityAvailable = getPartQuantityAvailable(part);
  const status = getPartStatus(part);
  const article = document.createElement("article");
  article.className = "part-card";

  const media = part.image
    ? `<img src="${part.image}" alt="${part.description} ${part.compatibility}">`
    : `<div class="part-placeholder">Disponible sur commande</div>`;

  const oem = part.oem ? `<p><strong>Numéro OEM :</strong> ${part.oem}</p>` : "";
  const price = Number.isFinite(part.salePriceCad)
    ? `<p class="part-price"><strong>Prix :</strong> ${formatCad(part.salePriceCad)}</p>`
    : `<p class="part-price-on-request">Prix sur demande</p>`;
  const quantityLabel = status.includes("transit") ? "Quantité en transit" : "Quantité reçue";
  const availableLabel = status.includes("transit") ? "Quantité à réserver" : "Quantité disponible";
  const stock = part.specialOrder
    ? ""
    : `<p><strong>${quantityLabel} :</strong> ${part.quantityReceived}</p>
       <p><strong>Quantité vendue :</strong> ${quantitySold}</p>
       <p><strong>${availableLabel} :</strong> ${quantityAvailable}</p>`;
  const dataPart = `${part.description} - ${part.compatibility}${part.oem ? ` - OEM ${part.oem}` : ""}`;

  article.innerHTML = `
    ${media}
    <div class="part-card-body">
      <h3>${part.description}</h3>
      <p><strong>Véhicule compatible :</strong> ${part.compatibility}</p>
      ${oem}
      ${price}
      ${stock}
      <span class="status ${statusClass(status)}">${status}</span>
      ${part.specialOrder ? "" : `<button class="button outline part-detail-button" type="button" data-part-id="${part.id}">Voir la fiche</button>`}
      <a class="button primary part-request-button" href="#demande-piece" data-part="${dataPart}">Demander cette pièce</a>
    </div>
  `;

  return article;
}

const partDetailDialog = document.querySelector("#partDetailDialog");
const partDetailContent = document.querySelector("#partDetailContent");

function openPartDetail(partId) {
  const part = (window.ElkVeltPartsInventory || []).find((item) => item.id === partId);
  if (!part || !partDetailDialog || !partDetailContent) return;

  const available = getPartQuantityAvailable(part);
  const sold = getPartQuantitySold(part);
  const status = getPartStatus(part);
  const detailQuantityLabel = status.includes("transit") ? "Quantité en transit" : "Quantité reçue";
  const detailAvailableLabel = status.includes("transit") ? "Quantité à réserver" : "Quantité disponible";

  partDetailContent.innerHTML = `
    <img src="${part.image}" alt="${part.description} ${part.compatibility}">
    <div>
      <p class="eyebrow">Fiche détaillée</p>
      <h2>${part.description}</h2>
      <p><strong>Véhicule compatible :</strong> ${part.compatibility}</p>
      <p><strong>Numéro OEM :</strong> ${part.oem}</p>
      <p class="part-detail-price"><strong>Prix :</strong> ${formatCad(part.salePriceCad)}</p>
      <p><strong>${detailQuantityLabel} :</strong> ${part.quantityReceived}</p>
      <p><strong>Quantité vendue :</strong> ${sold}</p>
      <p><strong>${detailAvailableLabel} :</strong> ${available}</p>
      <span class="status ${statusClass(status)}">${status}</span>
      <p class="price-change-note">Ces pièces sont en transit vers le Canada. Prix sujets à changement selon disponibilité.</p>
      <p class="final-sale-detail"><strong>Vente finale :</strong> cette pièce n'est ni retournable ni échangeable. Confirmez le numéro OEM et le véhicule compatible avant l'achat, sous réserve des obligations légales applicables.</p>
      <a class="button primary part-request-button" href="#demande-piece" data-part="${part.description} - ${part.compatibility} - OEM ${part.oem}">Demander cette pièce</a>
    </div>
  `;

  wirePartRequestButtons(partDetailContent);
  partDetailDialog.showModal();
}

function wirePartRequestButtons(scope = document) {
  scope.querySelectorAll(".part-request-button").forEach((button) => {
    button.addEventListener("click", () => {
      const partField = document.querySelector("#partsRequestForm textarea[name='part']");

      if (partField && button.dataset.part) {
        partField.value = button.dataset.part;
      }

      if (partDetailDialog?.open) {
        partDetailDialog.close();
      }
    });
  });
}

function wirePartDetailButtons(scope = document) {
  scope.querySelectorAll(".part-detail-button").forEach((button) => {
    button.addEventListener("click", () => openPartDetail(button.dataset.partId));
  });
}

function renderPartsInventory() {
  if (!partsInventoryRoot) return;

  const inventory = (window.ElkVeltPartsInventory || []).filter((part) => part.image);
  const term = normalizePartSearch(partsSearch?.value || "");
  let visibleCount = 0;

  partsInventoryRoot.innerHTML = "";

  partCategories.forEach((category) => {
    const parts = inventory.filter((part) => part.category === category && partMatchesSearch(part, term));
    if (!parts.length) return;

    visibleCount += parts.length;

    const section = document.createElement("section");
    section.className = "parts-panel parts-category-section";
    section.innerHTML = `
      <div class="section-heading compact">
        <p class="eyebrow">Type de pièce</p>
        <h2>${category}</h2>
      </div>
      <div class="parts-product-grid"></div>
    `;

    const grid = section.querySelector(".parts-product-grid");
    parts.forEach((part) => grid.appendChild(createPartCard(part)));
    partsInventoryRoot.appendChild(section);
  });

  if (partsEmptyState) {
    partsEmptyState.hidden = visibleCount > 0;
  }

  wirePartRequestButtons(partsInventoryRoot);
  wirePartDetailButtons(partsInventoryRoot);
}

if (partsInventoryRoot) {
  partsSearch?.addEventListener("input", renderPartsInventory);
  renderPartsInventory();
} else {
  wirePartRequestButtons();
}

document.querySelector("#partDetailClose")?.addEventListener("click", () => {
  partDetailDialog?.close();
});

partDetailDialog?.addEventListener("click", (event) => {
  if (event.target === partDetailDialog) {
    partDetailDialog.close();
  }
});

const adminPartsTableBody = document.querySelector("#adminPartsTableBody");

function renderAdminParts() {
  if (!adminPartsTableBody) return;

  adminPartsTableBody.innerHTML = (window.ElkVeltPartsInventory || []).map((part) => {
    const sold = getPartQuantitySold(part);
    const available = getPartQuantityAvailable(part);
    const status = getPartStatus(part);

    return `
      <tr>
        <td>${part.description}</td>
        <td>${part.oem}</td>
        <td>${formatCad(part.salePriceCad)}</td>
        <td>${part.quantityReceived}</td>
        <td>${sold}</td>
        <td>${available}</td>
        <td><span class="status ${statusClass(status)}">${status}</span></td>
      </tr>
    `;
  }).join("");
}

renderAdminParts();

if (partsRequestForm && partsFormNote) {
  partsRequestForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = buildFormMessage("Demande de pièce automobile", partsRequestForm, [
      ["name", "Nom"],
      ["phone", "Téléphone"],
      ["email", "Courriel"],
      ["year", "Année"],
      ["model", "Modèle"],
      ["vin", "VIN"],
      ["part", "pièce recherchée"]
    ]);

    sendSalesInquiry(message, partsFormNote, partsRequestForm);
  });
}

const exportForm = document.querySelector("#exportForm");
const exportFormNote = document.querySelector("#exportFormNote");

if (exportForm && exportFormNote) {
  exportForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = buildFormMessage("Demande de recherche et exportation de véhicule", exportForm, [
      ["name", "Nom"],
      ["country", "Pays"],
      ["city", "Ville"],
      ["whatsapp", "WhatsApp"],
      ["email", "Courriel"],
      ["budget", "Budget"],
      ["make", "Marque recherchée"],
      ["model", "Modèle recherché"],
      ["message", "Message"]
    ]);

    sendSalesInquiry(message, exportFormNote, exportForm);
  });
}


