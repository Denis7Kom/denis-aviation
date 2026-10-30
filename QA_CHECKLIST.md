# Verification checklist

## Automated checks

Run `npm ci` and `npm run check` before publishing. The checks cover:

- The committed browser bundle matching the source modules.
- Formatting of the paths configured in the `format:check` script.
- Geometry, moving parts, glazing, lights, depth occlusion and wireframe caching.
- Flight challenge rules, traffic conflicts and simulation reset behaviour.
- Preservation of the original application statements, renderer and reference data.
- Byte-for-byte preservation of HTML; formatter-normalised preservation of CSS and gallery data.
- Local resource paths, gallery metadata, file signatures and deferred script order.
- Mocked request form, translations, status display and browser-alert behaviour.
- Telegram Worker cursor, retry and lock logic with mocked external services.

These checks do not replace browser tests or validate the factual contents of documents.
External destinations and remote font availability are outside the local resource check.

## Request and notification checks

The Node.js tests use mocks. They do **not** execute Firestore Security Rules or prove
that a production Firebase, browser or Telegram connection works. The browser alert was
inspected with test data on 30 October 2026; live delivery with the administrator's
account was not confirmed by that check.

Before claiming access rules are verified, compare the rules deployed in Firebase with
`firestore.rules` and use the Firestore emulator or a rules simulator with isolated test
documents and authenticated test identities. Exercise direct reads and writes, including:

- Owner A can read and cancel A's request from `new`, `review` or `confirmed`.
- User B cannot read A's document or change A's status to `cancelled`, even with A's
  document ID. Hiding A's request in the interface is not evidence of this denial.
- An owner cannot cancel from `declined` or `completed`, change other fields while
  cancelling, or delete the document. Anonymous access is rejected.
- The administrator can change only the status to an allowed value, but cannot restore
  a document whose existing status is `cancelled`. Deletion is denied.

For a live browser test, sign in as the administrator, leave the request page open,
enable notifications and create an authorised test request. Check the count, the last
request preview, the browser notification and the click-through. Check denied permission,
reconnection and sign-out. A browser can truncate notification text and suspend background
tabs. Never include real visitor data in screenshots or shared logs.

Telegram delivery requires its own live test: inspect the current scheduled Worker logs,
then confirm receipt of a new test request in the intended private chat. A successful
deploy or a mocked test alone is not proof of delivery. See the
[Telegram setup guide](telegram-notifier/README.md).

## Leading-edge revision check - 26 October 2026

- Upper-wing decorative spoiler rectangles removed.
- Checked clean and deployed leading edges in the software depth renderer.
- Regressions verify family-specific panel counts, thin slat trailing lips,
  swept travel, Krueger downward folding and zero-translation droop noses.
- Flap fairings, landing-light mounts, glazing and wireframe caching retain their
  existing regression coverage.

## Wing and lighting check - 26 October 2026

- All six aircraft selected correctly in Chromium with the software depth renderer.
- Solid and cached wire modes, flap/slat deployment, gear and lights responded.
- A 375 px iframe (360 CSS px after the scrollbar) was checked for mobile controls
  and horizontal overflow; its document width equalled its scroll width.
- No application errors appeared for the local site origin in the inspected logs.
- Narrowbody secondary flap slots and slat-track attachment have dedicated regressions.
- Wing-panel fills and borders are adjacent, avoiding the coplanar overlap found
  during visual review. Lamp fixtures use the same wing surface as their halos.
- New fine details remain excluded from wire mode. Meshes/topology are cached.

These checks used a desktop Chromium viewport and an iframe at mobile width.
Physical phones and the WebGL driver path were not tested in this session.

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
