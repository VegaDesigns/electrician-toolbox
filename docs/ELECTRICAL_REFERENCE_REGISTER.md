# Electrical reference register

Software inventory reviewed September 28, 2026. This register describes the existing implementation and its source-tracking gaps. No new code edition or jurisdiction is claimed. The Version 1 preparation pass did not change electrical table values or formulas and does not constitute independent electrical or commercial-rights approval.

Status: **independent electrical review pending**. The owner has coworkers available for review; no completed reviewer record has been supplied. Use [V1 electrical review](V1_ELECTRICAL_REVIEW.md) for the inventory, sample regression cases, boundary checklist, and sign-off template. Use [V1 field test guide](V1_FIELD_TEST_GUIDE.md) for native acceptance with 5–10 testers.

| Dataset / module | Implemented scope | Reference tracking |
| --- | --- | --- |
| `src/utils/conduitFill/conduitFill.ts` | EMT, IMC, RMC, PVC 40/80 internal areas; common THHN/THWN-2 conductor areas; count-dependent fill limits and minimum listed size | Existing source comments identify NEC Chapter 9 Tables 4 and 5. The edition used for transcription was not recorded. Record edition, table rows, and reviewer after a complete source comparison. |
| `src/utils/boxFill/boxFill.ts` | Common listed box volumes and marked volume, insulated conductors, equipment grounds, device straps, and internal clamp allowance | The existing model uses one ground allowance through four grounds and a quarter allowance per extra ground. The source edition and the box-volume catalog provenance were not recorded; verify these against the intended edition and actual marked box/add-on volumes. |
| `src/utils/wireGuide/ampacity.ts` | Copper/aluminum 60/75/90°C columns, selected ambient and conductor-count adjustments, termination and small-wire limits | The original transcription edition was not recorded. The result is the most restrictive implemented limit, rounded down; it is not a complete circuit-design or breaker-selection workflow. |
| `src/utils/panelColors` | Circuit-to-phase sequencing and selected color schemes | Color presets describe the user's selected panel convention. They do not infer the actual installed wiring. |
| `src/utils/bending` | Hand-bender marks, dimensions, and schematic guides | See [bending methods and manufacturer references](bending-methods.md). Tool setup remains editable and must match the actual bender. |

The original table values remain unchanged in this repair. The conduit additional-conductor search now continues through the two-to-three conductor allowance transition; its regression checks both the final fitting quantity and the first quantity that does not fit.

For a reproducible release review, attach a licensed reference edition, jurisdiction, reviewer, review date, and representative boundary comparisons to each dataset. Preserve the supplied manufacturer dimensions and marked capacities; do not substitute a newer code edition silently.

Primary source starting points:

- [NFPA research on electrical conductors](https://content.nfpa.org/-/media/project/storefront/catalog/files/research/research-foundation/reports/electrical/rf_electrical_conductors.pdf?rev=580909633c3643878d186bb08a52226c) identifies the 2023 NEC conductor ampacity tables and their scope. It does not establish which edition this app's earlier tables were transcribed from.
- [Southwire calculators](https://www.southwire.com/calculators) includes conduit-fill and cable-pulling tools for independent example comparisons. No full table comparison with those tools was performed in this repair.

Do not label a dataset “verified to NEC 2023/2026” until the corresponding comparison and reviewer record exist. Source tracking is now explicit; field/reference acceptance remains a release task.

## Version 1 evidence tracker

| Area | Current evidence | Still required before a supported public-release claim |
| --- | --- | --- |
| Formula regression | 57 targeted tests passed September 28 on the current working tree, including domain calculations and selected geometry/input boundaries; see the review worksheet for scope and exact cases. | Run the final candidate all-app checks and retain the result. Derive separate answers from authorized references; tests written against the same dataset are not independent validation. |
| Electrical data provenance | Source modules and missing edition records are identified above. | Identify reference editions, actual source rows, errata, and applicable jurisdiction; compare every shipped row and record reviewer/date. |
| Manufacturer-specific behavior | Bending sources, configurable deduction, and schematic limits are documented. | Qualified physical checks for each claimed workflow and compatible tool; record model, material, tolerance, and measured results. |
| Content rights | Source links exist; no commercial-permission or complete authorship/license inventory has been recorded here. | Owner review of distribution basis for tables, text, illustrations, and assets; record required permissions/attribution and resolve legal uncertainty before sale. Removing citations does not resolve provenance. |
| Native field acceptance | The owner has offered coworkers for a test group. | Record actual TestFlight candidate, tester roles/devices, observations, critical/high defects, fixes, and acceptance. An available tester is not a completed test. |

Until these records are complete, retain the qualified field-reference scope and do not imply approval by NFPA, a jurisdiction, or a tool manufacturer. A disclaimer does not turn an unverified calculation into a verified one. Public release of an unresolved feature requires an owner decision to hold or reduce its scope, not a silent assumption.
