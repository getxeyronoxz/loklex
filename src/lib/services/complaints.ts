import { complaints } from "../data/complaints";
import type { Complaint, ComplaintStatus } from "../types";
import { service } from "./base";

export async function listComplaints(): Promise<Complaint[]> {
  return service([...complaints]);
}

export async function getComplaint(id: string): Promise<Complaint | null> {
  return service(complaints.find((c) => c.id === id) ?? null);
}

export async function getComplaintByRef(ref: string): Promise<Complaint | null> {
  return service(complaints.find((c) => c.ref === ref) ?? null);
}

export async function complaintCounts(): Promise<Record<ComplaintStatus, number>> {
  const counts: Record<ComplaintStatus, number> = {
    submitted: 0,
    "under-review": 0,
    "needs-info": 0,
    "action-taken": 0,
    closed: 0,
  };
  for (const c of complaints) counts[c.status] += 1;
  return service(counts);
}
