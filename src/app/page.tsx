"use client";

import Link from "next/link";
import { Settings2, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useApp } from "@/components/app-state";
import { DesktopWorkspace } from "@/components/shell/DesktopWorkspace";
import { Avatar } from "@/components/ui/Avatar";
import { ComplaintsPane } from "@/components/workspace/ComplaintsPane";
import { ForumsPane } from "@/components/workspace/ForumsPane";
import { ChatPane } from "@/components/workspace/ChatPane";

export default function Home() {
  const { account } = useApp();
  const reset = () => window.dispatchEvent(new CustomEvent("lx-reset-panes"));

  return (
    <div className="flex min-h-0 flex-col lg:h-full">
      <h1 className="sr-only">Loklex community workspace</h1>
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <p className="flex items-center gap-2.5">
          <ShieldCheck
            className="h-5 w-5 text-gold"
            strokeWidth={1.75}
            aria-hidden
          />
          <span className="font-display text-xl font-light tracking-wide text-ink">
            Community workspace
          </span>
        </p>
        <button
          type="button"
          onClick={reset}
          title="Reset panel layout"
          aria-label="Reset panel layout"
          className="hidden rounded-lg p-2.5 text-ink-3 transition-colors duration-150 hover:bg-navy-800 hover:text-gold-hi lg:block"
        >
          <SlidersHorizontal className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
      <DesktopWorkspace
        panes={[
          { id: "complaints", title: "Complaints", node: <ComplaintsPane /> },
          { id: "forums", title: "Forums", node: <ForumsPane /> },
          { id: "chat", title: "Text chat", node: <ChatPane /> },
        ]}
      />
      <div className="flex shrink-0 items-center gap-2.5 px-1 pt-3">
        <Avatar initials={account.initials} size="sm" />
        <p className="min-w-0 flex-1 truncate text-xs text-ink-3">
          Signed in as <span className="font-medium text-ink-2">{account.displayName}</span>
          <span className="capitalize"> · {account.role}</span>
        </p>
        <Link
          href="/profile"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-ink-3 transition-colors duration-150 hover:text-gold-hi"
        >
          <Settings2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          Settings
        </Link>
      </div>
    </div>
  );
}
