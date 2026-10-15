import { BookOpen } from "lucide-react";
import { Panel, PanelHeader } from "@/components/ui/Panel";

const rules = [
  {
    title: "Talk about problems, not people",
    body: "Criticise situations, services and decisions — not your neighbours. No personal attacks, slurs, or harassment of any member.",
  },
  {
    title: "No personal details in public",
    body: "Don't post phone numbers, exact home addresses, identity documents, or anything that identifies a private individual. Reports that need such detail should go privately to moderators.",
  },
  {
    title: "Say what you know, mark what you don't",
    body: "First-hand experience is gold. Rumours, forwarded messages and guesses should be labelled as such — or left out.",
  },
  {
    title: "One concern, one filing",
    body: "Check whether your issue is already filed before starting a duplicate. Add new information to the existing thread instead.",
  },
  {
    title: "Sensitive matters go private first",
    body: "Harassment, abuse, and anything involving safety risks should be reported privately to moderators rather than posted publicly. Nothing sensitive is published automatically.",
  },
  {
    title: "Respect a locked thread",
    body: "Locked discussions are closed for a reason. Start a new thread if there's genuinely more to add.",
  },
  {
    title: "No spam, scams or ads",
    body: "Commercial promotion, fundraising links and repeated off-topic posting will be removed.",
  },
];

const process = [
  {
    title: "Report",
    body: "Use the report control on any complaint, discussion, reply or message. Say briefly what's wrong.",
  },
  {
    title: "Review",
    body: "Moderators read the report against these rules. Private reports stay restricted to the review — they are never published.",
  },
  {
    title: "Outcome",
    body: "The people involved are told what was decided and why. Nothing is claimed as investigated or resolved until it is.",
  },
];

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="sr-only">Community rules</h1>
      <Panel>
        <PanelHeader eyebrow="Community" title="Rules of the square" />
        <ol className="space-y-1 px-5 py-4 sm:px-6">
          {rules.map((r, i) => (
            <li key={r.title} className="flex gap-4 py-3">
              <span
                aria-hidden
                className="tnum font-display text-xl font-light text-gold/80"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="text-[15px] font-semibold text-ink">{r.title}</h2>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-2">
                  {r.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Panel>
      <Panel>
        <PanelHeader eyebrow="Moderation" title="How reporting works" />
        <ol className="space-y-4 px-5 py-5 sm:px-6">
          {process.map((p, i) => (
            <li key={p.title} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold-deep/60 bg-gold-wash">
                <BookOpen className="h-3.5 w-3.5 text-gold-hi" aria-hidden />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  {i + 1}. {p.title}
                </h2>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-2">
                  {p.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}
