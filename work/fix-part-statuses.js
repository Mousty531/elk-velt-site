const fs = require("node:fs");
const path = require("node:path");

const filePath = path.resolve(__dirname, "../outputs/pieces.html");
let html = fs.readFileSync(filePath, "utf8");

const nissanOems = new Map([
  ["Phare gauche", "À confirmer"],
  ["Phare droit", "À confirmer"],
  ["Pare-chocs avant sans trou", "62026-7LG0A"],
  ["Cache remorquage avant", "622A0-7LG0H"],
  ["Pare-chocs avant côté gauche", "62025-7LG0H"],
  ["Pare-chocs avant côté droit", "62024-7LG0H"],
  ["Pare-chocs arrière sans trou", "850B2-7LG0A"],
  ["Cache remorquage arrière", "85010-7LG0H"],
  ["Pare-chocs arrière côté gauche", "85017-7LG0H"],
  ["Pare-chocs arrière côté droit", "85016-7LG0H"],
  ["Grille SR", "62310-7LG0A"],
  ["Grille SL", "62310-7LG0A"],
  ["Support radiateur inférieur", "62660-7LG0A"],
  ["Support plaque avant", "96210-7LG0A"],
  ["Support pare-chocs avant gauche", "62225-7LG0A"],
  ["Support pare-chocs avant droit", "62224-7LG0A"],
  ["Support pare-chocs arrière gauche", "85221-7LG0A"],
  ["Support pare-chocs arrière droit", "85220-7LG0A"],
  ["Moulure pare-chocs avant", "62084-7LG0H"],
  ["Moulure pare-chocs arrière", "85072-7LG0H"],
]);

html = html.replace(/<article class="part-card">[\s\S]*?<\/article>/g, (article) => {
  const isHyundaiOrKia = article.includes("Hyundai Tucson") || article.includes("Kia Sportage");
  const name = article.match(/<h3>(.*?)<\/h3>/)?.[1];

  if (isHyundaiOrKia) {
    return article
      .replace(/<p><strong>Numéro OEM :<\/strong>.*?<\/p>/g, "")
      .replace(/<span class="status (?:ordered|special-order)">.*?<\/span>/g, '<span class="status special-order">Sur commande</span>')
      .replace(/ - OEM à confirmer/g, "");
  }

  const oem = nissanOems.get(name);
  let updated = article.replace(/<span class="status (?:ordered|special-order)">.*?<\/span>/g, '<span class="status ordered">En commande</span>');

  if (oem && !updated.includes("Numéro OEM")) {
    updated = updated.replace(
      /(<p><strong>Modèle compatible :<\/strong> Nissan Kicks 2025-2026<\/p>)/,
      `$1<p><strong>Numéro OEM :</strong> ${oem}</p>`
    );
  }

  return updated;
});

fs.writeFileSync(filePath, html, "utf8");
