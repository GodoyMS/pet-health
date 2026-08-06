import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { Maximize2, Pause, Play, Volume2, VolumeX } from "lucide-react";

import { Icon } from "@repo/ui";

import { useReveal } from "../hooks/useReveal";

const PROMO_SRC = "/landing/brag.mp4";
const PROMO_POSTER = "/landing/brag-poster.jpg";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoSection() {
  const { ref, className } = useReveal<HTMLElement>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTime = () => {
      setCurrent(video.currentTime);
      setProgress(video.duration ? (video.currentTime / video.duration) * 100 : 0);
    };
    const onMeta = () => setDuration(video.duration || 0);
    const onPlay = () => {
      setPlaying(true);
      setStarted(true);
    };
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      setProgress(100);
    };

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  const play = () => {
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => {
      /* autoplay policies — user can retry via controls */
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

  const seek = (ratio: number) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    video.currentTime = Math.min(1, Math.max(0, ratio)) * video.duration;
  };

  const onSeekBar = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(ratio);
  };

  const enterFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) void video.requestFullscreen();
    else if ("webkitEnterFullscreen" in video) {
      (video as HTMLVideoElement & { webkitEnterFullscreen: () => void }).webkitEnterFullscreen();
    }
  };

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

            {!started ? (
              <button
                type="button"
                className="landing-play cursor-pointer"
                onClick={togglePlay}
                aria-label="Play promotional video"
              >
                <span className="landing-play__btn">
                  <Play className="ml-1 h-7 w-7 fill-current" aria-hidden />
                </span>
                <span className="landing-play__label">
                  Watch the product film
                  <span className="opacity-80"> · ~20s</span>
                </span>
              </button>
            ) : null}

            {started ? (
              <div className="landing-video-controls">
                <button
                  type="button"
                  className="landing-video-controls__btn cursor-pointer"
                  aria-label={playing ? "Pause video" : "Play video"}
                  onClick={togglePlay}
                >
                  {playing ? (
                    <Pause className="h-4 w-4 fill-current" aria-hidden />
                  ) : (
                    <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden />
                  )}
                </button>

                <div
                  className="landing-video-controls__seek cursor-pointer"
                  role="slider"
                  aria-label="Seek video"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress)}
                  tabIndex={0}
                  onClick={onSeekBar}
                  onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
                    if (e.key === "ArrowRight") seek((current + 2) / (duration || 1));
                    if (e.key === "ArrowLeft") seek((current - 2) / (duration || 1));
                  }}
                >
                  <div className="landing-video-controls__track">
                    <div
                      className="landing-video-controls__fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <span className="landing-video-controls__time tabular-nums">
                  {formatTime(current)} / {formatTime(duration)}
                </span>

                <button
                  type="button"
                  className="landing-video-controls__btn cursor-pointer"
                  aria-label={muted ? "Unmute video" : "Mute video"}
                  onClick={toggleMute}
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
                  onClick={enterFullscreen}
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
