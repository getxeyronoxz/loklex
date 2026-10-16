"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  EyeOff,
  FileWarning,
  Flag,
  HandHeart,
  MessageSquare,
  Paperclip,
} from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { useApp } from "@/components/app-state";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState, SkeletonRows } from "@/components/ui/EmptyState";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Field, SelectInput, TextArea } from "@/components/ui/fields";
import { initialsOf } from "@/lib/format";
import { complaintCategories, complaintStatuses } from "@/lib/types";
import type { Complaint, Thread } from "@/lib/types";
import { getComplaint } from "@/lib/services/complaints";
import { catalogThreads } from "@/lib/services/catalog";

export default function ComplaintDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-navy-700 bg-navy-900">
          <SkeletonRows rows={6} />
        </div>
      }
    >
      <ComplaintDetailView />
    </Suspense>
  );
}

function ComplaintDetailView() {
  const params = useParams<{ id: string }>();
  const { sessionComplaints, sessionThreads, account, accountKey, closedIds, closeComplaint } = useApp();
  const [complaint, setComplaint] = useState<Complaint | null | undefined>(
    undefined,
  );
  /* The visitor's own toggle for this filing. `null` means untouched —
     the filing's own value stands. Keyed by id so a later session
     update (a closure, another filing) can't silently flip a toggle
     the visitor just made. */
  const [supportOverride, setSupportOverride] = useState<{
    id: string;
    value: boolean;
  } | null>(null);
  const [linked, setLinked] = useState<Thread[] | null>(null);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportNote, setReportNote] = useState("");
  const [reported, setReported] = useState(false);

  useEffect(() => {
    const session = sessionComplaints.find((c) => c.id === params.id);
    if (session) {
      setComplaint(session);
      return;
    }
    getComplaint(params.id)
      .then(setComplaint)
      .catch(() => setComplaint(null));
  }, [params.id, sessionComplaints]);

  /* Threads that mention this filing's reference. */
  useEffect(() => {
    if (!complaint || complaint.visibility === "moderators") {
      setLinked([]);
      return;
    }
    catalogThreads()
      .then((all) => {
        const pool = [
          ...sessionThreads,
          ...all.filter((t) => !sessionThreads.some((s) => s.id === t.id)),
        ];
        setLinked(pool.filter((t) => t.title.includes(complaint.ref)));
      })
      .catch(() => setLinked([]));
  }, [complaint, sessionThreads]);

  if (complaint === undefined) {
    return (
      <div className="mx-auto max-w-4xl">
        <Panel>
          <SkeletonRows rows={6} />
        </Panel>
      </div>
    );
  }

  if (complaint === null) {
    return (
      <div className="mx-auto max-w-4xl">
        <Panel>
          <EmptyState
            icon={FileWarning}
            title="Complaint not found"
            body="It may have been removed, or the reference is incorrect."
            action={
              <Link href="/complaints">
                <Button variant="subtle" size="sm">
                  Back to complaints
                </Button>
              </Link>
            }
          />
        </Panel>
      </div>
    );
  }

  /* Private moderator reports stay restricted: anyone else sees only the
     filing record, never the body or history. The filer themself can
     always follow their own report. */
  const ownFiling = sessionComplaints.some((c) => c.id === complaint.id);
  if (
    complaint.visibility === "moderators" &&
    accountKey !== "moderator" &&
    !ownFiling
  ) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Link
          href="/complaints"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-2 hover:text-accent-hi"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          All complaints
        </Link>
        <Panel>
          <div className="border-b border-navy-700 px-5 pb-5 pt-5 sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="tnum font-mono text-xs tracking-[0.14em] text-accent">
                {complaint.ref}
              </span>
              <StatusPill tone={complaintStatuses[complaint.status].tone}>
                {complaintStatuses[complaint.status].label}
              </StatusPill>
              <span className="inline-flex items-center gap-1 rounded-full border border-navy-700 px-2.5 py-1 text-xs font-semibold text-ink-2">
                <EyeOff className="h-3 w-3" aria-hidden />
                Moderators only
              </span>
            </div>
            <h1 className="mt-2 font-display text-[clamp(1.375rem,1rem+2vw,1.625rem)] font-light leading-tight text-ink">
              Private report
            </h1>
          </div>
          <EmptyState
            icon={EyeOff}
            title="Restricted to moderators"
            body="This report was filed privately. Its contents are visible only to moderators and the person who filed it — switch to the moderator account to review it."
            action={
              <Link href="/complaints">
                <Button variant="subtle" size="sm">
                  Back to complaints
                </Button>
              </Link>
            }
          />
        </Panel>
      </div>
    );
  }

  /* The visitor's toggle wins once they touch it; otherwise the filing's
     own value stands. */
  const supported =
    supportOverride?.id === complaint.id
      ? supportOverride.value
      : complaint.supported;
  const supportCount =
    complaint.supporters +
    (supported === complaint.supported ? 0 : supported ? 1 : -1);
  const isClosed =
    !!complaint &&
    (closedIds.includes(complaint.id) || complaint.status === "closed");
  const status = complaintStatuses[isClosed ? "closed" : complaint.status];
  const isPrivate = complaint.visibility === "moderators";
  /* Outsiders were already turned away above; moderators and the filer
     themself get the full record from here on. */
  /* Moderators and the filer themself can read the body; everyone else
     was stopped by the restricted branch above. */
  const canRead = !isPrivate || accountKey === "moderator" || ownFiling;
  const isOwn =
    complaint.author === account.displayName ||
    sessionComplaints.some((c) => c.id === complaint.id);
  const timeline =
    isClosed &&
    complaint.timeline[complaint.timeline.length - 1]?.status !== "closed"
      ? [
          ...complaint.timeline,
          {
            status: "closed" as const,
            at: "Just now",
            note: "Closed by the filer. The community can still read it.",
          },
        ]
      : complaint.timeline;
  const files = complaint.files ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link
        href="/complaints"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-2 hover:text-accent-hi"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
        All complaints
      </Link>

      <Panel>
        <div className="border-b border-navy-700 px-5 pb-5 pt-5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="tnum font-mono text-xs tracking-[0.14em] text-accent">
              {complaint.ref}
            </span>
            <StatusPill tone={status.tone}>{status.label}</StatusPill>
            {isPrivate && (
              <span className="inline-flex items-center gap-1 rounded-full border border-navy-700 px-2.5 py-1 text-xs font-semibold text-ink-2">
                <EyeOff className="h-3 w-3" aria-hidden />
                Moderators only
              </span>
            )}
          </div>
          <h1 className="mt-2 break-words font-display text-[clamp(1.5rem,1.1rem+2vw,1.75rem)] font-light leading-tight text-ink">
            {complaint.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-ink-3">
            <span className="inline-flex items-center gap-2">
              <Avatar
                initials={
                  complaint.anonymous ? "··" : initialsOf(complaint.author)
                }
                size="sm"
              />
              <span className="text-ink-2">{complaint.author}</span>
            </span>
            <span>{complaint.filedAt}</span>
            <span>{complaintCategories[complaint.category].label}</span>
            {!isPrivate && complaint.audienceDetail && (
              <span>Shown in {complaint.audienceDetail}</span>
            )}
          </div>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6">
          {!canRead ? (
            <p className="rounded-lg border border-navy-700 bg-navy-950 px-4 py-3 text-sm leading-relaxed text-ink-2">
              The body of this report is restricted to moderators. What you
              see here is the filing record — reference, category, status and
              history.
            </p>
          ) : (
            <p className="whitespace-pre-line break-words text-[15px] leading-[1.7] text-ink">
              {complaint.description}
            </p>
          )}
          {files.length > 0 ? (
            <div>
              <h2 className="eyebrow text-ink-3">Photos · {files.length}</h2>
              <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {files.map((f) => (
                  <li
                    key={f.url ?? f.name}
                    className="group relative overflow-hidden rounded-lg border border-navy-700 bg-navy-950 transition-colors duration-150 hover:border-accent-deep"
                    title={f.name}
                  >
                    {f.url ? (
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${f.name} in full`}
                        className="block"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- session-local file URL */}
                        <img
                          src={f.url}
                          alt={f.name}
                          loading="lazy"
                          className="h-28 w-full object-cover"
                        />
                      </a>
                    ) : (
                      <span className="tnum flex h-28 items-center gap-1.5 px-3 text-xs text-ink-2">
                        <Paperclip className="h-4 w-4 shrink-0" aria-hidden />
                        <span className="truncate">{f.name}</span>
                      </span>
                    )}
                    {f.url && (
                      <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-navy-950/85 px-2.5 py-1.5">
                        <span className="tnum min-w-0 truncate text-xs text-ink-2">
                          {f.name}
                        </span>
                        <a
                          href={f.url}
                          download={f.name}
                          aria-label={`Download ${f.name}`}
                          title={`Download ${f.name}`}
                          className="shrink-0 rounded-md p-1 text-ink-2 transition-colors duration-150 hover:text-accent-hi"
                        >
                          <Download className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                        </a>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            complaint.attachments > 0 && (
              <p className="tnum flex items-center gap-2 text-[13px] text-ink-3">
                <Paperclip className="h-4 w-4" aria-hidden />
                {complaint.attachments} photo
                {complaint.attachments === 1 ? "" : "s"} attached to this filing
              </p>
            )
          )}

          {!isPrivate && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={supported ? "primary" : "subtle"}
                size="sm"
                onClick={() =>
                  setSupportOverride({ id: complaint.id, value: !supported })
                }
                aria-pressed={supported}
              >
                <HandHeart className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                {supported ? "Supported" : "Support this"} ·{" "}
                {supportCount}
              </Button>
              <span className="tnum inline-flex items-center gap-1.5 text-[13px] text-ink-3">
                <MessageSquare className="h-4 w-4" aria-hidden />
                {complaint.comments} comments
              </span>
              {!isPrivate && !isClosed && isOwn && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => closeComplaint(complaint.id)}
                >
                  Mark as closed
                </Button>
              )}
            </div>
          )}

          <div>
            <h2 className="eyebrow text-ink-3">Status history</h2>
            <ol className="mt-3 space-y-0">
              {timeline.map((t, i) => (
                <li key={`${t.status}-${t.at}`} className="relative flex gap-3 pb-5 last:pb-0">
                  <span className="flex flex-col items-center" aria-hidden>
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 rounded-full ${
                        i === timeline.length - 1
                          ? "bg-accent"
                          : "bg-navy-600"
                      }`}
                    />
                    {i < timeline.length - 1 && (
                      <span className="w-px flex-1 bg-navy-700" />
                    )}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">
                      {complaintStatuses[t.status].label}
                      <span className="tnum ml-2 font-normal text-ink-3">
                        {t.at}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-2">
                      {t.note}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {linked !== null && linked.length > 0 && (
            <div>
              <h2 className="eyebrow text-ink-3">Linked discussions</h2>
              <ul className="mt-2 space-y-2">
                {linked.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/forums/${t.categorySlug}/${t.id}`}
                      className="block rounded-lg border border-navy-700 bg-navy-950 px-4 py-3 transition-colors duration-150 hover:border-navy-600"
                    >
                      <span className="block break-words text-sm font-medium text-ink">
                        {t.title}
                      </span>
                      <span className="tnum mt-1 block text-xs text-ink-3">
                        {t.replies} replies · {t.lastActivity}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-xl border border-navy-700 bg-navy-950 px-4 py-4">
            {reported ? (
              <p role="status" className="text-sm leading-relaxed text-ink-2">
                Report received. Moderators will review it against the
                community rules — nothing is removed automatically.
              </p>
            ) : reporting ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (reportReason) setReported(true);
                }}
                className="space-y-3"
              >
                <Field label="Why are you reporting this?" htmlFor="r-reason">
                  <SelectInput
                    id="r-reason"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    required
                  >
                    <option value="">Choose a reason…</option>
                    <option value="personal">Contains personal details</option>
                    <option value="harassment">Harassment or abuse</option>
                    <option value="false">Seems false or misleading</option>
                    <option value="other">Something else</option>
                  </SelectInput>
                </Field>
                <Field
                  label="Anything moderators should know? (optional)"
                  htmlFor="r-note"
                >
                  <TextArea
                    id="r-note"
                    value={reportNote}
                    onChange={(e) => setReportNote(e.target.value)}
                    className="min-h-[80px]"
                    placeholder="One or two lines is enough."
                  />
                </Field>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={!reportReason}>
                    Send report
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReporting(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[13px] text-ink-3">
                  Something wrong with this complaint?
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReporting(true)}
                >
                  <Flag className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  Report
                </Button>
              </div>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}
