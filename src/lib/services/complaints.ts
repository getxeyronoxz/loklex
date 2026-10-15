import { complaints } from "../data/complaints";
import type { Complaint } from "../types";
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
