"use client";

import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export interface WorkspacePane {
  id: string;
  title: string;
  node: React.ReactNode;
}

const DEFAULT_WIDTHS = [30, 40, 30];
const MIN_PCT = 18;

export function DesktopWorkspace({ panes }: { panes: WorkspacePane[] }) {
  const [widths, setWidths] = useState<number[]>(DEFAULT_WIDTHS);
  const [collapsed, setCollapsed] = useState<boolean[]>([false, false, false]);
  const [resizing, setResizing] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ index: number; startX: number; start: number[] } | null>(
    null,
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lx-panes");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed.widths) &&
          parsed.widths.length === 3 &&
          Array.isArray(parsed.collapsed) &&
          parsed.collapsed.length === 3
        ) {
          setWidths(parsed.widths);
          setCollapsed(parsed.collapsed);
        }
      }
    } catch {
      /* ignore */
    }
    const reset = () => {
      setWidths(DEFAULT_WIDTHS);
      setCollapsed([false, false, false]);
    };
    window.addEventListener("lx-reset-panes", reset);
    return () => window.removeEventListener("lx-reset-panes", reset);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("lx-panes", JSON.stringify({ widths, collapsed }));
    } catch {
      /* ignore */
    }
  }, [widths, collapsed]);

  const onDividerDown = useCallback(
    (index: number, e: React.PointerEvent) => {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      drag.current = { index, startX: e.clientX, start: [...widths] };
      setResizing(true);
    },
    [widths],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      const track = trackRef.current;
      if (!d || !track) return;
      const total = track.getBoundingClientRect().width;
      if (total <= 0) return;
      const delta = ((e.clientX - d.startX) / total) * 100;
      const next = [...d.start];
      next[d.index] = Math.max(MIN_PCT, d.start[d.index] + delta);
      next[d.index + 1] = Math.max(MIN_PCT, d.start[d.index + 1] - delta);
      const sum = next[d.index] + next[d.index + 1];
      const origSum = d.start[d.index] + d.start[d.index + 1];
      if (sum !== origSum) return;
      setWidths(next);
    };
    const onUp = () => {
      drag.current = null;
      setResizing(false);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const toggle = (i: number) =>
    setCollapsed((prev) => prev.map((c, j) => (j === i ? !c : c)));

  const nudgeKey = (index: number) => (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      nudge(index, -1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nudge(index, 1);
    }
  };

  const nudge = (index: number, dir: 1 | -1) => {
    setWidths((prev) => {
      const next = [...prev];
      const step = 2;
      const a = Math.min(70, Math.max(MIN_PCT, next[index] + dir * step));
      const delta = a - next[index];
      const b = next[index + 1] - delta;
      if (b < MIN_PCT || b > 70) return prev;
      next[index] = a;
      next[index + 1] = b;
      return next;
    });
  };

  return (
    <div
      ref={trackRef}
      className="flex min-h-[calc(100vh-220px)] flex-col gap-4 lg:flex-row lg:gap-0"
    >
      {panes.map((pane, i) => (
        <div
          key={pane.id}
          style={
            collapsed[i]
              ? { flexGrow: 0, flexBasis: "auto" }
              : { flexGrow: widths[i], flexBasis: 0, minWidth: 0 }
          }
          className="flex min-w-0 flex-col lg:flex-row"
        >
          {collapsed[i] ? (
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-label={`Expand ${pane.title} panel`}
              className="hidden shrink-0 items-center justify-center rounded-xl border border-navy-700 bg-navy-900 px-2 py-4 hover:border-navy-600 lg:flex"
            >
              {i === 0 ? (
                <ChevronsRight className="h-4 w-4 text-ink-3" aria-hidden />
              ) : (
                <ChevronsLeft className="h-4 w-4 text-ink-3" aria-hidden />
              )}
              <span className="eyebrow mt-3 text-ink-3 [writing-mode:vertical-rl]">
                {pane.title}
              </span>
            </button>
          ) : (
            <section
              aria-label={pane.title}
              className="flex min-h-[320px] min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-navy-700 bg-navy-900 lg:min-h-0"
            >
              <header className="flex items-center justify-between gap-2 border-b border-navy-700 px-4 py-3">
                <h2 className="eyebrow text-gold">
                  <span aria-hidden className="mr-2 text-ink-3">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {pane.title}
                </h2>
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-label={`Collapse ${pane.title} panel`}
                  className="hidden rounded-md p-1.5 text-ink-3 hover:bg-navy-800 hover:text-ink lg:block"
                >
                  {i === 0 ? (
                    <ChevronsLeft className="h-4 w-4" aria-hidden />
                  ) : (
                    <ChevronsRight className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </header>
              <div className="min-h-0 flex-1 overflow-y-auto">{pane.node}</div>
            </section>
          )}
          {i < panes.length - 1 && (
            <div
              role="separator"
              tabIndex={0}
              aria-orientation="vertical"
              aria-label={`Resize ${panes[i].title} and ${panes[i + 1].title}. Arrow keys adjust.`}
              onPointerDown={(e) => onDividerDown(i, e)}
              onKeyDown={nudgeKey(i)}
              className={`divider-handle hidden w-4 shrink-0 cursor-col-resize touch-none items-center justify-center rounded lg:flex ${resizing ? "resizing" : ""}`}
            >
              <span aria-hidden className="h-10 w-1 rounded-full bg-navy-700" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
