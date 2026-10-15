"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { accounts } from "@/lib/data/users";
import type {
  Account,
  Attachment,
  ChatMessage,
  Complaint,
  ComplaintStatus,
  Reply,
  Thread,
} from "@/lib/types";
import {
  getNotifyPermission,
  requestNotifyPermission,
  showSystemNotification,
} from "@/lib/services/notify";

/* Session brain: account, prefs, and everything the visitor creates
   (filings, threads, replies, messages, mutes, closures). All of it
   resets on reload — the backend replaces this whole file one day.
   Full map: docs/Architecture.md. */

export type AccountKey = "member" | "moderator" | "anonymous";

interface FiledComplaint {
  title: string;
  description: string;
  category: Complaint["category"];
  visibility: Complaint["visibility"];
  audience: Complaint["audience"];
  audienceDetail?: string;
  anonymous: boolean;
  pseudonym?: string;
  attachments?: number;
  files?: Attachment[];
}

interface AppState {
  accountKey: AccountKey;
  account: Account;
  setAccountKey: (k: AccountKey) => void;
  /* notifications */
  notifyPermission: NotificationPermission | "unsupported";
  systemAlerts: boolean;
  setSystemAlerts: (v: boolean) => void;
  enableSystemAlerts: () => Promise<void>;
  /* session data (in-memory; backend replaces this) */
  sessionComplaints: Complaint[];
  fileComplaint: (c: FiledComplaint) => Complaint;
  sessionThreads: Thread[];
  sessionReplies: Reply[];
  startThread: (categorySlug: string, title: string, body: string) => Thread;
  addReply: (
    threadId: string,
    body: string,
    quote?: { author: string; body: string },
  ) => void;
  sessionMessages: ChatMessage[];
  sendMessage: (channelId: string, body: string, attachments?: Attachment[]) => void;
  retryMessage: (id: string) => void;
  mutedIds: string[];
  toggleMute: (id: string) => void;
  /* Author-driven lifecycle (session-only until the backend owns status). */
  closedIds: string[];
  closeComplaint: (id: string) => void;
  resolvedThreadIds: string[];
  resolveThread: (id: string) => void;
}

const Ctx = createContext<AppState | null>(null);

