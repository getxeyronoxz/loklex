# Flow — how execution travels

## App boot

`layout.tsx` (fonts, metadata, skip link) → `AppProvider` (restores
`lx-account`, prefs, pane layout from localStorage) → `AppShell`
(viewport lock: `h-screen`, header + footer fixed, `<main>` is the scroll
container) → route page.

## Home workspace (`/`)

`page.tsx` → `DesktopWorkspace` (widths/collapse in state + localStorage,
`lx-reset-panes` event) → three panes fetch via services in `useEffect`
(skeletons meanwhile) and merge session items from context.
QuickReport writes a draft to `sessionStorage` (`lx-draft`) and routes to
`/complaints/new`, which consumes it once on mount.

## Filing a complaint (`/complaints/new`)

Intent (awareness/ask/private) → Details (title ≥ 8, body ≥ 30, photos →
object URLs) → Audience/Category/Forum → Privacy (name display, visibility,
sensitive-category auto-suggests private) → Review (explicit checkbox for
publish-to-all) → `fileComplaint()` / `startThread()` → confirmation screen.
Validation errors render inline; input is never cleared.

## Sending a chat message (`/chat?v=`)

Composer (pill, Enter-to-send) → `sendMessage()` appends `sending` →
900 ms timer flips to `sent`. Failed seed message → `retry()` flips a
local `revived` map (seed rows don't live in session state). Photos travel
as `{name, url}` attachments and render as image bubbles with view +
download links.

## Replying in a thread (`/forums/[category]/[thread]`)

Composer (+ optional quote chip) → `addReply()` → reply appends instantly;
category rows add `sessionReplies` to their counts. Locked threads disable
the composer. Moderators see Pin/Lock toggles (local state).

## Author close / resolve

Complaint detail (`isOwn` = author matches account or session-filed) →
`closeComplaint(id)` → status pill + lists flip to Closed, timeline gains a
"Closed by the filer" entry. Thread page → `resolveThread(id)` → "Resolved
by author" chip + "Resolved" marker on category rows.

## Notifications

Bell badge = static service count. `/notifications` → `SystemAlertsControl`:
`Notification.requestPermission()` (user gesture only) → system alerts
while open. `pushReadiness()` always reports after-close delivery as
unavailable until a backend provides Web Push (see Constraints.md).
