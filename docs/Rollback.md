# Rollback — exit plans, written before they're needed

## Single bad commit

```bash
git log --oneline -5        # find the last good hash
git revert <bad-hash>       # surgical, keeps history
npm run build               # must list all 13 routes
```

Prefer `revert` over `reset` on shared history. One feature = one commit,
so a revert never drags unrelated work with it (see commit history).

## Dev server serving stale/mixed code (B-05)

```bash
taskkill /F /IM node.exe     # stop ALL node processes (dev only)
npm run dev                  # fresh watcher
# hard reload the tab (Ctrl+Shift+R); verify in a CLEAN tab
```

Never debug layout against a tab that has been open across edits —
HMR does not reliably re-apply root-layout changes in place.

## Extension-poisoned verification (B-06)

If hydration warnings or overlay pills appear: disable all extensions
for `localhost`, open a fresh tab, re-run the check. Do not "fix" code
for extension-injected attributes.

## Corrupted file encoding (B-07)

```bash
git diff --stat              # a whole-file rewrite = red flag
git checkout -- <file>       # restore, redo the edit via file tools
```

## Data-model regret (e.g. `files`, `closedIds`)

Session state is code, not stored data — removing a field is a code edit
plus deleting its reads. No migration exists because nothing persists.
Seed data edits are plain content edits with instant visual verification.

## Full retreat to last session

Each commit message names its feature. `git log --oneline` IS the
feature timeline; checking out any hash restores a known-good product
(`npm install` unchanged — no dependency changes to date).
