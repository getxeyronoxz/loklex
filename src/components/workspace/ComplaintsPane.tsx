"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, HandHeart, MessageSquare, Plus, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "@/components/app-state";
import { Avatar } from "@/components/ui/Avatar";
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
    <div className="border-b border-navy-700 px-4 py-4">
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
        className="mt-2 w-full border-b border-navy-700 bg-transparent pb-2 text-sm text-ink placeholder:text-ink-3 focus:border-gold focus:outline-none"
      />
      <label htmlFor="qr-desc" className="sr-only">
        Description
      </label>
      <textarea
        id="qr-desc"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description…"
        rows={2}
        className="mt-2 w-full resize-none border-b border-navy-700 bg-transparent pb-2 text-sm text-ink placeholder:text-ink-3 focus:border-gold focus:outline-none"
      />
      <Button
        size="sm"
        onClick={go}
        disabled={subject.trim().length === 0 && description.trim().length === 0}
        className="mt-3 w-full"
      >
        Continue filing
        <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
      </Button>
    </div>
  );
}

export function ComplaintsPane() {
  const { account, sessionComplaints } = useApp();
  const [items, setItems] = useState<Complaint[] | null>(null);

  useEffect(() => {
    listComplaints()
      .then((all) => setItems([...sessionComplaints, ...all].slice(0, 4)))
      .catch(() => setItems([]));
  }, [sessionComplaints]);

  return (
    <div className="flex h-full flex-col">
      <QuickReport />
      <div className="min-h-0 flex-1 overflow-y-auto">
        {items === null ? (
          <SkeletonRows rows={3} />
        ) : (
          <ul className="divide-y divide-navy-700/60">
            {items.map((c, i) => (
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
                    <span className="min-w-0 break-words text-sm font-medium leading-snug text-ink">
                      {c.title}
                    </span>
                    <StatusPill tone={complaintStatuses[c.status].tone}>
                      {complaintStatuses[c.status].label}
                    </StatusPill>
                  </span>
                  <span className="tnum mt-1.5 flex items-center gap-3 font-mono text-[11px] text-ink-3">
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
            ))}
          </ul>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-navy-700 px-4 py-3">
        <Link
          href="/complaints"
          className="inline-flex items-center gap-1 text-[13px] font-medium text-ink-2 hover:text-gold-hi"
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
      <div className="flex items-center gap-2.5 border-t border-navy-700 bg-navy-950/60 px-4 py-3">
        <Avatar initials={account.initials} size="sm" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[13px] font-medium text-ink">
            {account.displayName}
          </p>
          <p className="text-[11px] capitalize text-ink-3">{account.role}</p>
        </div>
        <Link
          href="/profile"
          aria-label="Account settings"
          className="rounded-lg p-2 text-ink-3 hover:bg-navy-800 hover:text-gold-hi"
        >
          <Settings2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
