const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../outputs");
const files = ["index.html", "inventaire.html", "pieces.html", "contact.html", "exportation.html"];

function nav(active) {
  const items = [
    ["index.html", "Accueil", "index"],
    ["inventaire.html", "Véhicules", "inventaire"],
    ["pieces.html", "Pièces", "pieces"],
    ["exportation.html", "Exportation sur mesure", "exportation"],
    ["contact.html", "Contact", "contact"],
  ];

  return `<nav class="site-nav" aria-label="Navigation principale">
      ${items.map(([href, label, key]) => `<a${key === active ? ' class="active"' : ""} href="${href}">${label}</a>`).join("\n      ")}
    </nav>`;
}

for (const file of files) {
  const filePath = path.join(root, file);
  let html = fs.readFileSync(filePath, "utf8");
  const active =
    file === "index.html" ? "index" :
    file === "inventaire.html" ? "inventaire" :
    file === "pieces.html" ? "pieces" :
    file === "exportation.html" ? "exportation" :
    "contact";

  html = html.replace(/<link rel="stylesheet" href="assets\/styles\.css\?v=\d+">/, '<link rel="stylesheet" href="assets/styles.css?v=15">');
  html = html.replace(/<nav class="site-nav" aria-label="Navigation principale">[\s\S]*?<\/nav>/, nav(active));
  fs.writeFileSync(filePath, html, "utf8");
}

const indexPath = path.join(root, "index.html");
let index = fs.readFileSync(indexPath, "utf8");
index = index
  .replace(/Voir l'inventaire/g, "Voir les véhicules")
  .replace(/Recherche de véhicule sur demande/g, "Recherche de véhicule sur demande")
  .replace(/href="contact\.html">Recherche de véhicule sur demande/g, 'href="exportation.html">Recherche de véhicule sur demande')
  .replace(/Inventaire commercial/g, "Véhicules commerciaux");
fs.writeFileSync(indexPath, index, "utf8");

const piecesPath = path.join(root, "pieces.html");
let pieces = fs.readFileSync(piecesPath, "utf8");
pieces = pieces
  .replace(/Pièces sur commande/g, "Disponible sur commande")
  .replace(/<span class="status special-order">Sur commande<\/span>/g, '<span class="status special-order">Disponible sur commande</span>');
fs.writeFileSync(piecesPath, pieces, "utf8");
