"use client";

import Link from "next/link";
import {
  Bell,
  FileText,
  MessageCircle,
  MessagesSquare,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SystemAlertsControl } from "@/components/notifications/SystemAlertsControl";
import { Button } from "@/components/ui/Button";
import { EmptyState, SkeletonRows } from "@/components/ui/EmptyState";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import type { Notification } from "@/lib/types";
import { listNotifications } from "@/lib/services/activity";

const kindIcon = {
  reply: MessagesSquare,
  message: MessageCircle,
  status: FileText,
  moderation: ShieldCheck,
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[] | null>(null);
  const [readAll, setReadAll] = useState(false);

  useEffect(() => {
    listNotifications()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  const visible = (items ?? []).map((n) =>
    readAll ? { ...n, read: true } : n,
  );
  const unread = visible.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="sr-only">Notifications</h1>
      <Panel>
        <PanelHeader eyebrow="Alerts" title="System alerts on this device" />
        <div className="px-5 py-4 sm:px-6">
          <SystemAlertsControl />
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          eyebrow="Activity"
          title={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
          action={
            unread > 0 ? (
              <Button variant="ghost" size="sm" onClick={() => setReadAll(true)}>
                Mark all read
              </Button>
            ) : undefined
          }
        />
        {items === null ? (
          <SkeletonRows rows={4} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="All quiet"
            body="Replies, messages, status changes and moderator notices will appear here."
          />
        ) : (
          <ul className="divide-y divide-navy-700/60">
            {visible.map((n, i) => {
              const Icon = kindIcon[n.kind];
              return (
                <li
                  key={n.id}
                  className="lx-rise"
                  style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
                >
                  <Link
                    href={n.href}
                    className="flex gap-3.5 px-5 py-4 transition-colors duration-150 hover:bg-navy-850 sm:px-6"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        n.read ? "bg-navy-800" : "bg-gold-wash"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${n.read ? "text-ink-3" : "text-gold-hi"}`}
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span
                          className={`text-sm leading-snug ${n.read ? "font-normal text-ink-2" : "font-semibold text-ink"}`}
                        >
                          {n.title}
                        </span>
                        {!n.read && (
                          <span
                            aria-label="Unread"
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold"
                          />
                        )}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-[13px] leading-relaxed text-ink-2">
                        {n.detail}
                      </span>
                      <span className="tnum mt-1 block text-xs text-ink-3">
                        {n.at}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
