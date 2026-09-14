# Electrician Toolbox

An offline-first React Native / Expo toolkit for helpers and experienced electricians.
Version 0.9.2 is the themes and reliability internal field-test milestone.

## Included tools

The shared Studio appearance system is accepted on main. Open the top-right home menu to
choose six bold Jobsite themes (Tool Red, Jobsite Yellow, Electric Blue, Hi-Vis Green,
Caution Orange, Steel) or the original five Studio themes in Light, Dark, or System appearance.
Follow [the shared style guide](docs/STYLE_GUIDE.md) for UI changes and
[the appearance checklist](docs/STUDIO_THEME_TEST_PLAN.md). This repair branch adds
[reliability and usability fixes](docs/RELIABILITY_TEST_PLAN.md) for review before merging.

- Workpad: measurement math, fractions, contextual unit conversion, precision settings, and recent/saved history.
- Panel Colors: explicit circuit submission, phase/color results, nearby circuits, and job-specific presets.
- Jobsite Lists: separate jobs, materials with quantities, notes, edit history, Undo while the screen is open, copy/share, and swipe actions. The previous Job Board has its own link.
- Fill Guide: conduit and box fill with common selections, mixed conductor groups, direct quantity entry, and independent session drafts with Reset.
- Wire Guide: conductor ampacity and adjustment guidance.
- Trade Talk: the complete offline dictionary, favorites, electrical definitions, and jobsite slang.
- Bending Suite: 90° stub-up, offset, rolling offset, three- and four-point saddles, back-to-back 90s, and box offset.

Each tool has its own route behind the responsive card home. Calculations and domain
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

The first command runs ESLint, TypeScript and 131 automated tests. Expo Doctor
checks SDK/dependency alignment; compatible SDK 57 maintenance patches are applied.
Browser flow and layout checks are documented in [the reliability test plan](docs/RELIABILITY_TEST_PLAN.md).
Remaining upstream npm audit advisories and native acceptance checks are recorded there.
Calculation scope and source-tracking gaps are listed in [the electrical reference register](docs/ELECTRICAL_REFERENCE_REGISTER.md).

## Internal iPhone build

The configured EAS preview profile creates an internal-distribution build for
registered devices, uses the preview channel, and increments the remote build number.

```bash
npx eas-cli build --profile preview --platform ios
```

The app identity is com.brokecoderlabs.electriciantoolbox. Install using the exact
completed build link in the handoff; older links do not contain newer code.

Version 0.9.2 uses a new update runtime for the current Expo SDK 57 / React Native
maintenance patches. Its internal iPhone build includes the Studio/Jobsite themes
and reliability fixes. Install over the existing app to retain its local data.
Future native dependency changes require another compatible build/runtime decision
before publishing JavaScript updates. See [Expo runtime compatibility](https://docs.expo.dev/eas-update/runtime-versions/).

Production and submission profiles exist, but field testing, release review,
support/privacy information and store readiness must be completed before any
public submission. A request to save code is not authorization to publish a store release.
