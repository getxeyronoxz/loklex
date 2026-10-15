"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { useApp, type AccountKey } from "@/components/app-state";
import { accountOrder, accounts } from "@/lib/data/users";
import { unreadNotifications } from "@/lib/services/activity";
import { CommandPalette } from "./CommandPalette";

const nav = [
  { href: "/complaints", label: "Complaints" },
  { href: "/forums", label: "Forums" },
  { href: "/chat", label: "Chat" },
];

function AccountMenu() {
  const { accountKey, setAccountKey } = useApp();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  const account = accounts[accountKey];

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account: ${account.displayName}. Change account`}
        className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-navy-800"
      >
        <Avatar initials={account.initials} size="sm" />
        <ChevronDown
          className="hidden h-4 w-4 text-ink-3 sm:block"
          strokeWidth={1.75}
          aria-hidden
        />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Switch account"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-navy-700 bg-navy-900 p-1.5 shadow-xl"
        >
          <p className="eyebrow px-2.5 pb-1 pt-2 text-ink-3">
            Viewing as (demo accounts)
          </p>
          {accountOrder.map((key: AccountKey) => {
            const a = accounts[key];
            const active = key === accountKey;
            return (
              <button
                key={key}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setAccountKey(key);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-navy-800"
              >
                <Avatar
                  initials={a.initials}
                  size="sm"
                  tone={active ? "gold" : "default"}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">
                    {a.displayName}
                  </span>
                  <span className="block text-xs capitalize text-ink-3">
                    {a.role}
                  </span>
                </span>
                {active && (
                  <Check
                    className="h-4 w-4 shrink-0 text-gold"
                    strokeWidth={2}
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [palette, setPalette] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    unreadNotifications().then(setUnread).catch(() => {});
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-navy-700 bg-navy-950/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:px-5">
          <Link
            href="/"
            aria-label="Loklex home"
            className="rounded-full"
          >
            <Logo size={36} />
          </Link>

          <nav aria-label="Sections" className="ml-4 hidden items-center gap-1 lg:flex">
            {nav.map((n) => {
              const active =
                pathname === n.href || pathname.startsWith(`${n.href}/`);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                    active
                      ? "text-gold-hi"
                      : "text-ink-2 hover:text-ink"
                  }`}
                >
                  {n.label}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-x-3 -bottom-[13px] h-0.5 bg-gold"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPalette(true)}
              className="hidden items-center gap-2 rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-[13px] text-ink-3 hover:border-navy-600 hover:text-ink-2 md:flex"
              aria-label="Search (Control or Command K)"
            >
              <Search className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              <span>Search…</span>
              <kbd className="tnum rounded border border-navy-700 bg-navy-950 px-1.5 py-0.5 font-mono text-[10px] text-ink-3">
                ⌘K
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => setPalette(true)}
              aria-label="Search"
              className="rounded-lg p-2.5 text-ink-2 hover:bg-navy-800 hover:text-ink md:hidden"
            >
              <Search className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => router.push("/notifications")}
              aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
              className="relative rounded-lg p-2.5 text-ink-2 hover:bg-navy-800 hover:text-ink"
            >
              <Bell className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              {unread > 0 && (
                <span className="tnum absolute right-1 top-1 rounded-full bg-gold px-1.5 py-px text-[10px] font-bold text-navy-950">
                  {unread}
                </span>
              )}
            </button>
            <AccountMenu />
          </div>
        </div>
        <div aria-hidden className="h-px bg-gradient-to-r from-transparent via-gold-deep/50 to-transparent" />
      </header>
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </>
  );
}
