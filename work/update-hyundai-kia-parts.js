const fs = require("node:fs");
const path = require("node:path");

const filePath = path.resolve(__dirname, "../outputs/pieces.html");
let html = fs.readFileSync(filePath, "utf8");

html = html.replace(/<article class="part-card">([\s\S]*?)(Hyundai Tucson|Kia Sportage)([\s\S]*?)<\/article>/g, (match) => {
  return match
    .replace(/<p><strong>Numéro OEM :<\/strong> À confirmer<\/p>/g, "")
    .replace(/<span class="status ordered">En commande<\/span>/g, '<span class="status special-order">Sur commande</span>')
    .replace(/ - OEM à confirmer/g, "");
});

fs.writeFileSync(filePath, html, "utf8");
