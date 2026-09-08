# Electrician Toolbox

An offline-first React Native / Expo toolkit for helpers and experienced electricians.
Version 0.9.1 is an internal field-test milestone, not a public store release.

## Included tools

- Workpad: measurement math, fractions, contextual unit conversion, precision settings, and recent/saved history.
- Panel Colors: explicit circuit submission, phase/color results, nearby circuits, and job-specific presets.
- Jobsite Lists: separate jobs, materials with quantities, notes, edit history, timed Undo, and swipe actions.
- Fill Guide: conduit and box fill with common selections, mixed conductor groups, and direct quantity entry.
- Wire Guide: conductor ampacity and adjustment guidance.
- Trade Talk: electrical definitions and jobsite slang.
- Bending Suite: 90° stub-up, offset, rolling offset, three- and four-point saddles, back-to-back 90s, and box offset.

Each tool has its own route behind the square-tile home. Calculations and domain
models live in src/utils; feature UI lives in src/screens. Local preferences and
saved work use AsyncStorage. Cloud sync and subscription billing are not implemented.

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

The first command runs ESLint, TypeScript and the automated tests (86 at this
milestone). Expo Doctor also checks SDK/dependency alignment. The current locked
SDK 57 versions have newer maintenance patches available; this warning is recorded
in the handoff and is not hidden. Upgrade dependencies as a separate verified change.

## Internal iPhone build

The configured EAS preview profile creates an internal-distribution build for
registered devices, uses the preview channel, and increments the remote build number.

```bash
npx eas-cli build --profile preview --platform ios
```

The app identity is com.brokecoderlabs.electriciantoolbox. Install using the exact
completed build link in the handoff; older links do not contain newer code.

Version 0.9.1 separates this native SVG-enabled build from the older 0.9.0 update
runtime. Future native dependency changes require another compatible build/runtime
decision before publishing JavaScript updates. See [Expo runtime compatibility](https://docs.expo.dev/eas-update/runtime-versions/).

Production and submission profiles exist, but field testing, release review,
support/privacy information and store readiness must be completed before any
public submission. A request to save code is not authorization to publish a store release.
