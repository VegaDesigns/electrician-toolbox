// Run against an exported app served locally. Every case uses disposable storage.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.APP_URL || 'http://localhost:8098';
const out = process.env.TEST_REPORT_DIR || path.join(__dirname, '../test-results');
const only = process.argv[2];
const listKey = 'electrician-toolbox:material-lists:v1';
const exampleList = { id: 'test-list', title: 'Hallway materials', lines: [{ id: 'couplings', text: '4 - Couplings', kind: 'material', done: false, previous: [] }], completed: false, createdAt: 1 };

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}) });
  const report = { cases: [], errors: [] };
  async function run(name, check) {
    if (only && only !== name) return;
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, colorScheme: 'light' });
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    try {
      const details = await check(page);
      assert.deepEqual(errors, []);
      report.cases.push({ name, passed: true, details });
      console.log(`PASS ${name}`);
    } catch (e) {
      report.cases.push({ name, passed: false, error: e.message });
      await page.screenshot({ path: path.join(out, `failed-${name}.png`) }).catch(() => {});
      console.log(`FAIL ${name}: ${e.message}`);
    } finally { report.errors.push(...errors); await page.close(); }
  }
  async function seed(page, values) {
    await page.goto(base);
    await page.getByRole('button', { name: 'Workpad', exact: true }).waitFor();
    await page.evaluate(values => { for (const [key, value] of Object.entries(values)) localStorage.setItem(key, JSON.stringify(value)); }, values);
  }
  async function saved(page, key) { return page.evaluate(k => JSON.parse(localStorage.getItem(k)), key); }
  async function readFailure(page, key) {
    await page.addInitScript(key => {
      const get = Storage.prototype.getItem;
      let failed = false;
      Storage.prototype.getItem = function (k) {
        if (k === key && !failed) { failed = true; throw Error('Test read failure'); }
        return get.call(this, k);
      };
    }, key);
  }
  const button = (p, name) => p.getByRole('button', { name, exact: true });
  await run('keypad-scaling', async p => {
    await p.goto(base + '/workpad');
    for (const name of ['2', 'Feet', 'Multiply', '3', 'Calculate']) await button(p, name).click();
    const key = 'electrician-toolbox:calc-history:v1';
    await p.waitForFunction(k => JSON.parse(localStorage.getItem(k) || '[]')[0]?.rawValue === 72, key);
    assert.equal(await p.getByRole('alert').count(), 0);
    const history = await saved(p, key);
    assert.equal(history[0].resultKind, 'measure');
    await p.screenshot({ path: path.join(out, 'fixed-workpad.png') });
    return { expression: history[0].expression, result: history[0].result, inches: history[0].rawValue };
  });
  await run('fill-drafts-and-reset', async p => {
    await p.goto(base + '/conduit-fill');
    await button(p, 'Increase #12 wire quantity').click();
    await p.getByRole('button', { name: /Add another wire size/ }).click();
    await p.getByRole('tab', { name: 'Box', exact: true }).click();
    await button(p, 'Add one device').click();
    await button(p, 'Increase #12 wire quantity').click();
    await p.getByRole('tab', { name: 'Conduit', exact: true }).click();
    await button(p, 'Edit #12 wire quantity, current value 4').waitFor();
    assert.equal(await button(p, 'Remove this wire row').count(), 2);
    await p.getByRole('tab', { name: 'Box', exact: true }).click();
    await button(p, 'Largest wire attached to devices #12').waitFor();
    await button(p, 'Edit #12 wire quantity, current value 4').waitFor();
    await button(p, 'Reset box calculation').click();
    await button(p, 'Edit #12 wire quantity, current value 3').waitFor();
    assert.equal(await button(p, 'Largest wire attached to devices #12').count(), 0);
    await p.getByRole('tab', { name: 'Conduit', exact: true }).click();
    await button(p, 'Edit #12 wire quantity, current value 4').waitFor();
    await button(p, 'Reset conduit calculation').click();
    await button(p, 'Edit #12 wire quantity, current value 3').waitFor();
    return { bothDraftsRetained: true, resetsIndependent: true };
  });
  await run('home-navigation', async p => {
    await p.goto(base);
    const lengths = [await p.evaluate(() => history.length)];
    for (let i = 0; i < 3; i++) {
      await button(p, 'Workpad').click();
      await button(p, 'Return to toolbox home').click();
      await button(p, 'Workpad').waitFor();
      lengths.push(await p.evaluate(() => history.length));
    }
    assert.equal(lengths[3], lengths[1]);
    await p.goto(base + '/wire-guide');
    await button(p, 'Return to toolbox home').click();
    await button(p, 'Workpad').waitFor();
    return { lengths, directLinkReturn: true };
  });
  await run('previous-board-access', async p => {
    const key = 'electrician-toolbox:job-board:v1';
    const old = { jobs: [], items: [{ id: 'legacy', kind: 'task', title: 'Existing customer punch list', status: 'open', jobId: null, location: '', priority: 'normal', dueOn: null, estimateMinutes: null, notes: '', quantity: 1, unit: 'ea', checklist: [], materials: [], createdAt: 1, updatedAt: 1, completedAt: null }] };
    await seed(p, { [key]: old });
    await button(p, 'Jobsite Lists').click();
    await button(p, 'Previous Job Board →').click();
    await p.getByText('Existing customer punch list', { exact: true }).waitFor();
    assert.deepEqual(await saved(p, key), old);
    await button(p, 'Back to Jobsite Lists').click();
    await button(p, 'Previous Job Board →').waitFor();
    return { originalDataIntact: true, normalNavigation: true };
  });
  await run('list-load-error-return', async p => {
    await seed(p, { [listKey]: { invalid: true } });
    await button(p, 'Jobsite Lists').click();
    await button(p, 'Retry loading').waitFor();
    assert.equal(await button(p, 'Return to toolbox home').isEnabled(), true);
    await p.screenshot({ path: path.join(out, 'fixed-storage-recovery.png') });
    await button(p, 'Return to toolbox home').click();
    await button(p, 'Workpad').waitFor();
    assert.deepEqual(await saved(p, listKey), { invalid: true });
    return { canLeave: true, savedDataUnchanged: true };
  });
  for (const [name, route, key, old] of [
    ['trade-talk', 'trade-talk', 'electrician-toolbox:trade-talk:v1', { favoriteIds: ['pigtail'], recentIds: ['pigtail'] }],
    ['wire-guide', 'wire-guide', 'electrician-toolbox:wire-guide:v1', { material: 'aluminum', size: '4', lugRating: '75', ambientBand: '96-104', conductorCountBand: '4-6' }],
    ['workpad', 'workpad', 'electrician-toolbox:preferences:v1', { precision: 32 }],
    ['bender', 'bending', 'bending-suite-v1', { settings: { size: 2, deduction: 8, precision: 32, method: 'geometry' }, bend: 'offset', drafts: { offset: { height: '17', roll: '8', bridge: '12', span: '24', location: '40', angle: 45, center: 45 } } }],
    ['lists', 'job-board', listKey, { lists: [exampleList] }],
  ]) await run(`${name}-read-recovery`, async p => {
    await seed(p, { [key]: old }); await readFailure(p, key); await p.goto(base + '/' + route);
    await button(p, 'Retry loading').waitFor();
    assert.deepEqual(await saved(p, key), old);
    await button(p, 'Retry loading').click();
    await button(p, 'Retry loading').waitFor({ state: 'hidden' });
    assert.equal(await p.getByRole('alert').count(), 0);
    assert.deepEqual(await saved(p, key), old);
    if (name === 'bender') await button(p, 'Change bend type, currently Offset').waitFor();
    return { preservedBeforeAndAfterRetry: true };
  });
  await run('list-write-recovery-and-leave', async p => {
    await seed(p, { [listKey]: { lists: [exampleList] } });
    await button(p, 'Jobsite Lists').click();
    await p.getByRole('button', { name: /Hallway materials/ }).click();
    await p.evaluate(key => {
      const set = Storage.prototype.setItem;
      window.allowTestWrites = false;
      Storage.prototype.setItem = function (k, v) { if (k === key && !window.allowTestWrites) throw Error('Test write failure'); return set.call(this, k, v); };
    }, listKey);
    await p.getByRole('checkbox', { name: 'Collected: 4 - Couplings', exact: true }).click();
    await button(p, 'Retry saving').waitFor();
    await button(p, 'Back to lists').click();
    await button(p, 'Keep editing').click();
    await button(p, 'Back to lists').click();
    await button(p, 'Leave anyway').click();
    await button(p, 'Return to toolbox home').click();
    await button(p, 'Leave anyway').click();
    await button(p, 'Workpad').waitFor();
    await button(p, 'Jobsite Lists').click();
    await button(p, 'Retry saving').waitFor();
    await p.evaluate(() => { window.allowTestWrites = true; });
    await button(p, 'Retry saving').click();
    await p.waitForFunction(key => JSON.parse(localStorage.getItem(key)).lists[0].lines[0].done, listKey);
    return { guardedArrow: true, unsavedChangeRetainedAcrossNavigation: true, retrySaved: true };
  });
  await run('list-browser-back-draft', async p => {
    await seed(p, { [listKey]: { lists: [exampleList] } });
    await button(p, 'Jobsite Lists').click();
    await p.getByRole('button', { name: /Hallway materials/ }).click();
    await button(p, '+ Add item').click();
    await p.getByRole('textbox', { name: 'Material text', exact: true }).fill('Unfinished connector entry');
    await p.evaluate(() => history.back());
    await button(p, 'Jobsite Lists').click();
    assert.equal(await p.getByRole('textbox', { name: 'Material text', exact: true }).inputValue(), 'Unfinished connector entry');
    return { browserBackDraftRestored: true };
  });
  await run('list-undo-and-copy', async p => {
    await p.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await seed(p, { [listKey]: { lists: [exampleList] } });
    await button(p, 'Jobsite Lists').click();
    await p.getByRole('button', { name: /Hallway materials/ }).click();
    await button(p, 'List options').click(); await button(p, 'Copy list').click();
    assert.match(await p.evaluate(() => navigator.clipboard.readText()), /\[ \] 4 - Couplings/);
    await button(p, 'List options').click(); await button(p, 'Delete list').click(); await button(p, 'Delete list').click();
    await button(p, 'Undo').waitFor(); await p.mouse.move(0, 0); await p.waitForTimeout(22000);
    await button(p, 'Undo').click();
    await p.getByRole('button', { name: /Hallway materials/ }).waitFor();
    await p.waitForFunction(key => JSON.parse(localStorage.getItem(key)).lists.length === 1, listKey);
    assert.deepEqual((await saved(p, listKey)).lists[0], exampleList);
    return { undoAfter22Seconds: true, fullListRestored: true, clipboardVerified: true };
  });
  await run('trade-talk-complete-browse', async p => {
    const ids = ['battleship', 'smurf-tube', 'four-square', 'beater', 'home-run', 'ticker'];
    await seed(p, { 'electrician-toolbox:trade-talk:v1': { favoriteIds: ids, recentIds: [] } });
    await button(p, 'Trade Talk').click();
    await button(p, 'All').waitFor();
    const expected = Number((await p.locator('body').innerText()).match(/(\d+) TERMS/)[1]);
    const rows = p.getByTestId(/^trade-entry-/);
    const allCount = await rows.count();
    assert.equal(allCount, expected + ids.length);
    await button(p, 'Favorites').click();
    assert.equal(await rows.count(), ids.length);
    return { dictionaryCount: expected, favoritesVisible: ids.length };
  });
  await run('home-large-text', async p => {
    await p.goto(base); await button(p, 'Workpad').waitFor();
    await p.evaluate(() => {
      for (const e of document.querySelectorAll('div,span')) if ([...e.childNodes].some(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim())) {
        const s = getComputedStyle(e); e.style.fontSize = parseFloat(s.fontSize) * 1.5 + 'px';
        if (s.lineHeight !== 'normal') e.style.lineHeight = parseFloat(s.lineHeight) * 1.5 + 'px';
      }
    });
    const clipped = await p.getByRole('button').evaluateAll(es => es.filter(e => e.scrollHeight > e.clientHeight + 2).map(e => e.getAttribute('aria-label')));
    assert.deepEqual(clipped, []);
    await p.screenshot({ path: path.join(out, 'fixed-home-larger-text.png') });
    return { clippedTiles: clipped, simulation: '150% browser text; native text scaling needs phone confirmation' };
  });
  fs.writeFileSync(path.join(out, only ? `web-check-${only}.json` : 'reliability-web-checks.json'), JSON.stringify(report, null, 2));
  await browser.close();
  if (report.cases.some(c => !c.passed)) process.exitCode = 1;
})().catch(e => { console.error(e); process.exitCode = 1; });
