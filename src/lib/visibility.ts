import type { Complaint, ComplaintStatus } from "./types";

/* Who may see a filing, and which status the UI should show after
   the author closes it this visit. Used by lists, cards, and search. */

export function canSeeComplaint(
  complaint: Complaint,
  accountKey: string,
  ownIds: string[],
): boolean {
  if (complaint.visibility !== "moderators") return true;
  if (accountKey === "moderator") return true;
  return ownIds.includes(complaint.id);
}

export function effectiveStatus(
  complaint: Complaint,
  closedIds: string[],
): ComplaintStatus {
  return closedIds.includes(complaint.id) ? "closed" : complaint.status;
}
