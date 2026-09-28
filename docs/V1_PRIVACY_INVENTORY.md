# Version 1 privacy inventory

Prepared September 28 2026. This is an engineering inventory and release checklist, not an approved public privacy policy or a legal opinion. It reflects the local source and installed dependencies at this checkpoint. Recheck against the actual production archive, configuration, and distribution services before completing App Store privacy answers.

## Product scope

- Initial plan: United States, iPhone, offline-first tools, no mandatory account, no advertising, and manual backup/restore.
- Working app name: Electrician Toolbox. Final public name, seller identity, support contact, and Brokecoderlabs business arrangements remain owner decisions. Do not describe Brokecoderlabs as an incorporated entity or an Apple organization account without verification.
- No subscription, purchase SDK, paywall, entitlement server, or AI service is implemented. All monetization stays disabled for this checkpoint.
- No application-added advertising, analytics, or remote crash-reporting service was found in the current dependencies and source. This is not a finding that the installed app or platform sends no network data.

## Information stored on the device

AsyncStorage is the app's persistent local store. It is not an app-encrypted vault. Device/platform backup behavior is separate from the manual backup feature. The source has nine app-owned persisted domains:

| Storage key | Contents | Potential sensitivity |
| --- | --- | --- |
| `electrician-toolbox:appearance:v1` | Theme family and light/dark preference | Low; preference data |
| `electrician-toolbox:preferences:v1` | Workpad precision | Low; preference data |
| `electrician-toolbox:calc-history:v1` | Expressions, results, favorites, timestamps and result presentation | Could expose job measurements entered by the user |
| `electrician-toolbox:panel-colors:v1` | Selected scheme and custom schemes, including user-provided names/panel labels | Job or facility names may be present |
| `electrician-toolbox:wire-guide:v1` | Conductor and calculation-condition preferences | Installation context |
| `electrician-toolbox:trade-talk:v1` | Favorite and recent dictionary entry identifiers | Usage preferences |
| `bending-suite-v1` | Bender setup and deductions | Tool preferences |
| `electrician-toolbox:material-lists:v1` | Jobsite list names, materials, quantities, notes and completion/edit state | Job descriptions and any private details the user types |
| `electrician-toolbox:job-board:v1` | Retained earlier Job Board data | Older job descriptions, materials and notes |

Unfinished forms and fill drafts are session-only and are not included in the manual backup. A restore resets live screen state so old in-memory drafts do not write over restored data. It is not cloud sync and it does not merge jobs.

## Data movement and user controls

| Path | Current behavior | Release follow-up |
| --- | --- | --- |
| Calculator/panel/list Copy | Writes user-selected result or list text to the system clipboard | Warn users not to copy private site details unnecessarily; no background clipboard reading is required |
| List Share | Sends selected list text to the native share sheet | Recipient and destination app are chosen by the user |
| Manual backup export | Produces an unencrypted, versioned JSON file containing the saved domains; native export uses a user-chosen share destination, including Files where supported | Verify real iPhone Save to Files, cancellation, free-space failures, and fresh-install restore |
| Manual backup import | Reads the file the user chooses; validates it; replacement requires explicit confirmation and includes recovery handling | Verify malformed/oversized files, rollback, app restart, and interruption on the installed build |
| Help feedback | User writes a description and expected outcome, reviews the exact report, then copies or shares it | No automatic upload, screenshots, job data, histories, panel presets, device identifiers or contact details are attached |
| Feedback metadata | App name/version, native build when available, operating system/version and preview type | All attached fields are visible in the report preview; do not add identifiers silently |
| Configured support/email/policy links | Inactive unless real valid values are configured; email launches the user's mail app with the reviewed report | Owner must supply working contact, HTTPS support page and approved policy/license details |
| Bender reference links | Open manufacturer-hosted PDFs after the user chooses a reference | Publisher's browser and destination site's data practices apply |
| Update checks | `expo-updates` is configured with an `https://u.expo.dev/…` update endpoint | Review Expo's service terms/privacy behavior and inspect production network traffic; do not claim zero network activity |
| Development and distribution | Expo Go and development tools use Metro; EAS distributes builds; TestFlight/Apple may process beta feedback and diagnostics | Development and TestFlight behavior must not be confused with the public production app's behavior |

