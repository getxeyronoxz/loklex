"use client";

import Link from "next/link";
import { FileWarning, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/app-state";
import { Button } from "@/components/ui/Button";
import { EmptyState, SkeletonRows } from "@/components/ui/EmptyState";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { SelectInput, TextInput } from "@/components/ui/fields";
import { ComplaintCard } from "@/components/complaints/ComplaintCard";
import { complaintCategories } from "@/lib/types";
import type { Complaint, ComplaintCategory, ComplaintStatus } from "@/lib/types";
import { listComplaints } from "@/lib/services/complaints";

export default function ComplaintsPage() {
  const { sessionComplaints, closedIds, accountKey } = useApp();
  const [all, setAll] = useState<Complaint[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"" | ComplaintCategory>("");
  const [status, setStatus] = useState<"" | ComplaintStatus>("");

  useEffect(() => {
    listComplaints()
      .then((seed) => setAll([...sessionComplaints, ...seed]))
      .catch(() => setFailed(true));
  }, [sessionComplaints]);

  const filtered = useMemo(() => {
    if (!all) return null;
    const q = query.trim().toLowerCase();
    const visible =
      accountKey === "moderator"
        ? all
        : all.filter((c) => c.visibility !== "moderators");
    return visible.filter(
      (c) =>
        (!q || `${c.title} ${c.description} ${c.ref}`.toLowerCase().includes(q)) &&
        (!category || c.category === category) &&
        (!status || c.status === status),
    );
  }, [all, query, category, status, accountKey]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="sr-only">Complaints raised by the community</h1>
      <Panel>
        <PanelHeader
          eyebrow="Complaints"
          title="Concerns raised by the community"
          action={
            <Link href="/complaints/new">
              <Button size="sm">
                <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
                File a complaint
              </Button>
            </Link>
          }
        />
        <div className="grid gap-3 border-b border-navy-700 px-5 py-4 sm:grid-cols-[1fr_200px_190px]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
              strokeWidth={1.75}
              aria-hidden
            />
            <TextInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, detail or reference…"
              aria-label="Search complaints"
              className="pl-9"
            />
          </div>
          <SelectInput
            value={category}
            onChange={(e) => setCategory(e.target.value as "" | ComplaintCategory)}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {(
              Object.entries(complaintCategories) as [
                ComplaintCategory,
                { label: string },
              ][]
            ).map(([key, v]) => (
              <option key={key} value={key}>
                {v.label}
              </option>
            ))}
          </SelectInput>
          <SelectInput
            value={status}
            onChange={(e) => setStatus(e.target.value as "" | ComplaintStatus)}
            aria-label="Filter by status"
          >
            <option value="">Any status</option>
            <option value="submitted">Submitted</option>
            <option value="under-review">Under review</option>
            <option value="needs-info">Needs more information</option>
            <option value="action-taken">Action taken</option>
            <option value="closed">Closed</option>
          </SelectInput>
        </div>
        {failed ? (
          <EmptyState
            icon={FileWarning}
            title="Couldn't load complaints"
            body="Something interrupted the load. Your filters are kept — try again."
            action={
              <Button
                variant="subtle"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Reload
              </Button>
            }
          />
        ) : filtered === null ? (
          <SkeletonRows rows={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FileWarning}
            title="No complaints match"
            body={
              query || category || status
                ? "Nothing matches this combination. Loosen a filter, or file it as a new complaint."
                : "No complaints yet. When someone files one, it will appear here."
            }
            action={
              <Link href="/complaints/new">
                <Button variant="subtle" size="sm">
                  File a complaint
                </Button>
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3 px-5 py-5">
            {filtered.map((c) => {
              const shown =
                closedIds.includes(c.id) && c.status !== "closed"
                  ? { ...c, status: "closed" as const }
                  : c;
              return (
                <li key={c.id}>
                  <ComplaintCard complaint={shown} />
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
