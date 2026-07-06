"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./MusicPlayer.module.css";
import { songs, normalizeSrc } from "./songs.config";
import { playerOptions, playerStyleVars, scrollOverlayOptions } from "./options";
import { getSharedAudio } from "./audioBus";

interface MusicPlayerProps {
  /** Whether the hero (and therefore the player) is visible / unlocked.
   *  Used to auto-start playback on first reveal. */
  visible: boolean;
  /** Optional onTic / onTac sound effects fired on control hover/click. */
  onHoverSfx?: () => void;
  onClickSfx?: () => void;
}

const VOLUME = playerOptions.volume;

export default function MusicPlayer({
  visible,
  onHoverSfx,
  onClickSfx,
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const filter2Ref = useRef<BiquadFilterNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const muffleInitRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  /** Set to true when the cover <img> for the current track fails to
   *  load, so we can fall back to the placeholder disc instead of
   *  showing a broken image. Reset whenever the track changes. */
  const [coverFailed, setCoverFailed] = useState(false);
  /** Tracks whether we've already attempted the initial autoplay so
   *  switching tracks during playback doesn't trigger another autoplay
   *  attempt that would fight a user-paused state. */
  const autoStarted = useRef(false);

  const current = songs[index];

  /** Resolve the cover for the current track:
   *  song-specific cover → playerOptions.defaultCover → none. */
  const resolvedCover = current.cover?.trim()
    ? normalizeSrc(current.cover)
    : playerOptions.defaultCover.trim()
      ? normalizeSrc(playerOptions.defaultCover)
      : "";

  // Reset the cover-failed flag whenever the track (and therefore the
  // cover URL) changes — a previous broken cover shouldn't suppress the
  // next track's attempt.
  useEffect(() => {
    setCoverFailed(false);
  }, [resolvedCover]);

  /* --------------------- adopt the shared audio element ---------------- */
  // Bind to the app-wide singleton created (and unlocked) by ClientShell's
  // "click to continue" handler, then mirror its state into React. Because
  // the element already exists and is playing by the time we mount, the
  // first track keeps going without a second tap on any platform.
  useEffect(() => {
    const a = getSharedAudio();
    audioRef.current = a;
    a.volume = VOLUME;
    if (!a.src) a.src = normalizeSrc(songs[index].src);

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => next();
    const onTime = () => setCurrentTime(a.currentTime);
    const onMeta = () => setDuration(a.duration);

    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("durationchange", onMeta);

    // Sync UI with whatever state the element is already in.
    setIsPlaying(!a.paused);
    if (!a.paused) autoStarted.current = true;
    if (Number.isFinite(a.duration)) setDuration(a.duration);
    setCurrentTime(a.currentTime);

    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("durationchange", onMeta);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----------------------------- controls ------------------------------ */

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % songs.length);
  }, []);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + songs.length) % songs.length);
  }, []);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      a.pause();
      setIsPlaying(false);
    }
  }, []);

  /* ----------------------- track-change side effects ------------------- */

  // When the song index changes, swap the source. If the player was
  // already playing (or autoplay has fired), continue playback on the
  // new track.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const desired = normalizeSrc(current.src);
    const currentPath = a.src
      ? new URL(a.src, window.location.href).pathname
      : "";
    // On first mount the shared element already points at (and is playing)
    // the primed track — reloading it here would restart or stop it.
    if (currentPath === desired) return;

    const shouldKeepPlaying = isPlaying || autoStarted.current;
    a.src = desired;
    a.load();
    if (shouldKeepPlaying) {
      a.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // First reveal of the hero — try autoplay. If the browser blocks it
  // (common on a fresh reload where the only user gesture happened in a
  // previous tab/session), fall back to a one-shot global listener so
  // the *next* click / key / pointer event anywhere on the page kicks
  // the song off. The listener removes itself as soon as playback
  // begins.
  useEffect(() => {
    if (!visible) return;
    const a = audioRef.current;
    if (!a) return;
    a.volume = VOLUME;

    let cleaned = false;
    let removeFallback: (() => void) | null = null;

    const installFallback = () => {
      if (cleaned || removeFallback) return;

      const tryStart = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.play()
          .then(() => {
            autoStarted.current = true;
            setIsPlaying(true);
            removeFallback?.();
          })
          .catch(() => {
            // Still blocked (rare) — keep listening for the next gesture.
          });
      };

      // pointerdown covers mouse + touch + pen. keydown covers keyboard.
      // We keep `passive: true` so we never interfere with the user's
      // actual click target (menu buttons, links, etc.).
      const opts: AddEventListenerOptions = { passive: true, capture: true };
      window.addEventListener("pointerdown", tryStart, opts);
      window.addEventListener("keydown", tryStart, opts);
      window.addEventListener("touchstart", tryStart, opts);

      removeFallback = () => {
        window.removeEventListener("pointerdown", tryStart, opts);
        window.removeEventListener("keydown", tryStart, opts);
        window.removeEventListener("touchstart", tryStart, opts);
        removeFallback = null;
      };
    };

    // Initial attempt — if autoplay is allowed (e.g. user just clicked
    // "click to continue"), this resolves and we're done.
    a.play()
      .then(() => {
        autoStarted.current = true;
        setIsPlaying(true);
      })
      .catch(() => {
        // Autoplay blocked. Install the gesture fallback.
        installFallback();
      });

    return () => {
      cleaned = true;
      removeFallback?.();
    };
  }, [visible]);

  /* ----------------------- audio muffle via Web Audio ------------------- */
  useEffect(() => {
    if (!scrollOverlayOptions.muffle) return;
    const audio = audioRef.current;
    if (!audio) return;

    // Build the audio graph only once — MediaElementSource can't be reconnected
    if (!muffleInitRef.current) {
      muffleInitRef.current = true;
      const ctx = new AudioContext();
      // Two cascaded lowpass filters = steeper roll-off (underwater feel)
      const f1 = ctx.createBiquadFilter();
      f1.type = "lowpass";
      f1.frequency.value = scrollOverlayOptions.muffleOpenFrequency;
      f1.Q.value = 0;
      const f2 = ctx.createBiquadFilter();
      f2.type = "lowpass";
      f2.frequency.value = scrollOverlayOptions.muffleOpenFrequency;
      f2.Q.value = 0;
      const gain = ctx.createGain();
      gain.gain.value = 1;
      ctx.createMediaElementSource(audio).connect(f1);
      f1.connect(f2);
      f2.connect(gain);
      gain.connect(ctx.destination);
      audioCtxRef.current = ctx;
      filterRef.current = f1;
      filter2Ref.current = f2;
      gainRef.current = gain;
    }

    // Re-register listener every effect run so StrictMode cleanup doesn't kill it
    const applyMuffle = (t: number) => {
      const f1 = filterRef.current;
      const f2 = filter2Ref.current;
      const g = gainRef.current;
      const c = audioCtxRef.current;
      if (!f1 || !f2 || !g || !c) return;
      // Apply power curve so muffle builds more noticeably mid-scroll
      // while keeping the final ceiling unchanged.
      const tc = Math.pow(t, scrollOverlayOptions.muffleCurve ?? 1);
      const smooth = scrollOverlayOptions.muffleSmoothing;
      const freq = scrollOverlayOptions.muffleOpenFrequency +
        tc * (scrollOverlayOptions.muffleFrequency - scrollOverlayOptions.muffleOpenFrequency);
      const q = tc * scrollOverlayOptions.muffleQ;
      const gainVal = 1 + tc * (scrollOverlayOptions.muffleGain - 1);
      f1.frequency.setTargetAtTime(freq, c.currentTime, smooth);
      f1.Q.setTargetAtTime(q, c.currentTime, smooth);
      f2.frequency.setTargetAtTime(freq, c.currentTime, smooth);
      f2.Q.setTargetAtTime(q * 0.6, c.currentTime, smooth);
      g.gain.setTargetAtTime(gainVal, c.currentTime, smooth);
    };

    const onOverlay = (e: Event) => {
      const t = (e as CustomEvent<number>).detail;
      const c = audioCtxRef.current;
      if (!c) return;
      if (c.state === "suspended") {
        c.resume().then(() => applyMuffle(t));
      } else {
        applyMuffle(t);
      }
    };

    window.addEventListener("overlaychange", onOverlay);
    return () => window.removeEventListener("overlaychange", onOverlay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------- seek -------------------------------- */

  const onSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const a = audioRef.current;
      if (!a || !a.duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      a.currentTime = Math.max(0, Math.min(1, ratio)) * a.duration;
    },
    []
  );

  /* ----------------------------- helpers ------------------------------- */

  const progressPct =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const handleHover = () => onHoverSfx?.();
  const handleClick = () => onClickSfx?.();

  return (
    <div
      className={styles.player}
      data-position={playerOptions.position}
      style={playerStyleVars()}
      aria-label="Music player"
    >
      {/* audio playback runs on the shared element from audioBus.ts */}

      {/* ------------------- spinning disc + cover art ------------------- */}
      <div
        className={[
          styles.disc,
          isPlaying ? styles.spinning : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-full-cover={playerOptions.fullDiscCover ? "true" : undefined}
        aria-hidden="true"
      >
        <div className={styles.discGrooves} />
        <div className={styles.discInner}>
          {resolvedCover && !coverFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolvedCover}
              alt=""
              className={styles.cover}
              draggable={false}
              onError={() => {
                // Bad path or 404 — fall back to the placeholder and
                // log a hint so it's obvious why nothing's showing.
                if (typeof console !== "undefined") {
                  console.warn(
                    `[MusicPlayer] cover image failed to load: "${resolvedCover}" ` +
                      `(song: "${current.name}"). Check the path; it must resolve ` +
                      `to a file under /public.`
                  );
                }
                setCoverFailed(true);
              }}
            />
          ) : (
            <div className={styles.coverFallback}>
              <span>{current.name.charAt(0).toUpperCase() || "♪"}</span>
            </div>
          )}
        </div>
        <div className={styles.discHole} />
        <div className={styles.discShine} />
      </div>

      {/* ------------------------ song info + bar ------------------------ */}
      {playerOptions.showTitle && (
        <div className={styles.title} title={current.name}>
          {current.name}
        </div>
      )}

      {playerOptions.showProgress && (
        <>
          <div
            className={styles.progressTrack}
            onClick={onSeek}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressPct)}
            aria-label="seek"
            tabIndex={0}
          >
            <div
              className={styles.progressFill}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className={styles.timeRow}>
            <span>{formatTime(currentTime)}</span>
            <span className={styles.timeSep}>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </>
      )}

      {/* ----------------------------- controls ---------------------------- */}
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.ctrlBtn}
          aria-label="previous track"
          onMouseEnter={handleHover}
          onFocus={handleHover}
          onClick={() => {
            handleClick();
            prev();
          }}
        >
          <PrevIcon />
        </button>

        <button
          type="button"
          className={`${styles.ctrlBtn} ${styles.playBtn}`}
          aria-label={isPlaying ? "pause" : "play"}
          onMouseEnter={handleHover}
          onFocus={handleHover}
          onClick={() => {
            handleClick();
            togglePlay();
          }}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <button
          type="button"
          className={styles.ctrlBtn}
          aria-label="next track"
          onMouseEnter={handleHover}
          onFocus={handleHover}
          onClick={() => {
            handleClick();
            next();
          }}
        >
          <NextIcon />
        </button>
      </div>
    </div>
  );
}

/* --------------------------- formatting util --------------------------- */
function formatTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${sec}`;
}

/* ------------------------------- icons -------------------------------- */
function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path d="M7 5v14l12-7L7 5z" fill="currentColor" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" fill="currentColor" />
      <rect x="14" y="5" width="4" height="14" fill="currentColor" />
    </svg>
  );
}
function PrevIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
      <rect x="5" y="5" width="2.5" height="14" fill="currentColor" />
      <path d="M20 5L9 12l11 7V5z" fill="currentColor" />
    </svg>
  );
}
function NextIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
      <path d="M4 5l11 7-11 7V5z" fill="currentColor" />
      <rect x="16.5" y="5" width="2.5" height="14" fill="currentColor" />
    </svg>
  );
}