The Help screen describes storage, sharing and electrical limitations in plain language. It deliberately identifies current privacy information as a test-build description rather than an approved policy. It does not provide a fake support email or dead policy button.

## SDK inventory

The lockfile is the version authority. Relevant direct packages at this checkpoint include:

- `@react-native-async-storage/async-storage`: persistent local data.
- `expo-clipboard`: explicit result/list/report copy operations.
- `expo-file-system`, `expo-document-picker`, `expo-sharing`: user-directed backup files, import selection and native sharing. These introduce native code and require a new installed build, not only an over-the-air update.
- `expo-constants`: app/runtime metadata shown in Help and feedback. The Help implementation does not collect a device ID or device name.
- `expo-haptics`: local interaction feedback.
- `expo-updates`: app update retrieval and runtime metadata. Configured update behavior needs production review.
- `expo-linking` and React Native Linking/Share: user-selected external actions.
- `expo-router`, React Native, Expo, safe area/screens/gesture/reanimated/worklets/SVG/theme components: UI/runtime dependencies; review transitive native modules in the final archive too.

Installed package manifests were inspected for AsyncStorage and Expo File System. AsyncStorage declares file-timestamp required-reason API use. File System declares file-timestamp and disk-space required-reason API use, with no tracking and empty collected-data entries in that package manifest. Those package declarations do not certify the entire app, every SDK, or the App Store privacy label. Validate the aggregate archive privacy report and required-reason APIs before submission.

## Customer data lifecycle

1. Local saves remain on the device until edited, removed through the tool, replaced by a restore, or removed by storage/app deletion.
2. Manual exported files remain wherever the user saves or sends them. Removing a list inside the app does not delete an earlier backup or a recipient's copy.
3. Import validates and replaces app data after confirmation. Keep a current backup before replacing it.
4. The new feedback draft exists only while the screen/app session remains open. Copying or sharing creates a separate copy in the selected destination.
5. There is no server account to delete and no implemented server-side copy of the user's jobs. This does not cover copies made by OS backups, share destinations, or support recipients.
6. If support email or an online feedback service is later added, define who receives reports, retention/deletion handling, access controls and contact instructions before collecting them.

## Required public release approvals

- [ ] Confirm public app name and Apple seller identity; distinguish an individual enrollment from an organization enrollment.
- [ ] Establish a monitored support inbox and a real HTTPS support page, then test them on a device.
- [ ] Approve and publish a privacy policy accurately covering the final build, services and support workflow.
- [ ] Decide the license/terms approach; publish the approved information. This inventory does not draft a contract.
- [ ] Review every direct and transitive SDK plus the production archive privacy manifests and network behavior.
- [ ] Complete App Store privacy answers from verified collection/use practices, not from the phrase "offline-first."
- [ ] Confirm backup export/import behavior, cache-file cleanup and file-protection expectations on a real iPhone. Backup files are not encrypted by the app.
- [ ] Run consented external field testing with the release build and record the outcomes.
- [ ] Complete qualified electrical review. Do not label unverified reference tables as certified or code-approved.
- [ ] Separately review content rights and commercial reuse. Electrical accuracy does not establish permission to reproduce reference material.
- [ ] Revisit this inventory before adding payments, analytics, remote crash reports, accounts, synchronization, or AI.

`src/config/release.ts` records unresolved contact/policy/review gates. Its validator is a planning check, not App Store approval, legal clearance, an electrical certification, or proof a URL is operational. Missing values intentionally keep customer links absent. Actual contact, policy publication and outside reviews remain owner/reviewer tasks.
