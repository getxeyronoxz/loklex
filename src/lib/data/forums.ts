import type { ForumCategory, Reply, Thread } from "../types";

export const forumCategories: ForumCategory[] = [
  {
    slug: "jayanagar",
    name: "Jayanagar Residents",
    description:
      "Water, roads, waste, streetlights and everything that keeps the blocks running.",
    threads: 148,
    lastActivity: "12 min ago",
  },
  {
    slug: "commuters",
    name: "Commuters' Forum",
    description:
      "Buses, metro feeders, auto fares, footpaths and the daily getting-around.",
    threads: 86,
    lastActivity: "34 min ago",
  },
  {
    slug: "safety-watch",
    name: "Safety Watch",
    description:
      "Street lighting, CCTV gaps, unsafe junctions and looking out for each other.",
    threads: 64,
    lastActivity: "1 hr ago",
  },
  {
    slug: "market-street",
    name: "Market Street",
    description:
      "Vendors, prices, encroachment, timings — the market and its neighbours.",
    threads: 52,
    lastActivity: "2 hrs ago",
  },
  {
    slug: "rentals-housing",
    name: "Rentals & Housing",
    description:
      "Deposits, agreements, maintenance, brokers and tenant questions.",
    threads: 97,
    lastActivity: "3 hrs ago",
  },
  {
    slug: "general",
    name: "General",
    description: "Anything community-shaped that fits nowhere else.",
    threads: 121,
    lastActivity: "26 min ago",
  },
];

export const threads: Thread[] = [
  {
    id: "t-pipeline-watch",
    categorySlug: "jayanagar",
    title: "12th Main pipeline: a running log of the repair (LX-2481)",
    author: "Meera Krishnan",
    createdAt: "9 Oct 2026",
    lastActivity: "18 min ago",
    replies: 18,
    pinned: true,
    label: "Linked complaint",
    excerpt:
      "Keeping one place for updates on the pipeline trench so the complaint thread doesn't scatter. BWSSB junior engineer visited yesterday — notes inside.",
  },
  {
    id: "t-bescom-docket",
    categorySlug: "jayanagar",
    title: "How to actually get a BESCOM docket that moves",
    author: "Raghav Menon",
    createdAt: "6 Oct 2026",
    lastActivity: "44 min ago",
    replies: 32,
    label: "Guide",
    excerpt:
      "After three dead dockets I learned the exact combination that gets a crew assigned. Step-by-step with the numbers they ask for.",
  },
  {
    id: "t-metro-feeder",
    categorySlug: "commuters",
    title: "Metro feeder MF-14 skipping the 8:40 pm run again",
    author: "Priya Nair",
    createdAt: "11 Oct 2026",
    lastActivity: "1 hr ago",
    replies: 9,
    excerpt:
      "Third time in two weeks the last feeder hasn't shown and the depot says 'no information'. Anyone else stranded at the station?",
  },
  {
    id: "t-prepaid-booth",
    categorySlug: "commuters",
    title: "Prepaid booth now open till 10:30 pm — evenings sorted?",
    author: "Farhan Sheikh",
    createdAt: "8 Oct 2026",
    lastActivity: "2 hrs ago",
    replies: 31,
    label: "Resolved",
    excerpt:
      "Following up on the auto-fare complaint: the booth hours were extended. Reporting back whether drivers are honouring it.",
  },
  {
    id: "t-dark-lane",
    categorySlug: "safety-watch",
    title: "Which lanes still go fully dark after 7 pm? Mapping them",
    author: "Arvind Rao",
    createdAt: "3 Oct 2026",
    lastActivity: "3 hrs ago",
    replies: 47,
    pinned: true,
    label: "Community map",
    excerpt:
      "One list of every unlit stretch so complaints can quote it. Add your lane with cross-street and nearest landmark.",
  },
  {
    id: "t-cctv-fund",
    categorySlug: "safety-watch",
    title: "Pooling for two CCTV cameras at the park gate — costs inside",
    author: "Sunita Patil",
    createdAt: "29 Sep 2026",
    lastActivity: "5 hrs ago",
    replies: 21,
    excerpt:
      "Two quotes received, both around ₹18,000 installed with a month of backup. Splitting across the three lanes that use the gate.",
  },
  {
    id: "t-announcement-time",
    categorySlug: "market-street",
    title: "Market announcements now start at 7 am — thank you",
    author: "4th Block resident",
    createdAt: "12 Oct 2026",
    lastActivity: "26 min ago",
    replies: 12,
    label: "Update",
    excerpt:
      "Woke up to quiet this morning for the first time in weeks. Logging here so the committee's response is on record.",
  },
  {
    id: "t-vendor-encroach",
    categorySlug: "market-street",
    title: "Carts blocking the footpath outside the flower stalls",
    author: "Joseph D'Souza",
    createdAt: "5 Oct 2026",
    lastActivity: "6 hrs ago",
    replies: 15,
    excerpt:
      "Pedestrians are forced onto the road during evening rush. Vendors say they have no allotted bays — is that true?",
  },
  {
    id: "t-deposit-norms",
    categorySlug: "rentals-housing",
    title: "10-month deposit demands: what's actually normal in Jayanagar?",
    author: "Ananya Iyer",
    createdAt: "10 Oct 2026",
    lastActivity: "52 min ago",
    replies: 28,
    excerpt:
      "Broker insists ten months is standard for the whole area. Two friends nearby paid five and six. What's the real range?",
  },
  {
    id: "t-rwa-meeting",
    categorySlug: "general",
    title: "Sunday RWA meeting notes — pipeline, lights, Deepavali cleanup",
    author: "Arvind Rao",
    createdAt: "11 Oct 2026",
    lastActivity: "1 hr ago",
    replies: 14,
    pinned: true,
    label: "Notes",
    excerpt:
      "Forty-two households attended. Decisions on the joint letter to BWSSB, the dark-lane list, and the festival waste drive.",
  },
  {
    id: "t-sterilisation-van",
    categorySlug: "general",
    title: "When did the sterilisation van last visit your block?",
    author: "Lakshmi Venkat",
    createdAt: "7 Oct 2026",
    lastActivity: "4 hrs ago",
    replies: 19,
    excerpt:
      "Trying to build a block-wise record since the municipality publishes no schedule. 4th Block: July. What about yours?",
  },
  {
    id: "t-rain-basement",
    categorySlug: "rentals-housing",
    title: "Basement flooding in rentals — who pays for the damage?",
    author: "Vikram Hegde",
    createdAt: "1 Oct 2026",
    lastActivity: "Yesterday",
    replies: 23,
    locked: true,
    lockReason: "Locked once the agreement copy was shared.",
    label: "Locked",
    excerpt:
      "Landlord says monsoon is an act of god, tenant says the drain was clogged before the lease. Locked after the agreement copy was shared.",
  },
];

