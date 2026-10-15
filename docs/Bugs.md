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

## Non-bugs (investigated, no change)

- "doable" typo report: byte-level check proved the file already reads
  `doable`. Screenshot misread. No change.
- "3 Issues" pill: external extension overlay (see B-06). No change.
- Unequal panels in one screenshot: stale-tab artifact (see B-05);
  fresh-tab measurement showed three equal panels. No change.
