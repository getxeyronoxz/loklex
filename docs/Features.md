# Features — what exists and where it lives

## Complaints

- List with search + category/status filters (`app/complaints/page.tsx`).
- 5-step wizard: intent routing (awareness / ask / private), details with
  photo thumbnails, audience picker (all-forums needs explicit checkbox),
  privacy with anonymity caveat, review → confirmation
  (`app/complaints/new/page.tsx`).
- Workspace quick-report box carries a draft into the wizard
  (`ComplaintsPane` → `sessionStorage lx-draft`).
- Detail: timeline, support toggle, report flow, linked discussions,
  session photo grid with view + download, author "Mark as closed"
  (`app/complaints/[id]/page.tsx`).

## Forums

- Categories + latest (`app/forums/page.tsx`).
- Category: pinned-first threads, search, latest/most-discussed sort,
  inline start-discussion composer, live reply counts (seed + session),
  "Resolved" markers (`app/forums/[category]/page.tsx`).
- Thread: opening post, replies, quote chips, reply composer, report,
  moderator pin/lock, linked-complaint chip, author "Mark as resolved"
  (`app/forums/[category]/[thread]/page.tsx`).

## Chat (channels only — no DMs)

- Channel list with search, unread, members (`app/chat/page.tsx`).
- Thread with author names, day chips, sending/sent/failed states, retry,
  photo messages (thumbnails, full view, download), pill composer with
  photo previews, mute/report channel, forum + complaint links.

## Cross-cutting

- Workspace: resizable/collapsible panes, keyboard dividers, layout reset,
  per-pane skeletons, quiet scrollbars, viewport lock.
- Notifications: activity list, system-alert permission flow with
  granted/denied/unsupported states, honest after-close note.
- Profile: account, notification prefs, filing defaults, session activity,
  muted channels.
- Moderation: gated review queue with recorded decisions (`app/mod`).
- Rules, ⌘K palette (complaints/threads/channels), 3 demo accounts.
