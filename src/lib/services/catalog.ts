import type { Channel, Complaint, ForumCategory, Thread } from "../types";
import { listChannels } from "./chat";
import { listComplaints } from "./complaints";
import { listCategories, listThreads } from "./forums";

/* Shared catalog reads.
   The workspace panes, the command palette and the profile page all want
   the same three lists, and each used to ask for them again on every
   mount and on every ⌘K. One in-flight promise per catalog keeps that to
   a single read each per page visit. A backend swap replaces these with
   real requests plus a real cache/invalidation policy; the signatures
   stay the same. */

let complaintsOnce: Promise<Complaint[]> | null = null;
let threadsOnce: Promise<Thread[]> | null = null;
let channelsOnce: Promise<Channel[]> | null = null;
let categoriesOnce: Promise<ForumCategory[]> | null = null;

/* Callers get the shared array; every consumer only reads from it. */

export function catalogComplaints(): Promise<Complaint[]> {
  if (!complaintsOnce) {
    complaintsOnce = listComplaints().catch((err) => {
      complaintsOnce = null; // let the next caller try again
      throw err;
    });
  }
  return complaintsOnce;
}

export function catalogThreads(): Promise<Thread[]> {
  if (!threadsOnce) {
    threadsOnce = listThreads().catch((err) => {
      threadsOnce = null;
      throw err;
    });
  }
  return threadsOnce;
}

export function catalogChannels(): Promise<Channel[]> {
  if (!channelsOnce) {
    channelsOnce = listChannels().catch((err) => {
      channelsOnce = null;
      throw err;
    });
  }
  return channelsOnce;
}

export function catalogCategories(): Promise<ForumCategory[]> {
  if (!categoriesOnce) {
    categoriesOnce = listCategories().catch((err) => {
      categoriesOnce = null;
      throw err;
    });
  }
  return categoriesOnce;
}
