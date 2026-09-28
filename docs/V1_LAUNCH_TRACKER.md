# Version 1 launch tracker

Updated September 28, 2026. Working product name: Electrician Toolbox. Intended brand: Brokecoderlabs. The owner has not confirmed a legal entity, final public name, support email, or public policy URLs. Do not present the brand as a registered company.

## Approved scope

- Initial public audience: United States iPhone users. Store territory must be set in App Store Connect; this document does not configure it.
- Offline-first tools, no mandatory account, no ads, manual backup/export/import.
- Freeze new widgets while preparing this release. Preserve existing tools and user data.
- Payments remain disabled. Package split, pricing, subscription implementation and purchase testing are a later approval.
- The owner can recruit coworkers for electrical review and 5–10 field testers. Recruitment is confirmed possible, not completed testing or approval.
- Keep app identity `com.brokecoderlabs.electriciantoolbox`. Branding decisions do not require changing it.
- Development checkpoint 0.9.3 has a new native runtime under the existing appVersion policy. It is not a claim that public Version 1.0 is approved.

## Release checkpoints

| Checkpoint | State | Owner and evidence needed |
| --- | --- | --- |
| Current calculator and timed Undo fixes | Implemented before this pass | Owner checks rapid entry, caret edits, VoiceOver and timed removal on an actual iPhone |
| Manual restorable backup | Implementation and verification in this pass | Native Files/share/picker round trip, cancel, failed restore and recovery on disposable data |
| Help and app information | Implementation in this pass | Owner supplies real contact and public policy URLs; review the in-app wording |
| Electrical data and calculation review | Open release blocker | Qualified reviewer records source edition, limits, examples, corrections and sign-off in V1_ELECTRICAL_REVIEW.md |
| Commercial content rights | Open release blocker | Establish provenance and permission/licensing basis for reference data, definitions and illustrations; removing NEC labels does not settle rights |
| Coworker TestFlight test | Prepared, not run | 5–10 testers use V1_FIELD_TEST_GUIDE.md; record exact build and results, resolve serious defects |
| Business and seller identity | Owner decision | See Brokecoderlabs homework below; decide before public release |
| Support and privacy | Open release blocker | Monitored address, working public support and privacy URLs, approved disclosures covering installed SDKs |
| Subscription experience | Deferred by scope | Approve benefits/pricing, implement StoreKit purchase/restore/manage and test all lifecycle cases before charging |
| Public store submission | Not authorized or performed | Final title, screenshots, description, age rating, US availability, required agreements and privacy answers reviewed by owner |

Passing software tests alone cannot close electrical review, licensing, device acceptance, or business decisions. Record actual review evidence; never turn an unchecked item into “passed” to make a release check green.

## Brokecoderlabs homework

1. **Choose the seller path.** You may retain an individual Apple membership, where Apple displays your personal legal name as seller. If you want an organization as seller, first decide with appropriate business/tax advice whether to form a qualifying legal entity. Apple does not accept a trade name or DBA alone as an organization.
2. **Check the proposed names.** Separately consider the company brand and app title. Search existing apps, Florida business records and the USPTO trademark database. A domain or business-name registration does not itself establish trademark clearance. No name availability or clearance has been established here.
3. **Set up contact channels.** Select a domain if desired, create a monitored support address, and prepare public support/privacy pages. Do not use an invented address in the app. A company domain and functional website are also relevant to Apple organization enrollment.
4. **If choosing an organization, coordinate Apple verification.** Review legal-entity eligibility and D-U-N-S requirements, then request conversion of the existing individual membership through Apple. Do not open a duplicate developer membership as an assumed fix. Only the owner should provide identity documents or accept agreements.
5. **Resolve commercial administration before charging.** Decide the actual business/payee, get advice on structure/tax/liability, and personally complete the applicable Apple paid-app agreements, bank and tax information. Do not put those sensitive records in this repository or tester reports.

This is an operational homework list, not legal, tax or trademark clearance. No company formation, purchase, Apple account conversion or agreement acceptance was performed.

## Follow up

A thread-linked weekly check is scheduled for Mondays at 9 a.m. local time. It reads this tracker and the conversation, stays quiet without a material change, and flags new blockers or unresolved requirements when release becomes relevant. It does not monitor private Apple or business accounts automatically and does not perform registrations or purchases. Update this tracker when the owner supplies decisions or reviewers return evidence.

## Release sequence

1. Review the local changes and Word report. Resolve implementation defects before adding monetization.
2. Save an approved code checkpoint. Build a fresh 0.9.3 preview for the owner's native acceptance; do not publish an incompatible update to 0.9.2 phones.
3. With owner authorization, create/upload a store-distribution build using the `fieldtest` profile. It uses a separate update channel from production. Configure TestFlight test information and invite the chosen coworkers after Apple's required review. A build upload is not a public App Store release.
4. Record coworker findings, electrical verification, rights review, restore-on-phone results and privacy/support completion.
5. Agree on the paid package and implement it as a separate milestone. Check purchases and restore on a development/TestFlight build, not Expo Go.
6. After all release blockers close, set public version 1.0.0, produce the final reviewed build and screenshots, complete App Store metadata and ask the owner for submission/release approval.

## Official starting points

Checked September 28, 2026. Recheck at the time of filing or release.

- [Apple enrollment and seller requirements](https://developer.apple.com/programs/enroll/)
- [Request an individual to organization membership update](https://developer.apple.com/help/account/membership/updating-your-account-information/)
- [Apple developer display name rules](https://developer.apple.com/help/app-store-connect/create-an-app-record/set-your-developer-name/)
- [Florida business records](https://search.sunbiz.org/inquiry/corporationsearch/byname)
- [Florida fictitious name instructions](https://dos.fl.gov/sunbiz/start-business/efile/fl-fictitious-name-registration/instructions/)
- [USPTO trademark search](https://www.uspto.gov/trademarks/search)
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Apple app privacy disclosures](https://developer.apple.com/app-store/app-privacy-details/)
- [Apple external TestFlight testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers/)
- [Expo native runtime compatibility](https://docs.expo.dev/eas-update/runtime-versions/)
- [Expo store submission](https://docs.expo.dev/submit/ios/)
- [Apple subscription experience](https://developer.apple.com/app-store/subscriptions/)
- [Expo purchase testing requirements](https://docs.expo.dev/guides/in-app-purchases/)
