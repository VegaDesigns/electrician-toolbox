# Electrician Toolbox

An offline-first React Native / Expo toolkit for helpers and experienced electricians.
Version 0.9.3 is a local launch-readiness checkpoint, not an approved public Version 1.0 release.
The current phone installation remains 0.9.2 (8); no new build, upload, commit or push
was made during this preparation pass.

## Included tools

The shared Studio appearance system is accepted on main. Open the top-right home menu to
choose six bold Jobsite themes (Tool Red, Jobsite Yellow, Electric Blue, Hi-Vis Green,
Caution Orange, Steel) or the original five Studio themes in Light, Dark, or System appearance.
Follow [the shared style guide](docs/STYLE_GUIDE.md) for UI changes and
[the appearance checklist](docs/STUDIO_THEME_TEST_PLAN.md). This repair branch adds
[reliability and usability fixes](docs/RELIABILITY_TEST_PLAN.md) for review before merging.

- Workpad: measurement math, fractions, contextual unit conversion, precision settings, recent/saved history, and direct caret editing of equations with the calculator keypad.
- Panel Colors: explicit circuit submission, phase/color results, nearby circuits, and job-specific presets.
- Jobsite Lists: separate jobs, materials with quantities, notes, edit history, a pausable five-second Undo countdown, copy/share, and swipe actions. The previous Job Board has its own link.
- Fill Guide: conduit and box fill with common selections, mixed conductor groups, direct quantity entry, and independent session drafts with Reset.
- Wire Guide: conductor ampacity and adjustment guidance.
- Trade Talk: the complete offline dictionary, favorites, electrical definitions, and jobsite slang.
- Bending Suite: 90° stub-up, offset, rolling offset, three- and four-point saddles, back-to-back 90s, and box offset.

Each tool has its own route behind the responsive card home. Calculations and domain
models live in src/utils; feature UI lives in src/screens. Local preferences and
saved work use AsyncStorage. Cloud sync and subscription billing are not implemented.

## Launch groundwork

The approved initial audience is United States iPhone users: offline-first, no mandatory
account, no ads, and manual backups. New widgets are paused while the existing tools
are verified. Store territory still needs to be configured in App Store Connect.

- Settings now opens **Backup & restore** and **Help & app information** instead of an Account placeholder, and shows the current version/build when available.
- Manual backups use versioned JSON for nine persisted app-data domains, including the retained previous Job Board. Restore previews contents and requires explicit replacement confirmation; it does not merge jobs. Files are not encrypted by the app and may contain job names and notes.
- A storage gate settles pending saves, journals the original data, verifies writes and rolls back failed restores. `BackupBoundary` recovers interrupted restores before tools read storage. Successful restore remounts the theme/navigation and clears session drafts; the themed `BackupNotice` acknowledges the outcome.
- Help explains offline use, storage/sharing limitations and electrical verification. Feedback is reviewed before Copy or Share; only user-entered feedback and visible app metadata are included, not saved job contents or device identifiers.
- Public contacts and policy URLs remain unset until the owner supplies real approved details. Payments stay disabled. Brokecoderlabs is an intended brand, not a verified legal-entity claim.

Use [the launch tracker](docs/V1_LAUNCH_TRACKER.md) for business/contact homework,
[the field-test guide](docs/V1_FIELD_TEST_GUIDE.md) for coworker testing,
[the electrical review worksheet](docs/V1_ELECTRICAL_REVIEW.md) for qualified review,
[the privacy inventory](docs/V1_PRIVACY_INVENTORY.md) for data/SDK decisions, and
[the store-listing draft](docs/V1_STORE_LISTING.md) for submission preparation.
Electrical accuracy and commercial content rights are separate release gates.

## Bending field-test scope

Inch/fraction results, editable EMT hand-bender setup, Mark it / Finished views,
optional guided steps, copy, and saved input drafts. The 90° stub preview animates
around its marked point; the other bends use centered static views.

These are schematic layout aids, not calibrated shoe models, guaranteed clearances,
or cut-length calculations. Verify tool markings, deduction, minimum spacing and
springback with the actual bender. Manufacturer references and limits are documented
in docs/bending-methods.md. Current architecture, checkpoint and build receipts are
recorded in docs/PROJECT_STATE_HANDOFF.md.

## Local development

Requires Node.js 22.13 or newer and npm.

```bash
npm ci
npm run check
npx expo start --go --lan --port 8081
```

Use a compatible Expo Go release on the same network, or open
[the local preview](http://localhost:8081). Expo Go and an installed internal
distribution build are different ways to run the app.

## Quality checks

```bash
npm run check
npm run doctor
```

The first command runs ESLint, TypeScript and the automated suite. All 175 tests,
ESLint and TypeScript passed at this checkpoint, including restore-notice dismissal.
Expo Doctor passed 21/21 with compatible SDK 57
maintenance patches. Browser checks and outstanding native acceptance are documented
in [the reliability test plan](docs/RELIABILITY_TEST_PLAN.md).
Local production exports compiled for iOS, Android and web (15 static routes).
Exports are compilation checks, not installed-phone builds or device acceptance.
Remaining upstream npm audit advisories and native acceptance checks are recorded there.
Calculation scope and source-tracking gaps are listed in [the electrical reference register](docs/ELECTRICAL_REFERENCE_REGISTER.md).

`npm run release:check` was verified to exit with ten unresolved release gates. It is not
part of ordinary code validation and must not be made green by inventing approvals.
Qualified electrical review, content-rights review, native backup acceptance, actual
coworker testing, and owner-approved identity/contact/policy details are still required.

## Internal iPhone build

The configured EAS preview profile creates an internal-distribution build for
registered devices, uses the preview channel, and increments the remote build number.

```bash
npx eas-cli build --profile preview --platform ios
```

The app identity is com.brokecoderlabs.electriciantoolbox. Install using the exact
completed build link in the handoff; older links do not contain newer code.

Latest verified installer: **0.9.3 (9)**, completed September 28, 2026, from pushed
source `f5ddff1` on `fix/reliability-and-ux`.
[Open this build page in Safari on the registered iPhone](https://expo.dev/accounts/brokecoderlabs/projects/electrician-toolbox/builds/807a8f1e-a1d5-43a7-8e73-4be2cbd853a1).
The installer is available; installation, retained data and native backup behavior
still require phone acceptance. This is not a coworker TestFlight invitation.

Version 0.9.3 adds native document-picker, file-system and sharing packages. It selects
a new update runtime under the existing appVersion policy. The fresh native build
above includes them; an over-the-air update cannot add them to installed 0.9.2 (8).
Do not delete the existing app as a routine update step. Install the new compatible
candidate over it and verify retained data. See
[Expo runtime compatibility](https://docs.expo.dev/eas-update/runtime-versions/).

The new `fieldtest` profile prepares a store-distribution iPhone build on a separate
`fieldtest` update channel for TestFlight. Its build/submit configuration exists, but
no build or upload was performed. External invitations, required beta review and
test results remain real-world tasks. The existing `preview` profile still serves
registered-device internal testing; `production` remains separate.

Production and submission profiles exist, but field testing, release review,
support/privacy information and store readiness must be completed before any
public submission. A request to save code is not authorization to publish a store release.
