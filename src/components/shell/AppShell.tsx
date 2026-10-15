"use client";

import { Suspense } from "react";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";
import { RouteTitle } from "./RouteTitle";

/* Viewport-locked shell: header + footer stay put, only <main> scrolls.
   The dashboard fills the visible height with internally-scrolling panes;
   longer pages scroll inside main while the footer stays visible. */
export function AppShell({ children }: { children: React.ReactNode }) {
  /* Dynamic viewport height: follows the mobile browser chrome instead
     of hiding content behind it (see responsive-design guidance). */
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Suspense fallback={null}>
        <RouteTitle />
      </Suspense>
      <Suspense fallback={<div aria-hidden className="h-16 shrink-0 border-b border-navy-700" />}>
        <TopBar />
      </Suspense>
      <main id="main" className="mx-auto min-h-0 w-full max-w-[1600px] flex-1 overflow-y-auto px-4 pb-24 pt-5 sm:px-5 lg:pb-10">
        {children}
      </main>
      <footer className="hidden shrink-0 border-t border-navy-700 lg:block">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4">
          <p className="font-mono text-xs tracking-[0.18em] text-ink-3">
            LOKLEX · JUSTICE · STRATEGY · RESULTS
          </p>
          <p className="text-xs text-ink-3">
            Lokeswaraiah Legal Associates LLP
          </p>
        </div>
      </footer>
      <Suspense fallback={null}>
        <MobileNav />
      </Suspense>
    </div>
  );
}
