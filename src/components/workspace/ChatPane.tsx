"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { SkeletonRows } from "@/components/ui/EmptyState";
import type { Channel } from "@/lib/types";
import { catalogChannels } from "@/lib/services/catalog";

export function ChatPane() {
  const [items, setItems] = useState<Channel[] | null>(null);

  useEffect(() => {
    catalogChannels()
      .then((all) => setItems(all.slice(0, 5)))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="flex min-h-0 flex-col lg:h-full">
      <div className="scroll-quiet min-h-0 flex-1 overflow-y-auto">
        {items === null ? (
          <SkeletonRows rows={4} />
        ) : (
          <ul className="divide-y divide-navy-700/60">
            {items.map((c, i) => (
              <li
                key={c.id}
                className="lx-rise"
                style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
              >
                <Link
                  href={`/chat?v=${c.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-navy-850"
                >
                  <Avatar initials={c.initials} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {c.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ink-2">
                      {c.lastMessage}
                    </span>
                  </span>
                  <span className="flex w-[64px] shrink-0 flex-col items-end gap-1">
                    <span className="tnum whitespace-nowrap text-xs text-ink-3">
                      {c.lastAt}
                    </span>
                    <span className="flex h-4 items-center">
                      {/* A dot, not a count — the number is a detail for
                          the full channel list. */}
                      {c.unread > 0 && (
                        <>
                          <span
                            aria-hidden
                            className="h-2 w-2 rounded-full bg-teal"
                          />
                          <span className="sr-only">{c.unread} unread</span>
                        </>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex min-h-[60px] shrink-0 items-center border-t border-navy-700 px-4 py-3">
        <Link
          href="/chat"
          className="inline-flex items-center gap-1 text-[13px] font-medium text-ink-2 transition-colors duration-150 hover:text-accent-hi"
        >
          Open chat <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
