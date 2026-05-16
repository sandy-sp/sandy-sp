# Portfolio Web App

This is the portfolio frontend app for `sandy-sp`, built with:

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Framer Motion + GSAP + React Three Fiber (deps installed for iterative feature work)
- PostHog client instrumentation

## App Location

`portfolio/web`

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env.local
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build & Lint

```bash
npm run lint
npm run build
```

## Structure

- `src/app/` - App Router entrypoints and global styles
- `src/components/` - UI sections and providers
- `.env.example` - required PostHog environment variable template

## PostHog Notes

- If `NEXT_PUBLIC_POSTHOG_KEY` is missing, analytics will not initialize.
- Default host is `https://us.i.posthog.com`.
