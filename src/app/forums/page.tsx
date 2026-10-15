"use client";

import Link from "next/link";
import { ArrowRight, MessageSquare, MessagesSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/app-state";
import { EmptyState, SkeletonRows } from "@/components/ui/EmptyState";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import type { ForumCategory, Thread } from "@/lib/types";
import { catalogCategories, catalogThreads } from "@/lib/services/catalog";

export default function ForumsPage() {
  const { sessionThreads, sessionReplies } = useApp();
  const [categories, setCategories] = useState<ForumCategory[] | null>(null);
  const [seedThreads, setSeedThreads] = useState<Thread[] | null>(null);

  useEffect(() => {
    catalogCategories().then(setCategories).catch(() => setCategories([]));
    catalogThreads()
      .then(setSeedThreads)
      .catch(() => setSeedThreads([]));
  }, []);

  const latest = useMemo(() => {
    if (seedThreads === null) return null;
    return [
      ...sessionThreads,
      ...seedThreads.filter((t) => !sessionThreads.some((s) => s.id === t.id)),
    ].slice(0, 5);
  }, [seedThreads, sessionThreads]);

  const shownCategories = useMemo(() => {
    if (!categories) return null;
    return categories.map((c) => ({
      ...c,
      threads:
        c.threads +
        sessionThreads.filter((t) => t.categorySlug === c.slug).length,
    }));
  }, [categories, sessionThreads]);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <h1 className="sr-only">Forums</h1>
      <Panel>
        <PanelHeader eyebrow="Forums" title="Find your conversation" />
        {shownCategories === null ? (
          <SkeletonRows rows={4} />
        ) : (
          <ul className="grid gap-3 px-5 py-5 sm:grid-cols-2">
            {shownCategories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/forums/${c.slug}`}
                  className="block h-full rounded-xl border border-navy-700 bg-navy-950 px-4 py-4 transition-colors duration-150 hover:border-navy-600 hover:bg-navy-850"
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-[15px] font-semibold text-ink">
                      {c.name}
                    </span>
                    <ArrowRight
                      className="mt-0.5 h-4 w-4 shrink-0 text-ink-3"
                      aria-hidden
                    />
                  </span>
                  <span className="mt-1 line-clamp-2 block text-[13px] leading-relaxed text-ink-2">
                    {c.description}
                  </span>
                  <span className="tnum mt-2.5 block text-[12px] text-ink-3">
                    {c.threads} threads · active {c.lastActivity}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelHeader eyebrow="Latest" title="Recent discussions" />
        {latest === null ? (
          <SkeletonRows rows={4} />
        ) : latest.length === 0 ? (
          <EmptyState
            icon={MessagesSquare}
            title="No discussions yet"
            body="Start the first one — ask a question or share an update."
          />
        ) : (
          <ul className="divide-y divide-navy-700/60">
            {latest.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/forums/${t.categorySlug}/${t.id}`}
                  className="block px-5 py-3.5 transition-colors duration-150 hover:bg-navy-850"
                >
                  <span className="block text-sm font-medium leading-snug text-ink">
                    {t.title}
                  </span>
                  <span className="tnum mt-1 flex items-center gap-3 text-[12px] text-ink-3">
                    <span>
                      {t.author} · {t.lastActivity}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" aria-hidden />
                      {t.replies +
                        sessionReplies.filter((r) => r.threadId === t.id).length}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