let refCounter = 2482;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [accountKey, setAccountKey] = useState<AccountKey>("member");
  const [notifyPermission, setNotifyPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [systemAlerts, setSystemAlertsState] = useState(false);
  const [sessionComplaints, setSessionComplaints] = useState<Complaint[]>([]);
  const [sessionThreads, setSessionThreads] = useState<Thread[]>([]);
  const [sessionReplies, setSessionReplies] = useState<Reply[]>([]);
  const [sessionMessages, setSessionMessages] = useState<ChatMessage[]>([]);
  const [mutedIds, setMutedIds] = useState<string[]>([]);
  const [closedIds, setClosedIds] = useState<string[]>([]);
  const [resolvedThreadIds, setResolvedThreadIds] = useState<string[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    /* Saved prefs load here (in an effect, never during render) so the
       server HTML and the first client render always match. */
    setNotifyPermission(getNotifyPermission());
    try {
      if (localStorage.getItem("lx-system-alerts") === "1") {
        setSystemAlertsState(true);
      }
      const saved = localStorage.getItem("lx-account");
      if (saved === "moderator" || saved === "anonymous" || saved === "member") {
        setAccountKey(saved);
      }
    } catch {
      /* private mode — carry on without persistence */
    }
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const setSystemAlerts = useCallback((v: boolean) => {
    setSystemAlertsState(v);
    try {
      localStorage.setItem("lx-system-alerts", v ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const changeAccount = useCallback((k: AccountKey) => {
    setAccountKey(k);
    try {
      localStorage.setItem("lx-account", k);
    } catch {
      /* ignore */
    }
  }, []);

  const enableSystemAlerts = useCallback(async () => {
    const result = await requestNotifyPermission();
    setNotifyPermission(result);
    if (result === "granted") {
      setSystemAlertsState(true);
      try {
        localStorage.setItem("lx-system-alerts", "1");
      } catch {
        /* ignore */
      }
      showSystemNotification(
        "Loklex alerts are on",
        "You'll see a system message when something needs your attention while Loklex is open.",
        "lx-enabled",
      );
    }
  }, []);

  const fileComplaint = useCallback(
    (c: FiledComplaint): Complaint => {
      const ref = `LX-${refCounter++}`;
      const now = new Date();
      const filedAt = `${now.getDate()} ${now.toLocaleString("en", { month: "short" })} ${now.getFullYear()}, ${now.toLocaleString("en", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase()}`;
      const complaint: Complaint = {
        id: `c-${Date.now()}`,
        ref,
        title: c.title,
        description: c.description,
        category: c.category,
        visibility: c.visibility,
        audience: c.audience,
        audienceDetail: c.audienceDetail,
        anonymous: c.anonymous,
        pseudonym: c.pseudonym,
        author: c.anonymous
          ? (c.pseudonym ?? "Anonymous")
          : (accounts[accountKey]?.displayName ?? "Member"),
        filedAt,
        status: "submitted" as ComplaintStatus,
        timeline: [
          {
            status: "submitted" as ComplaintStatus,
            at: filedAt,
            note:
              c.visibility === "moderators"
                ? "Received privately. Visible only to moderators."
                : "Filed and visible to its audience.",
          },
        ],
        supporters: 0,
        supported: false,
        comments: 0,
        attachments: c.attachments ?? 0,
        files: c.files ?? [],
      };
      setSessionComplaints((prev) => [complaint, ...prev]);
      return complaint;
    },
    [accountKey],
  );

  const startThread = useCallback(
    (categorySlug: string, title: string, body: string): Thread => {
      const thread: Thread = {
        id: `t-${Date.now()}`,
        categorySlug,
        title,
        author: accounts[accountKey]?.displayName ?? "Member",
        createdAt: "Just now",
        lastActivity: "Just now",
        replies: 0,
        excerpt:
          body.length > 140 ? `${body.slice(0, 140).trimEnd()}…` : body,
      };
      setSessionThreads((prev) => [thread, ...prev]);
      return thread;
    },
    [accountKey],
  );

  const addReply = useCallback(
    (
      threadId: string,
      body: string,
      quote?: { author: string; body: string },
    ) => {
      const reply: Reply = {
        id: `r-${Date.now()}`,
        threadId,
        author: accounts[accountKey]?.displayName ?? "Member",
        postedAt: "Just now",
        body,
        quote,
        mine: true,
      };
      setSessionReplies((prev) => [...prev, reply]);
    },
    [accountKey],
  );

  const sendMessage = useCallback(
    (channelId: string, body: string, attachments: Attachment[] = []) => {
      const id = `m-${Date.now()}`;
      const at = new Date()
        .toLocaleString("en", { hour: "numeric", minute: "2-digit", hour12: true })
        .toLowerCase();
      const msg: ChatMessage = {
        id,
        channelId,
        fromMe: true,
        body,
        at,
        state: "sending",
        attachments: attachments.length > 0 ? attachments : undefined,
      };
      setSessionMessages((prev) => [...prev, msg]);
      /* Mock network: "sent" appears only after the delay above.
         Never mark a message sent before its time is up. */
      timers.current.push(
        setTimeout(() => {
          setSessionMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, state: "sent" as const } : m)),
          );
        }, 400),
      );
    },
    [],
  );

  const retryMessage = useCallback((id: string) => {
    setSessionMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, state: "sending" as const } : m)),
    );
    timers.current.push(
      setTimeout(() => {
        setSessionMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, state: "sent" as const } : m)),
        );
      }, 400),
    );
  }, []);

  const toggleMute = useCallback((id: string) => {
    setMutedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const closeComplaint = useCallback((id: string) => {
    setClosedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const resolveThread = useCallback((id: string) => {
    setResolvedThreadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const value = useMemo<AppState>(
    () => ({
      accountKey,
      account: accounts[accountKey],
      setAccountKey: changeAccount,
      notifyPermission,
      systemAlerts,
      setSystemAlerts,
      enableSystemAlerts,
      sessionComplaints,
      fileComplaint,
      sessionThreads,
      sessionReplies,
      startThread,
      addReply,
      sessionMessages,
      sendMessage,
      retryMessage,
      mutedIds,
      toggleMute,
      closedIds,
      closeComplaint,
      resolvedThreadIds,
      resolveThread,
    }),
    [
      accountKey,
      changeAccount,
      notifyPermission,
      systemAlerts,
      setSystemAlerts,
      enableSystemAlerts,
      sessionComplaints,
      fileComplaint,
      sessionThreads,
      sessionReplies,
      startThread,
      addReply,
      sessionMessages,
      sendMessage,
      retryMessage,
      mutedIds,
      toggleMute,
      closedIds,
      closeComplaint,
      resolvedThreadIds,
      resolveThread,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
