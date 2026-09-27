import { chromium } from 'playwright';
// Requires a running preview server: npm run build && npm run preview -- --port 4173
import { readFileSync } from 'fs';
const axe = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const pages = ['/', '/app', '/explore', '/wisdom', '/guide/fa-minor-burn', '/profile', '/emergency', '/research', '/saved'];
for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: theme });
  const page = await ctx.newPage();
  for (const p of pages) {
    await page.goto('http://localhost:4173/#' + p, { waitUntil: 'networkidle' });
    await page.addScriptTag({ content: axe });
    const r = await page.evaluate(async () => await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] }));
    for (const v of r.violations) console.log(theme, p, v.id, v.impact, v.nodes.length, v.nodes.slice(0,2).map(n => n.target.join(' ') + ' :: ' + (n.failureSummary||'').split('\n')[1]).join(' || '));
  }
  // flow page
  await page.goto('http://localhost:4173/#/app', { waitUntil: 'networkidle' });
  await page.fill('#ask-input', 'Gala kharab hai'); await page.keyboard.press('Enter'); await page.waitForTimeout(600);
  for (let i=0;i<5;i++){ const b = page.locator('#clarify-q ~ div button').first(); if(!(await b.count())) break; await b.click(); await page.waitForTimeout(400);}
  await page.addScriptTag({ content: axe });
  const r = await page.evaluate(async () => await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] }));
  for (const v of r.violations) console.log(theme, 'RESULT', v.id, v.impact, v.nodes.length, v.nodes.slice(0,2).map(n => n.target.join(' ') + ' :: ' + (n.failureSummary||'').split('\n')[1]).join(' || '));
  await ctx.close();
}
await browser.close();
console.log('a11y done');
