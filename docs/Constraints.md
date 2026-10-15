# Constraints — what must never be touched

Binding on all future work, AI or human. Change only with the owner's
explicit approval.

1. **The logo.** `public/loklex-logo.png` is used as-is. Never recreate,
   recolor, retype, or extend it. No tagline additions (it's in the file).
2. **No personal DMs.** Chat stays forum-channels only. No 1:1 threads,
   no user blocking, no online-presence stalking.
3. **No voice/video calling.** Text only, everywhere. No call buttons,
   no media headers implying calls exist.
4. **No unconfirmed claims.** Never render "delivered", "read",
   "investigated", "resolved by authority", or guaranteed anonymity.
   Statuses: submitted → under review → needs info → action taken →
   closed, and only when the (mock or real) source says so.
5. **No backend-shaped lies.** Session state resets on reload; after-close
   push is unavailable; files are memory-local. UI copy must not imply
   persistence, delivery, or transmission that doesn't exist.
6. **Privacy defaults.** Harassment/safety categories suggest private
   moderator reports. Sensitive reports never auto-publish. The anonymity
   caveat stays wherever a name choice is offered.
7. **en-IN voice.** Indian-English spellings and locality content stay.
   No Americanization to satisfy a spell checker.
8. **Theme discipline.** AMOLED blacks, warmed greys, gold ramp. No purple
   gradients, no glass, no neon, no marketing heroes, no emoji iconography.
   Metallic gradient on the emblem only.
9. **Services seam.** No `fetch`, no data imports outside `lib/services/*`.
   `types.ts` carries no network code.
10. **Accessibility floor.** Keyboard-operable controls, visible gold focus,
    `text-xs` minimum for meta text, AA contrast on small text,
    `prefers-reduced-motion` respected. No fix may regress these.
