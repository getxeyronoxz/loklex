"use client";

import Link from "next/link";
import { BellOff, FileText, MessagesSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "@/components/app-state";
import { SystemAlertsControl } from "@/components/notifications/SystemAlertsControl";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Field, SelectInput } from "@/components/ui/fields";
import { catalogChannels } from "@/lib/services/catalog";
import { complaintStatuses } from "@/lib/types";
import type { Channel } from "@/lib/types";
import { effectiveStatus } from "@/lib/visibility";

function useStored(key: string, initial: string): [string, (v: string) => void] {
  /* Device prefs only. Everything else about the visit is forgotten. */
  const [value, setValue] = useState(initial);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) setValue(saved);
    } catch {
      /* ignore */
    }
  }, [key]);
  const set = (v: string) => {
    setValue(v);
    try {
      localStorage.setItem(key, v);
    } catch {
      /* ignore */
    }
  };
  return [value, set];
}

function Toggle({
  label,
  hint,
  storageKey,
  initial,
}: {
  label: string;
  hint: string;
  storageKey: string;
  initial: string;
}) {
  const [value, setValue] = useStored(storageKey, initial);
  const on = value === "1";
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-[13px] text-ink-3">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => setValue(on ? "0" : "1")}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ${
          on ? "bg-gold" : "bg-navy-700"
        }`}
      >
        <span
          aria-hidden
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-navy-950 transition-all duration-150 ${
            on ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const {
    account,
    sessionComplaints,
    sessionThreads,
    mutedIds,
    toggleMute,
    closedIds,
  } = useApp();
  const [channelCatalog, setChannelCatalog] = useState<Channel[]>([]);
  useEffect(() => {
    catalogChannels()
      .then(setChannelCatalog)
      .catch(() => setChannelCatalog([]));
  }, []);
  const [defaultName, setDefaultName] = useStored("lx-default-name", "name");
  const [defaultVisibility, setDefaultVisibility] = useStored(
    "lx-default-visibility",
    "public",
  );

  const nameOf = (id: string) =>
    channelCatalog.find((c) => c.id === id)?.name ?? "Channel";

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="sr-only">Profile and settings</h1>
      <Panel>
        <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
          <Avatar initials={account.initials} size="lg" tone="gold" />
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-light text-ink">
              {account.displayName}
            </h1>
            <p className="text-[13px] capitalize text-ink-3">
              {account.role} · joined {account.joined}
            </p>
          </div>
        </div>
        <div className="tnum grid grid-cols-2 divide-x divide-navy-700 border-t border-navy-700">
          <div className="px-5 py-3.5 text-center sm:px-6">
            <p className="text-xl font-semibold text-ink">
              {account.complaintsFiled + sessionComplaints.length}
            </p>
            <p className="text-xs text-ink-3">Complaints filed</p>
          </div>
          <div className="px-5 py-3.5 text-center sm:px-6">
            <p className="text-xl font-semibold text-ink">
              {account.threadsStarted + sessionThreads.length}
            </p>
            <p className="text-xs text-ink-3">Discussions started</p>
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHeader eyebrow="Notifications" title="How you hear from us" />
        <div className="space-y-1 px-5 py-2 sm:px-6">
          <div className="border-b border-navy-700/60 py-3">
            <SystemAlertsControl />
          </div>
          <div className="divide-y divide-navy-700/60">
            <Toggle
              label="Replies to my discussions"
              hint="When someone replies in a thread you started."
              storageKey="lx-pref-replies"
              initial="1"
            />
            <Toggle
              label="New text messages"
              hint="When a conversation gets a new message."
              storageKey="lx-pref-messages"
              initial="1"
            />
            <Toggle
              label="Complaint status changes"
              hint="When one of your filings moves to a new status."
              storageKey="lx-pref-status"
              initial="1"
            />
            <Toggle
              label="Moderator notices"
              hint="Important notices from moderators."
              storageKey="lx-pref-mod"
              initial="1"
            />
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHeader eyebrow="Filing defaults" title="Your usual choices" />
        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
          <Field label="Shown name" htmlFor="d-name" hint="Used as the starting point for new filings.">
            <SelectInput
              id="d-name"
              value={defaultName}
              onChange={(e) => setDefaultName(e.target.value)}
            >
              <option value="name">My name</option>
              <option value="pseudonym">A pseudonym</option>
              <option value="hidden">Hidden</option>
            </SelectInput>
          </Field>
          <Field label="Visibility" htmlFor="d-vis" hint="Private reports go only to moderators.">
            <SelectInput
              id="d-vis"
              value={defaultVisibility}
              onChange={(e) => setDefaultVisibility(e.target.value)}
            >
              <option value="public">Community-visible</option>
              <option value="moderators">Private to moderators</option>
            </SelectInput>
          </Field>
        </div>
      </Panel>

      <Panel>
        <PanelHeader eyebrow="Activity" title="My filings this visit" />
        {sessionComplaints.length === 0 && sessionThreads.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nothing filed yet"
            body="Complaints you file and discussions you start will be listed here."
            action={
              <Link href="/complaints/new">
                <Button variant="subtle" size="sm">
                  File a complaint
                </Button>
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-navy-700/60">
            {sessionComplaints.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/complaints/${c.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-navy-850 sm:px-6"
                >
                  <FileText className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.75} aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">
                    {c.title}
                  </span>
                  <span className="tnum shrink-0 text-xs text-ink-3">
                    {complaintStatuses[effectiveStatus(c, closedIds)].label}
                  </span>
                </Link>
              </li>
            ))}
            {sessionThreads.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/forums/${t.categorySlug}/${t.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-navy-850 sm:px-6"
                >
                  <MessagesSquare className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.75} aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">
                    {t.title}
                  </span>
                  <span className="tnum shrink-0 text-xs text-ink-3">
                    Discussion
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelHeader eyebrow="Quiet" title="Muted channels" />
        {mutedIds.length === 0 ? (
          <EmptyState
            icon={BellOff}
            title="Nothing muted"
            body="Muted channels stay readable but stop sending alerts. Unmute them here."
          />
        ) : (
          <ul className="divide-y divide-navy-700/60">
            {mutedIds.map((id) => (
              <li
                key={id}
                className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6"
              >
                <span className="text-sm text-ink">{nameOf(id)}</span>
                <Button variant="subtle" size="sm" onClick={() => toggleMute(id)}>
                  Unmute
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
