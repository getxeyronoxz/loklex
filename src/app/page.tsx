"use client";

import { ShieldCheck, SlidersHorizontal } from "lucide-react";
import { DesktopWorkspace } from "@/components/shell/DesktopWorkspace";
import { ComplaintsPane } from "@/components/workspace/ComplaintsPane";
import { ForumsPane } from "@/components/workspace/ForumsPane";
import { ChatPane } from "@/components/workspace/ChatPane";

export default function Home() {
  const reset = () => window.dispatchEvent(new CustomEvent("lx-reset-panes"));

  return (
    <>
      <h1 className="sr-only">Loklex community workspace</h1>
      <div className="mb-4 flex items-center justify-between gap-3">
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
          className="hidden rounded-lg p-2.5 text-ink-3 hover:bg-navy-800 hover:text-gold-hi lg:block"
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
    </>
  );
}
