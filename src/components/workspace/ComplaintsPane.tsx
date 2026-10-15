"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, HandHeart, MessageSquare, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "@/components/app-state";
import { Button } from "@/components/ui/Button";
import { SkeletonRows } from "@/components/ui/EmptyState";
import { StatusPill } from "@/components/ui/StatusPill";
import { complaintStatuses } from "@/lib/types";
import type { Complaint } from "@/lib/types";
import { listComplaints } from "@/lib/services/complaints";

function QuickReport() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const go = () => {
    try {
      sessionStorage.setItem(
        "lx-draft",
        JSON.stringify({ title: subject, description }),
      );
    } catch {
      /* ignore */
    }
    router.push("/complaints/new");
  };

  return (
    <div className="shrink-0 space-y-2.5 border-b border-navy-700 px-4 py-4">
      <p className="eyebrow text-ink-3">Report an issue</p>
      <label htmlFor="qr-subject" className="sr-only">
        Subject
      </label>
      <input
        id="qr-subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject…"
        maxLength={140}
        className="w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2.5 text-sm text-ink placeholder:text-ink-3 transition-colors duration-150 focus:border-gold focus:outline-none"
      />
      <label htmlFor="qr-desc" className="sr-only">
        Description
      </label>
      <textarea
        id="qr-desc"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description…"
        rows={3}
        className="w-full resize-none rounded-lg border border-navy-700 bg-navy-950 px-3 py-2.5 text-sm text-ink placeholder:text-ink-3 transition-colors duration-150 focus:border-gold focus:outline-none"
      />
      <Button
        size="sm"
        onClick={go}
        disabled={subject.trim().length === 0 && description.trim().length === 0}
        className="w-full"
      >
        Continue filing
        <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
      </Button>
    </div>
  );
}

export function ComplaintsPane() {
  const { sessionComplaints, closedIds, accountKey } = useApp();
  const [items, setItems] = useState<Complaint[] | null>(null);

  useEffect(() => {
    listComplaints()
      .then((all) => {
        const pool = [...sessionComplaints, ...all];
        const visible =
          accountKey === "moderator"
            ? pool
            : pool.filter((c) => c.visibility !== "moderators");
        setItems(visible.slice(0, 4));
      })
      .catch(() => setItems([]));
  }, [sessionComplaints, accountKey]);

  return (
    <div className="flex min-h-0 flex-col lg:h-full">
      <QuickReport />
      <div className="scroll-quiet min-h-0 flex-1 overflow-y-auto">
        {items === null ? (
          <SkeletonRows rows={3} />
        ) : (
          <ul className="divide-y divide-navy-700/60">
            {items.map((c, i) => {
              const st =
                closedIds.includes(c.id) && c.status !== "closed"
                  ? "closed"
                  : c.status;
              return (
              <li
                key={c.id}
                className="lx-rise"
                style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
              >
                <Link
                  href={`/complaints/${c.id}`}
                  className="block px-4 py-3.5 transition-colors duration-150 hover:bg-navy-850"
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="line-clamp-2 min-w-0 break-words text-sm font-medium leading-snug text-ink">
                      {c.title}
                    </span>
                    <StatusPill tone={complaintStatuses[st].tone}>
                      {complaintStatuses[st].label}
                    </StatusPill>
                  </span>
                  <span className="tnum mt-1.5 flex items-center gap-3 font-mono text-xs text-ink-3">
                    <span className="tracking-[0.1em] text-gold/80">{c.ref}</span>
                    <span className="flex items-center gap-1">
                      <HandHeart className="h-3 w-3" aria-hidden />
                      {c.supporters}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" aria-hidden />
                      {c.comments}
                    </span>
                  </span>
                </Link>
              </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="flex min-h-[60px] shrink-0 items-center justify-between gap-2 border-t border-navy-700 px-4 py-3">
        <Link
          href="/complaints"
          className="inline-flex items-center gap-1 text-[13px] font-medium text-ink-2 transition-colors duration-150 hover:text-gold-hi"
        >
          All complaints <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
        <Link href="/complaints/new">
          <Button size="sm">
            <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
            File a complaint
          </Button>
        </Link>
      </div>
    </div>
  );
}
