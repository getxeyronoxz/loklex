# Loklex — Justice · Strategy · Results

A community workspace for raising local concerns, discussing them in forums,
and talking them through in forum-based chat channels. Built for
Lokeswaraiah Legal Associates LLP.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production check
npm start        # serve the production build
```

Requires Node 18+. No database, no accounts server — everything runs in the
browser on typed mock data.

## What's inside

| Route | Screen |
|---|---|
| `/` | Community workspace: Complaints · Forums · Text chat panes (resizable, collapsible) |
| `/complaints` | Filterable complaint list |
| `/complaints/new` | 5-step filing wizard (intent → details → audience → privacy → review) |
| `/complaints/[id]` | Complaint detail, status timeline, support, report |
| `/forums` | Forum categories + latest discussions |
| `/forums/[category]` | Thread list, search, sort, start discussion |
| `/forums/[category]/[thread]` | Thread, replies, quote, moderator pin/lock, report |
| `/chat` | Forum channels, composer with photo previews, mute/report |
| `/notifications` | Activity + system-alert permission |
| `/profile` | Account, notification prefs, filing defaults, muted channels |
| `/mod` | Moderator review queue (switch via the account menu) |
| `/rules` | Community rules + how reporting works |

Chat is forum-based only — there are no personal direct messages. Every
channel belongs to a forum (or a watched complaint).

## Where the backend will plug in

Every screen reads through `src/lib/services/*` — small async functions
that return the types in `src/lib/types.ts`. Nothing else touches
`src/lib/data/*`. To attach a real backend, replace each service body with
a `fetch` call; signatures stay the same, and `types.ts` becomes the shared
client/server contract.

Session-created content (filed complaints, threads, replies, messages,
mutes) lives in React state in `src/components/app-state.tsx` and resets
on reload — the backend replaces that layer too.

## Design tokens

Tailwind v4 `@theme` in `src/app/globals.css`: AMOLED blacks, warmed
greys, a gold ramp (metallic gradient on the emblem only), Fraunces /
IBM Plex Sans / IBM Plex Mono. Motion (`lx-rise`, `lx-pop`,
`lx-slide-in`) is disabled under `prefers-reduced-motion`.
