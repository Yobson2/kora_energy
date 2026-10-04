"use client";

import { useEffect, useRef, useState } from "react";
import type { StaticImageData } from "next/image";
import { Pause, Play } from "lucide-react";

/**
 * A silent, looping film behind text.
 *
 *  - Decorative: hidden from assistive tech; the surrounding text carries
 *    the meaning.
 *  - WCAG 2.2.2: motion lasting more than five seconds gets a pause control.
 *  - prefers-reduced-motion: never starts on its own; the poster stays.
 *  - Plays only while on screen, so it costs nothing when scrolled past.
 *  - preload="none" until it is near the viewport: the 1.4 MB file is never
 *    fetched by a visitor who doesn't scroll that far.
 */
export function AmbientFilm({
  src,
  poster,
  className,
}: {
  src: string;
  poster: StaticImageData;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced || userPaused) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          video.preload = "auto";
          // Autoplay can still be refused (data saver, power saving); the
          // poster and the play button remain, which is a fine outcome.
          video.play().catch(() => setPlaying(false));
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduced, userPaused]);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      setUserPaused(false);
      video.play().catch(() => setPlaying(false));
    } else {
      setUserPaused(true);
      video.pause();
    }
  }

  return (
    <>
      <video
        ref={videoRef}
        aria-hidden
        muted
        loop
        playsInline
        preload="none"
        poster={poster.src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className={className}
      >
        <source src={src} type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={toggle}
        className="bg-ink/70 text-paper hover:bg-ink absolute right-4 bottom-4 z-10 flex size-10 items-center justify-center rounded-full backdrop-blur-sm"
      >
        {playing ? (
          <Pause className="size-4" aria-hidden />
        ) : (
          <Play className="size-4" aria-hidden />
        )}
        <span className="sr-only">
          {playing ? "Pause background film" : "Play background film"}
        </span>
      </button>
    </>
  );
}
