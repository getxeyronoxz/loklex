# Architecture — Loklex

Mock frontend. Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4.
No backend, no database, no auth server. All data is typed seed data served
through an async service seam.

## Layers (top to bottom)

```
src/app/**            Routes. All client components ("use client").
                      Pages fetch through services, never data directly.
src/components/**
  ui/*                Primitives: Button, Panel, StatusPill, fields,
                      Avatar, EmptyState/SkeletonRows.
  shell/*             AppShell (viewport lock), TopBar, MobileNav,
                      DesktopWorkspace (resizable 3-pane), CommandPalette.
  workspace/*         Home panes: ComplaintsPane, ForumsPane, ChatPane.
  complaints/*        ComplaintCard.
  brand/*             Logo (firm-supplied PNG, cropped to emblem circle).
  safety/             (removed) EmergencyNote deleted at owner's request.
  notifications/*     SystemAlertsControl (Notification API + push stub).
  app-state.tsx       AppProvider: account, prefs, ALL session state.
src/lib/**
  types.ts            Domain contracts. Becomes the shared client/server
                      contract when the backend arrives. Do not add
                      network code here.
  data/*.ts           Static seed: users, complaints, forums, chat,
                      notifications. Indian-locality content, en-IN spelling.
  services/*.ts       Async accessors over data (+ artificial latency).
                      THE ONLY SEAM the backend replaces. Signatures stay.
```

## State model

- **Seed data**: static imports, read-only, shared across visits.
- **Session state** (`app-state.tsx`, React state, resets on reload):
  accountKey, notify permission + prefs (persisted to localStorage),
  sessionComplaints (+files), sessionThreads, sessionReplies,
  sessionMessages (+revived retry map in chat page), mutedIds,
  closedIds (author-closed complaints), resolvedThreadIds.
- **localStorage keys**: `lx-account`, `lx-system-alerts`, `lx-panes`,
  `lx-default-name`, `lx-default-visibility`, `lx-pref-*`, `lx-draft`
  (wizard quick-report handoff, consumed once).
- **Chat attachments / complaint files**: `URL.createObjectURL` —
  session-memory only. A backend replaces these with stored file URLs.

## URL model

`/` workspace · `/complaints`, `/new`, `/[id]` · `/forums`,
`/[category]`, `/[category]/[thread]` · `/chat?v=<channelId>` ·
`/notifications` · `/profile` · `/mod` · `/rules`.

## Cross-links (one connected experience)

- Complaint detail → threads mentioning its `ref` ("Linked discussions").
- Thread title containing `LX-\d+` → complaint chip.
- Channel with `complaintRef` → complaint link; every channel → its forum.

## Identity and theme

- Logo: `public/loklex-logo.png` (firm file). Never recreate, never restyle.
- AMOLED blacks + warmed greys + gold ramp (`@theme` in globals.css).
  Metallic gradient on the emblem only. Fraunces / IBM Plex Sans / Mono.
- Chat is forum channels ONLY. No DMs, no voice/video — by owner decision.
