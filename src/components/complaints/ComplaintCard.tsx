import Link from "next/link";
import { EyeOff, HandHeart, MessageSquare, Paperclip } from "lucide-react";
import { initialsOf } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { StatusPill } from "@/components/ui/StatusPill";
import { complaintCategories, complaintStatuses } from "@/lib/types";
import type { Complaint } from "@/lib/types";

export function ComplaintCard({ complaint }: { complaint: Complaint }) {
  const status = complaintStatuses[complaint.status];
  return (
    <Link
      href={`/complaints/${complaint.id}`}
      className="block rounded-xl border border-navy-700 bg-navy-900 px-5 py-5 transition-colors duration-150 hover:border-navy-600 hover:bg-navy-850"
    >
      <span className="flex items-start justify-between gap-3">
        <span className="line-clamp-2 min-w-0 break-words font-display text-[17px] font-normal leading-snug text-ink">
          {complaint.title}
        </span>
        <StatusPill tone={status.tone}>{status.label}</StatusPill>
      </span>
      <span className="mt-2 line-clamp-2 block text-sm leading-relaxed text-ink-2">
        {complaint.description}
      </span>
      <span className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-ink-3">
        <span className="tnum font-mono tracking-[0.1em] text-accent/80">
          {complaint.ref}
        </span>
        <span>{complaintCategories[complaint.category].label}</span>
        <span className="inline-flex items-center gap-1.5">
          <Avatar
            initials={
              complaint.anonymous ? "··" : initialsOf(complaint.author)
            }
            size="sm"
          />
          {complaint.author}
        </span>
        <span>{complaint.filedAt}</span>
        <span className="tnum inline-flex items-center gap-1">
          <HandHeart className="h-3.5 w-3.5" aria-hidden />
          {complaint.supporters}
        </span>
        <span className="tnum inline-flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" aria-hidden />
          {complaint.comments}
        </span>
        {complaint.attachments > 0 && (
          <span className="tnum inline-flex items-center gap-1">
            <Paperclip className="h-3.5 w-3.5" aria-hidden />
            {complaint.attachments}
          </span>
        )}
        {complaint.visibility === "moderators" && (
          <span className="inline-flex items-center gap-1 text-ink-2">
            <EyeOff className="h-3.5 w-3.5" aria-hidden />
            Moderators only
          </span>
        )}
      </span>
    </Link>
  );
}
