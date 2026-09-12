# Homepage Cinematic Motion — StayBali

**Status:** First release implemented; optional sticky scroll story not implemented

**Priority:** P1 release polish, after the M6 operational E2E gate

**Reference:** `https://listings.nghpropertygroup.com/`

## Goal

Add the prepared 18-second villa-construction film to the StayBali homepage and create a premium scroll response without delaying search, hiding pricing, or turning the page into a scroll-controlled demo.

The film is an AI-assisted editorial asset. It may support the StayBali brand story, but it must never be presented as footage of a specific bookable property, a verification result, or evidence behind a trust claim.

## What the reference actually does

The NGH Listings homepage uses two related but separate patterns:

1. Its first viewport is a full-bleed video hero. The browser receives a preloaded WebP poster and chooses between AV1 MP4, VP9 WebM, and H.264 MP4 video sources. Playback is muted, inline, and deferred when reduced motion or data saving is enabled.
2. A later storytelling section uses a roughly `300svh` wrapper with a `sticky` full-viewport stage. Native scroll progress is sampled with `requestAnimationFrame`, mapped to `video.currentTime`, and also drives text translation, opacity, blur, and a progress line. Reduced-motion users receive a normal non-sticky layout.

The smooth feeling is therefore not only a smooth-scroll library. It comes from full-viewport composition, transform-only motion, progressive video loading, a sticky scroll runway, and synchronizing all visual changes to one normalized scroll-progress value.

## StayBali product decision

Use the reference as a motion language, not as a pixel-for-pixel clone.

### Required first release — implemented

- Replace the current hero photograph visually with the prepared film while retaining a poster as the first and fallback frame.
- Keep the headline and search panel immediately available in the first viewport.
- Add a restrained hero-exit parallax: media scales and travels slightly while the copy settles upward as the user leaves the hero.
- Use the existing Framer Motion dependency. Native page scroll remains the source of truth; do not add Lenis or GSAP for this pass.
- Play the construction film once and hold its completed-villa ending. Do not loop until a genuinely seamless loop edit exists.

### Optional second release — not implemented

Add one mid-page cinematic story section after featured stays and before destination discovery. This is the correct place for an NGH-style sticky scrub because it does not block the primary search task.

- Desktop runway: `240svh` to `300svh`, with a `sticky top-0 h-svh` stage.
- Mobile runway: maximum `180svh`; prefer a shorter motion sequence or a normal autoplay section when seeking is not stable.
- Map normalized section progress to a dedicated short-GOP scrub encode, text states, and a visible progress line.
- Do not reuse the normal streaming encode for frame scrubbing unless browser testing proves seeking is smooth.

## Asset contract

Place versioned marketing assets in `public/videos/homepage/`:

```text
public/videos/homepage/
├── hero-construction-poster.webp
├── hero-construction.av1.mp4
├── hero-construction.webm
└── hero-construction.mp4
```

The prepared files currently meet the intended first-pass envelope:

| Asset | Role | Target budget |
| --- | --- | ---: |
| `hero-construction-poster.webp` | LCP/fallback image | ≤ 250 KB |
| `hero-construction.av1.mp4` | Preferred modern source | ≤ 5 MB |
| `hero-construction.webm` | VP9 fallback | ≤ 6 MB |
| `hero-construction.mp4` | Broad H.264 fallback | ≤ 9 MB |

All variants must remain 16:9, 1920×1080 maximum, 24 fps, muted/no-audio, and contain identical visual timing. The poster should show the completed villa rather than an unfinished construction frame.

If the optional scroll-scrub section is implemented, create a separate `hero-construction-scrub.mp4` with frequent keyframes. Optimize that file for seeking, not only for sequential playback, and document its resulting size before shipping it.

## Component boundary

Keep `app/page.tsx` as a Server Component. Only media lifecycle and scroll-linked transforms cross the client boundary.

```text
app/page.tsx (Server Component)
└── HomeMotion
    └── CinematicHero (Client Component)
        ├── HeroVideo
        ├── gradient overlays
        ├── headline/value proposition
        └── SearchPanel
```

Recommended responsibilities:

- `HeroVideo`: poster, ordered sources, capability preferences, play/pause lifecycle, and a static fallback.
- `CinematicHero`: `useScroll`/`useTransform` mapping for the hero exit only.
- `ScrollStory`, if later approved: sticky runway, video-time mapping, narrative states, and progress indicator.
- `HomeMotion`: continue owning `LazyMotion`, the shared easing curve, and the reduced-motion configuration.

Do not attach scroll state to the whole homepage React tree. Motion values should update DOM transforms without causing `app/page.tsx`, search inputs, or property grids to rerender on every scroll event.

## Hero behavior specification

The hero uses `min-height: 100svh` and preserves mobile-safe spacing for the public header and search panel. The video media layer overscans the hero slightly so its parallax transform never exposes an empty edge. The construction film uses a tighter crop shifted to the right, keeping the building as the primary subject and pushing the less stable wave detail outside the visible frame.

