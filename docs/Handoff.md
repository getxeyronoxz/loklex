# Handoff — end-of-session notes

Update this file at the end of every work session. Half a minute today
saves hours tomorrow.

## 2026-10 — session: author-close, complaint downloads, docs pack

- Done: image borders + view/download on chat photos; complaint wizard
  keeps photo files → detail grid with view + download; author "Mark as
  closed" (complaints) and "Mark as resolved" (threads) with list +
  timeline reflection; live session reply counts; mobile-collapsed fix;
  full `docs/` pack (this set).
- Model: Muse Spark. Decisions/rationale in Decisions.md.
- Verified: `tsc` clean (re-run `next build` before shipping — last full
  build predates the close/resolve + docs work).
- Still open: live-click test of close/resolve + reply-count bump in the
  browser; mobile-viewport screenshot of the collapsed-panel fix; proofread
  pass on new copy ("Closed by the filer", "Resolved by author").
- Watch out for: B-05/B-06 (stale server, extension) whenever verification
  looks weird — clean tab first, code second. Never edit source with
  `powershell.exe` Set-Content (B-07).
- Next suggested: complaint photo previews in the wizard review step;
  mod-queue actions actually flipping a complaint's status ( backend will
  own this); empty-state for a channel with zero messages is covered.
