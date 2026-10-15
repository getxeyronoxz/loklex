"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  EyeOff,
  ImagePlus,
  Megaphone,
  MessagesSquare,
  ShieldAlert,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "@/components/app-state";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";

/* Draft carried over from the workspace quick-report box. */
function readDraft(): { title: string; description: string } {
  try {
    const raw = sessionStorage.getItem("lx-draft");
    sessionStorage.removeItem("lx-draft");
    if (!raw) return { title: "", description: "" };
    const parsed = JSON.parse(raw);
    return {
      title: typeof parsed.title === "string" ? parsed.title : "",
      description:
        typeof parsed.description === "string" ? parsed.description : "",
    };
  } catch {
    return { title: "", description: "" };
  }
}
import {
  Field,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/ui/fields";
import { forumCategories } from "@/lib/data/forums";
import {
  complaintCategories,
  complaintStatuses,
} from "@/lib/types";
import type {
  Complaint,
  ComplaintCategory,
  Thread,
} from "@/lib/types";

type Intent = "awareness" | "ask" | "private";
type NameChoice = "name" | "pseudonym" | "hidden";

const stepNames = ["Intent", "Details", "Audience", "Privacy", "Review"];

const intents: {
  key: Intent;
  icon: typeof Megaphone;
  title: string;
  body: string;
}[] = [
  {
    key: "awareness",
    icon: Megaphone,
    title: "Raise awareness",
    body: "A public complaint the community can see, support and follow up on.",
  },
  {
    key: "ask",
    icon: MessagesSquare,
    title: "Ask the community",
    body: "A forum discussion asking neighbours for advice or experiences.",
  },
  {
    key: "private",
    icon: EyeOff,
    title: "Report privately",
    body: "Seen only by moderators. For sensitive matters you'd rather not post publicly.",
  },
];

function StepDots({ step }: { step: number }) {
  return (
    <ol aria-label="Filing progress" className="flex items-center gap-2">
      {stepNames.map((name, i) => (
        <li key={name} className="flex items-center gap-2">
          <span
            aria-current={i === step ? "step" : undefined}
            aria-label={`${name}${i === step ? " (current step)" : ""}`}
            title={name}
            className={`h-2 rounded-full transition-all duration-150 ${
              i < step
                ? "w-6 bg-gold-deep"
                : i === step
                  ? "w-8 bg-gold"
                  : "w-2 bg-navy-700"
            }`}
          />
        </li>
      ))}
      <span className="tnum ml-2 text-xs text-ink-3">
        Step {step + 1} of 5 · {stepNames[step]}
      </span>
    </ol>
  );
}

export default function NewComplaintPage() {
  const router = useRouter();
  const { account, accountKey, fileComplaint, startThread } = useApp();
  const guest = accountKey === "anonymous";

  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  /* Pick up a draft carried over from the workspace quick-report box. */
  useEffect(() => {
    const d = readDraft();
    if (d.title) setTitle(d.title);
    if (d.description) setDescription(d.description);
  }, []);
  const [files, setFiles] = useState<string[]>([]);
  const [category, setCategory] = useState<ComplaintCategory | "">("");
  const [forum, setForum] = useState(forumCategories[0].slug);
  const [extraForums, setExtraForums] = useState<string[]>([]);
  const [audience, setAudience] = useState<"forum" | "forums" | "all" | "">("");
  const [nameChoice, setNameChoice] = useState<NameChoice>(
    guest ? "hidden" : "name",
  );
  const [pseudonym, setPseudonym] = useState("");
  const [visibility, setVisibility] = useState<"public" | "moderators">(
    "public",
  );
  const [confirmAll, setConfirmAll] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState<Complaint | Thread | null>(null);

  const isAsk = intent === "ask";
  const isPrivate = intent === "private";

  const validate = (s: number): string[] => {
    if (s === 0) return intent ? [] : ["Choose what you'd like to happen."];
    if (s === 1) {
      const e: string[] = [];
      if (title.trim().length < 8)
        e.push("Give it a clear title of at least 8 characters.");
      if (description.trim().length < 30)
        e.push("Describe what happened in at least 30 characters — detail is what makes a filing actionable.");
      return e;
    }
    if (s === 2) {
      if (isAsk) return forum ? [] : ["Choose a forum for your discussion."];
      if (isPrivate)
        return category ? [] : ["Choose the category that fits best."];
      const e: string[] = [];
      if (!category) e.push("Choose the category that fits best.");
      if (!audience) e.push("Choose who should see this complaint.");
      if (audience === "forums" && extraForums.length === 0)
        e.push("Pick at least one additional forum, or choose a single forum instead.");
      return e;
    }
    if (s === 3) {
      if (nameChoice === "pseudonym" && pseudonym.trim().length < 2)
        return ["Enter the name you'd like shown, or pick another option."];
      return [];
    }
    if (s === 4) {
      if (audience === "all" && !confirmAll)
        return [
          "Publishing to every forum is a wide audience — tick the confirmation to proceed.",
        ];
      return [];
    }
    return [];
  };

  const next = () => {
    const e = validate(step);
    setErrors(e);
    if (e.length === 0) setStep((s) => Math.min(4, s + 1));
  };

  const submit = () => {
    const e = validate(4);
    setErrors(e);
    if (e.length > 0) return;
    if (isAsk) {
      const thread = startThread(forum, title.trim(), description.trim());
      setDone(thread);
      return;
    }
    const anonymous = nameChoice !== "name";
    const complaint = fileComplaint({
      title: title.trim(),
      description: description.trim(),
      category: category as ComplaintCategory,
      visibility: isPrivate ? "moderators" : visibility,
      audience: isPrivate ? "forum" : (audience as Complaint["audience"]),
      audienceDetail: isPrivate
        ? "Moderators only"
        : audience === "all"
          ? "All forums"
          : [
              forumCategories.find((f) => f.slug === forum)?.name,
              ...extraForums.map(
                (s) => forumCategories.find((f) => f.slug === s)?.name,
              ),
            ]
            .filter(Boolean)
            .join(" · "),
      anonymous,
      pseudonym:
        nameChoice === "pseudonym" ? pseudonym.trim() : undefined,
      attachments: files.length,
    });
    setDone(complaint);
  };

  /* ------------------------------ Confirmation ----------------------------- */
  if (done) {
    const isThread = "categorySlug" in done;
    return (
      <div className="mx-auto max-w-2xl">
        <Panel className="px-6 py-10 text-center sm:px-10">
          <CheckCircle2
            className="mx-auto h-10 w-10 text-success"
            strokeWidth={1.5}
            aria-hidden
          />
          <h1 className="mt-4 font-display text-3xl font-light text-ink">
            {isThread ? "Discussion posted" : "Complaint filed"}
          </h1>
          {!isThread && (
            <p className="tnum mt-2 font-mono text-sm tracking-[0.14em] text-gold">
              {(done as Complaint).ref}
            </p>
          )}
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-2">
            {isThread ? (
              <>
                Your discussion is live in the forum. Neighbours can reply
                from here on.
              </>
            ) : (done as Complaint).visibility === "moderators" ? (
              <>
                Received privately — only moderators can see it. A moderator
                will acknowledge it; nothing here is published publicly.
              </>
            ) : (
              <>
                Filed with the status{" "}
                <strong className="font-semibold text-ink">
                  {complaintStatuses.submitted.label}
                </strong>
                . It becomes visible to its audience now; moderators confirm
                it is complete before it moves further.
              </>
            )}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button
              onClick={() =>
                router.push(
                  isThread
                    ? `/forums/${(done as Thread).categorySlug}/${done.id}`
                    : `/complaints/${done.id}`,
                )
              }
            >
              {isThread ? "View discussion" : "View complaint"}
            </Button>
            <Link href={isThread ? "/forums" : "/complaints"}>
              <Button variant="subtle">
                Back to {isThread ? "forums" : "complaints"}
              </Button>
            </Link>
          </div>
        </Panel>
      </div>
    );
  }

  const toggleExtra = (slug: string) =>
    setExtraForums((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Panel>
        <div className="border-b border-navy-700 px-5 pb-4 pt-5 sm:px-6">
          <p className="eyebrow text-gold">New filing</p>
          <h1 className="mt-1 font-display text-[26px] font-light text-ink">
            {step === 0
              ? "What would you like to happen?"
              : step === 1
                ? isAsk
                  ? "Describe your question"
                  : "Describe the problem"
                : step === 2
                  ? isAsk
                    ? "Where should it be discussed?"
                    : isPrivate
                      ? "What kind of matter is it?"
                      : "Who should see it?"
                  : step === 3
                    ? "How should your name appear?"
                    : "Check before filing"}
          </h1>
          <div className="mt-3">
            <StepDots step={step} />
          </div>
        </div>

        <div key={step} className="lx-slide-in space-y-5 px-5 py-6 sm:px-6">
          {errors.length > 0 && (
            <div
              role="alert"
              className="rounded-lg border border-danger/40 bg-danger/[0.07] px-4 py-3"
            >
              <ul className="list-disc space-y-1 pl-5 text-[13px] text-ink">
                {errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Step 0 — intent */}
          {step === 0 && (
            <div role="radiogroup" aria-label="What would you like to happen" className="space-y-3">
              {intents.map(({ key, icon: Icon, title: t, body }) => {
                const active = intent === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setIntent(key);
                      setErrors([]);
                    }}
                    className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors duration-150 ${
                      active
                        ? "border-gold-deep bg-gold-wash"
                        : "border-navy-700 bg-navy-950 hover:border-navy-600"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        active ? "bg-gold/20" : "bg-navy-800"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${active ? "text-gold-hi" : "text-ink-2"}`}
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </span>
                    <span>
                      <span className="block text-[15px] font-semibold text-ink">
                        {t}
                      </span>
                      <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-2">
                        {body}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 1 — details */}
          {step === 1 && (
            <>
              <Field
                label={isAsk ? "Question in one line" : "Title"}
                htmlFor="f-title"
                hint={
                  isAsk
                    ? "The clearer the question, the better the answers."
                    : "Name the problem plainly — a street, a place, what's wrong."
                }
              >
                <TextInput
                  id="f-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    isAsk
                      ? "e.g. How do I get a leaking overhead tank fixed in a rental?"
                      : "e.g. Streetlights out on 5th Cross since last week"
                  }
                  maxLength={140}
                />
              </Field>
              <Field
                label={isAsk ? "Background" : "What happened?"}
                htmlFor="f-desc"
                hint="Dates, places and what you've already tried. Leave out phone numbers, exact home addresses, ID numbers, and the names of private individuals."
              >
                <TextArea
                  id="f-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What happened, where, since when — and what would fix it."
                />
              </Field>
              {!isAsk && (
                <Field
                  label="Photos (optional)"
                  hint="Files stay on this device in this version."
                >
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-navy-700 px-4 py-2.5 text-sm font-medium text-ink-2 hover:border-navy-600 hover:text-ink">
                    <ImagePlus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    Choose images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={(e) => {
                        const names = Array.from(e.target.files ?? []).map(
                          (f) => f.name,
                        );
                        setFiles((prev) =>
                          [...prev, ...names].slice(0, 5),
                        );
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {files.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {files.map((name) => (
                        <li
                          key={name}
                          className="flex items-center justify-between gap-2 rounded-lg bg-navy-950 px-3 py-2 text-[13px] text-ink-2"
                        >
                          <span className="min-w-0 truncate">{name}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setFiles((prev) => prev.filter((f) => f !== name))
                            }
                            aria-label={`Remove ${name}`}
                            className="rounded p-1 text-ink-3 hover:text-danger"
                          >
                            <X className="h-4 w-4" aria-hidden />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </Field>
              )}
            </>
          )}

          {/* Step 2 — category / audience / forum */}
          {step === 2 && isAsk && (
            <Field
              label="Forum"
              htmlFor="f-forum"
              hint="Pick the forum whose members will know most about this."
            >
              <SelectInput
                id="f-forum"
                value={forum}
                onChange={(e) => setForum(e.target.value)}
              >
                {forumCategories.map((f) => (
                  <option key={f.slug} value={f.slug}>
                    {f.name}
                  </option>
                ))}
              </SelectInput>
            </Field>
          )}

          {step === 2 && !isAsk && (
            <>
              <div role="radiogroup" aria-label="Category" className="space-y-2">
                <span className="block text-[13px] font-semibold text-ink">
                  Category
                </span>
                {(
                  Object.entries(complaintCategories) as [
                    ComplaintCategory,
                    { label: string; hint: string },
                  ][]
                ).map(([key, v]) => {
                  const active = category === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        setCategory(key);
                        if (
                          (key === "harassment" || key === "safety") &&
                          !isPrivate
                        ) {
                          setVisibility("moderators");
                        }
                      }}
                      className={`flex w-full items-start justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors duration-150 ${
                        active
                          ? "border-gold-deep bg-gold-wash"
                          : "border-navy-700 hover:border-navy-600"
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-semibold text-ink">
                          {v.label}
                        </span>
                        <span className="block text-[13px] text-ink-3">
                          {v.hint}
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className={`mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${
                          active ? "border-gold bg-gold" : "border-navy-600"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {(category === "harassment" || category === "safety") &&
                !isPrivate && (
                  <p className="flex gap-2 rounded-lg border border-warn/40 bg-warn/[0.07] px-4 py-3 text-[13px] leading-relaxed text-ink-2">
                    <ShieldAlert
                      className="mt-0.5 h-4 w-4 shrink-0 text-warn"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    Sensitive matters are usually better as a private report —
                    only moderators see them, and nothing is published
                    automatically. We've switched the visibility below; change
                    it back only if you're sure.
                  </p>
                )}

              {!isPrivate && (
                <>
                  <div>
                    <span className="block text-[13px] font-semibold text-ink">
                      Audience
                    </span>
                    <div className="mt-1.5">
                      <Field label="" htmlFor="f-forum">
                        <SelectInput
                          id="f-forum"
                          value={forum}
                          onChange={(e) => setForum(e.target.value)}
                        >
                          {forumCategories.map((f) => (
                            <option key={f.slug} value={f.slug}>
                              {f.name}
                            </option>
                          ))}
                        </SelectInput>
                      </Field>
                    </div>
                    <div
                      role="radiogroup"
                      aria-label="How widely to publish"
                      className="mt-2 grid gap-2 sm:grid-cols-3"
                    >
                      {(
                        [
                          ["forum", "This forum", "Just the forum above"],
                          ["forums", "A few forums", "Pick more below"],
                          ["all", "All forums", "Needs confirmation"],
                        ] as const
                      ).map(([key, t, hint]) => {
                        const active = audience === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setAudience(key)}
                            className={`rounded-lg border px-3 py-2.5 text-left transition-colors duration-150 ${
                              active
                                ? "border-gold-deep bg-gold-wash"
                                : "border-navy-700 hover:border-navy-600"
                            }`}
                          >
                            <span className="block text-[13px] font-semibold text-ink">
                              {t}
                            </span>
                            <span className="block text-xs text-ink-3">
                              {hint}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {audience === "forums" && (
                    <fieldset>
                      <legend className="text-[13px] font-semibold text-ink">
                        Additional forums
                      </legend>
                      <div className="mt-1.5 space-y-1.5">
                        {forumCategories
                          .filter((f) => f.slug !== forum)
                          .map((f) => {
                            const checked = extraForums.includes(f.slug);
                            return (
                              <label
                                key={f.slug}
                                className="flex cursor-pointer items-center gap-3 rounded-lg border border-navy-700 px-3 py-2.5 text-sm text-ink-2 hover:border-navy-600"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleExtra(f.slug)}
                                  className="h-4 w-4 accent-[#d8b96a]"
                                />
                                {f.name}
                              </label>
                            );
                          })}
                      </div>
                    </fieldset>
                  )}
                </>
              )}
            </>
          )}

          {/* Step 3 — privacy */}
          {step === 3 && (
            <>
              <div role="radiogroup" aria-label="Name display" className="space-y-2">
                <span className="block text-[13px] font-semibold text-ink">
                  Shown name
                </span>
                <button
                  type="button"
                  role="radio"
                  aria-checked={nameChoice === "name"}
                  disabled={guest}
                  onClick={() => setNameChoice("name")}
                  className="flex w-full items-center gap-3 rounded-lg border border-navy-700 px-4 py-3 text-left disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:border-navy-600 aria-checked:border-gold-deep aria-checked:bg-gold-wash"
                >
                  <Avatar initials={account.initials} size="sm" />
                  <span>
                    <span className="block text-sm font-semibold text-ink">
                      {guest ? "Your name (sign-in required)" : account.displayName}
                    </span>
                    <span className="block text-xs text-ink-3">
                      {guest
                        ? "You're browsing as a guest — use a pseudonym or stay hidden."
                        : "Posted publicly next to your filing."}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={nameChoice === "pseudonym"}
                  onClick={() => setNameChoice("pseudonym")}
                  className="w-full rounded-lg border border-navy-700 px-4 py-3 text-left hover:border-navy-600 aria-checked:border-gold-deep aria-checked:bg-gold-wash"
                >
                  <span className="block text-sm font-semibold text-ink">
                    A pseudonym
                  </span>
                  <span className="block text-xs text-ink-3">
                    e.g. “4th Block resident” — shown instead of your name.
                  </span>
                </button>
                {nameChoice === "pseudonym" && (
                  <div className="pl-1">
                    <Field label="Pseudonym" htmlFor="f-pseudo">
                      <TextInput
                        id="f-pseudo"
                        value={pseudonym}
                        onChange={(e) => setPseudonym(e.target.value)}
                        placeholder="4th Block resident"
                        maxLength={40}
                      />
                    </Field>
                  </div>
                )}
                <button
                  type="button"
                  role="radio"
                  aria-checked={nameChoice === "hidden"}
                  onClick={() => setNameChoice("hidden")}
                  className="w-full rounded-lg border border-navy-700 px-4 py-3 text-left hover:border-navy-600 aria-checked:border-gold-deep aria-checked:bg-gold-wash"
                >
                  <span className="block text-sm font-semibold text-ink">
                    Hide my name
                  </span>
                  <span className="block text-xs text-ink-3">
                    Shown as “Anonymous” on the public page.
                  </span>
                </button>
              </div>
              <p className="rounded-lg bg-navy-950 px-4 py-3 text-[13px] leading-relaxed text-ink-2">
                Hiding your name keeps it off the public page, but it is not
                guaranteed technical anonymity. Moderators can still see who
                filed, so they can follow up.
              </p>
              {!isAsk && !isPrivate && (
                <div role="radiogroup" aria-label="Visibility" className="grid gap-2 sm:grid-cols-2">
                  {(
                    [
                      [
                        "public",
                        "Community-visible",
                        "Published to the audience you chose.",
                      ],
                      [
                        "moderators",
                        "Private to moderators",
                        "Never published; reviewed quietly.",
                      ],
                    ] as const
                  ).map(([key, t, hint]) => {
                    const active = visibility === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setVisibility(key)}
                        className={`rounded-lg border px-4 py-3 text-left transition-colors duration-150 ${
                          active
                            ? "border-gold-deep bg-gold-wash"
                            : "border-navy-700 hover:border-navy-600"
                        }`}
                      >
                        <span className="block text-sm font-semibold text-ink">
                          {t}
                        </span>
                        <span className="block text-xs text-ink-3">{hint}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {isPrivate && (
                <p className="rounded-lg border border-navy-700 bg-navy-950 px-4 py-3 text-[13px] leading-relaxed text-ink-2">
                  This report goes only to moderators. Sensitive details are
                  never published automatically, and anything identifying
                  another person stays restricted to the review.
                </p>
              )}
            </>
          )}

          {/* Step 4 — review */}
          {step === 4 && (
            <dl className="divide-y divide-navy-700 rounded-xl border border-navy-700">
              {(
                [
                  ["What", isAsk ? "Ask the community" : isPrivate ? "Private report" : "Raise awareness"],
                  ["Title", title.trim()],
                  ["Details", `${description.trim().slice(0, 160)}${description.trim().length > 160 ? "…" : ""}`],
                  ...(isAsk
                    ? [["Forum", forumCategories.find((f) => f.slug === forum)?.name ?? forum]]
                    : [
                        ["Category", category ? complaintCategories[category as ComplaintCategory].label : "—"],
                        ...(isPrivate
                          ? [["Audience", "Moderators only"]]
                          : [
                              ["Audience", audience === "all" ? "All forums" : audience === "forums" ? `Selected forums (${[forum, ...extraForums].length})` : (forumCategories.find((f) => f.slug === forum)?.name ?? forum)],
                              ["Visibility", visibility === "public" ? "Community-visible" : "Private to moderators"],
                            ]),
                      ]),
                  ["Shown as", nameChoice === "name" ? (guest ? "Hidden (guest)" : account.displayName) : nameChoice === "pseudonym" ? `“${pseudonym.trim()}”` : "Anonymous"],
                  ...(!isAsk && files.length > 0 ? [["Photos", `${files.length} attached`] ] : []),
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k} className="grid grid-cols-[110px_1fr] gap-3 px-4 py-3 text-sm">
                  <dt className="text-ink-3">{k}</dt>
                  <dd className="min-w-0 break-words text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {step === 4 && audience === "all" && !isAsk && (
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-warn/40 bg-warn/[0.07] px-4 py-3 text-[13px] leading-relaxed text-ink">
              <input
                type="checkbox"
                checked={confirmAll}
                onChange={(e) => setConfirmAll(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#d8b96a]"
              />
              I understand this publishes to every forum on Loklex, and I want
              that wide audience.
            </label>
          )}

          {/* Nav */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (step === 0 ? router.back() : setStep((s) => s - 1))}
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
              {step === 0 ? "Cancel" : "Back"}
            </Button>
            {step < 4 ? (
              <Button size="sm" onClick={next}>
                Continue
                <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
              </Button>
            ) : (
              <Button size="sm" onClick={submit}>
                {isAsk ? "Post discussion" : isPrivate ? "Send private report" : "File complaint"}
              </Button>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}
