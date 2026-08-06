export const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#demo", label: "Demo" },
  { href: "#stories", label: "Stories" },
] as const;

export const SOCIAL_PROOF = [
  "Health logs that stick",
  "Preventive care reminders",
  "AI wellness summaries",
  "Neighbourhood discovery",
  "Vet-ready timelines",
  "Lifestyle insights",
] as const;

export const PROBLEM_POINTS = [
  {
    icon: "event_busy" as const,
    title: "Missed vaccines",
    body: "Paper cards and scattered texts make it easy to lose track of what is due next.",
  },
  {
    icon: "monitoring" as const,
    title: "Scattered notes",
    body: "Weight, appetite, and mood live in different apps — or nowhere at all.",
  },
  {
    icon: "help" as const,
    title: "Guesswork between visits",
    body: "Without a clear timeline, every small change feels urgent and confusing.",
  },
] as const;

export const FEATURES = [
  {
    icon: "monitor_heart" as const,
    title: "Daily health logs",
    body: "Capture weight, symptoms, energy, and appetite in seconds — then spot trends before they escalate.",
  },
  {
    icon: "vaccines" as const,
    title: "Preventive care",
    body: "Vaccines, deworming, and checkups stay visible with smart reminders that keep your calendar honest.",
  },
  {
    icon: "auto_awesome" as const,
    title: "AI wellness summaries",
    body: "Turn months of notes into a clear report you can share with your vet in one tap.",
  },
  {
    icon: "insights" as const,
    title: "Analytics that matter",
    body: "See weight curves, logging consistency, and lifestyle patterns without spreadsheet chaos.",
  },
  {
    icon: "diversity_1" as const,
    title: "Pet neighbourhood",
    body: "Discover nearby pets, build friendships, and make walks feel a little more connected.",
  },
  {
    icon: "calendar_month" as const,
    title: "Calendar sync",
    body: "Push care events into Google Calendar so the whole household stays aligned.",
  },
] as const;

export const STEPS = [
  {
    step: "01",
    icon: "pets" as const,
    title: "Add your pet",
    body: "Species, breed, birth date, and a photo — your profile becomes the home for every care moment.",
  },
  {
    step: "02",
    icon: "edit_note" as const,
    title: "Log what matters",
    body: "Quick health entries and preventive tasks build a living timeline without the admin overwhelm.",
  },
  {
    step: "03",
    icon: "wand_stars" as const,
    title: "Get clarity",
    body: "AI summaries and charts turn messy history into decisions you can trust.",
  },
] as const;

export const HIGHLIGHTS = [
  {
    icon: "health_and_safety" as const,
    title: "One timeline",
    body: "Every vaccine, walk note, and symptom lives in one calm stream.",
  },
  {
    icon: "stethoscope" as const,
    title: "Vet-ready",
    body: "Export context that helps appointments start informed — not from memory.",
  },
  {
    icon: "cruelty_free" as const,
    title: "Built for love",
    body: "Designed for multi-pet homes who want care to feel gentle, not clinical.",
  },
] as const;

export const TESTIMONIALS = [
  {
    quote:
      "I finally stopped guessing. Pet Health turned our chaotic notes into a timeline my vet actually thanked me for.",
    name: "Maya R.",
    role: "Golden retriever parent",
    icon: "sentiment_satisfied" as const,
  },
  {
    quote:
      "The AI summary saved our last emergency visit. We walked in with clarity instead of panic.",
    name: "Jordan K.",
    role: "Two-cat household",
    icon: "thumb_up" as const,
  },
  {
    quote:
      "Reminders, maps, and health logs in one place — it feels like a modern co-pilot for pet parenting.",
    name: "Elena V.",
    role: "Rescue dog advocate",
    icon: "star" as const,
  },
] as const;

export const STATS = [
  { value: "12k+", label: "Health logs captured" },
  { value: "98%", label: "Owners feel more prepared" },
  { value: "3×", label: "Faster visit prep" },
] as const;
