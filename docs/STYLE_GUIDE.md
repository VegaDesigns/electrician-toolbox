# Electrician Toolbox — Studio style guide

This is the shared visual contract for the app. Studio uses warm, quiet surfaces, serif headings, clear system text, and one restrained accent. The same components and hierarchy work in every color family and appearance.

## Source of truth

| Source | Responsibility |
| --- | --- |
| `src/theme/color.ts` | Five paired palettes, semantic UI colors, fixed illustration colors |
| `src/theme/tokens.ts` | Type scale, heading fonts, spacing, corner radii, content width |
| `src/theme/ThemeProvider.tsx` | Live theme subscription, system appearance, loading and save feedback |
| `src/theme/preferences.ts` | Validated, versioned preferences and serialized storage |
| `app/settings.tsx` | Home menu destination and appearance controls |

All screens, reusable controls, sheets, diagrams, and the retained previous Job Board subscribe to this foundation. Use `defineStyles` for styles and `useAppTheme` for inline colors. Do not export a fixed global `Colors` object or cache a palette outside a component. A local alias named `Colors` is fine when it comes from the current theme.

## Color families and appearance

| Family | Character |
| --- | --- |
| Forest (default) | Warm paper and deep green; sage accent at night |
| Ocean | Cool gray and blue; pale blue accent at night |
| Clay | Warm neutrals and terracotta; peach accent at night |
| Iris | Soft neutrals and purple; lavender accent at night |
| Graphite | Restrained gray-green neutrals |

Each family has its own light and dark palette. System follows the device appearance; Light and Dark override it. Family and appearance are independent preferences. Exact values live in `color.ts`; copy semantic roles into components, never hex values from this document.

| Role | Use |
| --- | --- |
| `bg` | Screen background, open calculator display, quiet number keys |
| `surface` | Cards and sheets |
| `surface2`, `keyUtility` | Inputs and secondary controls |
| `primarySoft`, `keyOperator` | Selected surfaces and operator keys |
| `text` | Main content and numbers |
| `textMuted` / `textSubtle` | Descriptions and supporting labels |
| `primary` | Main actions, links, selected borders and accents |
| `inverseText` | Text **only on a solid primary fill** |
| `border` | Quiet separators and card edges |
| `borderStrong` | Input boundaries and stronger separators |
| `error` / `errorSoft` | Destructive or invalid states |
| `success` / `successSoft` | Successful or within-limit states |
| `warning` / `warningSoft` | Caution states |
| `overlay` | Modal scrims |

Never use the accent to communicate an electrical phase or a safety result. Panel phase data stays in its domain catalog. Copper, aluminum, and pipe illustration colors stay in `ReferenceColors`. Diagram annotations and backgrounds follow the theme; conduit geometry and metallic shading stay fixed.

## Typography and layout

- Use `Fonts.heading` for page titles, home tool names, and sheet headings: Georgia on iOS/web and the platform serif on Android.
- Body text and results use the platform system sans serif; `Fonts.body` is available for explicit overrides. Calculator values use tabular numerals.
- Use the shared `FontSize` scale: 12, 14, 16, 18, 20, 24, 28, 32, 48, 56. Prefer regular or medium weights. Keep large result values visually dominant.
- Use `Space`: 4, 8, 12, 16, 24, 32. Content is centered with `Layout.contentWidth` (520). Keep a comfortable 16–24 outer inset.
- Use `Radius.control` (12) for inputs, `Radius.card` (16) or `Radius.large` (20) for cards, and `Radius.pill` (24) for calculator keys. Circular buttons use `Radius.round`.
- Existing specialized measurements, compact calculator geometry, icon strokes, and diagram coordinates remain local. Do not force these into the spacing scale or alter calculation geometry during visual work.
- New controls should meet the 48-point `Layout.touchTarget`; preserve labels and normal font scaling. Scroll long settings or forms rather than clipping them.

## Component rules

**Home:** keep one calm card treatment across tool categories. The top-right hamburger opens Settings. Preserve phase swatches inside the Panel Colors icon.

**Calculator:** use an open display, quiet number keys, filled neutral utility keys, softly accented operators, and one solid primary equals action. Clear is a neutral utility action. Avoid bevels, inset shadows, gloss, and gradients on interface controls.

**Cards and fields:** separate sections with space, surface color, and a fine border. Use clear labels, units, and descriptions. Preserve existing validation and keyboard behavior.

**Selected controls:** use a primary border and soft accent fill, or a solid primary fill with `inverseText`. Include a checkmark or selection state, so selection is not conveyed by color alone.

**Feedback:** preserve pressed feedback, disabled states, accessibility names, and error explanations. Pair error text with the error surface, never `inverseText`. Keep essential information readable without shadows.

**Sheets and navigation:** use the active screen background and semantic scrim, retain safe areas and scroll behavior, and provide a clear close/back action. Theme changes must not remount or reset a tool.

## Implementation pattern

```tsx
import { Text, View } from "react-native";
import { defineStyles, Fonts, FontSize, Radius, Space } from "../theme";

const useStyles = defineStyles(({ colors }) => ({
  card: { backgroundColor: colors.surface, borderColor: colors.border,
    borderWidth: 1, borderRadius: Radius.card, padding: Space.md },
  title: { color: colors.text, fontFamily: Fonts.heading, fontSize: FontSize.title },
}));

export function ToolCard() {
  const styles = useStyles();
  return <View style={styles.card}><Text style={styles.title}>Your tool</Text></View>;
}
```

For inline SVG strokes, input placeholders, or dynamic swatches, get `theme.colors` from `useAppTheme()` inside the component. Call style hooks unconditionally. Add new semantic roles in the catalog when a genuine new use requires one; avoid new per-screen palettes.

## Persistence and future personalization

Appearance is stored only at `electrician-toolbox:appearance:v1`. Invalid or unknown stored values fall back safely. Writes are serialized so rapid selection saves the last choice. A failed save displays recovery feedback. No tool history, saved panel setup, list, measurement, or calculation setting is rewritten by the theme system.

All five themes are available in this experiment. Account settings are a clearly labeled future area; authentication, billing, paid entitlements, and cross-device sync are not implemented. A future paid catalog should check account entitlements separately from rendering, offer a free fallback, and preserve tool data when access changes. Add both appearances and contrast coverage for each future family before exposing it.

Native launch screens follow the system light/dark setting with Forest launch colors. They cannot read a saved color family before JavaScript starts. The saved theme appears after preferences load. Native configuration changes require a new native build to take effect.

## Review requirements

`npm run check` runs lint, type checking, the existing tool tests, and appearance tests. Lint rejects hardcoded UI hex/RGB colors in screens, components, and routes. Theme tests verify readable text/status combinations at 4.5:1 or higher and cover invalid preferences, system resolution, ordered writes, and storage recovery.

Review light and dark appearances, all five families, smaller screens, keyboard navigation, open sheets, and long content. Verify real iOS/Android behavior before merging or releasing; browser checks do not replace device testing. See `STUDIO_THEME_TEST_PLAN.md`.
