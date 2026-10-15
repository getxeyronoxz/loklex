"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Flag,
  Lock,
  MessagesSquare,
  Pin,
  Quote,
  Send,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useApp } from "@/components/app-state";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState, SkeletonRows } from "@/components/ui/EmptyState";
import { Panel } from "@/components/ui/Panel";
import { Field, SelectInput, TextArea } from "@/components/ui/fields";
import type { Reply, Thread } from "@/lib/types";
import { getThread, listReplies } from "@/lib/services/forums";
import { getComplaintByRef } from "@/lib/services/complaints";

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function ThreadPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-navy-700 bg-navy-900">
          <SkeletonRows rows={6} />
        </div>
      }
    >
      <ThreadView />
    </Suspense>
  );
}

function ThreadView() {
  const params = useParams<{ category: string; thread: string }>();
  const { accountKey, account, sessionThreads, sessionReplies, addReply, sessionComplaints, resolvedThreadIds, resolveThread } = useApp();
  const isModerator = accountKey === "moderator";

  const [thread, setThread] = useState<Thread | null | undefined>(undefined);
  const [seedReplies, setSeedReplies] = useState<Reply[] | null>(null);
  const [body, setBody] = useState("");
  const [quote, setQuote] = useState<{ author: string; body: string } | null>(null);
  const [pinned, setPinned] = useState(false);
  const [locked, setLocked] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reported, setReported] = useState(false);
  const [linkedComplaint, setLinkedComplaint] = useState<{ id: string; ref: string } | null>(null);

  useEffect(() => {
    const session = sessionThreads.find((t) => t.id === params.thread);
    if (session) {
      setThread(session);
      setPinned(!!session.pinned);
      setLocked(!!session.locked);
      setSeedReplies([]);
      return;
    }
    getThread(params.thread)
      .then((t) => {
        setThread(t);
        setPinned(!!t?.pinned);
        setLocked(!!t?.locked);
      })
      .catch(() => setThread(null));
    listReplies(params.thread)
      .then(setSeedReplies)
      .catch(() => setSeedReplies([]));
  }, [params.thread, sessionThreads]);

  const replies = useMemo(() => {
    const mine = sessionReplies.filter((r) => r.threadId === params.thread);
    return [...(seedReplies ?? []), ...mine];
  }, [seedReplies, sessionReplies, params.thread]);

  /* A reference like LX-2481 in the title links the watched complaint. */
  useEffect(() => {
    if (!thread) return;
    const match = thread.title.match(/LX-\d+/);
    if (!match) {
      setLinkedComplaint(null);
      return;
    }
    const ref = match[0];
    const mine = sessionComplaints.find((c) => c.ref === ref);
    if (mine) {
      setLinkedComplaint({ id: mine.id, ref });
      return;
    }
    getComplaintByRef(ref)
      .then((c) => setLinkedComplaint(c ? { id: c.id, ref } : null))
      .catch(() => setLinkedComplaint(null));
  }, [thread, sessionComplaints]);

  const post = () => {
    if (!thread || body.trim().length < 2 || locked) return;
    addReply(thread.id, body.trim(), quote ?? undefined);
    setBody("");
    setQuote(null);
  };

  if (thread === undefined || seedReplies === null) {
    return (
      <div className="mx-auto max-w-3xl">
        <Panel>
          <SkeletonRows rows={6} />
        </Panel>
      </div>
    );
  }

  if (thread === null) {
    return (
      <div className="mx-auto max-w-3xl">
        <Panel>
          <EmptyState
            icon={MessagesSquare}
            title="Discussion not found"
            body="It may have been removed, or the link is incorrect."
            action={
              <Link href="/forums">
                <Button variant="subtle" size="sm">
                  All forums
                </Button>
              </Link>
            }
          />
        </Panel>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href={`/forums/${params.category}`}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-2 hover:text-gold-hi"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
        Back to forum
      </Link>

      <Panel>
        <div className="border-b border-navy-700 px-5 pb-5 pt-5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            {pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold-wash px-2.5 py-1 text-xs font-semibold text-gold-hi">
                <Pin className="h-3 w-3" aria-hidden /> Pinned
              </span>
            )}
            {locked && (
              <span className="inline-flex items-center gap-1 rounded-full border border-navy-700 px-2.5 py-1 text-xs font-semibold text-ink-3">
                <Lock className="h-3 w-3" aria-hidden /> Locked
              </span>
            )}
            {thread.label && !pinned && !locked && (
              <span className="tnum rounded-full bg-navy-800 px-2.5 py-1 text-xs font-semibold text-ink-2">
                {thread.label}
              </span>
            )}
            {linkedComplaint && (
              <Link
                href={`/complaints/${linkedComplaint.id}`}
                className="tnum inline-flex items-center gap-1 rounded-full bg-gold-wash px-2.5 py-1 text-xs font-semibold text-gold-hi hover:bg-gold/20"
              >
                Linked complaint {linkedComplaint.ref} →
              </Link>
            )}
            {thread && resolvedThreadIds.includes(thread.id) ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                <Check className="h-3 w-3" strokeWidth={2} aria-hidden />
                Resolved by author
              </span>
            ) : (
              thread &&
              thread.author === account.displayName && (
                <button
                  type="button"
                  onClick={() => resolveThread(thread.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-navy-700 px-2.5 py-1 text-xs font-semibold text-ink-2 transition-colors duration-150 hover:border-success/50 hover:text-success"
                >
                  <Check className="h-3 w-3" strokeWidth={2} aria-hidden />
                  Mark as resolved
                </button>
              )
            )}
          </div>
          <h1 className="mt-2 break-words font-display text-[26px] font-light leading-tight text-ink">
            {thread.title}
          </h1>
          <p className="tnum mt-2 text-[13px] text-ink-3">
            Started by {thread.author} · {thread.createdAt}
          </p>
          {isModerator && (
            <div className="mt-3 flex gap-2">
              <Button
                variant="subtle"
                size="sm"
                onClick={() => setPinned((v) => !v)}
                aria-pressed={pinned}
              >
                <Pin className="h-3.5 w-3.5" aria-hidden />
                {pinned ? "Unpin" : "Pin"}
              </Button>
              <Button
                variant="subtle"
                size="sm"
                onClick={() => setLocked((v) => !v)}
                aria-pressed={locked}
              >
                <Lock className="h-3.5 w-3.5" aria-hidden />
                {locked ? "Unlock" : "Lock"}
              </Button>
            </div>
          )}
        </div>

        <ol className="divide-y divide-navy-700/60">
          <li className="px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <Avatar initials={initialsOf(thread.author)} size="sm" />
              <span className="min-w-0 break-words text-sm font-semibold text-ink">{thread.author}</span>
              <span className="tnum shrink-0 text-xs text-ink-3">{thread.createdAt}</span>
            </div>
            <p className="mt-2 whitespace-pre-line break-words text-[15px] leading-relaxed text-ink">
              {thread.excerpt}
            </p>
          </li>
          {replies.map((r) => (
            <li key={r.id} className="px-5 py-4 sm:px-6">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <Avatar
                  initials={initialsOf(r.author)}
                  size="sm"
                  tone={r.mine ? "gold" : "default"}
                />
                <span className="min-w-0 break-words text-sm font-semibold text-ink">{r.author}</span>
                <span className="tnum shrink-0 text-xs text-ink-3">{r.postedAt}</span>
                {!locked && (
                  <button
                    type="button"
                    onClick={() =>
                      setQuote({
                        author: r.author,
                        body:
                          r.body.length > 140
                            ? `${r.body.slice(0, 140).trimEnd()}…`
                            : r.body,
                      })
                    }
                    className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-ink-3 hover:bg-navy-800 hover:text-gold-hi"
                  >
                    <Quote className="h-3.5 w-3.5" aria-hidden />
                    Quote
                  </button>
                )}
              </div>
              {r.quote && (
                <blockquote className="mt-2 rounded-lg border-l-2 border-gold-deep bg-navy-950 px-3 py-2 text-[13px] leading-relaxed text-ink-2">
                  <span className="font-semibold text-ink-3">
                    {r.quote.author} —{" "}
                  </span>
                  {r.quote.body}
                </blockquote>
              )}
              <p className="mt-2 whitespace-pre-line break-words text-[15px] leading-relaxed text-ink">
                {r.body}
              </p>
            </li>
          ))}
        </ol>

        {/* Frozen reply bar: stays pinned while the discussion scrolls.
            On phones it floats above the bottom navigation. */}
        <div className="sticky bottom-[84px] z-10 rounded-b-xl border-t border-navy-700 bg-navy-900/95 px-5 py-5 backdrop-blur sm:px-6 md:bottom-0">
          {locked ? (
            <p className="flex items-center gap-2 rounded-lg border border-navy-700 bg-navy-950 px-4 py-3 text-sm text-ink-3">
              <Lock className="h-4 w-4" aria-hidden />
              This discussion is locked. No new replies can be added.
            </p>
          ) : (
            <div className="space-y-3">
              {quote && (
                <div className="flex items-start justify-between gap-2 rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-[13px] text-ink-2">
                  <span className="min-w-0">
                    <span className="font-semibold text-ink-3">
                      Quoting {quote.author} —{" "}
                    </span>
                    {quote.body}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuote(null)}
                    aria-label="Remove quote"
                    className="rounded p-1 text-ink-3 hover:text-ink"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              )}
              <Field label="Your reply" htmlFor="reply">
                <TextArea
                  id="reply"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="min-h-[96px]"
                  placeholder="Write a reply…"
                />
              </Field>
              <Button size="sm" onClick={post} disabled={body.trim().length < 2}>
                <Send className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                Post reply
              </Button>
            </div>
          )}
        </div>
      </Panel>

      <Panel>
        <div className="px-5 py-4 sm:px-6">
          {reported ? (
            <p role="status" className="text-sm leading-relaxed text-ink-2">
              Report received. Moderators will review this discussion against
              the community rules.
            </p>
          ) : reporting ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (reportReason) setReported(true);
              }}
              className="space-y-3"
            >
              <Field label="Why are you reporting this discussion?" htmlFor="t-reason">
                <SelectInput
                  id="t-reason"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                >
                  <option value="">Choose a reason…</option>
                  <option value="abuse">Harassment or abuse</option>
                  <option value="misinfo">False or misleading</option>
                  <option value="offtopic">Off-topic or spam</option>
                  <option value="other">Something else</option>
                </SelectInput>
              </Field>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={!reportReason}>
                  Send report
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setReporting(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[13px] text-ink-3">
                Breaks the community rules?
              </p>
              <Button variant="ghost" size="sm" onClick={() => setReporting(true)}>
                <Flag className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                Report discussion
              </Button>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