export const replies: Reply[] = [
  {
    id: "r-1",
    threadId: "t-pipeline-watch",
    author: "Meera Krishnan",
    postedAt: "9 Oct 2026, 8:20 am",
    body: "Starting this log so updates stay in one place. The trench is roughly fifteen feet long outside nos. 44–47, and the exposed joint has been seeping since the weekend. Photos are attached to the complaint (LX-2481).",
  },
  {
    id: "r-2",
    threadId: "t-pipeline-watch",
    author: "Raghav Menon",
    postedAt: "9 Oct 2026, 10:02 am",
    body: "Walked past this morning — the fallen barricade is now fully inside the pit, so from the pavement it looks like flat ground. I've put two traffic cones from my car there as a stopgap, but they won't survive the wind.",
  },
  {
    id: "r-3",
    threadId: "t-pipeline-watch",
    author: "Arvind Rao",
    postedAt: "9 Oct 2026, 1:44 pm",
    body: "Pinned. Meera, please keep every dated update in this thread — dated entries are what make a follow-up letter credible. I've linked the complaint reference in the title.",
  },
  {
    id: "r-4",
    threadId: "t-pipeline-watch",
    author: "Farhan Sheikh",
    postedAt: "10 Oct 2026, 9:15 am",
    body: "The BWSSB junior engineer came by at 8:30 with one helper, took photos, and said a repair gang would be assigned 'within the week'. No written acknowledgement. Meera, ask for the job card number if they return — without it there's nothing to quote.",
    quote: {
      author: "Meera Krishnan",
      body: "The trench is roughly fifteen feet long outside nos. 44–47…",
    },
  },
  {
    id: "r-5",
    threadId: "t-pipeline-watch",
    author: "Meera Krishnan",
    postedAt: "12 Oct 2026, 7:58 am",
    mine: true,
    body: "Update: no gang yet. The seep has widened and water now runs along the kerb to the storm drain. Called the section office again this morning and quoted the complaint reference — they said the job card is 'in process'. Logging it here with today's date.",
  },
  {
    id: "r-6",
    threadId: "t-pipeline-watch",
    author: "Lakshmi Venkat",
    postedAt: "12 Oct 2026, 12:30 pm",
    body: "Our block went through this in June. What finally moved it was forty signatures on one letter hand-delivered to the AEE's office, with the complaint reference on top. Happy to share the format we used.",
  },
  {
    id: "r-7",
    threadId: "t-deposit-norms",
    author: "Vikram Hegde",
    postedAt: "10 Oct 2026, 2:11 pm",
    body: "Five to six months is the honest range for Jayanagar right now. Ten months is a broker inflating it — ask the owner directly, and get whatever you agree written into the agreement before you pay a rupee.",
  },
  {
    id: "r-8",
    threadId: "t-deposit-norms",
    author: "Ananya Iyer",
    postedAt: "10 Oct 2026, 5:47 pm",
    mine: true,
    body: "Thank you — this confirms what I suspected. The owner agreed to six when I spoke to her directly this evening. Leaving this up in case another newcomer searches for it.",
  },
];
