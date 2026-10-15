/* Shared domain contracts. When the backend arrives, these types move
   verbatim into the shared client/server package. Nothing here knows
   about the network — services in lib/services/* are the only seam. */

export type Role = "member" | "moderator" | "anonymous";

export interface Account {
  id: string;
  role: Role;
  displayName: string;
  initials: string;
  joined: string;
  complaintsFiled: number;
  threadsStarted: number;
}

/* ------------------------------ Complaints ------------------------------ */

export type ComplaintCategory =
  | "neighbourhood"
  | "infrastructure"
  | "harassment"
  | "safety"
  | "other";

export type ComplaintVisibility = "public" | "moderators";

export type ComplaintAudience = "forum" | "forums" | "all";

export type ComplaintStatus =
  | "submitted"
  | "under-review"
  | "needs-info"
  | "action-taken"
  | "closed";

export interface StatusEvent {
  status: ComplaintStatus;
  at: string;
  note: string;
}

export interface Complaint {
  id: string;
  ref: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  visibility: ComplaintVisibility;
  audience: ComplaintAudience;
  audienceDetail?: string;
  anonymous: boolean;
  pseudonym?: string;
  author: string;
  filedAt: string;
  status: ComplaintStatus;
  timeline: StatusEvent[];
  supporters: number;
  supported: boolean;
  comments: number;
  attachments: number;
}

export const complaintCategories: Record<
  ComplaintCategory,
  { label: string; hint: string }
> = {
  neighbourhood: {
    label: "Community & neighbourhood",
    hint: "Noise, shared spaces, neighbours, local disputes",
  },
  infrastructure: {
    label: "Public services & infrastructure",
    hint: "Water, roads, streetlights, waste, power",
  },
  harassment: {
    label: "Harassment, abuse or threats",
    hint: "Handled with extra care; consider a private report",
  },
  safety: {
    label: "Crime & safety",
    hint: "Theft, break-ins, unsafe streets or junctions",
  },
  other: { label: "Other concerns", hint: "Anything else affecting daily life" },
};

export const complaintStatuses: Record<
  ComplaintStatus,
  { label: string; tone: "neutral" | "info" | "warn" | "success" | "muted" }
> = {
  submitted: { label: "Submitted", tone: "neutral" },
  "under-review": { label: "Under review", tone: "info" },
  "needs-info": { label: "Needs info", tone: "warn" },
  "action-taken": { label: "Action taken", tone: "success" },
  closed: { label: "Closed", tone: "muted" },
};

/* -------------------------------- Forums -------------------------------- */

export interface ForumCategory {
  slug: string;
  name: string;
  description: string;
  threads: number;
  lastActivity: string;
}

export interface Thread {
  id: string;
  categorySlug: string;
  title: string;
  author: string;
  createdAt: string;
  lastActivity: string;
  replies: number;
  pinned?: boolean;
  locked?: boolean;
  label?: string;
  excerpt: string;
}

export interface Reply {
  id: string;
  threadId: string;
  author: string;
  postedAt: string;
  body: string;
  quote?: { author: string; body: string };
  mine?: boolean;
}

/* --------------------------------- Chat --------------------------------- */
/* Forum-based channels only — there are no personal direct messages.
   Every channel belongs to a forum (or a complaint watched by a forum). */

export type MessageState = "sending" | "sent" | "failed";

export interface Channel {
  id: string;
  name: string;
  initials: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
  members: number;
  forumSlug?: string;
  complaintRef?: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  fromMe: boolean;
  author?: string;
  body: string;
  at: string;
  state: MessageState;
  attachments?: Attachment[];
}

/* A photo attached in chat. `url` is a session-local object URL —
   previews work while the app is open; a backend would replace this
   with a stored file URL. */
export interface Attachment {
  name: string;
  url?: string;
}

/* ----------------------------- Notifications ---------------------------- */

export type NotificationKind = "reply" | "message" | "status" | "moderation";

export interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  detail: string;
  at: string;
  read: boolean;
  href: string;
}
