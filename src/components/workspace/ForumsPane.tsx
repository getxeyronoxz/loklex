"use client";

import Link from "next/link";
import { ArrowRight, MessageSquare, Pin } from "lucide-react";
import { useEffect, useState } from "react";
import { SkeletonRows } from "@/components/ui/EmptyState";
import type { Thread } from "@/lib/types";
import { listThreads } from "@/lib/services/forums";
import { forumCategories } from "@/lib/data/forums";

const categoryName = (slug: string) =>
  forumCategories.find((c) => c.slug === slug)?.name ?? slug;

export function ForumsPane() {
  const [items, setItems] = useState<Thread[] | null>(null);

  useEffect(() => {
    listThreads()
      .then((all) => setItems(all.slice(0, 6)))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        {items === null ? (
          <SkeletonRows rows={5} />
        ) : (
          <ul className="divide-y divide-navy-700/60">
            {items.map((t, i) => (
              <li
                key={t.id}
                className="lx-rise"
                style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
              >
                <Link
                  href={`/forums/${t.categorySlug}/${t.id}`}
                  className="block px-4 py-3.5 transition-colors duration-150 hover:bg-navy-850"
                >
                  <span className="flex items-start gap-1.5 text-sm font-medium leading-snug text-ink">
                    {t.pinned && (
                      <Pin
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold"
                        strokeWidth={2}
                        aria-hidden
                      />
                    )}
                    <span className="min-w-0 break-words">{t.title}</span>
                  </span>
                  <span className="tnum mt-1.5 flex items-center gap-3 text-[12px] text-ink-3">
                    <span>{categoryName(t.categorySlug)}</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" aria-hidden />
                      {t.replies}
                    </span>
                    <span>{t.lastActivity}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-t border-navy-700 px-4 py-3">
        <Link
          href="/forums"
          className="inline-flex items-center gap-1 text-[13px] font-medium text-ink-2 hover:text-gold-hi"
        >
          All forums <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
