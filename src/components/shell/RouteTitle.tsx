"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/* Per-route tab titles. Pages are client components (session state), so
   titles are set here instead of via metadata exports — this is also what
   the built-in route announcer reads on client-side transitions. */
const titles: [RegExp, string][] = [
  [/^\/$/, "Community workspace · Loklex"],
  [/^\/complaints\/new$/, "File a complaint · Loklex"],
  [/^\/complaints\/.+$/, "Complaint · Loklex"],
  [/^\/complaints$/, "Complaints · Loklex"],
  [/^\/forums\/.+\/.+$/, "Discussion · Loklex"],
  [/^\/forums\/.+$/, "Forum · Loklex"],
  [/^\/forums$/, "Forums · Loklex"],
  [/^\/chat$/, "Text chat · Loklex"],
  [/^\/notifications$/, "Notifications · Loklex"],
  [/^\/profile$/, "Profile & settings · Loklex"],
  [/^\/mod$/, "Moderation · Loklex"],
  [/^\/rules$/, "Community rules · Loklex"],
];

export function RouteTitle() {
  const pathname = usePathname();

  useEffect(() => {
    const match = titles.find(([re]) => re.test(pathname));
    document.title = match ? match[1] : "Loklex — Justice · Strategy · Results";
  }, [pathname]);

  return null;
}
