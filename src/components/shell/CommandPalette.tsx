"use client";

import { useRouter } from "next/navigation";
import { FileText, MessagesSquare, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { complaints } from "@/lib/data/complaints";
import { threads } from "@/lib/data/forums";
import { channels } from "@/lib/data/chat";
import { useApp } from "@/components/app-state";

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { sessionComplaints, sessionThreads } = useApp();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open ]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const all = [...sessionComplaints, ...complaints];
    return [
      ...all
        .filter((c) => `${c.title} ${c.ref}`.toLowerCase().includes(q))
        .slice(0, 4)
        .map((c) => ({
          key: c.id,
          icon: FileText,
          label: `${c.ref} — ${c.title}`,
          hint: "Complaint",
          href: `/complaints/${c.id}`,
        })),
      ...[...sessionThreads, ...threads]
        .filter((t) => t.title.toLowerCase().includes(q))
        .slice(0, 4)
        .map((t) => ({
          key: t.id,
          icon: MessagesSquare,
          label: t.title,
          hint: "Thread",
          href: `/forums/${t.categorySlug}/${t.id}`,
        })),
      ...channels
        .filter((c) => c.name.toLowerCase().includes(q))
        .slice(0, 3)
        .map((c) => ({
          key: c.id,
          icon: MessageCircle,
          label: c.name,
          hint: "Channel",
          href: `/chat?v=${c.id}`,
        })),
    ];
  }, [query, sessionComplaints, sessionThreads]);

  if (!open) return null;

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div
      className="fixed inset-0 z-[90] bg-navy-950/70 p-4 pt-[12vh]"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search Loklex"
        className="lx-pop mx-auto max-w-lg overflow-hidden rounded-xl border border-navy-700 bg-navy-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) go(results[0].href);
          }}
          placeholder="Search complaints, threads, channels…"
          aria-label="Search complaints, threads, channels"
          className="w-full border-b border-navy-700 bg-transparent px-5 py-4 text-[15px] text-ink placeholder:text-ink-3 focus:outline-none"
        />
        <ul className="max-h-[40vh] overflow-y-auto p-2">
          {query.trim().length < 2 ? (
            <li className="px-3 py-6 text-center text-sm text-ink-3">
              Type at least two letters to search.
            </li>
          ) : results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-ink-3">
              Nothing matches “{query.trim()}”. Try different words.
            </li>
          ) : (
            results.map((r) => (
              <li key={`${r.hint}-${r.key}`}>
                <button
                  type="button"
                  onClick={() => go(r.href)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-navy-800"
                >
                  <r.icon
                    className="h-4 w-4 shrink-0 text-gold"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">
                    {r.label}
                  </span>
                  <span className="tnum shrink-0 font-mono text-xs uppercase tracking-[0.12em] text-ink-3">
                    {r.hint}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
