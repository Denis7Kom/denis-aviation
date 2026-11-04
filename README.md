# Denis Komarov — Aviation

Personal aviation portfolio with six procedural aircraft, an interactive flight network,
a recorded flight log, a local flight-control demo and a flight-request page.

[Open the website](https://denis7kom.github.io/denis-aviation/)

## Development

Requires Node.js 22 or later. Python 3 is used only for the local static server.

```sh
npm ci
npm run build
npm run dev
```

Open `http://localhost:8000`. GitHub Pages serves the committed static files; the
published website does not need Node.js at runtime. The request page loads the Firebase
JavaScript SDK and uses Firebase Authentication and Cloud Firestore; it requires a network
connection and the corresponding Firebase configuration. The site also uses hosted fonts.

## Commands

| Command                        | Purpose                                               |
| ------------------------------ | ----------------------------------------------------- |
| `npm run build`                | Bundle source modules into the published `app.js`     |
| `npm run build:check`          | Fail if the committed bundle differs from the source  |
| `npm run format`               | Format the configured source, tests and documentation |
| `npm run check`                | Check the bundle, formatting and regression tests     |
| `npm run test:firestore-rules` | Test Firestore rules against a local emulator         |
| `npm run dev`                  | Serve the repository on port 8000                     |

Run `npm run build` after editing `src/` and commit both the source and generated bundle.
Do not edit `app.js` directly. The separate `requests.js` file is served directly; it is
not generated from `src/`.

## Structure

```text
src/
  main.js                Page state, UI bindings, animation and flight demo
  aircraft/geometry.js   Airframe profiles, meshes and lamp attachment geometry
  data/aircraft.js       Fleet definitions with stable indices
  data/airports.js       Airport data and hub/favourite classification
scripts/                 Build and test entry points
tests/                  Geometry, rendering and flight-simulation regressions
requests.html           Flight-request form and administrator panel
requests.js             Firebase authentication, request handling and browser alerts
requests.css            Flight-request page styles
firestore.rules         Version-controlled Firestore rules; deploy separately in Firebase
telegram-notifier/      Separate scheduled Cloudflare Worker and D1 state
aircraft-renderer.js    WebGL, depth-buffer fallback and cached wireframe renderer
app.js                  Generated browser bundle
index.html              Published markup and bilingual page content
style.css               Published styles and responsive layouts
assets/                 Photographs and documents
```

See [architecture and invariants](docs/architecture.md) before changing aircraft geometry
or the animation loop. The [request and notification guide](docs/requests-and-notifications.md)
describes access rules, the browser alert and its limitations in Russian. The separate
[Telegram Worker guide](telegram-notifier/README.md) covers configuration and troubleshooting.
[QA_CHECKLIST.md](QA_CHECKLIST.md) covers manual checks, and the
[security review](docs/security-review.md) records the remaining deployment checks.

## Verification

Tests run in Node.js without a browser. They cover mesh validity, moving parts,
glazing clearance, navigation-light attachment, depth occlusion, wireframe caching
flight-game rules, request UI behaviour and the Telegram Worker's mocked integrations.
The flight and rendering tests extract functions from the **shipped bundle** using a
JavaScript parser, so formatting and braces inside strings do not break fixtures.

A separate preservation contract checks that the structural refactor retains the
original authored statements, data, renderer and published HTML/CSS. Local resource
checks also catch missing images, documents and scripts before deployment. Browser checks
remain necessary for visual appearance, responsive layout and GPU/driver differences.
The request tests use mocks: they do not test deployed Firestore Security Rules, Google
authentication or actual browser/Telegram delivery. Verify those separately as described
in the request guide and QA checklist.

The separate Firestore rules suite uses Java 17, an isolated demo project and the
Firestore emulator. It tests the rules in this repository, including direct attempts to
read or cancel another user's request, but does not inspect deployed Firebase rules:

```sh
npm ci --prefix tests/firestore-security --ignore-scripts
curl -fLsS https://storage.googleapis.com/firebase-preview-drop/emulator/cloud-firestore-emulator-v1.19.8.jar -o /tmp/firestore-emulator-v1.19.8.jar
FIRESTORE_EMULATOR_JAR=/tmp/firestore-emulator-v1.19.8.jar npm run test:firestore-rules
```

The runner checks the emulator JAR's SHA-256, binds it to localhost on port 8088 and
refuses to use an already-running service. GitHub Actions runs the same suite. The test
package pins a patched `@grpc/grpc-js` version for its Node-only Firebase dependency.

## Copyright

Text, design, images and source materials are covered by [LICENSE](LICENSE).
Reuse requires prior permission from the author.
