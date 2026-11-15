# Performance changes

The layout, animation timings, gallery curve/shaders, image framing, and booking/management features are preserved.

- Load the Three.js gallery scene shortly before its section reaches the viewport. Keep the section's original height so scroll positions do not shift.
- Use demand rendering: redraw when the scroll spring moves, an image finishes loading, or the canvas changes. Do not run continuous WebGL frames while the scene is stationary.
- Share curve sampling between each column's two vertices, reuse vectors, and omit normals unused by the shader. A regression test compares all Float32 vertex positions against the original calculation, including the curve endpoints and bend.
- Keep a conservative mesh bound for reliable photo picking after deformation. Dispose gallery GPU resources when unmounted.
- Update odometer text and hover tilt through motion values instead of React state. Suspend the velocity marquee's updates while offscreen.
- Serve supported local/Supabase images through Next's cached responsive WebP optimizer at quality 85. Keep original artwork intact and retain support for other administrator-provided HTTPS image hosts. Prioritize the hero and lazy-load images farther down the page.

The production build's initial home-page JavaScript decreased from **433 kB to 211 kB** (about 51%, including gallery recovery). The Three.js scene is still available as an on-demand chunk.

On this computer, `node scripts/benchmark-gallery.mjs` measured a median **96 ms versus 34 ms** for the original/optimized geometry calculations across 300 simulated moving frames and seven cards (five passes after warmup). This is a CPU microbenchmark, not a browser FPS claim. Stationary-frame and offscreen savings are additional and not included in that number.

Three representative original PNGs delivered at width 640 as WebP measured:

| Image | Original | Optimized |
| --- | ---: | ---: |
| Nissan NV200 | 3,917,417 bytes | 82,256 bytes |
| Toyota Axio | 3,033,159 bytes | 62,482 bytes |
| Vezel photo | 2,208,694 bytes | 38,148 bytes |

Actual image sizes depend on the requested viewport width and device pixel ratio. First requests generate and cache the optimized variant.

The gallery checks WebGL 2 support before initializing Three.js. When WebGL is blocked, or a context is lost, a demand-rendered Canvas 2D renderer projects the same ribbon geometry through the original camera. Both renderers share the original poster artwork and headline proportions. The software renderer preserves the curved scroll animation, depth ordering, and photo selection; the existing full-gallery and search controls remain available. A gallery error boundary contains initialization failures. The capability probe releases its temporary context. Supported browsers retain the original WebGL scene.

SVG gauge coordinates serialize at four decimal places so server/browser floating-point differences cannot produce hydration attribute mismatches.

Validation: production build and 17 automated tests, including unavailable/lost WebGL, software projection against the original Three.js camera, depth ordering, photo picking, and the reported SVG rounding cases. Browser checks cover hero slide controls, fleet pagination, deferred canvas loading, scrolling through the WebGL gallery, photo picking/lightbox image loading, and full-gallery search. The software renderer was also checked at three scroll positions against the WebGL reference at 2560 × 1024, with photo selection verified and no console errors. No database import or content replacement is needed for these changes.
