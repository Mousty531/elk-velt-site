const path = require("node:path");
const { chromium } = require("C:/Users/LalogistiqueElkVelt/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const outputDir = path.resolve(__dirname, "../outputs/screenshots");
const pages = [
  ["accueil", "http://localhost:4173/index.html"],
  ["inventaire", "http://localhost:4173/inventaire.html"],
  ["pieces-nissan-kicks", "http://localhost:4173/pieces-nissan-kicks.html"],
  ["contact", "http://localhost:4173/contact.html"],
];

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });

  for (const [name, url] of pages) {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.addStyleTag({
      content: ".site-header{position:static!important;top:auto!important}",
    });
    await page.screenshot({
      path: path.join(outputDir, `${name}.png`),
      fullPage: true,
    });
  }

  await browser.close();
})();
