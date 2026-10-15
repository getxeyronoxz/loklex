import { notifications } from "../data/notifications";
import { accounts } from "../data/users";
import type { Account, Notification } from "../types";
import { service } from "./base";

export async function listNotifications(): Promise<Notification[]> {
  return service([...notifications]);
}

export async function unreadNotifications(): Promise<number> {
  return service(notifications.filter((n) => !n.read).length);
}

export async function getAccount(role: string): Promise<Account> {
  return service(accounts[role] ?? accounts.member);
}
