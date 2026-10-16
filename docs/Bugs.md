# Bugs — paper trail (found → cause → fix → evidence)

## B-01 · Retry on seeded failed message did nothing

- Found: live click test, `/chat?v=ch-commuters`, Oct 2026.
- Cause: `retryMessage()` only updates `sessionMessages`; seed rows aren't
  in session state, so the id matched nothing.
- Fix: page-local `revived` map (`sending` → `sent` after 900 ms),
  rendered as the message state override.
- Evidence: post-fix click showed "Sending…" in the a11y snapshot.

## B-02 · Duplicate `composer` IDs (mobile + desktop instances)

- Found: code review + `querySelector` returning the hidden instance.
- Cause: the same thread element rendered twice (responsive containers),
  duplicating `id="composer"` / `id="chat-report`.
- Fix: `renderThread(prefix)` stamps `m-` / `d-` IDs. Also fixed automation
  targeting the wrong (hidden) node.
- Evidence: `tsc` clean; single visible input per viewport.

## B-03 · Collapsed panel vanished on mobile

- Found: code review, Oct 2026.
- Cause: collapse rail is `lg:flex`-only; below `lg` a collapsed panel
  rendered nothing with no way to expand it.
- Fix: collapsed branch also renders the full section, `lg:hidden`.
- Evidence: `tsc` clean (visual check pending on small viewport).

## B-04 · Composer pill ballooned to ~120px

- Found: screenshot review, Oct 2026.
- Cause: Tailwind v4 sorts `min-h-[120px]` (base) after `min-h-[40px]`
  (override) — later in stylesheet wins at equal specificity.
- Fix: `min-h-[40px]!` (`!important` utility wins deterministically).
  Lesson recorded in Decisions.md.
- Evidence: live cascade inspection (`120px` marked overloaded), then
  screenshot of the compact pill.

## B-05 · Stale dev server served mixed old/new code

- Found: screenshots contradicting on-disk code, Oct 2026.
- Cause: pre-restart `next dev` (PID 3120) with a half-dead watcher.
- Fix: killed it, started fresh; verify on clean tabs only.
- Evidence: fresh-tab geometry (doc = viewport, equal panels, 0 errors).

## B-06 · Browser extension poisoned the page (environmental, not ours)

- Found: dev-server log + DOM inspection, Oct 2026.
- Cause: extension `eppiocemhmnlbhjplcgkofciiegomcon` injects `bis_*`
  attributes into every page → all hydration warnings, its own
  `unhandledRejection`s, and the red "N Issues" overlay pill.
- Fix: none in code. Disable the extension for `localhost`, hard reload.
  Production HTML is clean (build output verified).
- Evidence: attribute names in mismatch diffs; extension ID in stack traces.

## B-07 · PowerShell 5.1 `Set-Content` corrupted UTF-8

- Found: `git diff` showing `—`→`-`, `·`→`�` across a file, Oct 2026.
- Cause: `powershell.exe` (5.1) defaults to ANSI encoding.
- Fix: restored via `git checkout`; all file writes go through the file
  tools, or `pwsh` with explicit `[UTF8Encoding]::new($false)`.
  Never `powershell.exe Set-Content` on source files.

## B-08 · `usePathname` outside Suspense breaks `next build`

- Found: production build prerender error, Oct 2026.
- Cause: `RouteTitle` (uses `usePathname`) mounted directly in `AppShell`.
  Any client hook that reads the URL must sit under `<Suspense>` or static
  prerendering fails — same rule that already covers TopBar/MobileNav.
- Fix: wrapped in `<Suspense fallback={null}>`.
- Evidence: build green, all 13 routes + `/_not-found` listed.

## B-09 · Moderators couldn't read private reports either

- Found: live moderator-view check, Oct 2026.
- Cause: the detail page showed a "restricted" placeholder for every
  `moderators`-visibility filing — including to moderators themselves,
  making the mod queue's "Open context" link useless.
- Fix: `canRead = !isPrivate || isModerator || ownFiling`; placeholder only
  for outsiders. Verified live: moderator sees the full body.

- "doable" typo report: byte-level check proved the file already reads
  `doable`. Screenshot misread. No change.
- "3 Issues" pill: external extension overlay (see B-06). No change.
- Unequal panels in one screenshot: stale-tab artifact (see B-05);
  fresh-tab measurement showed three equal panels. No change.

## B-10 · Mobile chat composer slid under the bottom nav (C4)

- Found: geometry probe at 360×640, `/chat?v=ch-commuters`, Oct 2026.
- Cause: the composer rail was `sticky bottom-[84px]`, but the mobile
  container has `overflow-hidden` + auto height — no scrollport for the
  rail to stick to, so on short phones it sat 90px below the nav's top
  edge. A single `bottomRef` also always held whichever thread instance
  (mobile/desktop) mounted last.
- Fix: fitted-height layout — the mobile panel fills the available height
  and the message log is the internal scroller, so the composer is a
  plain flex child pinned by the panel itself. One bottom ref per
  instance, the effect scrolls the visible one, and reduced-motion users
  get instant (`auto`) scrolling.
