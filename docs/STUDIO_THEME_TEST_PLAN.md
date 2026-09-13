# Studio theme trial

Branch: `feature/studio-themes`, based on `feature/home-navigation` at `78f13a5bf2a743ff9c73baf711aed2225edbcf34`. This includes the newer home/tool work that is not yet on `main`.

## Local validation

- Run Node 24, `npm ci`, then `npm run check`.
- Run `npm run export:web` to verify the production web bundle.
- Open Home → top-right menu → Settings. Select each family in Light and Dark, reload, and confirm the choice stays selected.
- Select System and change the device/browser appearance. Confirm it follows; explicit Light/Dark must remain fixed.
- Visit Workpad, Panel Colors, Jobsite Lists, Fill Guide (including Box Fill), Wire Guide, Trade Talk, Bending, and the retained `/previous-job-board` route.
- Calculate a result, open history, change theme, and verify the history remains. Check saved lists and presets independently of appearance storage.
- Check 320-point width as well as a typical phone. All settings should remain reachable by scrolling; no horizontal overflow or hidden actions.

## Native review before merge/release

1. Build or run this branch using the project's existing Expo development workflow. New automatic appearance / splash configuration needs a native rebuild; an older installed binary will retain its old native configuration.
2. On iOS and Android, check first launch, restart, explicit appearance, System transitions while open and after backgrounding, status bar contrast, safe areas, and native dialogs/keyboards.
3. Increase system text size. Inspect headings, tiles, segmented controls, inputs, result units, and sheet close controls.
4. With VoiceOver/TalkBack, verify the home menu label, appearance radio selections, theme names, and close/back navigation.
5. Exercise each tool's keyboard, modal, long list, swipe action, and calculation flow. Confirm phase colors and pipe artwork preserve their meaning in each appearance.
6. Review the selected Studio direction on a real device before asking to merge. This branch does not publish an update or change a release channel.

## Scope

The experiment changes UI styling, appearance settings, and shared theme infrastructure. Calculation/domain algorithms and existing tool storage schemas remain untouched. All themes are unlocked for testing. The account section is a future placeholder, not a working account or purchase flow.

## Validation receipt — September 13, 2026

- Lint and TypeScript checks passed with no warnings; all 106 automated tests passed.
- Production Expo web export succeeded for all 13 routes, including framework routes.
- Chromium browser smoke checks passed for 10 app/tool routes across all 10 family/appearance combinations (100 route checks), with no page errors or document horizontal overflow.
- Home, Workpad, and Settings passed overflow checks at 320, 390, and 768 pixels. The new theme controls met their 48-point target size.
- Verified calculator addition and saved history, theme persistence through reloads, System appearance changes, explicit Dark override, and recovery after a simulated storage write failure.
- Existing tool storage entries stayed identical through theme changes. The `src/utils` domain tree has no changes on this branch.
- Reviewed real application screenshots of all tools in Forest light and Home, Settings, and Workpad in Forest dark.
- iOS/Android device testing and native builds were not performed. Use the native checklist above before merge/release.
