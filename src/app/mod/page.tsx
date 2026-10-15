"use client";

import Link from "next/link";
import { EyeOff, Flag, Gavel, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/components/app-state";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Panel, PanelHeader } from "@/components/ui/Panel";

interface QueueItem {
  id: string;
  kind: "Private report" | "Reported complaint" | "Reported reply";
  ref: string;
  summary: string;
  detail: string;
  received: string;
  href?: string;
}

const queue: QueueItem[] = [
  {
    id: "q-private",
    kind: "Private report",
    ref: "LX-2458",
    summary: "Repeated late-night harassment near the park gate",
    detail:
      "Filed privately with dates and descriptions. Body restricted to moderators — review for guidance on next steps, not publication.",
    received: "27 Sep 2026",
    href: "/complaints/c-harassment",
  },
  {
    id: "q-reply",
    kind: "Reported reply",
    ref: "Safety Watch",
    summary: "Reply naming a shopkeeper in the dark-lane thread",
    detail:
      "Reported for naming a private individual. The allegation is unverified; options are to ask the author to edit or to remove the name.",
    received: "11 Oct 2026",
    href: "/forums/safety-watch/t-dark-lane",
  },
  {
    id: "q-complaint",
    kind: "Reported complaint",
    ref: "LX-2462",
    summary: "Storm drain at the 80 Feet Road junction",
    detail:
      "Reported as possibly duplicating an older filing. Check whether it adds new information before merging or dismissing.",
    received: "12 Oct 2026",
    href: "/complaints/c-drain",
  },
];

const kindIcon = {
  "Private report": EyeOff,
  "Reported complaint": Flag,
  "Reported reply": Flag,
};

export default function ModPage() {
  const { accountKey, setAccountKey, account } = useApp();
  const isModerator = accountKey === "moderator";
  const [decisions, setDecisions] = useState<Record<string, string>>({});

  const decide = (id: string, action: string) =>
    setDecisions((prev) => ({ ...prev, [id]: action }));

  const remaining = queue.filter((q) => !decisions[q.id]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Panel>
        <PanelHeader
          eyebrow="Moderation"
          title="Review queue"
          action={
            isModerator ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-wash px-3 py-1 text-xs font-semibold text-gold-hi">
                <Gavel className="h-3.5 w-3.5" aria-hidden />
                {account.displayName}
              </span>
            ) : undefined
          }
        />
        {!isModerator ? (
          <EmptyState
            icon={ShieldCheck}
            title="Moderators only"
            body="The review queue holds private reports and reported content. Switch to the moderator account to look at it in this demo."
            action={
              <Button size="sm" onClick={() => setAccountKey("moderator")}>
                View as moderator
              </Button>
            }
          />
        ) : remaining.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Queue clear"
            body="Every item has a recorded decision. New reports will appear here."
          />
        ) : (
          <ul className="divide-y divide-navy-700/60">
            {remaining.map((q) => {
              const Icon = kindIcon[q.kind];
              return (
                <li key={q.id} className="px-5 py-4 sm:px-6">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-800">
                      <Icon className="h-4 w-4 text-gold" strokeWidth={1.75} aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="tnum font-mono text-xs uppercase tracking-[0.12em] text-ink-3">
                        {q.kind} · {q.ref} · received {q.received}
                      </p>
                      <p className="mt-1 text-[15px] font-semibold text-ink">
                        {q.summary}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-2">
                        {q.detail}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {q.href && (
                          <Link href={q.href}>
                            <Button variant="subtle" size="sm">
                              Open context
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            decide(q.id, "Report dismissed — content stays as it is.")
                          }
                        >
                          Dismiss report
                        </Button>
                        {q.kind !== "Private report" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              decide(q.id, "Content removed. The author has been told why, and what they can change.")
                            }
                          >
                            Remove content
                          </Button>
                        )}
                        {q.kind === "Private report" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              decide(
                                q.id,
                                "Guidance sent to the reporter privately, including where to get help beyond Loklex.",
                              )
                            }
                          >
                            Respond privately
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {Object.keys(decisions).length > 0 && (
        <Panel>
          <PanelHeader eyebrow="Record" title="Decisions this visit" />
          <ul className="divide-y divide-navy-700/60">
            {Object.entries(decisions).map(([id, outcome]) => {
              const q = queue.find((x) => x.id === id);
              return (
                <li key={id} className="flex gap-3 px-5 py-3.5 sm:px-6">
                  <ShieldCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-success"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {q?.ref} — {q?.summary}
                    </p>
                    <p role="status" className="mt-0.5 text-[13px] text-ink-2">
                      {outcome}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      <p className="px-1 text-[13px] leading-relaxed text-ink-3">
        Outcomes are recorded as decisions, not verdicts — nothing here claims
        an investigation happened until it has. The people involved are told
        what was decided and why.
      </p>
    </div>
  );
}
