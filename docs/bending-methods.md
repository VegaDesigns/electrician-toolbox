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
