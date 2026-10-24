# Denis Komarov — Aviation

Personal aviation portfolio with six procedural aircraft, an interactive flight network,
a recorded flight log and a local flight-control demo.

[Open the website](https://denis7kom.github.io/denis-aviation/)

## Development

Requires Node.js 22 or later. Python 3 is used only for the local static server.

```sh
npm ci
npm run build
npm run dev
```

Open `http://localhost:8000`. GitHub Pages serves the committed static files; the
published website does not need Node.js, a backend or third-party JavaScript at runtime.

## Commands

| Command               | Purpose                                                         |
| --------------------- | --------------------------------------------------------------- |
| `npm run build`       | Bundle source modules into the published `app.js`               |
| `npm run build:check` | Fail if the committed bundle differs from the source            |
| `npm run format`      | Format authored JavaScript, tests and development documentation |
| `npm run check`       | Check the bundle, formatting and regression tests               |
| `npm run dev`         | Serve the repository on port 8000                               |

Run `npm run build` after editing `src/` and commit both the source and generated bundle.
Do not edit `app.js` directly.

## Structure

```text
src/
  main.js                Page state, UI bindings, animation and flight demo
  aircraft/geometry.js   Airframe profiles, meshes and lamp attachment geometry
  data/aircraft.js       Fleet definitions with stable indices
  data/airports.js       Airport data and hub/favourite classification
scripts/                 Build and test entry points
tests/                  Geometry, rendering and flight-simulation regressions
aircraft-renderer.js    WebGL, depth-buffer fallback and cached wireframe renderer
app.js                  Generated browser bundle
index.html              Published markup and bilingual page content
style.css               Published styles and responsive layouts
assets/                 Photographs and documents
```

See [architecture and invariants](docs/architecture.md) before changing aircraft geometry
or the animation loop. [QA_CHECKLIST.md](QA_CHECKLIST.md) covers manual visual checks.

## Verification

Tests run in Node.js without a browser. They cover mesh validity, moving parts,
glazing clearance, navigation-light attachment, depth occlusion, wireframe caching
and flight-game rules. Tests extract functions from the **shipped bundle** using a
JavaScript parser, so formatting and braces inside strings do not break fixtures.

A separate preservation contract checks that the structural refactor retains the
original authored statements, data, renderer and published HTML/CSS. Browser checks
remain necessary for visual appearance, responsive layout and GPU/driver differences.

## Copyright

Text, design, images and source materials are covered by [LICENSE](LICENSE).
Reuse requires prior permission from the author.
