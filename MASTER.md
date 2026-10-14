# sandy-sp.info — Design System (MASTER)

Single source of truth for the site's visual and motion language. Every color, size,
duration and easing in code comes from here (mirrored as CSS variables in
`src/app/globals.css` and as constants in `src/lib/motion.ts`).

Approved preview: https://claude.ai/artifact/K3Bkris16gxt1MCLYbKZ9W

## Theses

**Visual.** Warm ink-black canvas with bone-white text. One oxblood → ember red lives only
in the WebGL form, focus rings and active states. Huge tight grotesk display, mono for
metadata. Airy 8px rhythm on a 12-column grid with hairline rules. Sharp, flat, outlined
components. No shadows, no glass, no glow blobs.

**Interaction.** Two speeds. UI answers in 180–240ms with expo-out. The scene and text
reveals move slowly (600–1200ms), driven by scroll. Pointer warps the form. Links roll
their letters and wipe a red underline. Line-masked text reveals with a 40ms stagger.

**Forbidden.** Gradient text, sparkle/emoji pills, spotlight cards, particle networks,
glassmorphism, glow blobs, bounce/elastic easing, endless DOM loops, buzzword metrics,
scroll-jacking that blocks reading.

## Color

Single dark world. The site does not ship a light theme.

| Token | Hex | Role | Contrast on ink |
|---|---|---|---|
| `--ink` | `#0b0a09` | page background | — |
| `--ink-2` | `#141210` | raised surface (rare) | — |
| `--rule` | `#2a2622` | hairlines, borders | decorative |
| `--bone` | `#ece6dc` | primary text | 16.4:1 |
| `--ash` | `#9b938a` | secondary text, metadata | 6.6:1 |
| `--oxblood` | `#7a1712` | form shadow tone | decorative |
| `--ember` | `#e5462e` | form, focus, hover, active | 5.3:1 |

Rules: ember is never a fill for large areas of DOM. Text in ember only on hover/active
states or 1-3 word accents. Selection uses ember on ink.

## Typography

- Display / body: **Schibsted Grotesk** (variable 400–900). `--font-display`
- Utility: **JetBrains Mono**. `--font-mono`

| Step | Size | Line height | Tracking | Weight |
|---|---|---|---|---|
| `display-1` | `clamp(3.5rem, 11vw, 10.5rem)` | 0.86 | -0.055em | 600 |
| `display-2` | `clamp(2.25rem, 5.5vw, 4.75rem)` | 0.95 | -0.045em | 600 |
| `h3` | `clamp(1.5rem, 2.4vw, 2.25rem)` | 1.05 | -0.035em | 600 |
| `lead` | `clamp(1.125rem, 1.6vw, 1.375rem)` | 1.5 | -0.01em | 400 |
| `body` | `1rem` / `1.0625rem` | 1.6 | 0 | 400 |
| `mono` | `0.75rem` | 1.4 | +0.06em, uppercase | 400–500 |

Running text max 62ch. Headings `text-wrap: balance`. Numbers `tabular-nums`.

## Space

8px base. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192 (px).
Section padding: `clamp(96px, 16vw, 192px)` block. Page gutter: `max(16px, 4vw)`.
Grid: 12 columns, 24px gap (16px under 800px). Max content width 1440px.

## Shape

Radius: `0` for layout and rows, `2px` for controls. Borders are 1px `--rule`, `--bone`
on hover for ghost controls. No `box-shadow` anywhere.

## Components

- **Button (solid):** bone fill, ink text, 2px radius, 16×22 padding. Hover: ember fill.
  Active: translateY(1px). Focus: 2px ember outline, 3px offset. Disabled: 35% opacity.
- **Button (ghost):** transparent, `--rule` border → bone border on hover.
- **Link (roll):** text rolls up to an ember copy, ember 1px underline wipes left → right
  in 380ms.
- **Index row:** hairline top border, mono meta / display name / mono note. Hover: name
  shifts 12px right and turns ember; the WebGL form heats up.
- **Label:** mono, uppercase, ash.

## Motion

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(.16, 1, .3, 1)` | UI, text reveals |
| `--ease-in` | `cubic-bezier(.7, 0, .84, 0)` | exits (opacity only) |
| `--ease-scene` | `cubic-bezier(.65, 0, .35, 1)` | scene morphs, route fades |
| `--t-fast` | 180ms | hover color |
| `--t-ui` | 220ms | hover transform |
| `--t-wipe` | 380ms | underline wipe |
| `--t-route` | 450ms | page transition |
| `--t-reveal` | 900ms | line reveal |
| `--stagger` | 40ms | per line |
| scene settle | ~1.2s (exp damping, k = 3.2/s) | form morphs between sections |

Smooth scroll: Lenis (lerp 0.1), synced to GSAP ScrollTrigger.

Reduced motion: Lenis off, reveals become 300ms opacity fades, scene time runs at 15%,
pointer warp off, route transitions become instant.

## Scene (persistent WebGL form)

One fixed full-viewport raymarched SDF canvas behind all content. It never unmounts, so
moving between pages is a continuous morph: forms melt through lava on the way from one
shape to the next. Sections declare a state with `data-scene="<name>"` and optionally
`data-part="<index>"` (active module, layer or globe stop).

Each page owns a form. Inner pages open with the form beside the title (`*Intro`), then
slide it to the opposite side of the content as you scroll.

| Page | State | Form | Placement |
|---|---|---|---|
| Home | `hero` | lava sphere, pointer warps surface | right |
| Home | `approach` | orbiting agent nodes | bottom-left |
| Home | `explore` | lava; previews the destination's form on row hover | right |
| Home | `contact` | calm ring | top-right |
| Work | `work` | 3x3 modules, one per project; hovered row's module pops out | right of list |
| Project | `project` / `projectAside` | modules with this project's module raised | beside title / parked right |
| Journey | `globeIntro` → `globe` | dotted globe; turns to each stop, draws the route | right → left |
| Stack | `stackIntro` → `stack` | four stacked layers; active category slides out | right → left |
| Inner text | `aside` | dim nodes parked at the right edge | right edge |
| 404 | `page` | small dim sphere | top right |

Journey has two views (tab, remembered per browser): **Globe** (default) and **Basic**
(plain chronological list).
