import { accountOrder as demoOrder, accounts } from "../data/users";
import type { Account } from "../types";

/* Demo identity seam. A real auth service replaces these bodies;
   pages and the shell never import lib/data/users directly. */

export const accountOrder = demoOrder;

export function getAccount(key: string): Account {
  return accounts[key] ?? accounts.member;
}

export function listDemoAccounts(): {
  key: (typeof accountOrder)[number];
  account: Account;
}[] {
  return accountOrder.map((key) => ({ key, account: accounts[key] }));
}
