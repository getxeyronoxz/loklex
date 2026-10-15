"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { SkeletonRows } from "@/components/ui/EmptyState";
import type { Channel } from "@/lib/types";
import { listChannels } from "@/lib/services/chat";

export function ChatPane() {
  const [items, setItems] = useState<Channel[] | null>(null);

  useEffect(() => {
    listChannels()
      .then((all) => setItems(all.slice(0, 5)))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
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
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium text-ink">
                        {c.name}
                      </span>
                      <span className="tnum shrink-0 text-[11px] text-ink-3">
                        {c.lastAt}
                      </span>
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-[13px] text-ink-2">
                        {c.lastMessage}
                      </span>
                      {c.unread > 0 && (
                        <span className="tnum shrink-0 rounded-full bg-teal px-1.5 py-px text-[10px] font-bold text-navy-950">
                          {c.unread}
                        </span>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-t border-navy-700 px-4 py-3">
        <Link
          href="/chat"
          className="inline-flex items-center gap-1 text-[13px] font-medium text-ink-2 hover:text-gold-hi"
        >
          Open chat <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
