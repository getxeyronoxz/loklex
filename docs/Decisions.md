# Decisions — why, not just what

Recorded by Muse Spark (Oct 2026). Newest first.

## 2026-10 — WhatsApp-dark retheme, gold retired

Owner direction: whole-site retheme inspired by WhatsApp dark —
flat black, green accent, no gold anywhere in UI chrome. `gold*`
tokens renamed to `accent*` (`#00a884` / `#4de3a3` / `#005c4b`);
outgoing chat bubbles are deep green with light text, matching the
reference. The logo PNG keeps its own gold (supplied file, used
as-is). All pairs recomputed against AA: accent-hi 12.08, accent
6.53, ink-on-deep 7.18, navy-on-accent 6.93.

## 2026-10 — Author-close, not moderator-close (complaints/threads)

Filers can close their own complaints and resolve their own threads.
Reason: in a community tool the reporter knows first when something is
fixed; waiting on moderators for every closure doesn't scale. Moderators
keep removal/restriction powers via the review queue. Status flips are
session-local until the backend owns status transitions.

## 2026-10 — Snappier mock timings (140 ms lists, 400 ms sends)

Service latency 220→140 ms, message send 900→400 ms. Reason: the old
delays made every navigation flash skeletons and every message feel slow.
Loading and sending states still show honestly — just briefer. Real
network timing replaces both.

## 2026-10 — Responsive rules (skill-backed)

`h-dvh` shell (mobile chrome no longer hides content), fluid `clamp()`
display type, `aspect-ratio` on message images, one breakpoint (`lg`)
for all pane-vs-stack and nav decisions after finding chat used `md`
while everything else used `lg` (dual chrome + hidden composer at
tablet widths). Container queries noted as future, not adopted.
Reason: in a community tool the reporter knows first when something is
fixed; waiting on moderators for every closure doesn't scale. Moderators
keep removal/restriction powers via the review queue. Status flips are
session-local until the backend owns status transitions.

## 2026-10 — Complaint photos stored as `{name, url}`, counts kept

Seed complaints keep `attachments: number`; session filings add
`files: Attachment[]`. Reason: seed rows have no real files, and inventing
fake filenames would be dishonest mock data. Counts render for seed;
thumbnails + view + download render for session files. Backend unifies both.

## 2026-10 — Chat is channels-only, DMs removed

Owner directive: no personal chat; everything attached to forums. Removed
the New-conversation dialog, per-person threads, and user blocking.
Kept per-channel mute + report (those make sense for public channels).

## 2026-10 — Exact logo file, recreation deleted

Owner directive: use the supplied PNG, nothing extra. The SVG wordmark
recreation was deleted. Cropped to the emblem circle via CSS.

## 2026-10 — 112 banner removed

Owner request. The anonymity caveat, honest delivery wording ("Sent",
never "delivered"), and unconfirmed-outcome statuses stay — those are
product honesty, not labeling.

## 2026-10 — AMOLED black + warmed greys

Pure `#000` base (panels read through hairlines), greys warmed to sit with
gold instead of default blue-grey SaaS. Gold brightened a step for black-bg
contrast. `ink-3` pinned at ≥ 4.5:1 for small text.

## 2026-10 — Quiet scrollbars + viewport-locked pages

Multiple permanent scrollbars read as "broken". Pages lock to the viewport;
internal scrollers hide thumbs until hover/focus. `scrollbar-gutter` left
default to avoid layout shift debates; acceptable at this density.

## 2026-10 — Services seam, not a backend

All reads go through `lib/services/*` async functions. Reason: when the
backend arrives, only that folder changes and `types.ts` becomes the shared
contract. No fetch calls anywhere else — enforced by review, not tooling.

## 2026-10 — en-IN spelling kept under a US-dictionary checker

neighbours, honouring, sterilisation, kerb are correct for the audience.
Not Americanized. A browser extension flagging them is environmental noise.

## 2026-10 — `!important` utilities over custom CSS for overrides

Tailwind v4 sorts same-specificity utilities by stylesheet order, so
appended overrides (e.g. `min-h-[40px]` vs base `min-h-[120px]`) can lose.
`min-h-[40px]!` wins deterministically. Custom unlayered CSS is a fallback,
not the mechanism.

## 2026-10 — Shared catalog seam for the mock reads

`lib/services/catalog.ts` holds one in-flight promise per catalog
(complaints / threads / channels / categories). Panes, pages, and the
palette all read through it instead of each fetching independently.
Reason: the duplication was N reads per surface per visit; the seam
keeps one read each and survives the backend swap (real requests +
invalidation replace the promise cache, signatures stay).

## 2026-10 — Untracked `visibility.ts` + `users.ts` kept as canonical

The desktop plan said to delete them; verification showed they are the
modules everything imports (`canSeeComplaint`, account helpers). Reason:
deleting the imported copy would break the tree — the plan claim was
wrong, so both files are committed, recorded here and in B-13.
