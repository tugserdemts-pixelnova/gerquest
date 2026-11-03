# GerQuest

A 3D journey into the Mongolian ger (Монгол гэрийн 3D аялал).

Scroll through an exploded ger and learn what each of its 9 parts does. Answer a question at each station to collect that part, then build the whole ger yourself, in the right order. Available in Mongolian and English.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Sign-in uses Supabase. Put your project's keys in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
# optional: the deployed origin, used for share-card image URLs
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- three.js for the scene (`src/three/`)
- Game state and the scroll/quiz/build logic live in `src/game/`; part text and translations live in `src/data/`
