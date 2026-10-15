"use client";

import { Suspense } from "react";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <Suspense fallback={<div aria-hidden className="h-16 border-b border-navy-700" />}>
        <TopBar />
      </Suspense>
      <main id="main" className="mx-auto w-full max-w-[1600px] flex-1 px-4 pb-24 pt-5 sm:px-5 lg:pb-10">
        {children}
      </main>
      <footer className="hidden border-t border-navy-700 lg:block">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4">
          <p className="font-mono text-[11px] tracking-[0.18em] text-ink-3">
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
