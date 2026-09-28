# Version 1 field test guide

Prepared September 28, 2026. This is a test plan, not a record that testing has been completed. Intended first release: U.S. iPhone, offline-first, no mandatory account and no ads. Public name, support contact, and paid offering remain owner decisions.

## What this round should prove

Can a helper find an answer without coaching? Can a mechanic trust the inputs, units, and saved work? Can a lead return to a list after an interruption without losing information? We are testing the existing tools, not collecting an unlimited feature wish list.

Recruit 5–10 people across these roles, including at least one person unfamiliar with the app. A suggested five-person minimum is two helpers, two experienced mechanics/journeymen, and one lead. Include a small iPhone and a larger iPhone, normal and larger text, light and dark appearance, and at least one VoiceOver session. Record the exact phone and iOS version; a browser or Expo Go session does not replace acceptance on the release-candidate build.

Use sample jobs and de-energized training examples. Do not open equipment, perform energized work, or rely on an unreviewed app result to prove a circuit safe. Physical bending checks belong to an experienced person in a suitable work area, using their actual tool instructions. Get permission before recording a coworker or a jobsite.

## Owner preparation

1. Give the candidate a build number and record its source commit. Do not describe an old installed build as the latest candidate.
2. Complete the software checks, inspect known issues, and identify which electrical-reference items still need qualified review in [the electrical review worksheet](V1_ELECTRICAL_REVIEW.md).
3. Upload an appropriate build to App Store Connect, create the TestFlight groups, provide test information and a real feedback contact, and submit it for the required beta review. Invite coworkers as external testers rather than giving them developer-account access. Apple documents the current process in [Invite external testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers/).
4. Use a private invitation for this small group. Confirm installation, version, and the method for sending feedback before their first shift. Do not send passwords, signing credentials, or confidential job data.
5. Start with a 15–20 minute observed session. Follow with two or three ordinary shifts. Record interruptions and confusing moments, not only successful outcomes.

## First session without coaching

Read the task, then watch. Do not explain where a control is until the tester asks or becomes stuck. Record time-to-answer as an observation, not a competition. Ask the tester to say what they think a result means before revealing the expected behavior.

| Role | Task | What to watch |
| --- | --- | --- |
| Helper | Find the expected color for circuit 55 using the standard black/red/blue setup; then check 5. | Can they identify the setup, use Enter, and start a fresh number without appending it? Do they understand this is a selected convention, not proof of actual wiring? |
| Helper | Create a fresh job list; add quantity 4 and “1 1/4-inch couplings”; change the remaining quantity to 1; add a note. | Single-line entry, keyboard visibility, clear quantity, discreet edit indicator, no stale text when adding the next note. |
| Mechanic | Calculate `153in - 135in`, insert `.5` after `153`, and calculate again. | Caret placement, no missing rapid taps, no unwanted reset, readable long expressions. The edited arithmetic result is 18.5 inches. |
| Mechanic | Enter the mixed-wire box example in the next section, then switch to Conduit Fill and back. | Can the tester locate volume on a box or use the marked-volume option? Are separate session calculations retained without mixing? |
| Mechanic | Plan a 10-inch stub with a verified 6-inch deduction, then a 6-inch offset at 30 degrees. | Answers before diagrams, inches/fractions, which tool mark is used, and understanding that first offset position is user-chosen. |
| Lead | Reopen a partly collected list after leaving the app; share its text; finish a test list and separately delete a different test list. | Existing work retained, obvious confirmation, predictable swipe directions, finished versus deleted understood. |
| Any | Find a dictionary term used at work, favorite it, leave and return. | Search spelling/slang recognition, useful definition, favorite retained, no invented answer when no match exists. |

## Reproducible result checks

These are **regression expectations from current source tests**, not an independent electrical certification. Enter the exact setup and record the result. A qualified reviewer must separately establish the electrical assumptions and sources. More cases and test-file references are in [V1 electrical review](V1_ELECTRICAL_REVIEW.md).

| Tool | Exact sample | Expected current calculation |
| --- | --- | --- |
| Workpad | `2 + 3 × 4`; `2 ft ÷ 2`; `2 ÷ 0` | 14; 12 inches (or equivalent selected feet/inches display); explicit divide-by-zero error. |
| Panel Colors | Standard black/red/blue, paired-row layout: 53, 54, 55, 56, 57 | C Blue, C Blue, A Black, A Black, B Red. |
| Box Fill | Marked 30.3 in³; 3 insulated #10; 1 equipment ground #12; 5 insulated #12; no devices or internal clamp | 21 in³ required; 9.3 in³ remaining; within the modeled volume. |
| Conduit Fill | 3/4-inch EMT; 3 #10 plus 6 #12 copper THHN/THWN-2 | Nine conductors; 0.1431 in² used against 0.213 in² allowed by the current dataset; fits. |
| Wire Guide | Copper #8; 75°C marked connection; 78–86°F; 1–3 current-carrying conductors | 50 A result, limited by the connection setting; not an automatic breaker recommendation. |
| Bending | Field method; 1/16-inch precision; stub 10 inches, deduction 6 inches | Arrow mark 4 inches from the starting end. Check actual shoe compatibility before any physical bend. |
| Bending | Field method; offset height 6 inches; 30 degrees; first mark 20 inches | 12 inches between marks; marks at 20 and 32 inches. No hidden shrink addition to the first mark. |

