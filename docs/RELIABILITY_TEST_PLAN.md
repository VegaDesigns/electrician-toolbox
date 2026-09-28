# Reliability and usability checks

Repair branch: `fix/reliability-and-ux`, based on the accepted theme milestone on `main` (`cd7fc24`). Current local launch-readiness version: 0.9.3. This is not a public-release approval. Ohm's law, movable home tiles, payments and account sync remain outside this checkpoint.

## Automated checks

Use Node 22.13 or newer, then `npm ci` and `npm run check`. The suite covers keypad sequences, direct caret entry, signed measurements, dimensional validation, storage failure/retry, independent Fill Guide drafts, list sharing, timed Undo, backup validation/transactions, release configuration, and existing electrical, bending, history and theme checks. All 175 tests, ESLint and TypeScript passed after root integration, including the restore-notice dismissal regression.

`npm run doctor` checks Expo configuration and package compatibility; the current pass completed 21/21 checks. `npm run release:check` separately reports ten unresolved public-release gates. It is expected to fail until genuine outside reviews and owner decisions are recorded; passing software tests does not satisfy those gates.

## Current launch-groundwork verification

- Browser Help check: report composition, exact payload review and Copy. Reports include only entered feedback and displayed app metadata, not saved jobs or device identifiers.
- Browser restore check: disposable data on the separate `127.0.0.1` origin restored one list, one material and one note, plus the Ocean/Dark appearance. The user's `localhost` data was not the restore target.
- Independent backup fault exercise: 150 failure/recovery scenarios checked separately from the automated suite, with no mixed old/new records observed. This is additional software evidence, not 150 more suite tests or native-device acceptance.
- `BackupBoundary` and the themed `BackupNotice` are integrated at the root; restore clears cached screen/appearance state and acknowledges the outcome. Dismissing the notice must not remount or clear work again.
- Local production exports compiled successfully for iOS, Android and web, with 15 static routes. These are compilation checks, not native build/install acceptance. `release:check` returned the expected exit code 1 with ten unresolved gates.
- Native Files/share/picker behavior, VoiceOver and real-device interruption/recovery remain pending. The older installed 0.9.2 (8) does not contain these changes.

For browser checks, export the app with `npm run export:web` and serve `dist` using an SPA/static server on port 8098. Then run:

```sh
npx playwright install chromium
npm run test:web
node scripts/check-layout.cjs
```

`APP_URL` can select another preview URL. `BROWSER_CHANNEL=msedge` uses an installed Microsoft Edge instead of downloaded Chromium. `TEST_REPORT_DIR` selects the receipt/screenshot directory; the default is ignored `test-results/`. `npm run test:web -- case-name` reruns one case. The browser tests use isolated contexts and disposable fixtures, including injected read/write failures, and never open the user's browser storage.

The historical browser suite checked 15 flows. The earlier layout sweep checked 11 user routes at 320, 390, and 768 pixels (33 route/viewport checks), then five representative screens in all 22 light/dark palettes (110 themed-screen checks). Text scaling was simulated separately at 150% on Home. Those full sweeps were not rerun during this launch-groundwork pass and do not cover the new Help/Backup routes. They are browser measurements, not native Dynamic Type tests. Rerun and extend the checks before release.

## Phone acceptance

