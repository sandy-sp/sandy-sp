# Initial Build Baseline

## Scope

This baseline covers the first implementation slice for the portfolio website app.

## Implemented

- New app scaffold at `portfolio/web` using Next.js + TypeScript + Tailwind.
- Initial homepage replacing starter template with:
  - Sticky top navigation
  - Hero section with clear positioning statement
  - About section
  - Open source projects grid
  - Experience highlight section
  - Contact CTA/footer links
- Animation-ready UI using Framer Motion for entrance and scroll reveals.
- Light network-style animated background to preserve visual continuity from prior site direction.
- PostHog client provider integrated in root layout.
- `.env.example` added for PostHog configuration.

## Local Commands

From `portfolio/web`:

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Next Iteration Targets

- Add full project detail pages and links.
- Add GSAP ScrollTrigger timeline sections.
- Add a dedicated React Three Fiber scene for hero or transition sections.
- Add contact form API route and persistence layer.
