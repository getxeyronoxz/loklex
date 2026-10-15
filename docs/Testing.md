# Testing — checklists and evidence standard

Every behavior change must leave evidence, not a promise: a fresh-tab
browser pass (console clean), a measurement or screenshot for layout
claims, and `tsc` + `next build` green. Test ONLY in a clean tab with
extensions disabled for `localhost` (see Bugs.md B-06).

## Workspace (`/`)

- [ ] 1440×900: document height == viewport (no page scroll).
- [ ] All three panels equal height; footers share a baseline.
- [ ] Long list scrolls inside its pane; thumb hidden until hover.
- [ ] Dividers drag with mouse AND arrows when focused; layout persists.
- [ ] Collapse chevrons point the direction of travel; rails expand back.
- [ ] Quick-report carries subject + description into the wizard.
- [ ] Mobile 390px: panes stack, bottom nav works, collapsed panels visible.

## Complaints

- [ ] Wizard blocks progress on invalid steps; errors inline; input kept.
- [ ] Publish-to-all requires the explicit checkbox.
- [ ] Filing with photos → detail shows thumbnails + working download.
- [ ] Author sees "Mark as closed" → pill flips, timeline gains entry,
      lists reflect Closed.
- [ ] Report flow acknowledges without claiming an outcome.

## Forums

- [ ] Posting a reply appends it and increments the category count.
- [ ] Quote chip attaches and clears correctly.
- [ ] Locked thread disables the composer with an explanation.
- [ ] Author sees "Mark as resolved" → chip + category marker appear.
- [ ] Moderator pin/lock toggles work (moderator account).

## Chat

- [ ] Send → sending → sent; failed seed message retries to sent.
- [ ] Photo attach → thumbnail preview → image bubble → view + download.
- [ ] Mute/unmute channel; report acknowledges; block controls absent (DMed
      removed by design — their absence is correct).
- [ ] Channel header links reach the forum and (where linked) complaint.

## Shell

- [ ] `tsc --noEmit` clean. `next build` green, all 13 routes listed.
- [ ] Fresh tab, extensions off: zero console errors, zero hydration
      warnings on every route above.
- [ ] Keyboard: Tab reaches every control; gold focus visible; ⌘K works.

## Evidence log

- Oct 2026: fresh-tab geometry `docH == innerH == 900`, panels
  `[626, 626, 626]`, 0 console errors (workspace).
- Oct 2026: retry click rendered "Sending…" (B-01 fix).
- Oct 2026: real file upload → preview → image bubble with view/download.
- Oct 2026: cross-links verified in a11y tree (complaint→thread,
  thread→complaint, channel→forum/complaint).
