"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  MessageSquare,
  MessagesSquare,
  Pin,
  Plus,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useApp } from "@/components/app-state";
import { Button } from "@/components/ui/Button";
import { EmptyState, SkeletonRows } from "@/components/ui/EmptyState";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/fields";
import type { ForumCategory, Thread } from "@/lib/types";
import { getCategory, listThreads } from "@/lib/services/forums";

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-navy-700 bg-navy-900">
          <SkeletonRows rows={5} />
        </div>
      }
    >
      <CategoryView />
    </Suspense>
  );
}

function CategoryView() {
  const params = useParams<{ category: string }>();
  const router = useRouter();
  const { sessionThreads, sessionReplies, resolvedThreadIds, startThread } = useApp();
  const [category, setCategory] = useState<ForumCategory | null | undefined>(
    undefined,
  );
  const [threads, setThreads] = useState<Thread[] | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"latest" | "discussed">("latest");
  const [composing, setComposing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    getCategory(params.category).then(setCategory).catch(() => setCategory(null));
    listThreads(params.category)
      .then(setThreads)
      .catch(() => setThreads([]));
  }, [params.category]);

  const mine = useMemo(
    () => sessionThreads.filter((t) => t.categorySlug === params.category),
    [sessionThreads, params.category],
  );

  const visible = useMemo(() => {
    const all = [...mine, ...(threads ?? [])];
    const q = query.trim().toLowerCase();
    const filtered = all.filter(
      (t) => !q || `${t.title} ${t.author}`.toLowerCase().includes(q),
    );
    const pinned = filtered.filter((t) => t.pinned);
    const rest = filtered.filter((t) => !t.pinned);
    if (sort === "discussed") rest.sort((a, b) => b.replies - a.replies);
    return [...pinned, ...rest];
  }, [threads, mine, query, sort]);

  const post = () => {
    if (newTitle.trim().length < 8) {
      setFormError("Give your discussion a title of at least 8 characters.");
      return;
    }
    if (newBody.trim().length < 20) {
      setFormError("Add a little background — at least 20 characters.");
      return;
    }
    const thread = startThread(params.category, newTitle.trim(), newBody.trim());
    router.push(`/forums/${params.category}/${thread.id}`);
  };

  if (category === undefined) {
    return (
      <div className="mx-auto max-w-3xl">
        <Panel>
          <SkeletonRows rows={5} />
        </Panel>
      </div>
    );
  }

  if (category === null) {
    return (
      <div className="mx-auto max-w-3xl">
        <Panel>
          <EmptyState
            icon={MessagesSquare}
            title="Forum not found"
            body="This forum doesn't exist or was removed."
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
      <h1 className="sr-only">Forum threads</h1>
      <Link
        href="/forums"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-2 hover:text-gold-hi"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
        All forums
      </Link>

      <Panel>
        <PanelHeader
          eyebrow="Forum"
          title={category.name}
          action={
            <Button size="sm" onClick={() => setComposing((v) => !v)}>
              <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
              Start discussion
            </Button>
          }
        />
        <p className="border-b border-navy-700 px-5 py-3 text-sm text-ink-2 sm:px-6">
          {category.description}
        </p>

        {composing && (
          <div className="space-y-4 border-b border-navy-700 bg-navy-950/60 px-5 py-5 sm:px-6">
            <h2 className="font-display text-lg font-normal text-ink">
              New discussion in {category.name}
            </h2>
            {formError && (
              <p role="alert" className="text-[13px] font-medium text-danger">
                {formError}
              </p>
            )}
            <Field label="Title" htmlFor="t-title">
              <TextInput
                id="t-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What is this discussion about?"
                maxLength={140}
              />
            </Field>
            <Field label="Opening post" htmlFor="t-body">
              <TextArea
                id="t-body"
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                placeholder="Set the scene — what's the situation, what have you tried, what are you asking?"
              />
            </Field>
            <div className="flex gap-2">
              <Button size="sm" onClick={post}>
                Post discussion
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setComposing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-3 border-b border-navy-700 px-5 py-4 sm:grid-cols-[1fr_180px] sm:px-6">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
              strokeWidth={1.75}
              aria-hidden
            />
            <TextInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search this forum…"
              aria-label="Search this forum"
              className="pl-9"
            />
          </div>
          <SelectInput
            value={sort}
            onChange={(e) => setSort(e.target.value as "latest" | "discussed")}
            aria-label="Sort threads"
          >
            <option value="latest">Latest first</option>
            <option value="discussed">Most discussed</option>
          </SelectInput>
        </div>

        {threads === null ? (
          <SkeletonRows rows={5} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={MessagesSquare}
            title={query ? "No threads match" : "No discussions yet"}
            body={
              query
                ? "Try different words, or start a discussion with this title."
                : "Be the first to start a discussion in this forum."
            }
            action={
              <Button variant="subtle" size="sm" onClick={() => setComposing(true)}>
                Start discussion
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-navy-700/60">
            {visible.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/forums/${t.categorySlug}/${t.id}`}
                  className="block px-5 py-4 transition-colors duration-150 hover:bg-navy-850 sm:px-6"
                >
                  <span className="flex items-start gap-2">
                    {t.pinned && (
                      <Pin
                        className="mt-1 h-3.5 w-3.5 shrink-0 text-gold"
                        strokeWidth={2}
                        aria-hidden
                      />
                    )}
                    {t.locked && (
                      <Lock
                        className="mt-1 h-3.5 w-3.5 shrink-0 text-ink-3"
                        strokeWidth={2}
                        aria-hidden
                      />
                    )}
                    <span className="line-clamp-2 min-w-0 flex-1 break-words text-[15px] font-medium leading-snug text-ink">
                      {t.title}
                    </span>
                    {resolvedThreadIds.includes(t.id) ? (
                      <span className="tnum shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                        Resolved
                      </span>
                    ) : (
                      t.label && (
                        <span className="tnum shrink-0 rounded-full bg-navy-800 px-2 py-0.5 text-xs font-semibold text-ink-2">
                          {t.label}
                        </span>
                      )
                    )}
                  </span>
                  <span className="tnum mt-1.5 block truncate text-[13px] text-ink-3">
                    {t.excerpt}
                  </span>
                  <span className="tnum mt-1.5 flex items-center gap-3 text-[12px] text-ink-3">
                    <span>
                      {t.author} · {t.lastActivity}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" aria-hidden />
                      {t.replies +
                        sessionReplies.filter((r) => r.threadId === t.id).length}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
