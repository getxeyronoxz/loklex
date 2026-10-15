/* Service seam: every screen reads through these async accessors and
   never touches lib/data directly. To attach a backend later, replace
   each function body with a fetch call — signatures stay the same.
   Full map: docs/Architecture.md. */

const wait = (ms = 140) => new Promise((r) => setTimeout(r, ms));

export async function service<T>(value: T, ms?: number): Promise<T> {
  await wait(ms);
  return structuredClone(value);
}
