# Electrician Toolbox

An offline-first field toolkit built with React Native and Expo. The app now
combines the Workpad measurement calculator, a panel circuit color checker,
and a parked conduit-bending route in one scalable toolbox home.

## Panel circuit color checker

- Fast circuit-number entry with a compact jobsite keypad
- Phase and conductor color shown as the primary result
- Five nearby circuits for quick panel work
- Standard 120/208V and 277/480V color conventions
- Saved job-specific color presets with remembered selection
- One-tap result copy and an always-visible verification notice
- Isolated adjacent-pair phase logic ready for configurable layouts later

## Workpad beta features

- Calculator keypad for feet, inches, decimals, and fractions
- Smart Entry for typed jobsite measurements
- Cleaned interpretation shown before a result is trusted or copied
- Feet/inches, exact inches, decimal feet, and rounded-inches outputs
- Selectable 1/16, 1/8, 1/4, and 1/2-inch precision
- Normal and always-up rounding modes
- Tap-to-select and tap-to-copy result formats
- Offline recent and saved calculation history
- Saved precision and rounding preferences
- Compact layout for short phone screens and accessible control labels

Smart Entry accepts formats such as:

```text
48"
1.5ft
1' 6"
5 4/8"
5 and 4/8th
12/8
1' 6" + 5 1/2"
```

## Conduit bending suite

The toolbox keeps a dedicated route and home card for conduit bending while the
field workflow is redesigned. Its current screen is an intentional coming-soon
experience; no unfinished bending calculations ship in this version.

## Requirements

- Node.js 22.13 or newer
- npm
- An Expo account for cloud builds
- An Apple Developer account for TestFlight distribution

## Local development

```bash
npm ci
npm run check
npm start
```

Scan the QR code with a compatible development build, or use the iOS, Android,
or web commands shown by Expo.

## Quality checks

```bash
npm run check
npm run doctor
```

`npm run check` runs linting, strict TypeScript checks, and calculation tests.
The same check runs for pull requests and pushes to `main` through GitHub
Actions.

## Internal field-test build

Install the EAS CLI and sign in once:

```bash
npm install --global eas-cli
eas login
eas init
```

Confirm the app identifiers in `app.json`, then create an installable build:

```bash
eas build --profile preview --platform ios
```

For an iPhone internal-distribution build, EAS will guide you through Apple
credentials and registering test devices. Android preview builds use an
installable APK.

## TestFlight / store build

```bash
eas build --profile production --platform ios
eas submit --profile production --platform ios
```

Before submitting, replace any provisional app identity values, confirm the
bundle identifier belongs to your Apple Developer team, add support and privacy
policy URLs, and complete real-device field testing.

## Offline behavior

The Workpad does not require an account or network connection. Calculations,
history, saved calculations, and preferences stay on the device through local
storage.

## Planned additions

The toolbox home is designed to accept future tools without mixing their
workflows. Likely additions include a panel color checker, box/conduit fill,
and a basic jobsite to-do list.

Calculation and formatting logic lives under `src/utils` so future features can
reuse the same tested measurement foundation.
