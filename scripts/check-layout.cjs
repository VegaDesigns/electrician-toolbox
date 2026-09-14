const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.APP_URL || 'http://localhost:8098';
const out = process.env.TEST_REPORT_DIR || path.join(__dirname, '../test-results');
const routes = ['', 'settings', 'workpad', 'panel-colors', 'job-board', 'conduit-fill', 'box-fill', 'wire-guide', 'trade-talk', 'bending', 'previous-job-board'];
const themes = ['forest', 'ocean', 'clay', 'iris', 'graphite', 'tool-red', 'jobsite-yellow', 'electric-blue', 'hi-vis-green', 'caution-orange', 'steel'];
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}) });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const report = { errors: [], layouts: [], themes: [] };
  page.on('pageerror', e => report.errors.push(e.message));
  async function ready(route) {
    await page.goto(base + '/' + route);
    await page.waitForFunction(() => document.querySelectorAll('[role="button"], [role="radio"]').length > 1 && !/Loading (?:your|jobsite|workpad|bender|wire guide|trade talk)/i.test(document.body.innerText));
  }
  for (const route of routes) {
    await ready(route);
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        smallTargets: [...document.querySelectorAll('[role="button"], [role="tab"], [role="checkbox"]')].flatMap(e => {
          const r = e.getBoundingClientRect();
          return r.width && r.height && (r.width < 47.5 || r.height < 47.5) ? [{ label: e.getAttribute('aria-label') || e.textContent, width: Math.round(r.width), height: Math.round(r.height) }] : [];
        }),
      }));
      report.layouts.push({ route: route || 'home', width, ...layout });
      if (width === 320) await page.screenshot({ path: path.join(out, `fixed-${route || 'home'}-320.png`) });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const themeId of themes) for (const mode of ['light', 'dark']) {
    await page.evaluate(value => localStorage.setItem('electrician-toolbox:appearance:v1', JSON.stringify(value)), { version: 1, themeId, mode });
    for (const route of ['', 'workpad', 'job-board', 'conduit-fill', 'bending']) {
      await ready(route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      report.themes.push({ themeId, mode, route: route || 'home', overflow });
      if (themeId === 'tool-red' && mode === 'dark' && !route) await page.screenshot({ path: path.join(out, 'fixed-home-tool-red-dark.png') });
    }
  }
  fs.writeFileSync(path.join(out, 'reliability-layout-checks.json'), JSON.stringify(report, null, 2));
  await browser.close();
  console.log(JSON.stringify({ errors: report.errors, layouts: report.layouts.length, themeScreens: report.themes.length, smallTargets: report.layouts.filter(x => x.smallTargets.length), overflow: [...report.layouts, ...report.themes].filter(x => x.overflow) }, null, 2));
  assert.deepEqual(report.errors, []);
  assert.equal([...report.layouts, ...report.themes].some(x => x.overflow), false);
})().catch(e => { console.error(e); process.exitCode = 1; });
