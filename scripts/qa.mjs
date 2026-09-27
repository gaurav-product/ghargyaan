import { chromium } from 'playwright';
// Requires a running preview server: npm run build && npm run preview -- --port 4173
const base = 'http://localhost:4173/';
const which = process.argv[2] ?? 'all';
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const errors = [];
async function shoot(ctx, name, hash, act) {
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${name}] ${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`[${name}] pageerror: ${e.message}`));
  await page.goto(base + '#' + hash, { waitUntil: 'networkidle' });
  if (act) await act(page);
  await page.waitForTimeout(500);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 0) errors.push(`[${name}] horizontal overflow ${overflow}px`);
  await page.screenshot({ path: `qa/${name}.png`, fullPage: true });
  await page.close();
}
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const desktop = await browser.newContext({ viewport: { width: 1280, height: 860 } });
const answerAll = async (p) => { for (let i = 0; i < 8; i++) { const b = p.locator('#clarify-q ~ div button').first(); if (!(await b.count())) break; await b.click(); await p.waitForTimeout(450); } };
const ask = (q) => async (p) => { await p.fill('#ask-input', q); await p.keyboard.press('Enter'); await p.waitForTimeout(700); };
const flows = {
  landing: [mobile, '/', null],
  home: [mobile, '/app', null],
  clarify: [mobile, '/app', ask('Mere pair mein chhota sa burn ho gaya')],
  result: [mobile, '/app', async (p) => { await ask('Mere pair mein chhota sa burn ho gaya')(p); await answerAll(p); }],
  myth: [mobile, '/app', async (p) => { await ask('Dadi bol rahi hain toothpaste burn par lagao. Is this correct?')(p); await answerAll(p); }],
  emergency: [mobile, '/app', ask('my son swallowed rat poison')],
  selfharm: [mobile, '/app', ask('I want to end my life')],
  explore: [mobile, '/explore', null],
  wisdom: [mobile, '/wisdom', null],
  guide: [mobile, '/guide/dc-sore-throat', null],
  profile: [mobile, '/profile', null],
  research: [mobile, '/research', null],
  desktop_landing: [desktop, '/', null],
  desktop_result: [desktop, '/app', async (p) => { await ask('Khansi ho rahi hai 2 din se')(p); await answerAll(p); }],
};
for (const [name, [ctx, hash, act]] of Object.entries(flows)) {
  if (which !== 'all' && !which.split(',').includes(name)) continue;
  await shoot(ctx, name, hash, act);
}
await browser.close();
console.log(errors.length ? errors.join('\n') : 'no console errors / overflow');
