"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, MessagesSquare, ScrollText } from "lucide-react";
import { useEffect, useState } from "react";
import { unreadTotal } from "@/lib/services/chat";

const items = [
  { href: "/complaints", label: "Complaints", icon: ScrollText },
  { href: "/forums", label: "Forums", icon: MessagesSquare },
  { href: "/chat", label: "Chat", icon: MessageCircle },
];

export function MobileNav() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    unreadTotal().then(setUnread).catch(() => {});
  }, [pathname]);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-700 bg-navy-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="grid grid-cols-3">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-[60px] flex-col items-center justify-center gap-1 text-xs font-semibold ${
                  active ? "text-accent-hi" : "text-ink-3"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                {label}
                {href === "/chat" && unread > 0 && (
                  <>
                    {/* The pill stays narrow; the count is announced. */}
                    <span
                      aria-hidden
                      className="tnum absolute right-1/2 top-1.5 translate-x-5 rounded-full bg-teal px-1.5 py-px text-xs font-bold text-navy-950"
                    >
                      {unread > 99 ? "99+" : unread}
                    </span>
                    <span className="sr-only">{unread} unread</span>
                  </>
                )}
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-8 bottom-0 h-0.5 rounded-full bg-accent"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
