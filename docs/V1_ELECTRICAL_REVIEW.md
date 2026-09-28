# Version 1 electrical review worksheet

Prepared September 28, 2026 by software inspection. Status: **independent electrical review not completed**. Coworkers are available to review; no reviewer, source edition, jurisdiction, or acceptance result has yet been recorded here. This worksheet is not an installation instruction, safety certification, or legal opinion.

## Separate three kinds of evidence

1. **Software regression:** the implementation returns the expected value for a known input. Existing tests can preserve a wrong assumption, so passing tests are not independent validation.
2. **Electrical review:** a qualified person derives the result using an authorized reference, applicable scope, and actual manufacturer information, then compares the app. Record their relevant experience and any limitations; coworker participation alone is not certification.
3. **Content rights:** the owner establishes the provenance and permitted commercial use of shipped tables, explanatory text, illustrations, names, and assets. Removing a visible code citation or adding a disclaimer does not establish that underlying material may be distributed.

All three matter. This pass inventories the first and prepares the second and third; it does not mark them complete.

Software-only receipt, September 28, 2026: 57 targeted regression tests passed across conduit fill, box fill, ampacity, phase/preset validation, bending calculations/geometry/setup, and calculator entry. The current uncommitted working tree on `fix/reliability-and-ux` was tested. This is a subset, not the final all-app check or an independent reference comparison. Repeat on the identified release commit and retain its final test receipt.

## Review method

- Select the intended reference edition before comparing data. Record applicable errata/amendments and the job jurisdiction separately. Do not silently assume a newly published edition is adopted everywhere or upgrade an old dataset by changing a label.
- Have the reviewer work each sample without first seeing the app answer, then compare. Keep calculations in the review record, using source identifiers rather than copying whole tables into this repository.
- Compare every shipped data row against its documented authorized source; samples alone are insufficient to establish transcription accuracy. Verify supported ranges, rounding, boundaries, and excluded use cases.
- For physical bends, record conduit material/size, bender make/model, shoe marks, deduction, setup, measured output, and accepted tolerance. Use training material; do not experimentally validate on energized equipment or a live installation.
- Log mismatches as defects. Fix and rerun the case plus related boundaries. A waiver must state an enforced scope restriction, not merely “use at your own risk.”

## Inventory and required boundary review

| Tool and implementation | What it currently models | Review before public release |
| --- | --- | --- |
| Conduit Fill — `src/utils/conduitFill/conduitFill.ts` | Five raceway families, 1/2 through 4-inch listed sizes; common copper THHN/THWN-2 areas; quantity-based physical fill; smallest listed raceway and additional-conductor suggestions. | Confirm all internal/conductor areas and their edition/provenance; one/two/three-conductor transitions, exact-limit rounding, empty input, largest listed size, and the 1,000-additional-conductor search cap. Review conductor construction, equipment grounds, unsupported cable/insulation/compact constructions, nipples, pulling/jamming, and separate ampacity requirements. The current screen is not a general cable-pull design tool. |
| Box Fill — `src/utils/boxFill/boxFill.ts` | Common box presets or marked volume, #18 through #6 entries, insulated/ground roles, device count with one largest device-wire size, and one internal-clamp allowance. | Verify each box preset against identified manufacturer/marked-volume sources; add-on volume must come from a valid marking, not dimensional guesswork. Review ground/bonding allowance rules, entering versus internal conductors/pigtails, unbroken loops, support fittings, different device-wire sizes, multi-space devices, and internal clamps. Pull/junction-box sizing for larger conductors is outside this model. |
| Wire Guide — `src/utils/wireGuide/ampacity.ts` | Copper/aluminum THHN/THWN-2, 60/75/90°C columns, 90°C adjustment basis, ambient/count bands, connection limit, common small-wire limit; final number rounds down to an integer. | Verify every table row/factor and every band boundary; wire insulation and equipment connection markings; “unknown” connection fallback; neutral counting; cool/hot ambient, grouped conductors, and unsupported materials. Review how small-conductor overcurrent limits are presented alongside ampacity. Do not interpret this as complete breaker selection, load calculation, voltage drop, parallel-conductor design, or every wiring method. |
| Panel Colors — `src/utils/panelColors/phase.ts` and preset validation | Standard paired circuit rows: A-A-B-B-C-C or L1-L1-L2-L2, with chosen colors. Valid saved schemes use those supported orders. | Compare actual manufacturer panel schedules to supported numbering. Document exclusions such as tandem/quad numbering, unusual bus arrangements, and high-leg systems not modeled by this setup. Colors describe a selected convention, not measurement or confirmation of installed conductors. Verify custom phase colors cannot imply a prohibited neutral/ground assignment. |
| Bending — `src/utils/bending/bending.ts`, `feasibility.ts`, geometry and setup modules | Seven EMT hand-bender workflows; field multipliers or ideal offset geometry; explicit tool deduction; fraction formatting; schematic animation and fit warnings. | Review every mark origin/alignment and both saddle center choices; short stubs, springback, rolling direction, close marks, precision collisions, back-to-back origin, real shoe engagement, and obstruction clearance. Verify prefills against the actual tool. Illustrative bend radii and heuristic fit warnings do not certify a bend can be made. |
| Workpad — `src/utils/calc` | Arithmetic and linear measurements, selected display/rounding, equation editing and history. | Verify units, negatives, mixed fractions, rounding labels, floating-point boundaries, division by zero, and invalid expressions. It is not a dimensional area/volume or electrical circuit-design engine. Test native fast entry and caret editing separately from arithmetic. |