| Element | Hero entry | Hero exit | Notes |
| --- | --- | --- | --- |
| Video layer | opacity `0.82`, scale `1.045` | opacity `1`, then scale up to about `1.10` | Reuse the current entrance language; no large zoom |
| Video vertical travel | `0%` | `6%` to `8%` | Transform only; keep enough overscan to avoid exposed edges |
| Copy group | `y: 20px`, opacity `0` | `y: -24px`, opacity no lower than `0.35` | Entrance remains time-based; exit follows scroll |
| Search panel | normal | `y: -12px`, opacity no lower than `0.65` | Keep usable until the hero leaves the viewport |
| Dark overlay | current contrast | increase by at most `0.08` opacity | Text contrast must remain AA over every frame |

Use a normalized progress range local to the hero, not raw document scroll. Clamp values so elastic overscroll cannot produce extreme transforms.

## Video lifecycle

Server-render the poster and video element with `preload="none"`. After hydration:

1. Read `prefers-reduced-motion` and `navigator.connection.saveData` when available.
2. Keep the poster only when either preference requests less data or motion.
3. Otherwise set preload deliberately, call `load()`, and attempt muted inline playback.
4. Pause when the hero is outside the viewport and resume only when it returns and has not ended.
5. Pause while the document is hidden.
6. If autoplay rejects or decoding fails, keep the poster; the search and page content must remain fully functional.

Source order:

```html
<source src="/videos/homepage/hero-construction.av1.mp4" type='video/mp4; codecs="av01.0.05M.08"' />
<source src="/videos/homepage/hero-construction.webm" type='video/webm; codecs="vp9"' />
<source src="/videos/homepage/hero-construction.mp4" type="video/mp4" />
```

The poster is the LCP candidate and should be preloaded through the Next.js-supported API. The video must not be the only way to understand the page.

## Motion and performance constraints

- Animate only `transform` and `opacity` during normal hero scroll. Avoid scroll-linked width, height, top, padding, filter, or box-shadow changes.
- Do not add a global smooth-scroll engine for this feature. Native keyboard scrolling, anchor links, browser find, back/forward restoration, and form focus must continue to behave normally.
- Avoid permanent `will-change`; enable it only on the active media stage when profiling shows a benefit.
- One animation loop may own the optional scrub section. Do not combine Framer Motion, CSS smooth scrolling, and a second `requestAnimationFrame` loop on the same property.
- Pause video and animation work offscreen.
- Do not preload multiple full video codecs. Let the browser select one source.
- Preserve the hero's dimensions before media loads; no layout shift is allowed.
- The feature is rejected if it causes persistent long tasks, visible frame jumps, search-input lag, or horizontal overflow at 360 px.

Performance targets for the final browser review:

- No regression that moves homepage LCP beyond the agreed release budget; target ≤ 2.5 seconds on a representative mobile profile.
- CLS ≤ 0.1.
- Interaction with the search panel remains responsive while video is playing.
- Smooth visual motion at desktop 60 Hz where the device can sustain it; graceful frame dropping must not affect input.

## Accessibility and content integrity

- Decorative video uses `aria-hidden="true"`, has no controls, and contains no audio track.
- `prefers-reduced-motion: reduce` renders the poster and disables all scroll-linked transforms, sticky runway, blur, and scrub behavior.
- Data Saver receives the poster without loading video bytes.
- Text, search fields, focus rings, and validation messages stay in the normal reading/focus order.
- No scroll trapping or forced progress. Users can page-scroll, use Home/End, follow anchors, and focus the search form normally.
- The AI-assisted film must not be attached to a property title, verification statement, availability claim, or booking CTA in a way that suggests the depicted villa is a listed stay.

## Implementation sequence

1. Copy the four approved web assets to `public/videos/homepage/` and verify filenames and sizes.
2. Extract a focused `HeroVideo` client component and keep homepage data rendering server-side.
3. Replace the visual hero media while retaining the existing gradients, header, copy, and search semantics.
4. Add the restrained Framer Motion hero-exit mapping and reduced-motion fallback.
5. Test autoplay rejection, Data Saver fallback, tab visibility pause, and offscreen pause.
6. Run responsive and performance review before considering the optional sticky scrub section.
7. Implement the optional section only with a dedicated seek-friendly encode and separate acceptance review.

## Acceptance checklist

- Poster appears immediately before video decode and remains a valid fallback.
- AV1, VP9, and H.264 source negotiation works without downloading every variant.
- Video plays muted and inline where permitted, pauses offscreen, and ends on the completed villa frame.
- Headline and search are usable without waiting for JavaScript or video.
- Hero exit feels continuous with trackpad, wheel, touch, keyboard, and anchor navigation.
- Reduced Motion and Data Saver produce a static, complete page.
- Mobile 360 px and desktop 1440 px show no crop that hides the primary subject, no horizontal overflow, and no obscured search controls.
- The film is clearly editorial/decorative and is not confused with a real listing.
- Lint, TypeScript, production build, and targeted Playwright homepage checks pass after implementation.
