# Tech Stack Baseline (Current)

This document defines the current baseline stack for the portfolio and can evolve as implementation progresses.

## Core Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling/UI:** Tailwind CSS + shadcn/ui
- **Animation:** Framer Motion + GSAP (ScrollTrigger) + React Three Fiber (+ drei) for 3D
- **Content:** MDX for portfolio/project/blog content
- **Backend:** Next.js Route Handlers + Supabase (Postgres)
- **Deployment:** Vercel

## Product/Infra Integrations

- **Analytics:** PostHog
- **Email:** Resend
- **Rate limiting:** Upstash Redis

## Decision Notes

- Plausible analytics is removed from the baseline.
- Features and integrations may be added or removed based on ongoing development direction, scope, and performance needs.