## Regression examples for comparison

The expected values below come from the current repository's test cases. They are provided to reproduce behavior, not as externally verified requirements. Use the indicated test file to locate the complete setup. Record a separate independently derived answer and source.

| ID | Input | Expected current behavior | Existing test source |
| --- | --- | --- | --- |
| CF1 | EMT 3/4; 3 × #10 and 6 × #12 | Used area 0.1431 in²; allowed area 0.213 in²; fits | `conduitFill/conduitFill.test.ts` |
| CF2 | EMT; 12 × #10; request minimum listed size | 1-inch EMT | `conduitFill/conduitFill.test.ts` |
| CF3 | One #4 in 1/2-inch EMT; add #4 | Zero additional | `conduitFill/conduitFill.test.ts` |
| CF4 | EMT 3/4; one #1; request additional #14 | Five additional fit; six additional do not. Search must pass through the two-to-three count transition instead of stopping at its first failed step. | `calc/entry.test.ts` |
| BF1 | 30.3 in³; 3 insulated #10, 1 ground #12, 5 insulated #12; no devices/clamp | 21 in³ required; 9.3 remaining | `boxFill/boxFill.test.ts` |
| BF2 | Four versus five equipment grounds, all #12 | Ground contribution changes from 2.25 to 2.8125 in³ | `boxFill/boxFill.test.ts` |
| BF3 | 4 insulated #12; one #12 device strap; internal clamp | 15.75 in³ required | `boxFill/boxFill.test.ts` |
| AG1 | Copper #12; default 78–86°F, 1–3 current-carrying, connection unknown | 20 A; small-wire limit shown | `wireGuide/ampacity.test.ts` |
| AG2 | Copper #6; 96–104°F, 4–6 current-carrying, 75°C connection | Adjusted 54.6 A; displayed final 54 A | `wireGuide/ampacity.test.ts` |
| AG3 | Aluminum #10; 75°C connection, other defaults | 25 A | `wireGuide/ampacity.test.ts` |
| PC1 | Standard black/red/blue, circuits 1–6 and 55 | A, A, B, B, C, C; circuit 55 is A/Black | `panelColors/phase.test.ts` |
| PC2 | Standard split-phase, circuits 1–5 | L1, L1, L2, L2, L1 | `panelColors/phase.test.ts` |
| BE1 | Stub 10 inches; verified deduction 6 inches | Arrow at 4 inches | `bending/bending.test.ts` |
| BE2 | Offset height 6 inches, 30°, field method, first mark 20 inches | 12-inch spacing; marks 20 and 32 inches | `bending/bending.test.ts` |
| BE3 | Offset height 3 inches, 22.5°, field method, precision 1/16 | Unrounded 7.8-inch spacing; displayed 7 13/16 inches | `bending/bending.test.ts` |
| BE4 | Three-point saddle height 2 inches, center 45°, obstacle center 20 inches | Marks 15 3/8, 20 3/8, 25 3/8 inches; center notch first | `bending/bending.test.ts` |
| BE5 | Rolling offset rise 6 inches, sideways 8 inches, 30°, field method | True offset 10 inches; spacing 20 inches; roll plane about 53.13° from vertical | `bending/bending.test.ts` |
| BE6 | Four-point saddle height 6 inches, 30°, inner-mark spacing 12 inches | Relative marks 0, 12, 24, 36 inches; not a promised finished clear opening | `bending/bending.test.ts` |
| BE7 | Existing first 90; outside-back span 24 inches | Second star mark measured 24 inches from first bend's back; no tip deduction | `bending/bending.test.ts` |
| WP1 | Edit `153in - 135in` by inserting `.5` after `153` | Expression retained; result 18.5 inches | `calc/equationEdit.test.ts` |

