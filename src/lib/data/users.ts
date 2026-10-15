import type { Account } from "../types";

export const accounts: Record<string, Account> = {
  member: {
    id: "u-meera",
    role: "member",
    displayName: "Meera Krishnan",
    initials: "MK",
    joined: "March 2024",
    complaintsFiled: 3,
    threadsStarted: 11,
  },
  moderator: {
    id: "u-arvind",
    role: "moderator",
    displayName: "Arvind Rao",
    initials: "AR",
    joined: "January 2023",
    complaintsFiled: 1,
    threadsStarted: 26,
  },
  anonymous: {
    id: "u-anon",
    role: "anonymous",
    displayName: "Guest visitor",
    initials: "··",
    joined: "Browsing without an account",
    complaintsFiled: 0,
    threadsStarted: 0,
  },
};

export const accountOrder = ["member", "moderator", "anonymous"] as const;
