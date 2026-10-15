"use client";

import { useRouter } from "next/navigation";
import { FileText, MessagesSquare, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/components/app-state";
import {
  catalogChannels,
  catalogComplaints,
  catalogThreads,
} from "@/lib/services/catalog";
import type { Channel, Complaint, Thread } from "@/lib/types";
import { canSeeComplaint } from "@/lib/visibility";

/* Mounted only while open, so the box starts empty every time and no
   reset effect is needed. */
export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return <PaletteDialog onClose={onClose} />;
}

function PaletteDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { sessionComplaints, sessionThreads, accountKey } = useApp();
  const [query, setQuery] = useState("");
  const [seedComplaints, setSeedComplaints] = useState<Complaint[]>([]);
  const [seedThreads, setSeedThreads] = useState<Thread[]>([]);
  const [seedChannels, setSeedChannels] = useState<Channel[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    /* Whatever had focus before the palette opened gets it back when the
       dialog unmounts, instead of the caret landing on <body>. */
    const returnTo =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    requestAnimationFrame(() => inputRef.current?.focus());
    /* The catalogs are shared and read once per visit, so a repeat ⌘K
       resolves from the same promise instead of re-reading all three. */
    Promise.all([catalogComplaints(), catalogThreads(), catalogChannels()])
      .then(([c, t, ch]) => {
        setSeedComplaints(c);
        setSeedThreads(t);
        setSeedChannels(ch);
      })
      .catch(() => {
        /* keep the last catalog if a load fails mid-search */
      });
    return () => returnTo?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const ownIds = sessionComplaints.map((c) => c.id);
    const all = [...sessionComplaints, ...seedComplaints].filter((c) =>
      canSeeComplaint(c, accountKey, ownIds),
    );
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
      ...[...sessionThreads, ...seedThreads]
        .filter((t) => t.title.toLowerCase().includes(q))
        .slice(0, 4)
        .map((t) => ({
          key: t.id,
          icon: MessagesSquare,
          label: t.title,
          hint: "Thread",
          href: `/forums/${t.categorySlug}/${t.id}`,
        })),
      ...seedChannels
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
  }, [
    query,
    sessionComplaints,
    sessionThreads,
    seedComplaints,
    seedThreads,
    seedChannels,
    accountKey,
  ]);

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
        {query.trim().length < 2 ? (
          <p className="px-3 py-6 text-center text-sm text-ink-3">
            Type at least two letters to search.
          </p>
        ) : results.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-ink-3">
            Nothing matches “{query.trim()}”. Try different words.
          </p>
        ) : (
          /* The list wraps results only — the empty and prompt states are
             not list items. */
          <ul className="max-h-[40vh] overflow-y-auto p-2">
            {results.map((r) => (
              <li key={`${r.hint}-${r.key}`}>
                <button
                  type="button"
                  onClick={() => go(r.href)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-navy-800"
                >
                  <r.icon
                    className="h-4 w-4 shrink-0 text-accent"
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
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