Test paths above are relative to `src/utils/`. Add exact-limit, just-over-limit, min/max, missing/invalid input, and every supported option to the independent matrix. Do not stop after these happy-path examples.

## Review record template

Complete one record per dataset or workflow. Keep sensitive contact details outside the public repository.

- Dataset/workflow and source commit/build:
- Reviewer name or internal identifier, relevant qualifications/experience:
- Review date:
- Intended jurisdiction and source of adoption/requirements:
- Reference title, publisher/manufacturer, edition/model, errata/revision/date:
- Authorized access and commercial provenance/permission record location:
- Source sections/rows compared; total rows and cases covered:
- Independent calculation or measured bend result:
- App result and differences, including rounding:
- Supported scope and exclusions confirmed:
- Issues and retest evidence:
- Status: Not reviewed / In review / Failed / Accepted within stated scope:
- Reviewer acknowledgment and owner acceptance date:

## Content and rights release gate

The conduit, box, and ampacity transcription editions remain unrecorded in the existing source. Do not advertise “NEC 2023 verified,” “NEC 2026 compliant,” manufacturer endorsement, or nationwide code compliance on that basis.

Before selling, inventory each shipped table, illustration, dictionary definition, icon, and explanatory passage; establish whether it was independently authored, supplied under a suitable license, or requires permission. Record the actual license/permission and required attribution where applicable. Obtain appropriate legal advice for unresolved rights and product-claims questions. The software audit has not established commercial clearance. Reading access to a document, a source link, or an attribution is not a commercial-use permission record.

If a dataset cannot be verified or its distribution basis remains unresolved, hold the affected feature from public release or explicitly reduce the product scope with the owner's approval. Do not silently swap numbers, copy a newer standard, or hide an unresolved risk behind “field reference.”

## Primary review starting points

Sources are starting points for qualified review, not evidence that every shipped row has been checked. Accessed September 28, 2026.

- [Southwire calculation tools](https://www.southwire.com/calculators) — manufacturer comparison tool for matching supported fill examples; record exact settings. A matching calculator result alone does not establish table provenance or rights.
- [Southwire THHN/THWN-2 product specification](https://www.southwire.com/wire-cable/building-wire/simpull-sup-sup-thhn-thwn-2-copper/p/SPEC10000) — check the actual conductor marking and use conditions; do not generalize a selected 90°C product basis to all wire.
- [Klein conduit bender guide](https://data.kleintools.com/sites/all/product_assets/documents/instructions/klein/ConduitBenderGuide.pdf) and [Greenlee hand-bender instructions](https://cdn.greenlee.com/resources/media?key=1adba548-f1d2-43d2-bf44-fe4b89a8b579&languageCode=en&type=document) — compare instructions to the actual tool, including shoe marks and model-specific dimensions. See [bending methods](bending-methods.md) for implementation assumptions and other manufacturer references.
- [Electrical reference register](ELECTRICAL_REFERENCE_REGISTER.md) — current inventory and unresolved evidence. The reviewer should add the authorized reference edition and official jurisdiction source they actually use.

## Acceptance gate

Zero unresolved critical/high-severity calculation or safety-interpretation defects; full data-row comparison recorded; native display and input tests completed; physical bend checks completed within claimed scope; source/rights questions resolved or the affected feature withheld. A review is valid for its stated scope and version, not all future changes. Any changed formula, table, rounding behavior, tool assumption, or output label triggers relevant re-review.
