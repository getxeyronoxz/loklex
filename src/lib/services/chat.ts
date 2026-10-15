import { channels, messages } from "../data/chat";
import type { Channel, ChatMessage } from "../types";
import { service } from "./base";

export async function listChannels(): Promise<Channel[]> {
  return service([...channels]);
}

export async function listMessages(channelId: string): Promise<ChatMessage[]> {
  return service(messages.filter((m) => m.channelId === channelId));
}

export async function unreadTotal(): Promise<number> {
  return service(channels.reduce((n, c) => n + c.unread, 0));
}