- Evidence: post-fix probe at 360×640 — composer bottom 36px above nav
  top (overlap +90 → gap −36), log is the scroller
  (clientH 236 / scrollH 447), page itself no longer scrolls, 1 visible
  composer, no duplicate ids. Same at 390×844 and 1440×900.

## B-11 · Command palette re-read all three catalogs on every open (H1/P1)

- Found: 5 palette opens = 15 `structuredClone` service reads, Oct 2026.
- Cause: the open effect ran
  `Promise.all([listComplaints(), listThreads(), listChannels()])` on
  every `open=true`, and each workspace pane fetched the same catalogs
  independently (H3/P2).
- Fix: shared `lib/services/catalog.ts` seam — one in-flight promise per
  catalog per page visit; all panes, pages, and the palette read through
  it. The palette body also remounts per open (fresh query, focus
  restored to the opener on unmount, no reset effect).
- Evidence: code-level (module promise cache); live re-measure to 3
  total reads still pending a browser pass.

## B-12 · Support toggle silently reset by session updates (C2)

- Found: code review, Oct 2026.
- Cause: the detail effect called `setSupported(session.supported)` on
  every `sessionComplaints` update, so a later store refresh could flip
  a toggle the visitor just made.
- Fix: `supportOverride` (`null` = untouched) keyed by complaint id; the
  visitor's toggle wins once touched, the filing's value stands
  otherwise. Count math unchanged.
- Evidence: `tsc` clean; no other `setSupported` call sites remain.

## B-13 · Plan corrections (claims that did not survive verification)

- C3 privacy filter already correct: member sees 7/8 complaints,
  `c-harassment` hidden, detail shows "Restricted to moderators".
- M1 non-issue: `/forums/does-not-exist` renders "Forum not found".
- A5 non-issue: wizard `role="radiogroup"` groups are labelled.
- M5 wrong: `--color-warn` exists in `@theme`, so `border-warn` is a
  documented token, not a default-Tailwind leak.
- P3 non-issue: `shownCategories.threads` is rendered
  (`{c.threads} threads`), not dead computation.
- M2 reversed: `src/lib/visibility.ts` + `src/lib/services/users.ts`
  are the canonical modules imported across the tree — committed, not
  deleted.
- M4 non-issue: `ForumCategory` / `MessageState` imports are used.
- M3's "invalid `<li>`" claim overstated (a single `<li>` in a `<ul>` is
  valid), but placeholders moved out of the list anyway so the list
  wraps results only.

## B-14 · `npm run lint` red on a pre-existing pattern (advisory, no CI)

- Found: `npm run lint` → 13 errors, 7 warnings, Oct 2026.
- Cause: the `react-hooks/set-state-in-effect` rule fires on the
  hydration-safe restore-from-storage / reload-from-service effects used
  across the tree (chat, complaint detail, wizard draft, thread page,
  profile, app-state, workspace). Same count at HEAD — this pass adds
  none and removed the palette's instance via the remount refactor.
  Two `react/no-unescaped-entities` apostrophes in the wizard remain.
- Fix: none yet — the effects are deliberate (server HTML and first
  client render must match). No `.github/workflows` exist, so lint is
  advisory, not a gate. `tsc --noEmit` clean, `next build` green.

## B-15 · Hydration mismatch on full load with a persisted non-default account
- Found: dev-server log `Uncaught Error: Hydration failed…` on `/`,
  Oct 2026 — only when `lx-account` held a non-default value
  (moderator); cleared storage loaded clean.
- Cause: the server always renders the default account (Meera
  Krishnan / MK) while the client converges to the saved one (Arvind
  Rao / AR) via the restore effect — the account toggle's `aria-label`
  and the Avatar initials differ at hydration time.
- Fix: `suppressHydrationWarning` on the account toggle button
  (`TopBar.tsx`) and on Avatar's decorative initials span
  (`Avatar.tsx`) — React's sanctioned hatch for client-persisted UI.
  No output or behavior change.
- Evidence: live reload with `lx-account=moderator` → zero console
  errors/warnings (was: 1 hydration error). `tsc` clean.

## H2 retest note (Playwright, clean run)
- Quick-report → Continue lands on Step 1 of 5 · Intent with the
  subject and description prefilled in the Step-2 fields and the draft
  consumed (`lx-draft` null). No step drift across the run. The one
  earlier Step-2 sighting was a test artifact (stale click/snapshot
  race), not app behavior - the Playwright run is definitive.

## B-16 · Palette Escape strands focus on body when opened via Ctrl+K

- Found: subagent QA sweep, Oct 2026 (reproduced twice).
- Cause: the dialog restores focus to `document.activeElement` at open
  time — via keyboard shortcut that is `<body>`, so Escape left
  keyboard users at the top of the page instead of the Search button.
- Fix: when the opener is body (or nothing), fall back to the
  `#command-palette-trigger` button (new id on the TopBar search
  button). Button-opens still restore to the button itself.
- Evidence: live Ctrl+K → Escape → `activeElement` is the Search
  button, dialog closed. `tsc` clean.
