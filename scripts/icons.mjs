import { chromium } from 'playwright';
import { readFileSync } from 'fs';
const svg = readFileSync('public/icon.svg', 'utf8');
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage();
for (const size of [192, 512]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi&display=swap"></head><body style="margin:0">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `public/icon-${size}.png`, omitBackground: false });
}
await browser.close();
console.log('icons done');
