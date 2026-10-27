# Architecture

The application is a static GitHub Pages site. esbuild resolves the authored ES module
imports at development time and emits one readable IIFE bundle. There is no client-side
module loader and no added network dependency in the published application.

## Boundaries

- `src/data/` owns airport and fleet definitions. Fleet and airport indices are stable
  references used by the logbook, console, selection controls and network visualisation.
- `src/aircraft/geometry.js` produces aircraft-space meshes and light fixtures. It does
  not access the DOM, run timers or own interactive state. Cached airframe specifications
  are shared between the solid mesh, wire mesh and light-placement calculations.
- `src/main.js` owns page state, browser events, surface sizing, articulation, animation,
  localisation, logbook replay, radar and the local flight challenge. These features still
  share a lifecycle; this refactor deliberately does not redesign their state management.
- `aircraft-renderer.js` exposes the existing renderer factories on `window`. Its shader
  text and rendering behaviour are preserved. The page loads it before the app bundle.

## Geometry invariants

Coordinates are metres: x is wingspan, y points up and the nose has negative z.
Dimensions are display-model approximations, not engineering data.

1. Keep the same fuselage surface for the hull, windows, doors and cargo markings.
2. Attach moving details to the same articulation part and pivot as their parent surface.
3. Attach lamp housings and light overlays to the same aircraft-space location.
4. Keep detail decals and glazing out of the wireframe mesh.
5. Cache meshes/topology. Camera movement must not rebuild the airframe.
6. Preserve the fleet order; append aircraft instead of changing existing indices.

## Rendering and lifecycle

The WebGL path uses a depth buffer. The software fallback also resolves depth per pixel.
Wireframe uses cached, deduplicated vertices and edges. Aircraft articulation transforms
cached points; motion preferences, viewport visibility and requestAnimationFrame control
when surfaces are repainted.

No additional event listeners, animation loops, storage keys or startup requests were
introduced by extracting modules.

## Preservation contract

`tests/fixtures/refactor-contract.json` records the reviewed statement sequence for
the application shell and a multiset of extracted geometry/data statements. Parsed syntax
trees ignore source locations and literal spelling, so indentation can change without
weakening the check. HTML is checked byte for byte because translations capture its inner markup. CSS and
gallery data are compared after parsing and formatting with the pinned Prettier version;
only formatting changes are permitted. Renderer syntax includes its shader string literals. Review a deliberate behaviour change before updating this contract.

The contract is a refactor guard, not a replacement for functional or browser tests.

## Wing and lamp detail update - 26 October 2026

The wing loft shares its triangulated surface with lamp mounts and clipped panel skins.
Narrowbody secondary flap elements carry their own chord pivot and Fowler travel.
Slat rails share the parent hinge; fine skins and lamp bezels are omitted from wire mode.
The preservation fixture was deliberately refreshed for these geometry and lamp changes;
airport/fleet data, unrelated UI, renderer and styles retain their existing guards.

## Leading-edge revision - 26 October 2026

Removed the decorative spoiler rectangles from the upper wing. Each leading-edge
panel now has its own span bounds and a thin curved slat section. Slats translate
normal to the swept leading edge; deployment leads the flap command slightly.
The 737 uses two inboard Krueger panels and four outboard slats per wing. The A321
uses five slats. The A350 uses an inboard droop nose with six translating slats.
Dimensions and travel remain display approximations; this is not a rigging model.

Reference layouts:

- [FAA: 737 leading-edge devices](https://www.faa.gov/lessons_learned/transport_airplane/accidents/B18616)
- [Airbus: A320-family planning drawings](https://aircraft.airbus.com/sites/g/files/jlcbta126/files/2025-01/AC_A320_0624.pdf)
- [Airbus: A330 planning drawings](https://www.aircraft.airbus.com/sites/g/files/jlcbta126/files/2025-12/AC_A330_20251201.pdf)
- [Airbus: A350 high-lift system design](https://www.icas.org/icas_archive/ICAS2014/data/papers/2014_0298_paper)
