# English / Spanish implementation — local 0.9.4

September 28, 2026. The owner subsequently approved saving/pushing this checkpoint and TestFlight preparation. Source is saved and pushed as `6790a59`; the first build attempt stopped at missing store-signing configuration before upload or build creation. This is not an installed 0.9.4 build or public release. See PROJECT_STATE_HANDOFF.md for the current receipt and owner-assisted signing next step; the implementation-time notes below are retained as history.

## Product decisions

- One bilingual app, not a separate Spanish product. Settings → Language offers Automatic, English and Español.
- Automatic chooses the first supported English/Spanish device language; unsupported languages fall back to English.
- Neutral Spanish for a mixed-country crew working on U.S. jobsites. Localization does not change the electrical jurisdiction, code basis, units, conductor sizes, fractions, calculations or manufacturer assumptions.
- User-written job names, material descriptions, notes, panel names and equations remain verbatim. Existing saved data is not translated or migrated.
- Standard dictionary terms receive Spanish names and explanations. English slang/brand aliases remain recognizable; do not invent universal Spanish slang. Search supports both languages and ignores accents.
- All 43 bundled dictionary entries have Spanish explanations. Four existing reviewed quiz questions are translated. Questions live in a separate curated data module so later additions need not alter the screen. No automatic AI question generation, scheduling or remote content service was added.
- Suggestions use a local draft → exact preview → Copy/native Share workflow. Word and meaning are required; country/region is optional. Limits are 80/1200/80 characters. Nothing is uploaded, published or inserted into the dictionary automatically. Users choose their recipient, currently the person who invited them. A public submission inbox and moderation workflow remain future decisions.

## Architecture and maintenance

- `src/i18n/core.ts`: pure language resolution, English fallback, exact source-message lookup and named interpolation. Catalogs under `src/i18n/catalogs/` contain data only. Shared wording overrides feature duplicates intentionally.
- `src/i18n/index.tsx`: `LanguageProvider` and `useI18n`, using Expo Localization. Provider order is BackupBoundary → ThemeProvider → LanguageProvider → navigation. Startup recovery uses device language before saved preferences can safely be read. Web sets the document language. Normal language changes do not remount tools.
- `src/theme/preferences.ts` stores optional `language: system | en | es` inside the existing appearance record. Legacy records remain valid with no added property. `src/utils/backup/schema.ts` accepts valid language values while rejecting unknown imported values. Backup format and nine-domain storage key list are unchanged.
- UI translation is explicit at presentation boundaries. Do not scan/replace arbitrary rendered text, translate stored identifiers, or pass user-authored text directly to `t`. Insert user values as interpolation parameters.
- `src/i18n/electricalPresentation.ts` protects user preset names and unknown legacy color text. Canonical phase/color IDs remain English internally; swatches and electrical phase logic are unchanged.
- `src/screens/bending/measurementText.ts` translates audited app-authored generated instructions using exact templates. The engine still produces the same numerical results. Add matching coverage whenever an English engine message changes; otherwise it intentionally falls back to English.
- `src/utils/tradeTalk/spanish.ts` provides dictionary presentations by stable ID. Favorites/recents continue using the original IDs. `quiz.ts` holds the original four questions. `suggestion.ts` validates and formats suggestions without storage or transport; `SuggestTermSheet.tsx` owns the transient review/share UI.
- Share/report helpers accept an optional language, defaulting to English for compatibility. Only app-authored headings are translated; authored report/list content is unchanged.
- Native Box Fill decimal-pad volume fields accept one comma or dot as a decimal separator. Values normalize to the existing dot format with the same two-decimal limit. Grouped or mixed-separator inputs are rejected. This is not a metric conversion.
- Changes include all main screens (home, settings, Workpad, Panel Colors, Jobsite Lists, Fill Guide, Wire Guide, Trade Talk, Bending), retained legacy list view, Help, Backup, common controls, accessibility labels, copy/share messages, errors and safety warnings. Small wrapping adjustments accommodate longer labels; no theme redesign.

## Build / data compatibility

- Added Expo SDK-compatible `expo-localization` and its `supportedLocales: [en, es]` plugin configuration.
- Local app/package version is 0.9.4. Under the existing `appVersion` runtime policy, a fresh native binary is required before the installed app can receive this feature. Do not push these native-module changes as an OTA update to 0.9.3.
- Existing installed internal preview remains 0.9.3 (9); its receipt is in PROJECT_STATE_HANDOFF.md. No native cloud build, commit, push, TestFlight upload, invitation or public submission was made for this localization request.
- No translation API, account, backend, analytics or automatic data transfer was added. Language works offline. Manual sharing is performed by the user's chosen application.

## Verification

- 201 automated tests pass, including existing electrical/calculator/storage behavior and new localization, data preservation, decimal input, bilingual search, quiz and suggestion checks.
- TypeScript and full ESLint pass. Expo Doctor passes all 21 checks.
- iOS, Android and web production bundles export successfully. This validates bundling, not native installation or device acceptance.
- Browser QA at 390 × 844: language selection/reload, home navigation, panel circuit 80 and nearby row, Box Fill chooser, advanced Wire Guide, translated dictionary definition and accent-insensitive search, suggestion validation/review/discard/fresh reopening, unchanged existing test job/material/note wording, add-material/add-note sheets, bending 90° labels and measurement entry.
- Browser QA at 320 × 568: Spanish Workpad precision sheet and fraction controls. Real-device keyboard, safe-area and large-text behavior are separate acceptance checks.
- QA used the isolated 127.0.0.1 browser origin. No real user list was edited, deleted or shared. No dictionary suggestion was sent.

## Required field review before release

1. In Expo Go or a newly authorized 0.9.4 build, change to Español, close/reopen, return to English, and confirm lists, presets, favorites and history remain intact.
2. Have Spanish-speaking electricians from at least two crew backgrounds review terminology, especially grounding/bonding, box-fill allowances, conductor warnings and bending deductions. Translation is not a new technical approval.
3. Test native iPhone keyboard layout, decimal comma entry when offered, app-language override on an English phone, VoiceOver pronunciation, larger text and Reduce Motion.
4. Review Copy/native Share for a sample suggestion; confirm cancellation does not claim delivery and no suggestion appears in the published dictionary.
5. Export/restore a disposable backup with an explicit language selection and verify both preference and saved work.
6. Before public launch, configure a real support/submission destination and approve submission moderation, rights and privacy wording. Current tester-to-owner sharing is not an online inbox.
7. Expand the curated quiz bank only with reviewed question text, correct answers, explanations and bilingual coverage. Clarify the owner's longer-term generation idea before adding a service.

Existing electrical/content-rights, public policy, business identity, TestFlight and monetization launch gates remain open. Localization does not satisfy them.
