# Bending Suite methods and limits

Local field-test release. All values are inches; display rounding is separate from calculation. No NEC content or code-compliance claims. These calculations do not replace the actual shoe instructions or a test bend.

Primary reference reviewed September 8, 2026: [Klein Tools Conduit Bender Guide](https://data.kleintools.com/sites/all/product_assets/documents/instructions/klein/ConduitBenderGuide.pdf). Guidance is independently worded. App is not affiliated with Klein Tools.

- Stub: target outside height minus verified shoe deduction. Prefilled EMT deductions correspond to compatible Klein hand-bender sizes; users can override. Arrow alignment.
- Offset / box offset: height times the selected field multiplier. Optional ideal-geometry mode uses height / sin(angle). First mark is user-chosen, not inferred from obstacle location.
- Shrink: field estimate by selected angle, or ideal geometry height × tan(angle/2). Shown as an estimate, never silently added to the first offset mark.
- Rolling: true offset = hypot(rise, sideways travel); mark spacing uses true offset. Roll plane is atan2(sideways, rise), measured from vertical. Side view is in that plane.
- Three-point saddle: distinct field method, NOT the ordinary offset multiplier. Center 45° uses spacing 2.5 × height each side and center correction 3/16 × height. Center 60° uses 2 × height and 1/4 × height. Center notch first, arrow returns. Optional location is obstacle center from end.
- Four-point saddle: two offset pairs separated by user-selected INNER MARK spacing. This is not a model of finished obstruction clearance, shoe radius, or minimum bridge length.
- Back-to-back: first 90 already formed. Measure desired outside-back distance from that bend; use the star on the second mark. Not a cut length or deduction-based tip measurement.

Diagrams: rounded code-native SVG pipe. Straight portions preserve selected bend angle; bend radii and layout distances are illustrative. Dimension labels, not drawing scale, govern layout. EMT setup only; no unsupported claim that conduit sizes/materials share a shoe. Segmented bends, kicks, powered bending and full cut-length development are excluded.

Before release: test each workflow with an experienced electrician and the specified physical bender, including short stubs, close marks, springback, rolling direction, and saddle clearance. Browser tests cannot establish physical accuracy.

## 90-degree preview behavior

The stub animation holds the amber-marked material point at a fixed screen coordinate, rather than holding the cut end and translating the bend to the bottom edge. Its arc is illustrative; neither its radius nor the displayed mark spacing is a calibrated physical shoe model. Tests cover the stationary mark and viewport clearance throughout the transition.

All stub SVG labels must be a single string child. Splitting a phrase into literal and interpolated children caused centered text fragments to overlap in the iPhone renderer. Keep height labels horizontal and use ordinary React Native text for the target-minus-deduction equation beneath the image. Verify rendering on a physical iPhone as well as the browser.

Every bend now uses the approved single control row: Mark it / Finished normally, or four bend-specific steps after selecting Guide me. These occupy the same height. One result summary and Copy action sit beneath the diagram; detailed methods, unrounded values, shrink estimates and absolute mark lists live in Help. Optional end-location inputs remain in the measurement card. The saddle center-location correction and the offset's user-chosen first mark remain distinct.

The remaining six previews share the stub's visual styles, metallic shading, hollow ends and fixed-height diagram area. Finished offset/saddle shapes straddle the center of the stage; switching between views does not change diagram height. Only the stub currently animates its pipe transition. All SVG labels use single strings to avoid native text overlap. Absolute marks also appear in a wrapping native-text strip when an optional location is entered; long fractions are not crammed into the diagram. Guide steps highlight the relevant layout marks; the three-point saddle retains center-notch-first ordering, and the rolling guide retains both true offset and roll plane. Guide imagery is either the marking layout or the final shape, not a simulation of every intermediate physical bend.

The setup label is brand-neutral, with a user-editable deduction preserved in saved settings. Prefills are starting values, not universal specifications. For example, the [Gardner Bender guide](https://www.gardnerbender.com/-/media/inriver/GAR_BRO_032_1220_Hand%20Bender%20How%20To%20Guide.pdf) agrees on the common ¾″ EMT 6″ deduction but specifies 12″ for 1¼″ EMT versus 11″ in the Klein source. Manufacturer guides remain available in Help alongside the [Greenlee guide](https://cdn.greenlee.com/resources/media?key=1adba548-f1d2-43d2-bf44-fe4b89a8b579&languageCode=en&type=document). Do not remove source-specific saddle-method attribution from the calculation layer merely to make the working-screen wording generic.

## September 8 field-feedback preview (local, not released)

Measurement entry now uses typed inches and Enter; additive fraction shortcuts were removed. Angle choices are unchanged. The optional mark-location card explains first-mark placement (or obstacle center for a three-point saddle). A prominent guide button above the preview opens bend-specific steps.

Offset, box offset and rolling offset now separate Bend 1, the 180-degree pipe rotation, Bend 2 and Check. Rolling retains its measurement/plane step. Three-point saddles show center, near return and far return in that order; four-point saddles show each bend separately. Intermediate SVG shapes animate between stages, respect reduced motion, and retain the mark as a material point during each sequential bend. Geometry is schematic, using fixed illustrative lengths and fillets, not a shoe simulation. Back-to-back retains its existing diagram; stub retains its existing animation. Guide controls wrap on small screens.

This supersedes the earlier four-step/static-preview description for these five workflows. Calculations and saved-data schemas are unchanged. Local changes require preview review and physical-iPhone validation before a new release.

Follow-up visual refinement: optional placement is now a quiet single text row (First mark or Obstacle center, marked optional). The guide entry is a muted text link above the diagram. Amber callout backgrounds and explanatory subtitles were removed at the user’s request; entry dialogs and guide behavior are retained.

Optional location clarification: empty locations use the dashed add control; populated locations use a solid row with the tip measurement and a separate Edit button. Actual calculated mark-from-tip measurements appear in amber badges below the diagram when a location is present. Number-only circles were removed from the pipe. Calculations and storage schemas remain unchanged.

## Consistency and fit review — local September 8 follow-up

All seven bends now use PreviewControls and useGuideMotion. Normal order is Mark it/Finished, quiet guide link, diagram, optional absolute mark badges, result/copy, instruction, and Help. Guides use the same Previous/Next/Restart controls, end in Check, and reset to marking when inputs/settings change. The Toolbox home action is explicitly labeled; the bend selector says Change bend. Optional locations retain a dashed empty state and a solid populated row with Edit.

All seven animate between marking and finished views, respecting reduced motion. The 90 stub retains its fixed-material-point geometry. Back-to-back holds the existing bend and star point stationary. Offset/saddle geometry anchors the long end so the shorter side moves, with each active mark invariant during sequential bends. Angle/dimension callouts fan out on narrow screens. These are illustrations, not calibrated shoes; actual marker alignment instructions and computed measurements remain authoritative.

Fit review is separate from calculate(): no multipliers, saddle correction, or first-mark semantics changed. Radius-based screening uses Greenlee Site-Rite reference radii 4-3/16, 5-1/8, 6-1/2 and 9-5/8 inches for the four supported EMT sizes, from the 2023 manual p.4. Source: https://cdn.greenlee.com/resources/media?key=1adba548-f1d2-43d2-bf44-fe4b89a8b579&languageCode=en&type=document . They are examples, not the user's identified bender.

Our geometric inference: two equal circular bends need h >= 2R(1-cos(theta)) before a nonnegative straight section can fit between them. This checks offset height (hypot for rolling; each half of a saddle uses its return angle), not arrow-mark spacing against arc length. The box example, height 1/2 inch at 45 degrees, still calculates 0.7 inch spacing (approximately 11/16) but now flags likely poor fit and offers 10 degrees. Smaller-angle suggestions are recalculated and screened, not certified. Reference-radius violations remain warnings because the actual shoe is unknown. Tight back-to-back spans below two reference radii are also flagged. The outside dimension, shoe engagement and clearance require physical validation.

The existing under-4-inch close-mark reminder is now surfaced prominently but styled mildly. New under-1-inch tip/stub reminders are conservative heuristics, not manufacturer limits. Only unrenderable numeric layouts (zero rounded distance or merged rounded marks) are withheld, with Change precision as recovery. Copied layouts carry applicable warnings. There is no blanket safe/possible badge. Conduit length, hook grip, custom/powered tools, differing radii and real obstacle fit are not fully modeled.

UX review references Nielsen Norman Group's visibility of system status, clear real-world labels, consistency, error prevention, recognition rather than recall, and user control: https://www.nngroup.com/articles/ten-usability-heuristics/ . New controls maintain 44px minimum touch targets and guides keep one contextual instruction visible. Native iPhone visual/accessibility and physical bending acceptance are still required.
