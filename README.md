# Noir Frame

A premium, cinematic photography studio website — dark editorial design,
glassmorphism used sparingly, and a slow-drifting glass sculpture built
in Three.js / React Three Fiber as the site's signature motif.

## Stack

- React 18 + Vite
- Three.js / React Three Fiber / Drei (the hero + about glass object)
- GSAP + ScrollTrigger (scroll reveals, parallax, the horizontal gallery)
- Lenis (smooth scrolling)
- Framer Motion (route + image-viewer transitions)
- React Router (Home, Portfolio, About, Contact)

## Getting started

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build      # production build to /dist
npm run preview    # preview the production build locally
```

## Project structure

```
src/
├── components/     UI building blocks (Navbar, Hero, Portfolio, Contact...)
├── pages/          Route-level compositions (Home, PortfolioPage, AboutPage, ContactPage)
├── three/          Reusable R3F scene: Scene, Camera, Lighting, Environment, FloatingGeometry
├── animations/      GSAP scroll/hover helpers + Framer Motion variants
├── styles/         globals / typography / glassmorphism / responsive CSS
├── data/           portfolio.js, services.js, gallery.js
└── utils/          small helpers (lerp, clamp, scrollToId, device detection)
```

## Performance pass

The site was optimized in place — same folder structure, same components,
no rebuild. What changed:

- **One WebGL canvas.** The About section's glass object used to be a
  second `<Canvas>`; it's now `<StaticGlassFallback>`, a pure-CSS radial
  gradient with a CSS keyframe float. Only the hero mounts real Three.js.
- **Lazy-loaded 3D.** `three/LazyScene.jsx` code-splits `Scene.jsx` (and
  therefore three / fiber / drei) out of the main bundle, defers mounting
  until `requestIdleCallback`, and renders `StaticGlassFallback` as the
  loading state — so the hero text and image paint immediately and the
  3D chunk downloads after the page is already interactive.
- **Graceful degradation, not a throttled scene.** Touch devices, devices
  that report low core/memory counts, `prefers-reduced-motion`, and
  no-WebGL environments all resolve to the same static fallback rather
  than a "lite" WebGL scene — one code path, always correct.
- **Cheaper Three.js.** `dpr` is capped at 1.5 (1 on touch devices, per
  `getDpr()` in `utils/helpers.js`), the environment map is skipped on
  touch/low-power devices and capped to a 64px cubemap otherwise, and the
  glass material drops to a plain `meshPhysicalMaterial` instead of
  `MeshTransmissionMaterial` when `lowFi` is set.
- **Responsive, blur-up images.** `components/SmartImage.jsx` renders a
  tiny blurred placeholder first, then a `srcSet`/`sizes` image with
  `loading="lazy" decoding="async"` — except the hero image, which uses
  `fetchpriority="high"` and loads eagerly. All portfolio, gallery, and
  service imagery now goes through this one component. It currently
  resolves against `picsum.photos` seeds (placeholder data only) — swap
  in a real AVIF/WebP-serving `src` builder and nothing else changes.
- **Fewer ScrollTrigger instances.** `initScrollReveals` now uses a
  single `ScrollTrigger.batch` per section instead of one trigger per
  card; all triggers are still killed on unmount.
- **Trimmed fonts.** `index.html` only requests the weights the CSS
  actually uses (Manrope 300/500, Fraunces 300/400 + 300 italic) instead
  of the full variable-font range.
- **Reduced motion, fully respected.** When `prefers-reduced-motion` is
  set: Lenis never initializes, the hero parallax never attaches, and
  the 3D scene resolves straight to the static fallback.

One deliberate non-change: GSAP and Framer Motion both stay. They're not
doing the same job — GSAP/ScrollTrigger drives scroll-linked animation,
Framer Motion drives React-mount-linked transitions (route changes, the
image viewer). Simple hover/opacity/scale states are plain CSS
transitions throughout, per the brief.

## Notes

- All imagery in `src/data/*.js` currently points at placeholder images
  (`picsum.photos`) so the site runs immediately. Swap these for real
  photography before shipping — same file, same shape, no other code
  changes needed.
- The 3D scene automatically drops to a cheaper material and disables
  the environment map on lower-end / touch devices, and respects
  `prefers-reduced-motion`.
- The custom cursor disables itself on touch devices.
- Fonts are loaded from Google Fonts (Fraunces + Manrope) in `index.html`.
  Swap in local files under `public/fonts` if you'd rather self-host.
