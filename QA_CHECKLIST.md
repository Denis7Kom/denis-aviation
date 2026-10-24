# Verification checklist

## Automated checks

Run `npm ci` and `npm run check` before publishing. The checks cover:

- The committed browser bundle matching the source modules.
- Formatting of authored JavaScript, CSS, tests and documentation.
- Geometry, moving parts, glazing, lights, depth occlusion and wireframe caching.
- Flight challenge rules, traffic conflicts and simulation reset behaviour.
- Preservation of the original application statements, renderer and reference data.
- Byte-for-byte preservation of HTML; formatter-normalised preservation of CSS and gallery data.
- Local resource paths, gallery metadata, file signatures and deferred script order.

These checks do not replace browser tests or validate the factual contents of documents.
External destinations and remote font availability are outside the local resource check.

## Latest browser check — 24 October 2026

The published site was checked in Chromium after the source-module refactor:

- Aircraft selection, wireframe mode, landing gear and flaps responded.
- The aircraft canvas reported the wireframe renderer.
- No application errors appeared in the inspected browser console.
- All six solid and wire meshes matched the approved baseline in a separate comparison.
- Articulation matched at nine combinations of landing-gear and flap positions per aircraft.

The repository contains six aircraft and one gallery image. This record describes
specific checks; it is not a claim that every browser or device has been tested.

## Manual regression checklist

Repeat the following after changes to markup, layout, translations or interaction:

- Check Russian and English at desktop width and at 320, 375 and 768 CSS pixels.
- Check the hero image, favicon and both certificate download links.
- Select all six aircraft. Check solid/wire modes, detail views, rotation, zoom and lights.
- Cycle landing gear and flaps. Inspect windows, doors, lights and moving-part clearance.
- Check the three logbook routes, scrubbing, pause/reset and the aircraft link.
- Check all airport categories, search, country filters, empty results and reset.
- Check ATC tabs with mouse and keyboard, and callsign copying on HTTPS.
- Start, pause and reset the flight challenge. Check target selection and flight controls.
- Check Motion, console commands, mobile navigation and keyboard focus.
- Open and close the gallery. Check translated alt text and the image caption area.
- Inspect browser errors and horizontal overflow.

## Historical check — 22 October 2026

Russian and English were inspected in Chromium at desktop width and at 320, 375
and 768 CSS pixels. That version had four aircraft and an empty, hidden gallery.
It covered logbook replay, airport filters, ATC keyboard navigation, copying,
challenge controls, Motion, console commands and narrow-screen overflow.

Safari, Firefox and physical iOS/Android devices have not been verified in this record.
The flight instruments and conflict warnings are illustrative simulation features.
