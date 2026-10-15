import { notifications } from "../data/notifications";
import type { Notification } from "../types";
import { service } from "./base";

export async function listNotifications(): Promise<Notification[]> {
  return service([...notifications]);
}

export async function unreadNotifications(): Promise<number> {
  return service(notifications.filter((n) => !n.read).length);
}
