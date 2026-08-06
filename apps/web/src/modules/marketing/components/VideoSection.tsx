import { useEffect, useRef, useState } from "react";
import { Maximize2, Play, Volume2, VolumeX } from "lucide-react";

import { Icon } from "@repo/ui";

import { useReveal } from "../hooks/useReveal";

const PROMO_SRC = "/landing/brag.mp4";
const PROMO_POSTER = "/landing/brag-poster.jpg";

export function VideoSection() {
  const { ref, className } = useReveal<HTMLElement>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      setPlaying(true);
      setStarted(true);
    };
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  const play = () => {
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => {
      /* autoplay policies — user can retry via the center play button */
    });
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) play();
    else video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const enterFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) void video.requestFullscreen();
    else if ("webkitEnterFullscreen" in video) {
      (video as HTMLVideoElement & { webkitEnterFullscreen: () => void }).webkitEnterFullscreen();
    }
  };

  const showPlayOverlay = !started || !playing;

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
            See Pet Health in action
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--landing-muted)] sm:text-lg">
            A short product film — from first log to AI clarity — so you know exactly what you&apos;re signing up for.
          </p>
        </div>

        <div className="landing-video-shell landing-video-promo mx-auto mt-12 max-w-4xl">
          <div className="landing-video-chrome" aria-hidden="true">
            <span />
            <span />
            <span />
            <p>Pet Health — Product tour</p>
          </div>

          <div className="relative aspect-video overflow-hidden bg-black">
            <video
              ref={videoRef}
              className="h-full w-full cursor-pointer object-contain bg-black"
              poster={PROMO_POSTER}
              playsInline
              preload="metadata"
              controls={false}
              aria-label="Pet Health promotional product video"
              onClick={togglePlay}
            >
              <source src={PROMO_SRC} type="video/mp4" />
              Your browser does not support embedded video.
            </video>

            {showPlayOverlay ? (
              <button
                type="button"
                className={`landing-play cursor-pointer ${started ? "landing-play--resume" : ""}`}
                onClick={togglePlay}
                aria-label={started ? "Resume promotional video" : "Play promotional video"}
              >
                <span className="landing-play__btn">
                  <Play className="ml-1 h-7 w-7 fill-current" aria-hidden />
                </span>
                {!started ? (
                  <span className="landing-play__label">
                    Watch the product film
                    <span className="opacity-80"> · ~20s</span>
                  </span>
                ) : null}
              </button>
            ) : null}

            {started ? (
              <div className="landing-video-controls landing-video-controls--minimal">
                <button
                  type="button"
                  className="landing-video-controls__btn cursor-pointer"
                  aria-label={muted ? "Unmute video" : "Mute video"}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                >
                  {muted ? (
                    <VolumeX className="h-4 w-4" aria-hidden />
                  ) : (
                    <Volume2 className="h-4 w-4" aria-hidden />
                  )}
                </button>

                <button
                  type="button"
                  className="landing-video-controls__btn cursor-pointer"
                  aria-label="Enter fullscreen"
                  onClick={(e) => {
                    e.stopPropagation();
                    enterFullscreen();
                  }}
                >
                  <Maximize2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
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
