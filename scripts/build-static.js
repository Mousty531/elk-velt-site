const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = path.join(root, "outputs");
const target = path.join(root, "dist");

function copyDirectory(from, to) {
  fs.mkdirSync(to, { recursive: true });

  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const sourcePath = path.join(from, entry.name);
    const targetPath = path.join(to, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

if (!fs.existsSync(source)) {
  throw new Error("Le dossier outputs est introuvable.");
}

fs.rmSync(target, { recursive: true, force: true });
copyDirectory(source, target);
console.log("Build termine : outputs copie dans dist.");

