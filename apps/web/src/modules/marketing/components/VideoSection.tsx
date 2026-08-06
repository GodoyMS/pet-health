import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

import { Icon } from "@repo/ui";

import { useReveal } from "../hooks/useReveal";

const SCENES = [
  {
    src: "/landing/hero-pets.jpg",
    alt: "Dog and cat together outdoors",
    title: "One home for every pet story",
    caption: "Profiles, timelines, and care notes — finally in one calm place.",
  },
  {
    src: "/landing/care-moment.jpg",
    alt: "Owner checking a dog during outdoor care",
    title: "Daily rituals that stick",
    caption: "Log weight, mood, and symptoms in seconds — patterns appear over weeks.",
  },
  {
    src: "/landing/clinic-care.jpg",
    alt: "Veterinarian examining a calm cat",
    title: "Walk in prepared",
    caption: "AI summaries turn scattered notes into clarity your vet can use.",
  },
  {
    src: "/landing/neighbourhood.jpg",
    alt: "Dogs playing in a sunny park",
    title: "Care meets community",
    caption: "Discover nearby pets and keep preventive care on schedule.",
  },
] as const;

const SCENE_MS = 4200;

export function VideoSection() {
  const { ref, className } = useReveal<HTMLElement>();
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    if (!playing) {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      progressRef.current = 1;
      return;
    }

    let start = performance.now() - progressRef.current * SCENE_MS;
    let cancelled = false;

    const tick = (now: number) => {
      if (cancelled) return;
      const p = Math.min(1, (now - start) / SCENE_MS);
      progressRef.current = p;
      setProgress(p);

      if (p >= 1) {
        setIndex((i) => (i + 1) % SCENES.length);
        start = now;
        progressRef.current = 0;
        setProgress(0);
      }
      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
    };
  }, [playing]);

  const scene = SCENES[index]!;
  const overall = ((index + progress) / SCENES.length) * 100;

  return (
    <section
      ref={ref}
      id="demo"
      className={`${className} scroll-mt-24 py-20 sm:py-24`}
      aria-labelledby="demo-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--landing-teal)]">
            Product tour
          </p>
          <h2
            id="demo-title"
            className="font-display mt-3 text-3xl font-bold tracking-tight text-[var(--landing-ink)] sm:text-4xl"
          >
            See the rhythm of healthier pet care
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--landing-muted)] sm:text-lg">
            A short look at how Pet Health turns everyday moments into a wellness story you can trust.
          </p>
        </div>

        <div className="landing-video-shell mx-auto mt-12 max-w-4xl">
          <div
            className="relative aspect-video overflow-hidden bg-black"
            role="region"
            aria-label="Pet Health promotional reel"
          >
            {SCENES.map((s, i) => (
              <img
                key={s.src}
                src={s.src}
                alt={s.alt}
                width={1600}
                height={900}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                  i === index ? "opacity-100" : "opacity-0"
                } ${playing && i === index ? "landing-kenburns" : ""}`}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            ))}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
              <p className="font-display text-xl font-semibold text-white sm:text-2xl">
                {scene.title}
              </p>
              <p className="mt-1 max-w-xl text-sm text-white/85 sm:text-base">{scene.caption}</p>

              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-[var(--landing-teal-deep)] shadow-lg transition-transform duration-200 hover:scale-105"
                  aria-label={playing ? "Pause promotional reel" : "Play promotional reel"}
                  onClick={() => setPlaying((v) => !v)}
                >
                  {playing ? (
                    <Pause className="h-5 w-5 fill-current" aria-hidden />
                  ) : (
                    <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden />
                  )}
                </button>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25" aria-hidden="true">
                  <div
                    className="h-full rounded-full bg-white transition-[width] duration-100 ease-linear"
                    style={{ width: `${overall}%` }}
                  />
                </div>
                <span className="text-xs tabular-nums text-white/80">
                  {index + 1}/{SCENES.length}
                </span>
              </div>
            </div>

            {!playing ? (
              <button
                type="button"
                className="landing-play cursor-pointer"
                onClick={() => setPlaying(true)}
                aria-label="Play promotional video"
              >
                <span className="landing-play__btn">
                  <Play className="ml-1 h-7 w-7 fill-current" aria-hidden />
                </span>
              </button>
            ) : null}
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-6 text-sm text-[var(--landing-muted)]">
          <span className="inline-flex items-center gap-2">
            <Icon name="bolt" variant="filled" className="text-lg text-[var(--landing-coral)]" />
            Under 60 seconds to first log
          </span>
          <span className="inline-flex items-center gap-2">
            <Icon name="lock" variant="filled" className="text-lg text-[var(--landing-teal)]" />
            Private by default
          </span>
          <span className="inline-flex items-center gap-2">
            <Icon name="travel_explore" variant="filled" className="text-lg text-[var(--landing-teal)]" />
            Works on phone &amp; desktop
          </span>
        </div>
      </div>
    </section>
  );
}
