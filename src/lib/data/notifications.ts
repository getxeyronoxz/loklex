import type { Notification } from "../types";

export const notifications: Notification[] = [
  {
    id: "n-1",
    kind: "reply",
    title: "Lakshmi Venkat replied in the pipeline log",
    detail:
      "“Put the complaint reference right at the top. The clerk files it correctly only if…”",
    at: "12:31 pm",
    read: false,
    href: "/forums/jayanagar/t-pipeline-watch",
  },
  {
    id: "n-2",
    kind: "status",
    title: "LX-2476 needs more information",
    detail:
      "Moderators asked for your BESCOM docket number so it can be quoted in follow-ups.",
    at: "11:02 am",
    read: false,
    href: "/complaints/c-streetlight",
  },
  {
    id: "n-3",
    kind: "message",
    title: "New message in Jayanagar Residents",
    detail: "Lakshmi: “I'll bring the letter format to the meeting on Sunday”",
    at: "12:30 pm",
    read: false,
    href: "/chat?v=ch-jayanagar",
  },
  {
    id: "n-4",
    kind: "moderation",
    title: "Market announcements: action recorded",
    detail:
      "The market committee agreed to begin announcements at 7 am. Moderators will check back in two weeks.",
    at: "Yesterday",
    read: true,
    href: "/complaints/c-market",
  },
  {
    id: "n-5",
    kind: "reply",
    title: "Ananya Iyer replied in Rentals & Housing",
    detail: "“The owner agreed to six when I spoke to her directly…”",
    at: "Yesterday",
    read: true,
    href: "/forums/rentals-housing/t-deposit-norms",
  },
  {
    id: "n-6",
    kind: "status",
    title: "LX-2451 is now closed",
    detail:
      "Prepaid booth hours extended to 10:30 pm. Closed after confirmation from three commuters.",
    at: "8 Oct",
    read: true,
    href: "/complaints/c-autostand",
  },
];
