"use client";

import { BellOff, BellRing } from "lucide-react";
import { useApp } from "@/components/app-state";
import { Button } from "@/components/ui/Button";
import {
  pushReadiness,
  showSystemNotification,
} from "@/lib/services/notify";

export function SystemAlertsControl() {
  const { notifyPermission, systemAlerts, setSystemAlerts, enableSystemAlerts } =
    useApp();

  if (notifyPermission === "unsupported") {
    return (
      <p className="text-sm leading-relaxed text-ink-2">
        System alerts aren&apos;t available in this browser. Notifications
        inside Loklex still work.
      </p>
    );
  }

  if (notifyPermission === "denied") {
    return (
      <div className="flex gap-3">
        <BellOff
          className="mt-0.5 h-5 w-5 shrink-0 text-warn"
          strokeWidth={1.75}
          aria-hidden
        />
        <p className="text-sm leading-relaxed text-ink-2">
          You&apos;ve blocked alerts for this site. To turn them back on, allow
          notifications for Loklex in your browser&apos;s site settings, then
          return here. Notifications inside Loklex still work either way.
        </p>
      </div>
    );
  }

  if (notifyPermission !== "granted" || !systemAlerts) {
    return (
      <div className="space-y-2">
        <p className="text-sm leading-relaxed text-ink-2">
          Get a system message for replies, new messages and status changes —
          even when Loklex is in another tab.
        </p>
        <Button size="sm" onClick={enableSystemAlerts}>
          <BellRing className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Enable system alerts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink">
          System alerts are on for this device.
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={systemAlerts}
          aria-label="System alerts"
          onClick={() => setSystemAlerts(!systemAlerts)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ${
            systemAlerts ? "bg-accent" : "bg-navy-700"
          }`}
        >
          <span
            aria-hidden
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-navy-950 transition-all duration-150 ${
              systemAlerts ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="subtle"
          size="sm"
          onClick={() =>
            showSystemNotification(
              "Test alert from Loklex",
              "If you can read this, system alerts are working.",
              "lx-test",
            )
          }
        >
          Send a test alert
        </Button>
      </div>
      <p className="text-[13px] leading-relaxed text-ink-3">
        {pushReadiness().reason}
      </p>
    </div>
  );
}