- Initial release acceptance targets iPhone. Android remains a regression concern if retained in source, not an approved launch platform. Calculate `2 ft × 3`, `2 ft ÷ 2`, and a typed mixed expression; reopen history and verify units. Edit `153in - 135in` by inserting `.5` after `153`; check 18.5 inches. Verify rapid entry and selection handles on the native device.
- Make a list, rename it, add notes/material quantities, mark collected, copy/share, delete, and Undo. The normal removal window is five seconds with a shrinking line, then the bar and pending Undo expire. It pauses while saving, on save errors, behind covering forms/dialogs and in the background. Screen-reader allowance is longer; Reduce Motion must not stop expiry. It is no longer an indefinite Undo bar.
- While editing, use Android Back and the visible arrow. Keep editing must retain the entry; leaving must complete without another prompt. Browser Back may bypass a native route guard, so unfinished list forms also remain in memory and reopen when returning to Lists. Reload/close warns while an unsaved Lists screen is active; session drafts do not survive an app restart.
- Move between Conduit and Box after changing multiple fields and wire rows. Both calculations should remain until their own Reset is pressed or the app session ends.
- Raise system text size, use VoiceOver/TalkBack, open the quantity keyboard and list sheets, and confirm every control remains reachable.
- Check light/dark/System with the saved theme; confirm phase-wire and pipe illustration colors remain physically meaningful.
- Verify manufacturer-specific bend deductions and the applicable electrical references in the field. A successful bundle or software test does not validate a physical installation.
- Export a disposable nine-domain backup with native Save to Files, find it, import it, review its contents, cancel once and then confirm replacement. Verify lists/notes, retained legacy work, history, presets, bender setup and theme. No merge is promised. Export current work before any replacement test.
- Reject malformed, oversized and unsupported-version files without changing saved data. Exercise interrupted restore/recovery with disposable data, including cold launch. Recovery must block normal access if original data cannot yet be recovered; do not uninstall the app as a workaround.
- Confirm imported theme applies, unfinished session drafts clear only after accepted restore, and the restoration/recovery notice survives navigation remount but disappears after Continue. Notice dismissal must preserve subsequent work.
- Check export cancellation and temporary-file cleanup. Backup files are not encrypted by the app; sharing destinations are user-controlled. A successful share-sheet opening does not prove a file was saved.
- Read Help, compose and review sample feedback, Copy and Share it, then confirm exactly what the recipient receives. No private job information should be attached automatically. Check large text, keyboard visibility and leave-with-unfinished-feedback behavior.

Use [the field-test guide](V1_FIELD_TEST_GUIDE.md) for the 5–10 coworker sessions and issue records. Invitations, installation and completed testing are not implied by the prepared `fieldtest` build profile.

## Persistence contract

The shared persistent stores never save while loading, and never turn a failed read into defaults. Missing keys may initialize defaults. A read failure blocks edits and offers Retry loading. Saves are serialized; failed saves retain the newest in-memory value and offer Retry saving. Lists also guard unsaved changes on native route removal and warn before browser reload/close while the screen is active.

The old Job Board and current Jobsite Lists keep separate keys. Previous Job Board remains reachable; the backup contains both without merging them. Fill Guide and unfinished entry drafts are session-only. List Copy/Share is readable text, distinct from the versioned JSON backup. Account sync and paid entitlements are not implemented.

Manual backup captures nine persisted app domains only after pending saves settle. App-wide storage serialization prevents ordinary writes interleaving with restore. Restore validates a supported file, previews its scope, asks for explicit replacement confirmation, journals exact originals, applies and verifies records, and rolls back on failure. Startup recovery checks unfinished journals before normal storage access. If recovery cannot complete, the app protects saved data and exposes Retry rather than silently resetting it.

Root remount after successful restore occurs after exclusive storage unlock; it reloads the saved theme and resets in-memory stores/session drafts. The retained Job Board save queue participates in settlement so a delayed old save cannot overwrite the restored state. Appearance and calculator history use the same persistence gate. `BackupNotice` acknowledges restored or recovered work without another data reset when dismissed.

See [the privacy inventory](V1_PRIVACY_INVENTORY.md) for storage keys, export sensitivity and SDK/network caveats. Offline-first is not a claim that Expo updates, TestFlight, the operating system or chosen share destinations perform no network activity.

## Dependency advisory follow-up

The current npm audit reports 15 moderate advisories and no high or critical findings. Remaining upstream dependency chains include `uuid` through `xcode` and `decode-uri-component` through `query-string`. Compatible SDK 57 patches were applied. npm may propose incompatible Expo/Router downgrades for the remaining chains: do not force those downgrades or claim the dependency audit is clear. Recheck the exact lockfile before release.

Version 0.9.3 adds native document-picker, file-system and sharing modules and uses a new appVersion-policy update runtime. The installed 0.9.2 (8) does not acquire them automatically. Prepare a fresh authorized native build; do not publish an incompatible JavaScript update to the old runtime. The new store-distribution `fieldtest` profile uses a separate channel from production, but no build, upload, commit or push was performed in this preparation pass.

## Remaining release gates

[The launch tracker](V1_LAUNCH_TRACKER.md) records owner decisions and Brokecoderlabs homework. Final name, seller identity, real support contact/page, approved privacy/license information, qualified electrical review, commercial content rights, external field-test results and installed-iPhone backup acceptance remain open. [The electrical review worksheet](V1_ELECTRICAL_REVIEW.md) separates software regression expectations from independent verification. Removing a code-reference label is not content-rights clearance. Payments remain disabled; monetization is a later approved milestone.
