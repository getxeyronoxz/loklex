/* Browser notification seam. Everything that works without a backend
   lives here and is used today. Anything that needs a server — delivery
   after the browser is closed — is stubbed honestly: the UI reads
   pushReadiness() and says what's actually active instead of faking it. */

export type NotifySupport = "supported" | "unsupported";

export function notifySupport(): NotifySupport {
  if (typeof window === "undefined") return "unsupported";
  return "Notification" in window && "serviceWorker" in navigator
    ? "supported"
    : "unsupported";
}

export function getNotifyPermission(): NotificationPermission | "unsupported" {
  if (notifySupport() === "unsupported") return "unsupported";
  return Notification.permission;
}

/** Must be called from a user gesture (button click). */
export async function requestNotifyPermission(): Promise<NotificationPermission | "unsupported"> {
  if (notifySupport() === "unsupported") return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

/** Shows a system notification. Only fires when permission is granted
    and the page is running. Returns whether anything was shown. */
export function showSystemNotification(
  title: string,
  body: string,
  tag: string,
): boolean {
  try {
    if (notifySupport() === "unsupported") return false;
    if (Notification.permission !== "granted") return false;
    new Notification(title, { body, tag, silent: false });
    return true;
  } catch {
    return false;
  }
}

/* ---------------- After-close delivery (needs a backend) --------------- */

export interface PushReadiness {
  /** True only when a push subscription is live on a backend. */
  afterClose: false;
  reason: string;
}

export function pushReadiness(): PushReadiness {
  return {
    afterClose: false,
    reason:
      "Notifications arrive while Loklex is open. Delivery after the browser is closed needs the Loklex push service, which isn't connected in this build.",
  };
}
/* NOTE: no subscribePush stub — when the backend exists, add the real
   Web Push subscription here next to pushReadiness. */
