# Reliability and usability checks

Repair branch: `fix/reliability-and-ux`, based on the accepted theme milestone on `main` (`cd7fc24`). Ohm's law and movable home tiles remain separate future work.

## Automated checks

Use Node 22.13 or newer, then `npm ci` and `npm run check`. The suite covers 131 cases, including real keypad sequences, typed entry, signed measurements, dimensional validation, storage failure/retry, independent Fill Guide drafts, list sharing, and the existing electrical, bending, history, and theme checks.

`npm run doctor` checks Expo configuration and package compatibility.

For browser checks, export the app with `npm run export:web` and serve `dist` using an SPA/static server on port 8098. Then run:

```sh
npx playwright install chromium
npm run test:web
node scripts/check-layout.cjs
```

`APP_URL` can select another preview URL. `BROWSER_CHANNEL=msedge` uses an installed Microsoft Edge instead of downloaded Chromium. `TEST_REPORT_DIR` selects the receipt/screenshot directory; the default is ignored `test-results/`. `npm run test:web -- case-name` reruns one case. The browser tests use isolated contexts and disposable fixtures, including injected read/write failures, and never open the user's browser storage.

The browser suite checks 15 flows. The layout sweep checks all 11 user routes at 320, 390, and 768 pixels, then five representative screens in all 22 light/dark palettes. Text scaling is simulated separately at 150% on Home. These are browser measurements, not native Dynamic Type tests.

## Phone acceptance

- On iPhone and Android, calculate `2 ft × 3`, `2 ft ÷ 2`, and a typed mixed expression; reopen history and verify the displayed units.
- Make a list, rename it, add notes/material quantities, mark collected, copy/share, delete, and Undo. Undo remains available while that Lists screen is open, including after 22 seconds.
- While editing, use Android Back and the visible arrow. Keep editing must retain the entry; leaving must complete without another prompt. Browser Back may bypass a native route guard, so unfinished list forms also remain in memory and reopen when returning to Lists. Reload/close warns while an unsaved Lists screen is active; session drafts do not survive an app restart.
- Move between Conduit and Box after changing multiple fields and wire rows. Both calculations should remain until their own Reset is pressed or the app session ends.
- Raise system text size, use VoiceOver/TalkBack, open the quantity keyboard and list sheets, and confirm every control remains reachable.
- Check light/dark/System with the saved theme; confirm phase-wire and pipe illustration colors remain physically meaningful.
- Verify manufacturer-specific bend deductions and the applicable electrical references in the field. A successful bundle or software test does not validate a physical installation.

## Persistence contract

The shared persistent stores never save while loading, and never turn a failed read into defaults. Missing keys may initialize defaults. A read failure blocks edits and offers Retry loading. Saves are serialized; failed saves retain the newest in-memory value and offer Retry saving. Lists also guard unsaved changes on native route removal and warn before browser reload/close while the screen is active.

The old Job Board and current Jobsite Lists keep separate keys. Previous Job Board is reachable from Lists; this repair does not migrate or rewrite that data. Fill Guide and unfinished list-entry drafts are session-only. Copy/Share exports readable text; backup import, account sync, and paid entitlements are not implemented.

## Dependency advisory follow-up

Compatible SDK 57 patch updates and targeted transitive updates remove the high-severity alerts found during this pass. The remaining npm audit findings are moderate upstream dependency chains involving `uuid` through `xcode` and `decode-uri-component` through `query-string`. npm proposes incompatible Expo/Router downgrades for these chains. Keep them visible; do not run a forced downgrade or claim the dependency audit is clear. Recheck upstream fixes before a release.

Native dependencies changed. An old installed 0.9.1 build does not acquire these repairs automatically; confirm runtime compatibility and make a new internal build before distributing native updates.
