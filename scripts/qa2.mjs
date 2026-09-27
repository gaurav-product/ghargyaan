import { chromium } from 'playwright';
// Requires a running preview server: npm run build && npm run preview -- --port 4173
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const errors = [];
const mk = async (opts) => { const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, ...opts }); const p = await ctx.newPage(); p.on('pageerror', e => errors.push('pageerror ' + e.message)); p.on('console', m => { if (m.type()==='error') errors.push('console ' + m.text()); }); return p; };
const answerAll = async (p) => { for (let i = 0; i < 8; i++) { const b = p.locator('#clarify-q ~ div button').first(); if (!(await b.count())) break; await b.click(); await p.waitForTimeout(400); } };
// 1 Hindi
let p = await mk({});
await p.goto('http://localhost:4173/#/app'); await p.waitForTimeout(400);
await p.getByRole('button', { name: 'हिंदी में देखें' }).click(); await p.waitForTimeout(300);
await p.screenshot({ path: 'qa/hindi_home.png' });
await p.fill('#ask-input', 'गले में खराश है'); await p.keyboard.press('Enter'); await p.waitForTimeout(600);
await p.screenshot({ path: 'qa/hindi_clarify.png' });
// 2 Dark result + drawer
p = await mk({ colorScheme: 'dark' });
await p.goto('http://localhost:4173/#/app'); await p.fill('#ask-input', 'Bacche ko mosquito bite ho gaya'); await p.keyboard.press('Enter'); await p.waitForTimeout(600); await answerAll(p);
await p.screenshot({ path: 'qa/dark_result.png' });
await p.getByRole('button', { name: 'Why am I seeing this?' }).first().click(); await p.waitForTimeout(400);
await p.screenshot({ path: 'qa/dark_drawer.png' });
await p.keyboard.press('Escape'); await p.waitForTimeout(200);
const dlgOpen = await p.evaluate(() => !!document.querySelector('dialog[open]'));
console.log('dialog closes on Esc:', !dlgOpen);
// 3 image flow
p = await mk({});
await p.goto('http://localhost:4173/#/app'); await p.waitForTimeout(300);
await p.setInputFiles('input[type=file]', 'public/icon-512.png'); await p.waitForTimeout(600);
await p.getByRole('button', { name: 'Get guidance' }).click(); await p.waitForTimeout(300);
const notice = await p.locator('[role=status]').first().textContent();
console.log('image-without-context notice:', notice);
await p.getByRole('button', { name: 'A burn', exact: true }).click();
await p.getByRole('button', { name: 'Get guidance' }).click(); await p.waitForTimeout(700); await answerAll(p);
await p.screenshot({ path: 'qa/image_result.png' });
console.log('image disclaimer shown:', await p.getByText('from this image alone').count());
// bad file
await p.goto('http://localhost:4173/#/app'); await p.waitForTimeout(300);
await p.setInputFiles('input[type=file]', 'package.json'); await p.waitForTimeout(300);
console.log('bad file notice:', await p.locator('[role=status]').first().textContent());
// empty submit
await p.getByRole('button', { name: 'Get guidance' }).click(); await p.waitForTimeout(200);
console.log('empty notice:', await p.locator('[role=status]').first().textContent());
// 4 voice
await p.getByRole('button', { name: 'Speak' }).click(); await p.waitForTimeout(1500);
console.log('voice notice:', await p.locator('[role=status]').first().textContent().catch(() => 'none'));
// 5 keyboard
p = await mk({});
await p.goto('http://localhost:4173/#/app'); await p.waitForTimeout(300);
const seq = [];
for (let i = 0; i < 8; i++) { await p.keyboard.press('Tab'); seq.push(await p.evaluate(() => (document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent || document.activeElement?.tagName || '').trim().slice(0, 30))); }
console.log('tab order:', seq.join(' | '));
await p.keyboard.press('Tab');
// 6 saved + guide flow
await p.goto('http://localhost:4173/#/guide/dc-sore-throat'); await p.getByRole('button', { name: 'Save guide' }).click();
await p.goto('http://localhost:4173/#/saved'); await p.waitForTimeout(300);
console.log('saved count:', await p.locator('main li').count());
await p.goto('http://localhost:4173/#/guide/dc-sore-throat'); await p.getByRole('button', { name: /Check my situation/ }).click(); await p.waitForTimeout(600);
console.log('guide->clarify:', await p.locator('#clarify-q').textContent());
// 7 back button in clarify
await p.locator('#clarify-q ~ div button').first().click(); await p.waitForTimeout(400);
await p.getByRole('button', { name: 'Back' }).click(); await p.waitForTimeout(300);
console.log('after back:', await p.locator('#clarify-q').textContent());
await browser.close();
console.log(errors.length ? errors.join('\n') : 'no errors');
