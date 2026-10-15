import { forumCategories, replies, threads } from "../data/forums";
import type { ForumCategory, Reply, Thread } from "../types";
import { service } from "./base";

export async function listCategories(): Promise<ForumCategory[]> {
  return service([...forumCategories]);
}

export async function getCategory(slug: string): Promise<ForumCategory | null> {
  return service(forumCategories.find((c) => c.slug === slug) ?? null);
}

export async function listThreads(categorySlug?: string): Promise<Thread[]> {
  const all = categorySlug
    ? threads.filter((t) => t.categorySlug === categorySlug)
    : [...threads];
  const pinned = all.filter((t) => t.pinned);
  const rest = all.filter((t) => !t.pinned);
  return service([...pinned, ...rest]);
}

export async function getThread(id: string): Promise<Thread | null> {
  return service(threads.find((t) => t.id === id) ?? null);
}

export async function listReplies(threadId: string): Promise<Reply[]> {
  return service(replies.filter((r) => r.threadId === threadId));
}