## Native reliability checklist

Use disposable sample data for destructive tests. Back up real data first. Mark each item Pass, Fail, or Not tested, with the candidate build number.

- Workpad: enter at least 30 quick digits; the display may shrink or scroll but must retain every digit. Edit the middle, select and replace a range, insert a fraction, backspace, clear, calculate, and recall history. Compare the actual equation, not just its final visible portion.
- Panel Colors: type slowly and quickly; result waits for Enter; the first digit after a completed lookup starts a new entry. Browse Nearby, tap a neighbor, and return to the entered circuit. The keypad must not move when the result appears. Save, reopen, rename, and delete a disposable custom preset; Done stays below the status bar.
- Lists: remove a sample item. With the screen active and no blocking form or save issue, Undo counts down for about five seconds and disappears. Repeat and Undo before expiry. Open a form or background the app during a second countdown; confirm the timer pauses and resumes instead of expiring while inaccessible. VoiceOver has a longer allowance. Reduction of motion must not disable expiry.
- Lists: finish by swiping left and delete by swiping right, using sample lists and their confirmation dialogs. Cancel both once. Vertical scrolling must not unexpectedly commit either action. Swipe gestures must not navigate a tool back to Home.
- Inputs and sheets: add wire quantity by typing and by plus/minus; clear and backspace; ensure entered text and the action button stay above the keyboard. Test bending whole inches, a common fraction, and a custom fraction. Invalid input must explain the problem instead of returning a plausible result.
- Offline: install/open the native candidate once, then airplane mode and fully reopen. Core tools, saved presets, lists, history, and dictionary should remain usable without sign-in. External support/reference links may need a connection. Do not use Metro availability as an offline test.
- Persistence: add a saved list/preset/history entry, wait for save completion, close and reopen, then install the next candidate over it. Data should remain. Fill drafts and unfinished text are session-only unless the app explicitly promises otherwise.
- Backup: after the implementation is available, export sample data to a location you can find; preview the restore contents and scope; restore into a disposable test installation or after protecting current work. Check record counts and representative values. Cancel once. A malformed or unsupported backup must fail without changing existing data. Never assume sharing readable list text is a restorable backup.
- Accessibility and appearance: test larger iPhone text, VoiceOver reading order/labels, Reduce Motion, both appearances, and at least two color families. Do not rely on hue alone for status or phase. No cropped results, unreachable close controls, or keyboard-covered forms.
- Interruption: receive a call or lock the phone while entering a value, then return; check state and focus. Repeat navigation several times and note crashes, frozen touches, or duplicate screens.

## Feedback record

Use one record per issue. Do not include customer names, panel schedules, or other sensitive job details unless necessary and approved.

- Tester role / experience:
- Date, device, iOS, app version and build:
- Tool and selected settings:
- What I was trying to do:
- Exact steps and input:
- Expected result / actual result:
- Screenshot or screen recording, if safe and useful:
- Repeatability: every time / sometimes / once:
- Effect: incorrect electrical result / lost work / cannot finish / confusing / cosmetic:
- Workaround, if any:

After each shift ask: “What saved you time?”, “Where did you hesitate?”, and “When did you go back to paper or another app, and why?” Do not ask only whether they liked it. Keep new feature requests separate from release defects.

## Release decision

Recommended gate: zero unresolved critical or high-severity defects. Treat a credible incorrect electrical result, silent loss of saved work, broken restore, or inability to finish a common workflow as release-blocking until triaged and retested. Keep cosmetic issues in a short acknowledged backlog.

Release requires recorded electrical review within a declared scope, completed native checks on the exact candidate, real coworker feedback, and owner approval. Five satisfied testers do not prove every supported calculation is correct. Recheck affected flows after fixes and repeat saved-data upgrade/restore checks on the final build.

Candidate version/build: ______  Source commit: ______  Test dates: ______

Testers completed: ______  Open critical/high defects: ______  Electrical review record: ______

Owner decision: Hold / Approve within documented scope  Date: ______
