"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BellOff,
  Check,
  Download,
  Expand,
  Hash,
  ImagePlus,
  MessageCircle,
  MoreVertical,
  Paperclip,
  Search,
  Send,
  X,
} from "lucide-react";
import { Fragment, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/components/app-state";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState, SkeletonRows } from "@/components/ui/EmptyState";
import { Field, TextArea, TextInput } from "@/components/ui/fields";
import { initialsOf } from "@/lib/format";
import type {
  Attachment,
  Channel,
  ChatMessage,
  ForumCategory,
  MessageState,
} from "@/lib/types";
import { listMessages } from "@/lib/services/chat";
import { catalogCategories, catalogChannels } from "@/lib/services/catalog";
import { getComplaintByRef } from "@/lib/services/complaints";

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl overflow-hidden rounded-xl border border-navy-700 bg-navy-900">
          <SkeletonRows rows={6} />
        </div>
      }
    >
      <ChatView />
    </Suspense>
  );
}

/* Day chips like familiar chat apps: clock times mean today,
   anything else ("Yesterday", weekday) is its own group. */
function dayLabel(at: string): string {
  return /\d{1,2}:\d{2}\s?(am|pm)/i.test(at) ? "Today" : at;
}

function ChatView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("v");
  const {
    sessionMessages,
    sendMessage,
    retryMessage,
    mutedIds,
    toggleMute,
    sessionComplaints,
  } = useApp();

  const [channels, setChannels] = useState<Channel[] | null>(null);
  const [forumCategories, setForumCategories] = useState<ForumCategory[]>([]);
  const [seedMessages, setSeedMessages] = useState<ChatMessage[] | null>(null);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const [finding, setFinding] = useState("");
  const [draft, setDraft] = useState("");
  const [photos, setPhotos] = useState<Attachment[]>([]);
  /* Retry state for seeded failed messages (they don't live in session
     state, so their sending/sent flip is tracked here). */
  const [revived, setRevived] = useState<Record<string, MessageState>>({});
  const [linkedComplaintId, setLinkedComplaintId] = useState<string | null>(null);
  /* The thread is rendered twice (mobile + desktop containers) and CSS
     hides one. A single ref would always hold whichever mounted last,
     so scroll-to-newest would aim at the hidden copy. One ref per
     instance, then the effect picks the visible one. */
  const bottomRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    catalogChannels().then(setChannels).catch(() => setChannels([]));
    catalogCategories().then(setForumCategories).catch(() => setForumCategories([]));
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setSeedMessages(null);
      return;
    }
    listMessages(selectedId)
      .then(setSeedMessages)
      .catch(() => setSeedMessages([]));
    setReadIds((prev) => (prev.includes(selectedId) ? prev : [...prev, selectedId]));
    setReporting(false);
    setReported(false);
    setMenuOpen(false);
    setDraft("");
    setPhotos([]);
    setRevived({});
  }, [selectedId]);

  const visibleChannels = useMemo(() => {
    const q = finding.trim().toLowerCase();
    return (channels ?? []).filter(
      (c) => !q || `${c.name} ${c.lastMessage}`.toLowerCase().includes(q),
    );
  }, [channels, finding]);

  const active = (channels ?? []).find((c) => c.id === selectedId) ?? null;

  const messages = useMemo(() => {
    if (!selectedId) return [];
    const mine = sessionMessages.filter((m) => m.channelId === selectedId);
    return [...(seedMessages ?? []), ...mine];
  }, [seedMessages, sessionMessages, selectedId]);

  useEffect(() => {
    const nodes = Object.values(bottomRefs.current).filter(
      (n): n is HTMLDivElement => n !== null,
    );
    /* offsetParent is null on the instance CSS is hiding. */
    const visible = nodes.find((n) => n.offsetParent !== null) ?? nodes[0];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    visible?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "end",
    });
  }, [messages.length, selectedId]);

  const isMuted = active ? mutedIds.includes(active.id) : false;
  const forumName = active?.forumSlug
    ? forumCategories.find((f) => f.slug === active.forumSlug)?.name
    : null;

  /* Complaint watch channels link back to the filing. */
  useEffect(() => {
    const ref = active?.complaintRef;
    if (!ref) {
      setLinkedComplaintId(null);
      return;
    }
    const mine = sessionComplaints.find((c) => c.ref === ref);
    if (mine) {
      setLinkedComplaintId(mine.id);
      return;
    }
    getComplaintByRef(ref)
      .then((c) => setLinkedComplaintId(c ? c.id : null))
      .catch(() => setLinkedComplaintId(null));
  }, [active?.complaintRef, sessionComplaints]);

  const send = () => {
    if (!active) return;
    if (draft.trim().length === 0 && photos.length === 0) return;
    sendMessage(active.id, draft.trim(), [...photos]);
    setDraft("");
    setPhotos([]);
  };

  const retry = (id: string) => {
    setRevived((prev) => ({ ...prev, [id]: "sending" }));
    retryMessage(id);
    window.setTimeout(() => {
      setRevived((prev) => ({ ...prev, [id]: "sent" }));
    }, 400);
  };

  const select = (id: string) => router.push(`/chat?v=${id}`);

  const listNode = (
    <div className="flex h-full flex-col">
      <div className="space-y-2 border-b border-navy-700 px-4 py-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
            strokeWidth={1.75}
            aria-hidden
          />
          <TextInput
            value={finding}
            onChange={(e) => setFinding(e.target.value)}
            placeholder="Search channels…"
            aria-label="Search channels"
            className="pl-9"
          />
        </div>
        <p className="px-1 text-xs leading-relaxed text-ink-3">
          Every channel belongs to a forum — neighbours talk in the open,
          next to the complaints and threads.
        </p>
      </div>
      <div className="scroll-quiet min-h-0 flex-1 overflow-y-auto">
        {channels === null ? (
          <SkeletonRows rows={5} />
        ) : visibleChannels.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title={finding ? "No matches" : "No channels"}
            body={
              finding
                ? "Try a different name or word."
                : "Channels appear here as forums open them."
            }
          />
        ) : (
          <ul className="divide-y divide-navy-700/60">
            {visibleChannels.map((c) => {
              const unread = readIds.includes(c.id) ? 0 : c.unread;
              const liveLast =
                sessionMessages.filter((m) => m.channelId === c.id).at(-1)
                  ?.body ?? c.lastMessage;
              const isActive = c.id === selectedId;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => select(c.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-navy-850 ${
                      isActive ? "bg-navy-850" : ""
                    }`}
                  >
                    <Avatar initials={c.initials} tone={isActive ? "accent" : "default"} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-medium text-ink">
                          {c.name}
                        </span>
                        <span className="tnum shrink-0 text-xs text-ink-3">
                          {c.lastAt}
                        </span>
                      </span>
                      <span className="mt-0.5 flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-[13px] text-ink-2">
                          {mutedIds.includes(c.id) ? "Muted · " : ""}
                          {liveLast}
                        </span>
                        {unread > 0 && (
                          <span className="tnum shrink-0 rounded-full bg-accent px-1.5 py-px text-xs font-bold text-navy-950">
                            {unread}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );

  const emptyThread = (
    <EmptyState
      icon={Hash}
      title="No channel open"
      body="Choose one from the list to read and reply."
    />
  );

  /* One thread, drawn twice (phone layout + desktop layout), so every
     element id carries a prefix — otherwise the page holds duplicates. */
  const renderThread = (prefix: string) => {
    if (!active) return emptyThread;
    return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-navy-700 px-4 py-3">
        <Link
          href="/chat"
          aria-label="Back to channels"
          className="rounded-lg p-2 text-ink-2 hover:bg-navy-800 hover:text-ink lg:hidden"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </Link>
        <Avatar initials={active.initials} tone="accent" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{active.name}</p>
          <p className="tnum truncate text-xs text-ink-3">
            {active.members} members{isMuted ? " · Muted" : ""}
            {active.complaintRef ? ` · ${active.complaintRef}` : ""}
          </p>
        </div>
        {forumName && active.forumSlug && (
          <Link
            href={`/forums/${active.forumSlug}`}
            className="hidden shrink-0 text-[13px] font-medium text-ink-2 hover:text-accent-hi sm:block"
          >
            Open forum →
          </Link>
        )}
        {linkedComplaintId && active.complaintRef && (
          <Link
            href={`/complaints/${linkedComplaintId}`}
            className="tnum hidden shrink-0 rounded-full bg-accent-wash px-2.5 py-1 text-xs font-semibold text-accent-hi hover:bg-accent/20 sm:block"
          >
            Open {active.complaintRef} →
          </Link>
        )}
        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Channel options"
            className="rounded-lg p-2 text-ink-2 hover:bg-navy-800 hover:text-ink"
          >
            <MoreVertical className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-30 mt-1 w-52 rounded-xl border border-navy-700 bg-navy-900 p-1.5 shadow-xl"
            >
              <button
                type="button"
                role="menuitemcheckbox"
                aria-checked={isMuted}
                onClick={() => {
                  toggleMute(active.id);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ink-2 hover:bg-navy-800 hover:text-ink"
              >
                <BellOff className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                {isMuted ? "Unmute channel" : "Mute channel"}
                {isMuted && <Check className="ml-auto h-4 w-4 text-accent" aria-hidden />}
              </button>
              <Link
                href="/profile"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-2 hover:bg-navy-800 hover:text-ink"
                onClick={() => setMenuOpen(false)}
              >
                <BellOff className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                Notification settings
              </Link>
            </div>
          )}
        </div>
      </header>

      <div
        className="scroll-quiet min-h-0 flex-1 overflow-y-auto px-4 py-4"
        role="log"
        aria-label={`Messages in ${active.name}`}
        aria-live="polite"
      >
        {seedMessages === null ? (
          <SkeletonRows rows={4} />
        ) : messages.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="No messages yet"
            body={`Start the conversation in ${active.name} — everyone in the channel can read and reply.`}
          />
        ) : (
          <ol className="space-y-4">
            {messages.map((m, idx) => {
              const shown = revived[m.id] ?? m.state;
              const day = dayLabel(m.at);
              const prevDay = idx === 0 ? null : dayLabel(messages[idx - 1].at);
              return (
              <Fragment key={m.id}>
              {day !== prevDay && (
                <li className="flex justify-center pt-1">
                  <span className="tnum rounded-full border border-navy-700 bg-navy-950 px-3 py-1 text-xs text-ink-3">
                    {day}
                  </span>
                </li>
              )}
              <li
                className={`lx-rise flex gap-2.5 ${m.fromMe ? "justify-end" : "justify-start"}`}
              >
                {!m.fromMe && (
                  <Avatar
                    initials={initialsOf(m.author ?? "?")}
                    size="sm"
                    tone="default"
                  />
                )}
                <div
                  className={`max-w-[78%] rounded-xl px-3.5 py-2.5 ${
                    m.fromMe
                      ? "rounded-br-sm bg-accent-deep text-ink"
                      : "rounded-bl-sm border border-navy-700 bg-navy-800 text-ink"
                  }`}
                >
                  {!m.fromMe && m.author && (
                    <p className="mb-0.5 text-xs font-semibold text-accent-hi">
                      {m.author}
                    </p>
                  )}
                  {m.attachments && m.attachments.length > 0 && (
                    <ul className="mb-1.5 space-y-1.5">
                      {m.attachments.map((a) =>
                        a.url ? (
                          <li key={a.url}>
                            <div className="group overflow-hidden rounded-lg border border-navy-700 bg-navy-950 transition-colors duration-150 hover:border-accent-deep">
                              <a
                                href={a.url}
                                target="_blank"
                                rel="noreferrer"
                                title={`Open ${a.name} in full`}
                                className="block"
                              >
                                {/* Plain img: object URLs are session-local, not served files */}
                                <img
                                  src={a.url}
                                  alt={a.name}
                                  loading="lazy"
                                  className="aspect-[16/10] max-h-64 w-full object-cover"
                                />
                              </a>
                              <span className="flex items-center justify-between gap-2 px-2.5 py-1.5">
                                <span className="tnum min-w-0 truncate text-xs text-ink-2">
                                  {a.name}
                                </span>
                                <span className="flex shrink-0 items-center gap-0.5">
                                  <a
                                    href={a.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={`Open ${a.name} in full`}
                                    title={`Open ${a.name} in full`}
                                    className="rounded-md p-1 text-ink-3 transition-colors duration-150 hover:text-accent-hi"
                                  >
                                    <Expand className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                                  </a>
                                  <a
                                    href={a.url}
                                    download={a.name}
                                    aria-label={`Download ${a.name}`}
                                    title={`Download ${a.name}`}
                                    className="rounded-md p-1 text-ink-3 transition-colors duration-150 hover:text-accent-hi"
                                  >
                                    <Download className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                                  </a>
                                </span>
                              </span>
                            </div>
                          </li>
                        ) : (
                          <li
                            key={a.name}
                            className={`tnum flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs ${
                              m.fromMe ? "bg-navy-950/10" : "bg-navy-950"
                            }`}
                          >
                            <Paperclip className="h-3 w-3 shrink-0" aria-hidden />
                            <span className="truncate">{a.name}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  )}
                  {m.body && (
                    <p className="whitespace-pre-line break-words text-sm leading-relaxed">{m.body}</p>
                  )}
                  <p
                    className={`tnum mt-1 text-right text-xs ${
                      m.fromMe ? "text-navy-950/70" : "text-ink-3"
                    }`}
                  >
                    {shown === "sending" ? (
                      "Sending…"
                    ) : shown === "failed" ? (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-danger">
                        Not sent
                        <button
                          type="button"
                          onClick={() => retry(m.id)}
                          className="underline underline-offset-2"
                        >
                          Retry
                        </button>
                      </span>
                    ) : (
                      `Sent · ${m.at}`
                    )}
                  </p>
                </div>
              </li>
              </Fragment>
              );
            })}
            <div
              ref={(el) => {
                bottomRefs.current[prefix] = el;
              }}
              aria-hidden
            />
          </ol>
        )}
      </div>

      <div className="border-b border-navy-700 px-4 py-2">
        {reported ? (
          <p role="status" className="py-1 text-[13px] text-ink-2">
            Report received. Moderators will review this channel.
          </p>
        ) : reporting ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setReported(true);
              setReporting(false);
            }}
            className="flex items-center gap-2 py-1"
          >
            <label htmlFor={`${prefix}-chat-report`} className="sr-only">
              Reason for reporting
            </label>
            <select
              id={`${prefix}-chat-report`}
              required
              defaultValue=""
              className="h-9 rounded-lg border border-navy-700 bg-navy-950 px-2 text-[13px] text-ink"
            >
              <option value="" disabled>
                Report reason…
              </option>
              <option value="abuse">Harassment or abuse</option>
              <option value="spam">Spam or scam</option>
              <option value="other">Something else</option>
            </select>
            <Button type="submit" size="sm">
              Send report
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setReporting(false)}>
              Cancel
            </Button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setReporting(true)}
            className="py-1 text-[13px] font-medium text-ink-3 hover:text-danger"
          >
            Report this channel
          </button>
        )}
      </div>

      {/* The composer is a plain flex child pinned by the panel's own
          height — the mobile view fits the viewport and scrolls the
          message log inside, so nothing needs to float over the page
          (a sticky rail had no scrollport to stick to, and slid under
          the bottom nav on short phones). Solid background so messages
          never ghost through it. */}
      <div className="relative z-10 border-t border-navy-700 bg-navy-900 px-4 py-3 shadow-[0_-12px_32px_rgba(0,0,0,0.55)] lg:border-t-0 lg:bg-transparent lg:shadow-none">
        {photos.length > 0 && (
          <ul className="mb-2 flex flex-wrap gap-2" aria-label="Attached photos">
            {photos.map((p) => (
              <li
                key={p.url ?? p.name}
                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-navy-700 bg-navy-950"
                title={p.name}
              >
                {p.url ? (
                  <img src={p.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="grid h-full w-full place-items-center">
                    <ImagePlus className="h-4 w-4 text-accent" aria-hidden />
                  </span>
                )}
                <span className="sr-only">{p.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (p.url) URL.revokeObjectURL(p.url);
                    setPhotos((prev) => prev.filter((x) => x.url !== p.url || x.name !== p.name));
                  }}
                  aria-label={`Remove ${p.name}`}
                  className="absolute right-0.5 top-0.5 rounded-full bg-navy-950/90 p-0.5 text-ink-3 hover:text-danger"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="rounded-full border border-navy-700 bg-navy-950 transition-colors duration-150 focus-within:border-accent">
          <div className="flex items-end gap-1 px-1.5 py-1.5">
            <label
              className="cursor-pointer rounded-full p-2.5 text-ink-2 transition-colors duration-150 hover:bg-navy-800 hover:text-ink"
              title="Attach photos"
            >
              <span className="sr-only">Attach photos</span>
              <ImagePlus className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                  /* Chosen files become session-local preview URLs. They work
                     until reload; stored file URLs replace them later. */
                  const picked: Attachment[] = Array.from(e.target.files ?? []).map(
                    (f) => ({ name: f.name, url: URL.createObjectURL(f) }),
                  );
                  setPhotos((prev) => [...prev, ...picked].slice(0, 4));
                  e.target.value = "";
                }}
              />
            </label>
            <div className="min-w-0 flex-1">
              <Field htmlFor={`${prefix}-composer`}>
                <TextArea
                  id={`${prefix}-composer`}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={1}
                  placeholder={`Message ${active.name}…`}
                  aria-label={`Message ${active.name}`}
                  className="max-h-[140px] min-h-[40px]! resize-none border-transparent bg-transparent py-2 focus:border-transparent!"
                />
              </Field>
            </div>
            <button
              type="button"
              onClick={send}
              disabled={draft.trim().length === 0 && photos.length === 0}
              aria-label="Send message"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-navy-950 transition-colors duration-150 hover:bg-accent-hi disabled:cursor-not-allowed disabled:bg-navy-700 disabled:text-ink-3"
            >
              <Send className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        </div>
        <p className="tnum mt-1.5 text-xs text-ink-3">
          Enter to send · Shift+Enter for a new line
        </p>
      </div>
    </div>
    );
  };

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col">
      <h1 className="sr-only">Text chat channels</h1>
      {/* One at a time: CSS picks the container, and the fitted height
          makes the message log the scroller on both. */}
      <div className="flex min-h-0 flex-1 flex-col lg:hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-navy-700 bg-navy-900">
          {selectedId ? (active ? renderThread("m") : emptyThread) : listNode}
        </div>
      </div>
      <div className="hidden min-h-0 flex-1 gap-4 lg:flex">
        <section
          aria-label="Channels"
          className="flex w-[320px] shrink-0 flex-col overflow-hidden rounded-xl border border-navy-700 bg-navy-900"
        >
          {listNode}
        </section>
        <section
          aria-label={active ? `Channel ${active.name}` : "Channel"}
          className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-navy-700 bg-navy-900"
        >
          {active ? renderThread("d") : emptyThread}
        </section>
      </div>
    </div>
  );
}
